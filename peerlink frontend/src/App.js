import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://peerlink-cwvt.onrender.com/"); // Connect to backend

function App() {
  const [message, setMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    // Listen for signals
    socket.on("signal", (data) => {
      console.log("Received signaling data:", data);
      setReceivedMessage(data);
    });

    return () => socket.off("signal"); // Cleanup on unmount
  }, []);

  const sendSignal = () => {
    socket.emit("signal", message); // Send signal
    console.log("Sent signaling data:", message);
  };

  const generateToken = () => {
    fetch("https://peerlink-cwvt.onrender.com/generate-token")
      .then((response) => response.json())
      .then((data) => {
        setToken(data.token);
        console.log("Generated Token:", data.token);
      })
      .catch((error) => console.error("Error fetching token:", error));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>PeerLink Signaling & Token Generation</h1>

      {/* Token Generation */}
      <button onClick={generateToken}>Generate Token</button>
      <h3>Generated Token: {token}</h3>

      {/* Signaling Input */}
      <input
        type="text"
        placeholder="Enter message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendSignal}>Send Signal</button>

      <h3>Received: {receivedMessage}</h3>
    </div>
  );
}

export default App;
