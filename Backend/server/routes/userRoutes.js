import express from "express";
import { createUser, deleteuser, getUserbyId, getUsers, loginUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id",getUserbyId);
router.delete("/:id",deleteuser);
router.post("/login",loginUser)


export default router;