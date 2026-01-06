import express from "express";
import Idea from "../models/Idea.js";
import mongoose, { mongo } from "mongoose";

import { protect } from "../middleware/authMiddleware.js";

const ideaRouter = express.Router();

//get all ideas
ideaRouter.get("/", async (req, res, next) => {
  try {
    //get the limit from the request
    const limit = parseInt(req.query._limit);

    //create a query sorting it out by time of creation
    const query = Idea.find().sort({ createdAt: -1 });

    //use the limit
    if (!isNaN(limit)) {
      query.limit(limit);
    }
    //get the ideas from the query
    const ideas = await query.exec();
    res.json(ideas);
  } catch (err) {
    next(err);
  }
});

//get single idea
ideaRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    //check if the id is a valid ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }
    res.json(idea);
  } catch (err) {
    next(err);
  }
});

//create new idea
ideaRouter.post("/", protect, async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body || {};

    if (!title.trim() || !summary.trim() || !description.trim()) {
      res.status(400);
      throw new Error("Title, summary and description are required");
    }

    const newIdea = new Idea({
      title,
      summary,
      description,
      tags:
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : [],
      user: req.user.id,
    });
    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (err) {
    next(err);
  }
});

//delete idea
ideaRouter.delete("/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    //check if the id is a valid ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }

    //find the idea first
    const idea = await Idea.findById(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }

    //check if the user owns the idea
    if (idea.user.toString() !== req.user._id.toString()) {
      //the idea userID and the request userID are different, and so you cannot delete this idea
      res.status(403); //unauthorized status
      throw new Error("Not authorized to delete this idea");
    }

    //actually delete idea
    await idea.deleteOne();

    res.json({ message: "Idea deleted successfully" });
  } catch (err) {
    next(err);
  }
});

//update idea
ideaRouter.put("/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }

    //find idea
    const idea = Idea.findById(id);

    if (!idea) {
      res.status(404); //not found status
      throw new Error("Idea not found");
    }

    //check if user owns this idea
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403); //unauthorized status
      throw new Error("Not authorized to delete this idea");
    }

    const { title, summary, description, tags } = req.body || {};

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary and description are required");
    }

    idea.title = title;
    idea.summary = summary;
    idea.description = description;
    idea.tags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const updatedIdea = await idea.save();

    res.json(updatedIdea);
  } catch (err) {
    next(err);
  }
});

export default ideaRouter;
