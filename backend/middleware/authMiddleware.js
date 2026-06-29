const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Token comes in Authorization header as "Bearer <token>"
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized — no token provided" });
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request — available in all downstream controllers
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Not authorized — invalid token" });
  }
};

module.exports = { protect };