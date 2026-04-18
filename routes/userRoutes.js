import express from "express";

const router = express.Router();

// Temporary route so server can boot while user endpoints are added.
router.get("/", (req, res) => {
  res.status(200).json({ message: "User routes working" });
});

export default router;
