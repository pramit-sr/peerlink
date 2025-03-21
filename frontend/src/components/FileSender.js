import React, { useState } from "react";

function FileSender({ socket }) {
  const [file, setFile] = useState(null);

  const sendFile = () => {
    if (!file) return;
    
    // Ensure the selected file is a PDF
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const CHUNK_SIZE = 16 * 1024;
      let offset = 0;

      while (offset < arrayBuffer.byteLength) {
        let chunk = arrayBuffer.slice(offset, offset + CHUNK_SIZE);
        socket.emit("file-chunk", { chunk });
        offset += CHUNK_SIZE;
      }

      socket.emit("file-chunk", { done: true, fileName: file.name });
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2>Send a PDF File</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="application/pdf" />
      <button onClick={sendFile}>Send</button>
    </div>
  );
}

export default FileSender;
