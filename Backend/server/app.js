import express from "express";
const app = express();
import pool from "./Db/pool.js"
import userRoutes from "./routes/userRoutes.js";
import { authMiddleware } from "./middleware/auth.js";
import mlRoutes from "./routes/mlroutes.js";


app.use("/ml", mlRoutes);

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route",
    user: req.user,
  });
});

//Middleware

app.use(express.json());


app.use("/users", userRoutes);

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected",
      time: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "database connection failed" });
  }
});

 

export default app;