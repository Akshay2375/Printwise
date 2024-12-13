import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./App2.css"; // Your custom styles
import * as pdfjsLib from "pdfjs-dist/webpack";

const Editor = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null); // To store the loaded PDF document
  const [fileUploaded, setFileUploaded] = useState(false); // Track file upload status
  const canvasRefs = useRef([]); // References for each page's canvas

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const blob = new Blob([fileReader.result], { type: "application/pdf" });
        setPdfFile(URL.createObjectURL(blob));
        setFileUploaded(true); // Mark file as uploaded
      };
      fileReader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  useEffect(() => {
    if (pdfFile) {
      const loadingTask = pdfjsLib.getDocument(pdfFile);
      loadingTask.promise
        .then((pdf) => {
          setPdfDoc(pdf);
          renderAllPages(pdf);
        })
        .catch((error) => {
          console.error("Error loading PDF:", error);
        });
    }
  }, [pdfFile]);

  const renderPage = (pdf, pageNumber) => {
    pdf.getPage(pageNumber).then((page) => {
      const scale = 1.5; // Adjust for zoom level
      const viewport = page.getViewport({ scale });
      const canvas = canvasRefs.current[pageNumber - 1];
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match the PDF page
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

  const renderAllPages = (pdf) => {
    for (let i = 1; i <= pdf.numPages; i++) {
      renderPage(pdf, i);
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
        <h1 className="title2"> PDF Upload Page</h1>
        <p className="subtitle2">
          Upload and view your PDF files.
        </p>

        {/* File Upload */}
        <form>
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
          />
        </form>

        {/* Layout and Copies Section (only shown after upload) */}
        {fileUploaded && (
          <div>
            <div className="orientation">
              <p htmlFor="orientation">Layout:</p>
              <select id="orientation" name="orientation">
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div className="copies">
              <p htmlFor="copies">Copies:</p>
              <input type="number" id="copies" name="copies" min="1" required />
            </div>

            <button type="submit">Generate PDF</button>
          </div>
        )}
      </main>

      {/* PDF Preview with Scrollable Container */}
      {pdfDoc && (
        <div className="pdf-preview">
          {Array.from({ length: pdfDoc.numPages }).map((_, index) => (
            <canvas
              key={index}
              ref={(el) => (canvasRefs.current[index] = el)}
              className="pdf-canvas"
            />
          ))}
        </div>
      )}

      <div className="background-design"></div>
    </div>
  );
};

export default Editor;
