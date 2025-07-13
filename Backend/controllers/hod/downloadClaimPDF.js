import event from "../../models/eventModel.js";
import { isValidObjectId } from "mongoose";
import { generateClaimBillPDF } from "../coordinator/claimPdfController.js";

export const downloadClaimPDF = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { forceRegenerate } = req.query; // Add query parameter for force regeneration
    
    // Validate eventId
    if (!eventId || !isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID provided"
      });
    }
    
    // Retrieve event with PDF data
    const result = await event.findById(eventId).select('claimPDF claimBill');
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if claim bill exists
    if (!result.claimBill) {
      return res.status(404).json({
        success: false,
        message: "No claim bill found for this event"
      });
    }

    // Force regeneration if requested, or if PDF doesn't exist/is corrupted
    const shouldRegenerate = forceRegenerate === 'true' || 
                            !result.claimPDF || 
                            !result.claimPDF.data || 
                            result.claimPDF.data.length === 0;

    if (shouldRegenerate) {

      // Redirect to generateClaimBillPDF with the same request/response
      req.params.id = eventId; // Set the id parameter for generateClaimBillPDF
      return await generateClaimBillPDF(req, res);
    }

    // Extract PDF data
    const { data: pdfBuffer, contentType, fileName } = result.claimPDF;
    
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