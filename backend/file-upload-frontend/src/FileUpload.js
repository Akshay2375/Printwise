import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [orientation, setOrientation] = useState('portrait');
  const [copies, setCopies] = useState(1);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('orientation', orientation);
    formData.append('copies', copies);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log(response.data); // Success or error message
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>File Upload</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} required />
        <div>
          <label>
            Orientation:
            <select value={orientation} onChange={(e) => setOrientation(e.target.value)}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Copies:
            <input
              type="number"
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
              min="1"
              required
            />
          </label>
        </div>
        <button type="submit">Upload and Print</button>
      </form>
    </div>
  );
};

export default FileUpload;
