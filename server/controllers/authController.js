import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// ==========================================
// REGISTER
// ==========================================

export const registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const existingUser =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "User with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token =
      generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",

      maxAge:
        7 *
        24 *
        60 *
        60 *
        1000,
    });

    res.status(201).json({
      message:
        "Registration successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    res.status(500).json({
      message:
        "Server error during registration",
    });
  }
};


// ==========================================
// LOGIN
// ==========================================

export const loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user =
      await User.findOne({
        email: email.toLowerCase(),
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const token =
      generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",

      maxAge:
        7 *
        24 *
        60 *
        60 *
        1000,
    });

    res.json({
      message:
        "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message:
        "Server error during login",
    });
  }
};


// ==========================================
// CURRENT USER
// ==========================================

export const getCurrentUser = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,

        notificationPreferences:
          user.notificationPreferences,
      },
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ==========================================
// GET SETTINGS
// ==========================================

export const getSettings = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      ).select(
        "name email notificationPreferences"
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      settings: {
        name: user.name,
        email: user.email,

        notificationPreferences:
          user.notificationPreferences,
      },
    });
  } catch (error) {
    console.error(
      "Get settings error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load settings",
    });
  }
};


// ==========================================
// UPDATE SETTINGS
// ==========================================

export const updateSettings = async (
  req,
  res
) => {
  try {
    const {
      interestDue,
      paymentReceived,
      overdue,
    } = req.body;

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Only update values that were
    // actually supplied by the client.

    if (
      typeof interestDue ===
      "boolean"
    ) {
      user.notificationPreferences.interestDue =
        interestDue;
    }

    if (
      typeof paymentReceived ===
      "boolean"
    ) {
      user.notificationPreferences.paymentReceived =
        paymentReceived;
    }

    if (
      typeof overdue ===
      "boolean"
    ) {
      user.notificationPreferences.overdue =
        overdue;
    }

    await user.save();

    res.status(200).json({
      message:
        "Settings updated successfully",

      settings: {
        name: user.name,
        email: user.email,

        notificationPreferences:
          user.notificationPreferences,
      },
    });
  } catch (error) {
    console.error(
      "Update settings error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to update settings",
    });
  }
};


// ==========================================
// LOGOUT
// ==========================================

export const logoutUser = (
  req,
  res
) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({
    message:
      "Logout successful",
  });
};

// ==========================================
// FORGOT PASSWORD
// ==========================================

export const forgotPassword = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message:
          "Email address is required",
      });
    }

    const user =
      await User.findOne({
        email: email.toLowerCase().trim(),
      }).select(
        "+resetPasswordToken +resetPasswordExpires"
      );

    // Don't reveal whether an account exists
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a password reset link has been generated.",
      });
    }

    // Generate secure random token
    const resetToken =
      crypto.randomBytes(32).toString("hex");

    // Store token in database
    user.resetPasswordToken =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save({
      validateBeforeSave: false,
    });

    // Frontend reset URL
    const clientUrl =
      process.env.CLIENT_URL ||
      "http://localhost:5173";

    const resetUrl =
      `${clientUrl}/reset-password/${resetToken}`;
      
    // Development response
    res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been generated.",

      ...(process.env.NODE_ENV !==
        "production" && {
        resetUrl,
      }),
    });

  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to process password reset request",
    });
  }
};


// ==========================================
// RESET PASSWORD
// ==========================================

export const resetPassword = async (
  req,
  res
) => {
  try {
    const {
      token,
    } = req.params;

    const {
      password,
    } = req.body;

    if (!token) {
      return res.status(400).json({
        message:
          "Reset token is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message:
          "New password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    // Hash token for database lookup
    const hashedToken =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user =
      await User.findOne({
        resetPasswordToken:
          hashedToken,

        resetPasswordExpires: {
          $gt: Date.now(),
        },
      }).select(
        "+password +resetPasswordToken +resetPasswordExpires"
      );

    if (!user) {
      return res.status(400).json({
        message:
          "Reset link is invalid or has expired.",
      });
    }

    // Hash new password
    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    user.password =
      hashedPassword;

    // Invalidate token
    user.resetPasswordToken =
      null;

    user.resetPasswordExpires =
      null;

    await user.save();

    res.status(200).json({
      message:
        "Password reset successful. You can now sign in.",
    });

  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to reset password",
    });
  }
};