const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

/**
 * Function to generate a unique token manually.
 * Format: A-Z, a-z, 0-9 with Math.random()
 */
function generateToken(length = 8) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}

// API to generate a unique token
app.get("/generate-token", (req, res) => {
  const token = generateToken(10); // Generate a 10-character token
  res.json({ token });
});

/**
 * Socket.io Signaling Logic
 */
io.on("connection", (socket) => {
  console.log(`🔗 New client connected: ${socket.id}`);

  // Handle signaling messages
  socket.on("signal", (data) => {
    console.log(`📡 Signal received: ${JSON.stringify(data)}`);
    socket.broadcast.emit("signal", data); // Forward to all other peers
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = 5003;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
