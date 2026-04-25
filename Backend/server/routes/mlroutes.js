import express from "express";
import multer from "multer";
import { analyzeData } from "../controllers/mlController.js";

const router = express.Router();

const storage = multer.memoryStorage(); // IMPORTANT
const upload = multer({ storage });

router.post("/analyze", upload.single("file"), analyzeData);

export default router;