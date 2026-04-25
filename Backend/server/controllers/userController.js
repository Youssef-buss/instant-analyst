import pool from "../Db/pool.js"; 
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET = "mysecretkey";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 🔥 CREATE TOKEN
    const token = jwt.sign(
      { id: user.id, email: user.email }, // payload
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

   
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

   
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

  
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [first_name, last_name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error);

   
    if (error.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Error creating user" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");

    res.json({
      message: "Users fetched successfully",
      users: result.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching users" });
  }
};


export const getUserbyId = async(req,res)=>{
  try{
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM USERS WHERE id=$1",[id]);

       if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
     message:"user found sucessfully",
     user: result.rows[0],
    });

    }
    catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching user" });
  }
}

export const deleteuser= async(req,res)=>{
  try{
    const{id}=req.params
    const result=await pool.query("SELECT FROM USERS WHERE id=$1",[id]);
    if(result.rows.length===0){
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      message: "User deleted successfully",
      user: result.rows[0],
    });
    
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, password } = req.body;

    // 🔍 Check if email belongs to another user
    const emailCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND id != $2",
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

   
    const result = await pool.query(
      `UPDATE users
       SET first_name = $1,
           last_name = $2,
           email = $3,
           password = $4
       WHERE id = $5
       RETURNING *`,
      [first_name, last_name, email, password, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user" });
  }
};