import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export const createAccount = async (req, res) => {
  try {
    const { name, username, phone, password } = req.body;

    const errors = {};
    if (!name) errors.name = "Name is required";
    if (!username) errors.username = "Username is required";
    if (!phone) errors.phone = "Phone is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

   const existingUser = await User.findOne({
  $or: [{ phone }, { username }],
});

if (existingUser) {
  const errors = {};

  if (existingUser.phone === phone) {
    errors.phone = "Phone number already exists";
  }

  if (existingUser.username === username) {
    errors.username = "Username already exists";
  }

  return res.status(409).json({
    success: false,
    errors,
  });
}


    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      phone,
      passwordHash: hashedPassword,
      passwordPlain: password, 
    });

    return res.status(201).json({
      success: true,
      message: "Account created ",
    //   userId: user._id,
    user:{
        userId: user._id,
        username: user.username,
        phone: user.phone
    }
    });

  } catch (err) {
    console.error("CreateAccount Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const errors = {};

    if (!username) errors.username = "Username is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // 🔹 Find user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        success: false,
        errors: {
          username: "Username not found",
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        errors: {
          password: "Incorrect password",
        },
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login Sucessfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};






export const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




export const updatePassword = async (req, res) => {
  try {
    const userId = req.userId; 
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const errors = {};

    if (!oldPassword) errors.oldPassword = "Old password is required";
    if (!newPassword) errors.newPassword = "New password is required";
    if (!confirmPassword)
      errors.confirmPassword = "Confirm password is required";

    if (newPassword && newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        errors: {
          oldPassword: "Old password is incorrect",
        },
      });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = newHashedPassword;

    if (user.passwordPlain !== undefined) {
      user.passwordPlain = newPassword;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error("UpdatePassword Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, place, description } = req.body;

    const updates = {};

    if (name) updates.name = name;
    if (place) updates.place = place;
    if (description) updates.description = description;

    // 👇 profile pic from multer
    if (req.file) {
      updates.profilePic = `/uploads/profile/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select("-passwordHash -passwordPlain");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });

  } catch (err) {
    console.error("UpdateProfile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId)
      .select("-passwordHash -passwordPlain");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (err) {
    console.error("GetProfile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


