import event from "../../models/eventModel.js";
import { isValidObjectId } from "mongoose";

export const downloadClaimPDF = async (req, res) => {
  console.log("coordinator download claim pdf");
  try {
    const { eventId } = req.params;
    
    // Validate eventId
    if (!eventId || !isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID provided"
      });
    }
    
    // Retrieve event with PDF data
    const result = await event.findById(eventId).select('claimPDF');
    
    if (!result) {
      console.log("no pdf found in db!");
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    if (!result.claimPDF || !result.claimPDF.data) {
      return res.status(404).json({
        success: false,
        message: "No PDF found for this event"
      });
    }

    // Extract PDF data
    const { data: pdfBuffer, contentType, fileName } = result.claimPDF;
    
    // Validate PDF data
    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(404).json({
        success: false,
        message: "PDF data is empty or corrupted"
      });
    }
    
    // Set response headers for PDF
    res.setHeader("Content-Type", contentType || "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Content-Disposition", `inline; filename="${fileName || 'claim-document.pdf'}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    
    // Send PDF buffer to frontend
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("❌ Error downloading PDF:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};