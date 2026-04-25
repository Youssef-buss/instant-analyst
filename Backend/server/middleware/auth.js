import jwt from "jsonwebtoken";

const SECRET =process.env.JWT_SECRET;;

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;

    // 🔥 CREATE NEW TOKEN (refresh)
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      SECRET,
      { expiresIn: "30m" }
    );

    // send new token in response header
    res.setHeader("Authorization", "Bearer " + newToken);

    next();

  } catch (error) {
    return res.status(401).json({ error: "Token expired or invalid" });
  }
};