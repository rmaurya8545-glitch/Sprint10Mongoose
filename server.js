const cors = require('cors');
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const upload = require("./middleware/upload");
const cloudinary = require("./config/cloudinary");
const express = require("express");
const mongoose = require("mongoose");
const Post = require("./models/Post");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Connection error:", err));


// POST/users - nya user banao

app.post("/users",async(req,res) => {
  try{
    const user = await User.create(req.body);
    res.status(201).json(user);
  }catch(err){
    res.status(400).json({ error:err.message });
  }
});

// POST /posts - naya post banao

app.post("/posts", upload.single("thumbnail"),async(req, res) => {
  try {
    let thumbnailUrl;
    if(req.file){
      thumbnailUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {},
          (error, result) => {
            if(error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }
    const post = await Post.create({ ...req.body, thumbnail:thumbnailUrl });
    res.status(201).json(post);
  }catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/posts/top", async (req,res) => {
  try{
    const posts = await Post.find()
    .sort({ createdAt: -1})
    .limit(3)
    .populate("authorId","name email");
    res.json(posts);
  }catch(err){
    res.status(500).json({ error:err.message });
  }
});

// GET /posts - saare posts lao
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("authorId", "name emil");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /posts/:id - post delete karo
app.delete("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://cine-stream-alpha-ten.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join room", (room) => {
    for (const r of socket.rooms) {
      if (r !== socket.id) socket.leave(r);
    }
    socket.join(room);
    console.log(socket.id, "joined", room);
  });

  socket.on("chat message", (msg) => {
    io.to(msg.room).emit("chat message", msg);
  });

  socket.on("typing", ({ user, room }) => {
    socket.to(room).emit("typing", user);
  });

  socket.on("stop typing", (room) => {
    socket.to(room).emit("stop typing");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
httpServer.listen(process.env.PORT || 5000, ()=>{
  console.log("Server running");
});
