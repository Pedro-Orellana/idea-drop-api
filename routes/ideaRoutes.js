import express from "express";
import Idea from "../models/Idea.js";

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
    const idea = Idea.findById(id);
    res.json(idea);
  } catch (err) {
    next(err);
  }
});

ideaRouter.post("/", (req, res) => {
  const { title, description } = req.body;
  res.send(title);
});

export default ideaRouter;
