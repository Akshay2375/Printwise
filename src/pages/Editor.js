import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./App2.css"; // Your custom styles
import * as pdfjsLib from "pdfjs-dist/webpack";

const Editor = () => {
  const [pdfFiles, setPdfFiles] = useState([]); // To store multiple PDF files
  const [pdfDocs, setPdfDocs] = useState([]); // To store loaded PDF documents
  const [fileUploaded, setFileUploaded] = useState(false); // Track file upload status
  const canvasRefs = useRef({}); // References for each page's canvas

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const pdfUrls = files.map((file) => URL.createObjectURL(file));
    setPdfFiles((prevFiles) => [...prevFiles, ...pdfUrls]); // Append new files to existing files
    setFileUploaded(true); // Mark file as uploaded
  };

  useEffect(() => {
    if (pdfFiles.length > 0) {
      const loadingTasks = pdfFiles.map((pdfFile) =>
        pdfjsLib.getDocument(pdfFile).promise
      );

      Promise.all(loadingTasks)
        .then((loadedPdfs) => {
          setPdfDocs(loadedPdfs);
          loadedPdfs.forEach((pdf, pdfIndex) => {
            renderAllPages(pdf, pdfIndex); // Render all pages for each PDF
          });
        })
        .catch((error) => {
          console.error("Error loading PDFs:", error);
        });
    }
  }, [pdfFiles]);

  const renderPage = (pdf, pageNumber, pdfIndex) => {
    pdf.getPage(pageNumber).then((page) => {
      const scale = 1.5; // Adjust for zoom level
      const viewport = page.getViewport({ scale });
      const canvas = canvasRefs.current[`${pdfIndex}-${pageNumber - 1}`];
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

  const renderAllPages = (pdf, pdfIndex) => {
    for (let i = 1; i <= pdf.numPages; i++) {
      renderPage(pdf, i, pdfIndex);
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
            multiple // Allow multiple file selection
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
              <input type="number" id="copies" name="copies" min="1" defaultValue="1" required />
            </div>

            <button type="submit">Submit</button>
          </div>
        )}
      </main>

      {/* PDF Preview with Scrollable Container */}
      {pdfDocs.length > 0 && (
        <div className="pdf-preview">
          {pdfDocs.map((pdf, pdfIndex) => (
            <div key={pdfIndex} className="pdf-container">
              <h2>PDF {pdfIndex + 1}</h2>
              {/* Loop over the pages of each PDF */}
              {Array.from({ length: pdf.numPages }).map((_, pageIndex) => (
                <div key={`${pdfIndex}-${pageIndex}`} className="pdf-page">
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

export default Editor;
