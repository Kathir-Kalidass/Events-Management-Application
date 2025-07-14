import User from "../../models/userModel.js";

const registerUser = async (req, res) => {
  const { name, email, password, department, role } = req.body;

  if (!role) return res.status(400).json({ message: "Role is required" });

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Already registered" });
    }

    // Don't hash password here - let the mongoose pre-save hook handle it
    const newUser = new User({
      name,
      email,
      password, // Use plain password - pre-save hook will hash it
      department,
      role
    });

    await newUser.save();
    res.status(201).json({ message: "Registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });

  }
};

export default registerUser;
