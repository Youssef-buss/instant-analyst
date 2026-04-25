import { sendToML } from "../services/MLservices.js";
import pool from "../Db/pool.js";

export const analyzeData = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 🔥 Send to Python
    const result = await sendToML(file);

    // 🔥 Save in DB
    const saved = await pool.query(
      `INSERT INTO reports (file_name, insights)
       VALUES ($1, $2)
       RETURNING *`,
      [file.originalname, result]
    );

    res.json({
      message: "Analysis complete",
      data: result,
      saved: saved.rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ML processing failed" });
  }
};