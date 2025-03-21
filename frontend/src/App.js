import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [file, setFile] = useState(null);
  const [receivedChunks, setReceivedChunks] = useState([]);
  const [receivedFileName, setReceivedFileName] = useState("");
  const [dataChannelOpen, setDataChannelOpen] = useState(false); //  Ensure channel is open
  const peerConnection = useRef(new RTCPeerConnection());
  const dataChannelRef = useRef(null);

  useEffect(() => {
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", { candidate: event.candidate });
      }
    };

    peerConnection.current.ondatachannel = (event) => {
      dataChannelRef.current = event.channel;
      dataChannelRef.current.onopen = () => {
        console.log("✅ DataChannel is OPEN!");
        setDataChannelOpen(true);
      };

      dataChannelRef.current.onmessage = (event) => {
        console.log("Receiving Data...");
        setReceivedChunks((prev) => [...prev, event.data]);
      };
    };

    socket.on("signal", async (data) => {
      if (data.offer) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("signal", { answer });
      } else if (data.answer) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      socket.off("signal");
    };
  }, []);

  const createOffer = async () => {
    dataChannelRef.current = peerConnection.current.createDataChannel("fileTransfer");
    dataChannelRef.current.onopen = () => {
      console.log(" DataChannel Created and OPEN!");
      setDataChannelOpen(true);
    };

    dataChannelRef.current.onmessage = (event) => {
      console.log("Receiving Data...");
      setReceivedChunks((prev) => [...prev, event.data]);
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("signal", { offer });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const sendFile = () => {
    if (!file) return;
    if (!dataChannelOpen) {
      console.error(" DataChannel is NOT open yet!");
      return;
    }

    setReceivedFileName(file.name);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      const chunkSize = 16 * 1024;
      const fileData = new Uint8Array(reader.result);

      for (let i = 0; i < fileData.length; i += chunkSize) {
        const chunk = fileData.slice(i, i + chunkSize);
        if (dataChannelRef.current.readyState === "open") {
          dataChannelRef.current.send(chunk);
        } else {
          console.error(" DataChannel closed while sending!");
          break;
        }
      }
    };
  };

  const downloadReceivedFile = () => {
    if (!receivedChunks.length) return;

    const blob = new Blob(receivedChunks);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = receivedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1>Peer-to-Peer File Transfer</h1>
      <button onClick={createOffer}>Create Connection</button>

      <input type="file" onChange={handleFileChange} />
      <button onClick={sendFile}>Send File</button>

      {receivedChunks.length > 0 && (
        <div>
          <h2>File Received: {receivedFileName}</h2>
          <button onClick={downloadReceivedFile}>Download</button>
        </div>
      )}
    </div>
  );
}

export default App;
