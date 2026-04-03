import User from "../models/User.js";

// 🟢 Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Get user by ID (public info)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Update profile info (name, bio, skills, hourlyRate)
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, hourlyRate } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    if (hourlyRate) user.hourlyRate = hourlyRate;

    await user.save();

    const userResponse = { ...user._doc };
    delete userResponse.password;

    res.json({ message: "Profile updated", user: userResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Build a public URL that the browser can load
    const filename = req.file.filename; // requires multer diskStorage
    const base = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    user.profilePhoto = `${base}/uploads/${filename}`;

    await user.save();

    return res.json({
      message: "Profile photo updated",
      profilePhoto: user.profilePhoto,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};