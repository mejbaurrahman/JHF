const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Protect routes - Verify JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Check if it's a mock token - these should not be sent to backend
      if (token && token.startsWith("mock_jwt_token_")) {
        // Don't log - just silently reject
        return res.status(401).json({ message: "Not authorized" });
      }

      // Validate token format before verification
      if (!token || typeof token !== "string" || token.trim() === "") {
        return res.status(401).json({ message: "Not authorized" });
      }

      // Verify token - catch JWT errors silently
      const jwtSecret =
        process.env.JWT_SECRET ||
        "default_jwt_secret_change_in_production_2024";
      let decoded;
      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch (jwtError) {
        // JWT verification failed - return 401 without logging
        // This suppresses "jwt malformed" errors
        return res.status(401).json({ message: "Not authorized" });
      }

      // Get user from the token (only if JWT verification succeeded)
      if (decoded && decoded.id) {
        req.user = await User.findById(decoded.id).select("-password");
      } else {
        return res.status(401).json({ message: "Not authorized" });
      }

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      next();
    } catch (error) {
      // Only log unexpected errors (database errors, etc.)
      // JWT errors are handled above and don't reach here
      if (
        error.name !== "JsonWebTokenError" &&
        !error.message?.toLowerCase().includes("jwt") &&
        !error.message?.toLowerCase().includes("malformed")
      ) {
        console.error("Auth error:", error.message || error);
      }
      res.status(401).json({ message: "Not authorized" });
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return asyncHandler((req, res, next) => {
    // Check if user exists
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, please log in");
    }

    // Normalize role comparison (case-insensitive)
    const userRole = String(req.user.role || "")
      .toLowerCase()
      .trim();
    const allowedRoles = roles.map((role) =>
      String(role || "")
        .toLowerCase()
        .trim()
    );

    if (!allowedRoles.includes(userRole)) {
      res.status(403);
      throw new Error(
        `User role "${
          req.user.role
        }" is not authorized to access this route. Required roles: ${roles.join(
          ", "
        )}`
      );
    }
    next();
  });
};

module.exports = { protect, authorize };
