import asyncHandler from "express-async-handler";
import event from "../../models/eventModel.js";

export const addComment = asyncHandler(async (req, res) => {

  const {eventId, comment} = req.body;
  try {
    const result = await event.findByIdAndUpdate(
      { _id: eventId },
      {
        $set: {
          reviewComments: comment,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).send(result);
  }catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});
