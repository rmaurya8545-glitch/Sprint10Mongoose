const cors = require('cors');
require("dotenv").config();
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
    console.log("UPLOAD ERROR: ",err);
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

app.listen(process.env.PORT || 5000, () =>
  console.log("Server is running")
);
