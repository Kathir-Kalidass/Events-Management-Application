import User from '../../models/userModel.js';
import decrypt from '../../passwordManager/decryption.js';
import jwt from 'jsonwebtoken';

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Step 2: Compare password using decrypt()
    const isMatch = await decrypt(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Step 3: Sign JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Step 4: Send role & token
    res.status(200).json({
      message: "Login successful",
      role: user.role,
      name: user.name,
      email:user.email,
      _id:user._id,
      token
    });

  }catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Login error", error });
  }
};

export default loginUser;
