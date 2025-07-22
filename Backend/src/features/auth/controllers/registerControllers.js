import User from "../../../shared/models/userModel.js";

const registerUser = async (req, res) => {
  const { name, email, password, department, role } = req.body;

  if (!role) return res.status(400).json({ message: "Role is required" });

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Already registered" });
    }

    // Handle HOD registration - ensure only one active HOD
    if (role === 'hod') {
      // Check if there's already an active HOD
      const existingActiveHOD = await User.findOne({ 
        role: 'hod', 
        isActive: true 
      });

      if (existingActiveHOD) {
        // Deactivate the existing HOD
        existingActiveHOD.isActive = false;
        existingActiveHOD.signature.isActive = false;
        await existingActiveHOD.save();
        
        console.log(`✅ Deactivated existing HOD: ${existingActiveHOD.name} (${existingActiveHOD.email})`);
      }
    }

    // Don't hash password here - let the mongoose pre-save hook handle it
    const newUser = new User({
      name,
      email,
      password, // Use plain password - pre-save hook will hash it
      department,
      role,
      isActive: role === 'hod' ? true : undefined // Set HOD as active, others use default
    });

    await newUser.save();

    let message = "Registered successfully";
    if (role === 'hod') {
      message = "HOD registered successfully and set as active. Previous HOD has been deactivated.";
    }

    res.status(201).json({ 
      message,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        isActive: newUser.isActive
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
};

export default registerUser;
