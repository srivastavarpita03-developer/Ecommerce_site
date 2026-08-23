const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ======================================
// REGISTER
// ======================================

async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      address,
      contactNumber,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !contactNumber
    ) {
      return res.status(400).send({
        success: false,
        message: "Required Fields are missing",
      });
    }

    // ==============================
    // CHECK EMAIL
    // ==============================

    const userData = await User.findOne({
      email: email,
    });

    if (userData) {
      return res.status(400).send({
        success: false,
        message: "Email Already Registered",
      });
    }

    // ==============================
    // HASH PASSWORD
    // ==============================

    const hashPassword = await bcrypt.hash(
      password,
      10
    );

    // ==============================
    // CREATE USER
    // ==============================

    const newUserData = new User({
      name,
      email,
      address,
      contactNumber,
      password: hashPassword,
    });

    const newUser = await newUserData.save();

    return res.status(201).send({
      success: true,
      message: "Registered Successfully",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        contactNumber: newUser.contactNumber,
        role: newUser.role,
        profilePic: newUser.profilePic,
      },
    });
  } catch (error) {
    console.log("Register Error:", error);

    return res.status(500).send({
      success: false,
      message: "Registration Failed",
      error: error.message,
    });
  }
}

// ======================================
// LOGIN
// ======================================

async function login(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "All Required Fields Not Found",
      });
    }

    // ==============================
    // FIND USER
    // ==============================

    const userData = await User.findOne({
      email: email,
    });

    if (!userData) {
      return res.status(400).send({
        success: false,
        message: "Email Or Password is Invalid",
      });
    }

    // ==============================
    // CHECK PASSWORD
    // ==============================

    const isPasswordMatch =
      await bcrypt.compare(
        password,
        userData.password
      );

    if (!isPasswordMatch) {
      return res.status(400).send({
        success: false,
        message: "Email Or Password is Invalid",
      });
    }

    // ==============================
    // JWT SECRET
    // ==============================

    const JWT_SECRET =
      process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return res.status(500).send({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    // ==============================
    // CREATE TOKEN
    // ==============================

    const token = jwt.sign(
      {
        userId: userData._id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ==============================
    // SAVE TOKEN IN COOKIE
    // ==============================

    res.cookie("token", token, {
      httpOnly: true,

      secure:
        process.env.MODE === "production",

      sameSite:
        process.env.MODE === "production"
          ? "none"
          : "lax",

      maxAge:
        7 *
        24 *
        60 *
        60 *
        1000,
    });

    // ==============================
    // USER RESPONSE
    // DO NOT SEND PASSWORD
    // ==============================

    const userResponse = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      address: userData.address,
      contactNumber:
        userData.contactNumber,
      role: userData.role,
      profilePic:
        userData.profilePic,
    };

    return res.status(200).send({
      success: true,
      message: "Login Successfully",
      data: userResponse,
    });
  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).send({
      success: false,
      message: "Login Failed",
      error: error.message,
    });
  }
}

// ======================================
// GET CURRENT USER
// ======================================

async function getMe(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found!",
      });
    }

    return res.status(200).send({
      success: true,
      message: "User Found",
      data: user,
    });
  } catch (error) {
    console.log("Get Me Error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed To Get User",
      error: error.message,
    });
  }
}

// ======================================
// UPDATE PROFILE
// ======================================

async function updateProfile(req, res) {
  try {
    const userId = req.user._id;

    const {
      name,
      address,
      contactNumber,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (
      !name ||
      !address ||
      !contactNumber
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Name, address and contact number are required",
      });
    }

    // ==============================
    // UPDATE USER
    // ==============================

    const updatedUser =
      await User.findByIdAndUpdate(
        userId,
        {
          name,
          address,
          contactNumber,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }

    return res.status(200).send({
      success: true,
      message:
        "Profile Updated Successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(
      "Update Profile Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message: "Profile Update Failed",
      error: error.message,
    });
  }
}

// ======================================
// CHANGE PASSWORD
// ======================================

async function changePassword(req, res) {
  try {
    const userId = req.user._id;

    const {
      currentPassword,
      newPassword,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).send({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    // ==============================
    // FIND USER
    // ==============================

    const user = await User.findById(
      userId
    );

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }

    // ==============================
    // CHECK CURRENT PASSWORD
    // ==============================

    const isPasswordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isPasswordMatch) {
      return res.status(400).send({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    // ==============================
    // HASH NEW PASSWORD
    // ==============================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).send({
      success: true,
      message:
        "Password Changed Successfully",
    });
  } catch (error) {
    console.log(
      "Change Password Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message:
        "Password Change Failed",
      error: error.message,
    });
  }
}

// ======================================
// LOGOUT
// ======================================

async function logout(req, res) {
  try {
    // ==============================
    // CLEAR JWT COOKIE
    // ==============================

    res.clearCookie("token", {
      httpOnly: true,

      secure:
        process.env.MODE === "production",

      sameSite:
        process.env.MODE === "production"
          ? "none"
          : "lax",
    });

    return res.status(200).send({
      success: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    console.log(
      "Logout Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message: "Logout Failed",
      error: error.message,
    });
  }
}

// ======================================
// EXPORT
// ======================================

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
};