import express from "express";

const ideaRouter = express.Router();

ideaRouter.get("/", (req, res) => {
  const ideas = [
    {
      title: "Smart Ring",
      description:
        "A ring that is able to recognize gestures and act accordingly",
    },
    {
      title: "Star Platinum +",
      description:
        "An interactive decoration that lights up and makes sound when a word is spoken",
    },
    {
      title: "Smart backpack",
      description: "A backpack that keeps track of all your items ",
    },
  ];

  res.send(ideas);
});

ideaRouter.post("/", (req, res) => {
  const { title, description } = req.body;
  res.send(title);
});

export default ideaRouter;
