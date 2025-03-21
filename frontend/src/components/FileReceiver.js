import React, { useState, useEffect } from "react";

function FileReceiver({ socket }) {
  const [fileChunks, setFileChunks] = useState([]);
  const [fileName, setFileName] = useState("received_file.pdf");

  useEffect(() => {
    socket.on("file-chunk", (data) => {
      if (data.done) {
        // Merge chunks into a Blob and trigger download
        const receivedFile = new Blob(fileChunks, { type: "application/pdf" });
        const url = URL.createObjectURL(receivedFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();

        // Reset state
        setFileChunks([]);
        setFileName("received_file.pdf");
      } else {
        setFileChunks((prev) => [...prev, data.chunk]);
      }
    });

    return () => socket.off("file-chunk");
  }, [socket, fileChunks]);

  return (
    <div>
      <h2>Waiting for PDF File...</h2>
    </div>
  );
}

export default FileReceiver;
