import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Normalize user ID
    // so every controller can use req.user._id
    const userId =
      decoded._id ||
      decoded.id ||
      decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message:
          "Invalid authentication token",
      });
    }

    req.user = {
      ...decoded,
      _id: userId,
    };

    next();

  } catch (error) {
    console.error(
      "Auth middleware error:",
      error
    );

    return res.status(401).json({
      message:
        "Invalid or expired token",
    });
  }
};

export default protect;