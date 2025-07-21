import event from "../../../shared/models/eventModel.js";
import { isValidObjectId } from "mongoose";
import { generateClaimBillPDF } from "./claimPdfController.js";

export const downloadClaimPDF = async (req, res) => {

  try {
    const { eventId } = req.params;
    
    // Validate eventId
    if (!eventId || !isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID provided"
      });
    }
    
    // Retrieve event with PDF data and populate createdBy for authorization
    const result = await event.findById(eventId).select('claimPDF claimBill createdBy').populate('createdBy', '_id');
    
    if (!result) {

      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Authorization check: Allow coordinators who own the event, HODs, and admins
    if (req.user && req.user.role === 'coordinator' && result.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. You can only download claim PDFs for events you created" 
      });
    }
    
    // HODs and admins have access to all events (no additional check needed)

    // Check if claim bill exists
    if (!result.claimBill) {
      return res.status(404).json({
        success: false,
        message: "No claim bill found for this event"
      });
    }

    // If PDF doesn't exist, generate it using the generateClaimBillPDF function
    if (!result.claimPDF || !result.claimPDF.data) {

      // Redirect to generateClaimBillPDF with the same request/response
      req.params.id = eventId; // Set the id parameter for generateClaimBillPDF
      return await generateClaimBillPDF(req, res);
    }

    // Extract PDF data
    const { data: pdfBuffer, contentType, fileName } = result.claimPDF;
    
    // Validate PDF data
    if (!pdfBuffer || pdfBuffer.length === 0) {

      // Regenerate PDF if data is corrupted
      req.params.id = eventId;
      return await generateClaimBillPDF(req, res);
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