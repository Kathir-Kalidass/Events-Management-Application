import event from "../../../shared/models/eventModel.js";

// Update event status with comments
export const updateEventStatus = async (req, res) => {
  try {
    const { status, reviewComments } = req.body;
    const eventId = req.params.id;

    if (!status || !eventId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedEvent = await event.findByIdAndUpdate(
      eventId,
      { 
        status, 
        reviewComments: reviewComments || "",
        reviewedBy: req.user?._id || null
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      message: `Event ${status} successfully`,
      event: updatedEvent
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
