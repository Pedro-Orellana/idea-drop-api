import express from "express";
import Idea from "../models/Idea.js";
import mongoose, { mongo } from "mongoose";

const ideaRouter = express.Router();

//get all ideas
ideaRouter.get("/", async (req, res, next) => {
  try {
    const ideas = await Idea.find();
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
ideaRouter.post("/", async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body;

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
    });
    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (err) {
    next(err);
  }
});

//delete idea
ideaRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    //check if the id is a valid ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }

    const idea = await Idea.findByIdAndDelete(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }
    res.json({ message: "Idea deleted successfully" });
  } catch (err) {
    next(err);
  }
});

//update idea
ideaRouter.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }

    const { title, summary, description, tags } = req.body;

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary and description are required");
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      {
        title,
        summary,
        description,
        tags: Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()),
      },
      { new: true, runValidators: true }
    );

    if (!updatedIdea) {
      res.status(404);
      throw new Error("Idea not found");
    }

    res.json(updatedIdea);
  } catch (err) {
    next(err);
  }
});

export default ideaRouter;
