import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handleFileDrop = (acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://localhost:3000/upload', formData);
      setPrediction(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <Dropzone onDrop={handleFileDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
          </div>
        )}
      </Dropzone>
      {selectedFile && (
        <div>
          <p>Selected file: {selectedFile.name}</p>
          <button onClick={handleSubmit}>Submit</button>
          {prediction && <p>Prediction: {prediction.prediction}</p>}
        </div>
      )}
    </div>
  );
}

export default App;