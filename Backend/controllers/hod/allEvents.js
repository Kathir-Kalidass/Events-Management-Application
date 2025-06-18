import asyncHandler from "express-async-handler";
import event from "../../models/eventModel.js";

export const allEvents = asyncHandler(async(req, res)=>{
  try{
      const result = await event.find()
      .populate('createdBy', '_id name email')
      .populate('reviewedBy', '_id name email')
      res.status(200).send(result);
  }catch(error){
    res.status(500);
    throw new Error(error.message);
  }
});