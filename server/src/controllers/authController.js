import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validataion
    if (!username || !email || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
    });
    
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {

    // Handle validation errors from Mongoose
    if(error.name === "ValidationError") {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ 
            success: false,
            message: messages.join(", ") 
        });
    }

    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        // Validation
        if(!email || !password){
            return res.status(400).json({
                success: 'false',
                message: 'Please provide email and password'
            });
        }

        // Find User
        const user = await User.findOne({
            $or : [{email: email},{username: email}],
        }).select("+password");

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Compare password
        const isPasswordMatch = await user.comparePassword(password)

        if(!isPasswordMatch){
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate token & respond
        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user,
                token,
            }
        });
    }catch(error){
        console.log("Login error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later."
        });
    }
};


// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
      .populate("followers", "username fullName profilePicture")
      .populate("following", "username fullName profilePicture");

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

export { register, login, getMe };