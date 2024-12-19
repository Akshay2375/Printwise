import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/webpack";
import "./App2.css"; // Your custom styles

const EditorFileUpload = () => {
  const [pdfFiles, setPdfFiles] = useState([]); // To store multiple PDF files
  const [pdfDocs, setPdfDocs] = useState([]); // To store loaded PDF documents
  const [fileUploaded, setFileUploaded] = useState(false); // Track file upload status
  const [file, setFile] = useState(null); // File to be uploaded
  const [orientation, setOrientation] = useState("portrait"); // Layout orientation
  const [copies, setCopies] = useState(1); // Number of copies to print
  const canvasRefs = useRef({}); // References for each page's canvas

  // Handle file selection for rendering
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const pdfUrls = files.map((file) => URL.createObjectURL(file));
    setPdfFiles((prevFiles) => [...prevFiles, ...pdfUrls]);
    setFileUploaded(true);
    setFile(event.target.files[0]);
  };

  // Handle file removal
  const removePdf = (index) => {
    setPdfFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
    setPdfDocs((prevDocs) => prevDocs.filter((_, idx) => idx !== index));
  };

  // Render PDF pages when files or orientation are updated
  useEffect(() => {
    if (pdfFiles.length > 0) {
      const loadingTasks = pdfFiles.map((pdfFile) =>
        pdfjsLib.getDocument(pdfFile).promise
      );

      Promise.all(loadingTasks)
        .then((loadedPdfs) => {
          setPdfDocs(loadedPdfs);
          loadedPdfs.forEach((pdf, pdfIndex) => {
            renderAllPages(pdf, pdfIndex);
          });
        })
        .catch((error) => {
          console.error("Error loading PDFs:", error);
        });
    }
  }, [pdfFiles, orientation]); // Re-render when orientation changes

  // Render a single page with orientation
  const renderPage = (pdf, pageNumber, pdfIndex) => {
    pdf.getPage(pageNumber).then((page) => {
      const scale = 1.5; // Base scale
      let viewport = page.getViewport({ scale });

      // Adjust the viewport for landscape orientation
      if (orientation === "landscape") {
        viewport = page.getViewport({ scale, rotation: 90 }); // Rotate the page
      }

      const canvas = canvasRefs.current[`${pdfIndex}-${pageNumber - 1}`];
      const context = canvas.getContext("2d");

      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render the page into the canvas
      const renderContext = {
        canvasContext: context,
        viewport,
      };
      page.render(renderContext);
    });
  };

  // Render all pages for each PDF
  const renderAllPages = (pdf, pdfIndex) => {
    for (let i = 1; i <= pdf.numPages; i++) {
      renderPage(pdf, i, pdfIndex);
    }
  };

  // Submit form data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("orientation", orientation);
    formData.append("copies", copies);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1 className="logo">PrintWise</h1>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/login">Log in</Link>
        </nav>
      </header>

      <main className={`main ${fileUploaded ? "file-uploaded" : ""}`}>
        <h1 className="title2">PDF Upload Page</h1>
        <p className="subtitle2">Upload and view your PDF files.</p>

        {/* File Upload Form */}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label htmlFor="pdfFileUpload" className="upload-label">
            Upload Files
          </label>
          <input
            type="file"
            id="pdfFileUpload"
            name="pdfFileUpload"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="file-input"
            multiple
            required
          />

          {/* Layout and Copies Section */}
          {fileUploaded && (
            <div>
              <div className="orientation">
                <p htmlFor="orientation">Layout:</p>
                <select
                  id="orientation"
                  name="orientation"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div className="copies">
                <p htmlFor="copies">Copies:</p>
                <input
                  type="number"
                  id="copies"
                  name="copies"
                  value={copies}
                  min="1"
                  onChange={(e) => setCopies(e.target.value)}
                  required
                />
              </div>

              <button type="submit">Submit</button>
            </div>
          )}
        </form>
      </main>

      {/* PDF Preview */}
      {pdfDocs.length > 0 && (
        <div className="pdf-preview">
          {pdfDocs.map((pdf, pdfIndex) => (
            <div key={pdfIndex} className="pdf-container">
              <h2>PDF {pdfIndex + 1}</h2>
              <button
                className="remove-pdf-btn"
                onClick={() => removePdf(pdfIndex)}
              >
                &#10005;
              </button>
              {Array.from({ length: pdf.numPages }).map((_, pageIndex) => (
                <div
                  key={`${pdfIndex}-${pageIndex}`}
                  className={`pdf-page ${orientation}`} // Add dynamic orientation class
                >
                  <canvas
                    ref={(el) => (canvasRefs.current[`${pdfIndex}-${pageIndex}`] = el)}
                    className="pdf-canvas"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
            <div className="background-design"></div>

    </div>
  );
};

export default EditorFileUpload;
