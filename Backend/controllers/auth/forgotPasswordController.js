import User from "../../models/userModel.js";
import nodemailer from "nodemailer";
import decrypt from "../../passwordManager/decryption.js";

export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  try {
    const user = await User.findOne({ email, role });
    if (!user) return res.status(404).json({ message: "Email not found for this role." });

    const plainPassword = await decrypt(user.password); // decrypt stored password

    // setup email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your test email
        pass: process.env.EMAIL_PASS  // app password
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password for Event Management App",
      text: `Hello ${user.name},\n\nHere is your password: ${plainPassword}\n\nPlease keep it safe!`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password sent to your email." });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
