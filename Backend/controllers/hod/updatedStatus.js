import asyncHandler from "express-async-handler";
import event from "../../models/eventModel.js";

export const approveEvent = asyncHandler(async (req, res) => {  
  const {eventId, reviewedBy} = req.body;
  try {
    const updatedEvent = await event.findByIdAndUpdate(
      {
        _id : eventId,
      },
      {
        $set: {
          status: "approved",
          reviewedBy: reviewedBy,
        },
      },
      {
        new: true,
      }
    )
    .populate('createdBy', '_id name email')
    .populate('reviewedBy', '_id name email')
    
    return res.status(200).send(updatedEvent);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

export const rejectEvent = asyncHandler(async (req, res) => {

  const {eventId, reviewedBy} = req.body;
  try {
    const updatedEvent = await event.findByIdAndUpdate(
      {
        _id : eventId,
      },
      {
        $set: {
          status: "rejected",
          reviewedBy: reviewedBy,
        },
      },
      {
        new: true,
      }
    )
    .populate('createdBy', '_id name email')
    .populate('reviewedBy', '_id name email')
    
    return res.status(200).send(updatedEvent);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }

});
