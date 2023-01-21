import React, { useState, useCallback } from "react";
import Arweave from "arweave";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const Dropzone = () => {
  const [file, setFile] = useState(null);

  const handleDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 1) {
      if (acceptedFiles[0].type.startsWith("image/")) {
        setFile(acceptedFiles[0]);
      } else {
        alert("Not an image file.");
      }
    } else {
      alert("Please drop only 1 file at a time.");
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = async () => {
        const buffer = new Uint8Array(reader.result);
        const transaction = await arweave.createTransaction({
          data: buffer,
        });
        transaction.addTag("Content-Type", "image/png");
        await arweave.transactions.sign(transaction);
        let uploader = await arweave.transactions.getUploader(transaction);
        while (!uploader.isComplete) {
          await uploader.uploadChunk();
          console.log(
            `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
          );
        }
      };
    }
  }, [file]);

  return (
    <div className="dropzone">
      {file ? (
        <div>
          <p>{file.name}</p>
          <p>{file.type}</p>
          <p>{file.size} bytes</p>
          <button onClick={() => handleUpload([file])}>
            Upload to Arweave
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.onchange = (e) => handleDrop(e.target.files);
              input.click();
            }}
          >
            Select file
          </button>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
