import user from "../../../shared/models/userModel.js";

export const getHod = async (req, res) => {
  try {
    const hod = await user
      .findOne({
        role: { $regex: "^HOD$", $options: "i" },
        department: { $regex: "^CSE$", $options: "i" },
      })
      .select("-password");

    res.status(200).send(hod);
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
};