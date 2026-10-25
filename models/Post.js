const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  thumbnail: String,
  createdAt: { type: Date, default: Date.now },
  authorId:{ type:mongoose.Schema.Types.ObjectId,ref:"User" },
});

module.exports = mongoose.model("Post", postSchema);
