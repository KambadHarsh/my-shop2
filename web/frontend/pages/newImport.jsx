import React, { useState } from 'react';
import axios from 'axios';

export default function UploadProducts() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadStatus('');
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);
      const response = await axios.post('/api/products/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NfdG9rZW4iOiJzaHB1YV85ZThiYjBlNjQ4YmJhZjJiZDAwMzY2N2U0NTg0YTdjYiIsImlhdCI6MTcxMzAwMDczN30.oiP6sRSUM_oO_H980gYUjECG_azXzUcJp8f7HLu40oE'
        }
      });
      setUploadStatus('Upload successful!');
      console.log(response.data); // Log or process response data
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError('The server endpoint was not found. Please check your backend configuration.');
      } else {
        setError('Failed to upload file: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Products CSV</h2>
      <input type="file" onChange={handleFileChange} accept=".csv" />
      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
