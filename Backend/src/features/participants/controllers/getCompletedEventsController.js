import ParticipantEvent from "../../../shared/models/ParticipantEventModel.js";
import Event from "../../../shared/models/eventModel.js";

const getCompletedEvents = async (req, res) => {
  try {
    const participantId = req.user._id; // from JWT auth middleware

    // Find events the participant attended
    const attendedRecords = await ParticipantEvent.find({
      participantId,
      attended: true
    }).populate("eventId");

    // Filter only completed events
    const completedEvents = attendedRecords
      .filter(record => record.eventId.status === "completed")
      .map(record => ({
        eventId: record.eventId._id,
        title: record.eventId.title,
        startDate: record.eventId.startDate,
        endDate: record.eventId.endDate
      }));

    res.status(200).json(completedEvents);
  } catch (err) {
    console.error("Error fetching completed events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default getCompletedEvents;
