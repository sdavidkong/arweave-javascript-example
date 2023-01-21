import React, { useState, useCallback } from "react";
import Arweave from "arweave";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const Dropzone = () => {
  const [file, setFile] = useState(null);
  const [transactionId, setTransactionId] = useState("");

  const handleDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 1) {
      if (acceptedFiles[0].type.startsWith("image/")) {
        setFile(acceptedFiles[0]);
        const transaction = await arweave.createTransaction({
          data: acceptedFiles[0],
        });
        let uploader = await arweave.transactions.getUploader(transaction);
        await arweave.transactions.sign(transaction);
        while (!uploader.isComplete) {
          await uploader.uploadChunk();
          console.log(
            `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
          );
        }
        setTransactionId(transaction.id);
      } else {
        alert("Not an image file.");
      }
    } else {
      alert("Please drop only 1 file at a time.");
    }
  }, []);

  return (
    <div className="dropzone">
      {file ? (
        <div>
          <p>{file.name}</p>
          <p>{file.type}</p>
          <p>{file.size} bytes</p>
          <button onClick={() => handleDrop()}>Upload to Arweave</button>
        </div>
      ) : (
        <div>
          <p>Drop an image here</p>
          <input type="file" onChange={(e) => handleDrop(e.target.files)} />
        </div>
      )}
    </div>
  );
};

export default Dropzone;
