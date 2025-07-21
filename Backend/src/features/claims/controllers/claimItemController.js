import Event from "../../../shared/models/eventModel.js";
import TrainingProgramme from "../../../shared/models/TrainingProgramme.js";
import PDFDocument from "pdfkit";
import asyncHandler from "express-async-handler";
import { syncAmountFields, syncClaimBill } from "../../../shared/utils/amountSyncHelper.js";

// Approve or reject individual claim item
export const updateClaimItemStatus = asyncHandler(async (req, res) => {
  try {
    const { eventId, itemIndex } = req.params;
    const { action, approvedAmount, rejectionReason } = req.body;
    const reviewerId = req.user?._id || null; // Handle case where user is not authenticated

    // Validate action
    if (!["approved", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'approved' or 'rejected'" });
    }

    // Find event
    const event = await Event.findById(eventId).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if claim bill exists
    if (!event.claimBill || !event.claimBill.expenses || event.claimBill.expenses.length === 0) {
      return res.status(404).json({ message: "No claim bill found for this event" });
    }

    // Validate item index
    if (itemIndex < 0 || itemIndex >= event.claimBill.expenses.length) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    const claimItem = event.claimBill.expenses[itemIndex];

    // Update item status
    claimItem.itemStatus = action;
    claimItem.reviewedBy = reviewerId;
    claimItem.reviewDate = new Date();

    if (action === "approved") {
      const newApprovedAmount = parseFloat(approvedAmount) || claimItem.actualAmount || claimItem.budgetAmount || 0;
      claimItem.rejectionReason = "";
      claimItem.coordinatorApprovalDate = new Date(); // Set coordinator approval date
      
      // ✅ AUTOMATIC AMOUNT SYNCHRONIZATION
      syncAmountFields(claimItem, newApprovedAmount);
      
      // Generate receipt number if not exists
      if (!claimItem.receiptNumber) {
        const receiptCount = await Event.countDocuments({
          "claimBill.expenses.receiptNumber": { $exists: true, $ne: null }
        });
        const year = new Date().getFullYear();
        claimItem.receiptNumber = `RCP-${year}-${String(receiptCount + 1).padStart(6, '0')}`;
      }
    } else if (action === "rejected") {
      claimItem.rejectionReason = rejectionReason || "Item rejected";
      claimItem.receiptNumber = null;
      claimItem.receiptGenerated = false;
      
      // ✅ AUTOMATIC AMOUNT SYNCHRONIZATION
      syncAmountFields(claimItem);
    }

    // Calculate total approved amount
    event.claimBill.totalApprovedAmount = event.claimBill.expenses.reduce(
      (sum, item) => sum + (item.approvedAmount || 0), 0
    );

    // Update total expenditure to reflect approved amounts
    event.claimBill.totalExpenditure = event.claimBill.totalApprovedAmount;
    
    // Update total budget amount to reflect only approved amounts
    const approvedItemsOnly = event.claimBill.expenses.filter(item => item.itemStatus === "approved");
    event.claimBill.totalBudgetAmount = approvedItemsOnly.reduce(
      (sum, item) => sum + (item.actualAmount || item.amount || 0), 0
    );

    // Update overall claim status based on individual items
    const approvedItems = event.claimBill.expenses.filter(item => item.itemStatus === "approved").length;
    const rejectedItems = event.claimBill.expenses.filter(item => item.itemStatus === "rejected").length;
    const totalItems = event.claimBill.expenses.length;

    if (approvedItems === totalItems) {
      event.claimBill.status = "approved";
    } else if (rejectedItems === totalItems) {
      event.claimBill.status = "rejected";
    } else if (approvedItems > 0 || rejectedItems > 0) {
      event.claimBill.status = "under_review";
    }

    // CRITICAL: Update budget breakdown to reflect only approved amounts
    if (event.budgetBreakdown && event.budgetBreakdown.expenses) {

      // Filter budget breakdown expenses to only include approved items
      const approvedBudgetExpenses = event.budgetBreakdown.expenses.filter(budgetExp => {
        return approvedItemsOnly.some(approvedExp => 
          approvedExp.category === budgetExp.category
        );
      });

      // Update amounts in budget breakdown to reflect approved amounts
      approvedBudgetExpenses.forEach(budgetExp => {
        const matchingApprovedExp = approvedItemsOnly.find(approvedExp => 
          approvedExp.category === budgetExp.category
        );
        if (matchingApprovedExp) {
          budgetExp.amount = matchingApprovedExp.approvedAmount || matchingApprovedExp.actualAmount || matchingApprovedExp.amount || 0;
        }
      });

      // Update budget breakdown with only approved expenses
      event.budgetBreakdown.expenses = approvedBudgetExpenses;
      event.budgetBreakdown.totalExpenditure = approvedBudgetExpenses.reduce(
        (sum, exp) => sum + (exp.amount || 0), 0
      );

    }

    // Mark the claim bill as modified to ensure database update
    event.markModified('claimBill');
    event.markModified('budgetBreakdown');
    await event.save();

    res.json({
      message: `Claim item ${action} successfully`,
      claimItem: {
        category: claimItem.category,
        actualAmount: claimItem.actualAmount, // Return the updated actualAmount
        amount: claimItem.amount, // ✅ FIX: Also return the updated amount field
        budgetAmount: claimItem.budgetAmount, // Return the updated budgetAmount
        itemStatus: claimItem.itemStatus,
        approvedAmount: claimItem.approvedAmount,
        rejectionReason: claimItem.rejectionReason,
        receiptNumber: claimItem.receiptNumber,
        reviewDate: claimItem.reviewDate,
        coordinatorApprovalDate: claimItem.coordinatorApprovalDate
      },
      totalApprovedAmount: event.claimBill.totalApprovedAmount,
      overallStatus: event.claimBill.status
    });

  } catch (error) {
    console.error('Error updating claim item status:', error);
    res.status(500).json({
      message: 'Error updating claim item status',
      error: error.message
    });
  }
});

// Generate receipt for approved claim item
export const generateReceipt = asyncHandler(async (req, res) => {
  try {
    const { eventId, itemIndex } = req.params;

    // Find event
    const event = await Event.findById(eventId).populate('createdBy', 'name email department');
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Validate item
    if (!event.claimBill || !event.claimBill.expenses || itemIndex >= event.claimBill.expenses.length) {
      return res.status(404).json({ message: "Claim item not found" });
    }

    const claimItem = event.claimBill.expenses[itemIndex];

    // Check if item is approved
    if (claimItem.itemStatus !== "approved") {
      return res.status(400).json({ message: "Receipt can only be generated for approved items" });
    }

    // Generate PDF receipt
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(chunks);
      
      // Store receipt in database
      claimItem.receiptData = {
        data: pdfData,
        contentType: "application/pdf",
        fileName: `Receipt_${claimItem.receiptNumber}.pdf`
      };
      claimItem.receiptGenerated = true;
      
      await event.save();

      // Send PDF response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfData.length);
      res.setHeader("Content-Disposition", `inline; filename="${claimItem.receiptData.fileName}"`);
      res.send(pdfData);
    });

    // Generate receipt content
    generateReceiptContent(doc, event, claimItem);
    doc.end();

  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({
      message: 'Error generating receipt',
      error: error.message
    });
  }
});

// Helper function to generate receipt content
function generateReceiptContent(doc, event, claimItem) {
  // Use coordinator approval date if available, otherwise use current date
  const approvalDate = claimItem.coordinatorApprovalDate 
    ? new Date(claimItem.coordinatorApprovalDate).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  // Get coordinator details dynamically from event creator
  const coordinatorName = event.createdBy?.name || 'Coordinator';
  const coordinatorDesignation = event.createdBy?.designation || 'Coordinator';
  const coordinatorDepartment = event.createdBy?.department || 'DCSE';
  
  // Header - Centre for Cyber Security
  doc.fontSize(16).font('Helvetica-Bold')
     .text('CENTRE FOR CYBER SECURITY (CCS)', { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(14).font('Helvetica-Bold')
     .text('And', { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(16).font('Helvetica-Bold')
     .text('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)', { align: 'center' })
     .moveDown(3);

  // Receipt title
  doc.fontSize(18).font('Helvetica-Bold')
     .text('RECEIPT', { align: 'center' })
     .moveDown(3);

  // Date (right aligned) - Use coordinator approval date
  doc.fontSize(12).font('Helvetica')
     .text(`Date: ${approvalDate}`, 400, doc.y)
     .moveDown(3);

  // Receipt content - exact format as requested
  const amountInWords = numberToWords(claimItem.approvedAmount);
  
  doc.fontSize(12).font('Helvetica')
     .text(`Received a sum of Rs. ${claimItem.approvedAmount.toLocaleString('en-IN')}/-`, 50, doc.y)
     .text(`(Rupees ${amountInWords} only)`, 50, doc.y + 25)
     .moveDown(2);

  doc.text(`From Centre For Cyber Security, Anna University, Chennai - 600025`, 50, doc.y)
     .text(`towards ${claimItem.category}`, 50, doc.y + 25)
     .moveDown(2);

  doc.text(`in connection with a training programme on "${event.title}".`, 50, doc.y)
     .moveDown(6);

  // Signature section - using dynamic coordinator details
  doc.text('Signature     :', 50, doc.y)
     .moveDown(2);
  
  doc.text(`Name           : ${coordinatorName}`, 50, doc.y)
     .moveDown(1);
  
  doc.text(`Designation   : ${coordinatorDesignation}, ${coordinatorDepartment}, CEG,`, 50, doc.y)
     .text('                        Anna University.', 50, doc.y + 20)
     .moveDown(3);

  // Receipt number at bottom
  doc.fontSize(10).font('Helvetica')
     .text(`Receipt No: ${claimItem.receiptNumber}`, 50, doc.page.height - 100)
     .text(`Approved on: ${approvalDate}`, 50, doc.page.height - 80)
     .text(`Generated on: ${currentDate}`, 50, doc.page.height - 60);
}

// Helper function to convert number to words (simplified version)
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

  if (num === 0) return 'Zero';

  function convertHundreds(n) {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  }

  let result = '';
  let thousandIndex = 0;

  while (num > 0) {
    if (num % 1000 !== 0) {
      result = convertHundreds(num % 1000) + thousands[thousandIndex] + ' ' + result;
    }
    num = Math.floor(num / 1000);
    thousandIndex++;
  }

  return result.trim();
}

// Get all claim items with their status
export const getClaimItemsStatus = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('claimBill.expenses.reviewedBy', 'name email')
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.claimBill || !event.claimBill.expenses) {
      return res.status(404).json({ message: "No claim bill found" });
    }

    console.log('Raw claim bill expenses:', JSON.stringify(event.claimBill.expenses, null, 2));

    const itemsWithStatus = event.claimBill.expenses.map((item, index) => ({
      index,
      category: item.category,
      actualAmount: item.actualAmount || item.amount || 0, // Check both field names
      itemStatus: item.itemStatus || 'pending',
      approvedAmount: item.approvedAmount || 0,
      rejectionReason: item.rejectionReason || '',
      receiptNumber: item.receiptNumber || null,
      receiptGenerated: item.receiptGenerated || false,
      reviewedBy: item.reviewedBy || null,
      reviewDate: item.reviewDate || null,
      coordinatorApprovalDate: item.coordinatorApprovalDate || null
    }));

    console.log('Processed items with status:', JSON.stringify(itemsWithStatus, null, 2));

    res.json({
      eventTitle: event.title,
      claimItems: itemsWithStatus,
      totalApprovedAmount: event.claimBill.totalApprovedAmount,
      overallStatus: event.claimBill.status
    });

  } catch (error) {
    console.error('Error fetching claim items status:', error);
    res.status(500).json({
      message: 'Error fetching claim items status',
      error: error.message
    });
  }
});

// Generate consolidated claim bill with all approved items and individual receipts
export const generateConsolidatedClaimBill = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find event
    const event = await Event.findById(eventId).populate('createdBy', 'name email department designation');
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if claim bill exists
    if (!event.claimBill || !event.claimBill.expenses) {
      return res.status(404).json({ message: "No claim bill found" });
    }

    // Get approved and rejected items
    const approvedItems = event.claimBill.expenses.filter(item => item.itemStatus === 'approved');
    const rejectedItemsCount = event.claimBill.expenses.filter(item => item.itemStatus === 'rejected').length;
    
    if (approvedItems.length === 0) {
      return res.status(400).json({ message: "No approved items found to generate consolidated claim bill" });
    }

    // Calculate totals
    const totalApprovedAmount = approvedItems.reduce((sum, item) => sum + (item.approvedAmount || 0), 0);

    // ✅ AUTOMATIC SYNCHRONIZATION: Update all approved items
    approvedItems.forEach(item => {
      syncAmountFields(item, item.approvedAmount);
    });
    
    // ✅ AUTOMATIC SYNCHRONIZATION: Sync entire claim bill
    syncClaimBill(event.claimBill);

    // REMOVE REJECTED ITEMS from database - Keep only approved items
    event.claimBill.expenses = approvedItems; // This removes rejected items permanently
    event.claimBill.totalApprovedAmount = totalApprovedAmount;
    event.claimBill.totalExpenditure = totalApprovedAmount;
    event.claimBill.totalBudgetAmount = totalApprovedAmount; // Update budget to approved amounts
    event.claimBill.status = 'approved';
    event.claimBill.finalizedDate = new Date();

    await event.save();

    // Generate PDF with all individual receipts appended
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfData = Buffer.concat(chunks);
      
      // Send PDF response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfData.length);
      res.setHeader("Content-Disposition", `inline; filename="Consolidated_Claim_Bill_${event.title.replace(/\s+/g, '_')}.pdf"`);
      res.send(pdfData);
    });

    // Generate consolidated claim bill with all receipts appended
    generateConsolidatedClaimWithReceipts(doc, event, approvedItems, totalApprovedAmount, rejectedItemsCount);
    doc.end();

  } catch (error) {
    console.error('Error generating consolidated claim bill:', error);
    res.status(500).json({
      message: 'Error generating consolidated claim bill',
      error: error.message
    });
  }
});

// Helper function to generate consolidated claim bill with all receipts appended
function generateConsolidatedClaimWithReceipts(doc, event, approvedItems, totalApprovedAmount, rejectedItemsCount) {
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  // Get coordinator details dynamically
  const coordinatorName = event.createdBy?.name || 'Coordinator';
  const coordinatorDesignation = event.createdBy?.designation || 'Coordinator';
  const coordinatorDepartment = event.createdBy?.department || 'DCSE';

  // PAGE 1: CONSOLIDATED SUMMARY
  // Header - Centre for Cyber Security
  doc.fontSize(16).font('Helvetica-Bold')
     .text('CENTRE FOR CYBER SECURITY (CCS)', { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(14).font('Helvetica-Bold')
     .text('And', { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(16).font('Helvetica-Bold')
     .text('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)', { align: 'center' })
     .moveDown(2);

  // Title
  doc.fontSize(18).font('Helvetica-Bold')
     .text('CONSOLIDATED CLAIM BILL', { align: 'center' })
     .moveDown(2);

  // Event Details
  doc.fontSize(12).font('Helvetica')
     .text(`Event: ${event.title}`, 50)
     .text(`Date: ${new Date(event.startDate).toLocaleDateString('en-IN')} to ${new Date(event.endDate).toLocaleDateString('en-IN')}`, 50)
     .text(`Coordinator: ${coordinatorName}`, 50)
     .text(`Generated on: ${currentDate}`, 50)
     .moveDown(2);

  // Summary Statistics
  doc.fontSize(12).font('Helvetica-Bold')
     .text('CLAIM SUMMARY:', 50)
     .moveDown(1);
  
  doc.fontSize(11).font('Helvetica')
     .text(`Total Items Approved: ${approvedItems.length}`, 70)
     .text(`Total Items Rejected: ${rejectedItemsCount} (Removed from final bill)`, 70)
     .text(`Total Approved Amount: ₹${totalApprovedAmount.toLocaleString('en-IN')}`, 70)
     .text(`Amount in Words: ${numberToWords(totalApprovedAmount)} Rupees Only`, 70)
     .moveDown(2);

  // Table Header
  const tableTop = doc.y;
  const itemX = 50;
  const approvedX = 250;
  const receiptX = 380;
  const statusX = 480;

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Item Category', itemX, tableTop);
  doc.text('Approved Amount', approvedX, tableTop);
  doc.text('Receipt No.', receiptX, tableTop);
  doc.text('Status', statusX, tableTop);

  // Draw line under header
  doc.moveTo(50, tableTop + 15)
     .lineTo(550, tableTop + 15)
     .stroke();

  // Table Content
  let currentY = tableTop + 25;
  doc.fontSize(9).font('Helvetica');

  approvedItems.forEach((item, index) => {
    doc.text(item.category, itemX, currentY);
    doc.text(`₹${(item.approvedAmount || 0).toLocaleString('en-IN')}`, approvedX, currentY);
    doc.text(item.receiptNumber || 'Generated', receiptX, currentY);
    doc.text('APPROVED', statusX, currentY);
    
    currentY += 20;
  });

  // Draw line before totals
  doc.moveTo(50, currentY + 5)
     .lineTo(550, currentY + 5)
     .stroke();

  // Totals
  currentY += 20;
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text('TOTAL APPROVED AMOUNT:', itemX, currentY);
  doc.text(`₹${totalApprovedAmount.toLocaleString('en-IN')}`, approvedX, currentY);

  // Note about rejected items
  doc.fontSize(9)
     .fillColor('red')
     .text('Note: Rejected items have been permanently removed from this claim bill and database.', 50, currentY + 30)
     .text('Budget amounts have been updated to reflect only approved amounts.', 50, currentY + 45)
     .fillColor('black')
     .moveDown(2);

  // Signature section for summary
  doc.fontSize(10)
     .text('Consolidated and Approved by:', 50, currentY + 80)
     .text(`Name: ${coordinatorName}`, 50, currentY + 100)
     .text(`Designation: ${coordinatorDesignation}, ${coordinatorDepartment}, CEG, Anna University`, 50, currentY + 115)
     .text('Signature: ________________________', 50, currentY + 135)
     .text(`Date: ${currentDate}`, 50, currentY + 155);

  // APPEND INDIVIDUAL RECEIPTS FOR EACH APPROVED ITEM
  approvedItems.forEach((item, index) => {
    // Add new page for each receipt
    doc.addPage();
    
    // Generate individual receipt for this item
    generateIndividualReceiptInPDF(doc, event, item, coordinatorName, coordinatorDesignation, coordinatorDepartment);
  });

  // Final page with consolidated signature
  doc.addPage();
  
  // Final consolidation page
  doc.fontSize(16).font('Helvetica-Bold')
     .text('FINAL CONSOLIDATION', { align: 'center' })
     .moveDown(2);

  doc.fontSize(12).font('Helvetica')
     .text('This consolidated claim bill contains:', 50)
     .text(`• Summary of all approved items (${approvedItems.length} items)`, 70)
     .text(`• Individual receipts for each approved item`, 70)
     .text(`• Total approved amount: ₹${totalApprovedAmount.toLocaleString('en-IN')}`, 70)
     .text(`• Rejected items removed from database: ${rejectedItemsCount} items`, 70)
     .moveDown(3);

  doc.text('All amounts in the budget have been updated to reflect approved amounts only.', 50)
     .text('This document serves as the final claim bill for budget completion.', 50)
     .moveDown(4);

  // Final signature
  doc.text('Final Approval:', 50)
     .text(`Coordinator: ${coordinatorName}`, 50)
     .text(`Date: ${currentDate}`, 50)
     .text('Signature: ________________________', 50);
}

// Helper function to generate individual receipt within the PDF
function generateIndividualReceiptInPDF(doc, event, claimItem, coordinatorName, coordinatorDesignation, coordinatorDepartment) {
  // Use coordinator approval date if available, otherwise use current date
  const approvalDate = claimItem.coordinatorApprovalDate 
    ? new Date(claimItem.coordinatorApprovalDate).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  // Header - Centre for Cyber Security
  doc.fontSize(16).font('Helvetica-Bold')
     .text('CENTRE FOR CYBER SECURITY (CCS)', { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(14).font('Helvetica-Bold')
     .text('And', { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(16).font('Helvetica-Bold')
     .text('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)', { align: 'center' })
     .moveDown(3);

  // Receipt title
  doc.fontSize(18).font('Helvetica-Bold')
     .text('RECEIPT', { align: 'center' })
     .moveDown(3);

  // Date (right aligned) - Use coordinator approval date
  doc.fontSize(12).font('Helvetica')
     .text(`Date: ${approvalDate}`, 400, doc.y)
     .moveDown(3);

  // Receipt content - exact format as requested
  const amountInWords = numberToWords(claimItem.approvedAmount);
  
  doc.fontSize(12).font('Helvetica')
     .text(`Received a sum of Rs. ${claimItem.approvedAmount.toLocaleString('en-IN')}/-`, 50, doc.y)
     .text(`(Rupees ${amountInWords} only)`, 50, doc.y + 25)
     .moveDown(2);

  doc.text(`From Centre For Cyber Security, Anna University, Chennai - 600025`, 50, doc.y)
     .text(`towards ${claimItem.category}`, 50, doc.y + 25)
     .moveDown(2);

  doc.text(`in connection with a training programme on "${event.title}".`, 50, doc.y)
     .moveDown(6);

  // Signature section - using dynamic coordinator details
  doc.text('Signature     :', 50, doc.y)
     .moveDown(2);
  
  doc.text(`Name           : ${coordinatorName}`, 50, doc.y)
     .moveDown(1);
  
  doc.text(`Designation   : ${coordinatorDesignation}, ${coordinatorDepartment}, CEG,`, 50, doc.y)
     .text('                        Anna University.', 50, doc.y + 20)
     .moveDown(3);

  // Receipt number at bottom
  doc.fontSize(10).font('Helvetica')
     .text(`Receipt No: ${claimItem.receiptNumber}`, 50, doc.page.height - 100)
     .text(`Approved on: ${approvalDate}`, 50, doc.page.height - 80)
     .text(`Generated on: ${currentDate}`, 50, doc.page.height - 60);
}

// Download existing receipt
export const downloadReceipt = asyncHandler(async (req, res) => {
  try {
    const { eventId, itemIndex } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.claimBill || !event.claimBill.expenses || itemIndex >= event.claimBill.expenses.length) {
      return res.status(404).json({ message: "Claim item not found" });
    }

    const claimItem = event.claimBill.expenses[itemIndex];

    if (!claimItem.receiptData || !claimItem.receiptData.data) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    const { data: pdfBuffer, contentType, fileName } = claimItem.receiptData;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error downloading receipt:', error);
    res.status(500).json({
      message: 'Error downloading receipt',
      error: error.message
    });
  }
});

// Remove rejected items permanently from database and update budget
export const removeRejectedItems = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if claim bill exists
    if (!event.claimBill || !event.claimBill.expenses) {
      return res.status(404).json({ message: "No claim bill found" });
    }

    // Get rejected items before removal for logging
    const rejectedItems = event.claimBill.expenses.filter(item => item.itemStatus === 'rejected');
    const approvedItems = event.claimBill.expenses.filter(item => item.itemStatus === 'approved');

    if (rejectedItems.length === 0) {
      return res.status(400).json({ message: "No rejected items found to remove" });
    }

    console.log(`🗑️ Removing ${rejectedItems.length} rejected items from database:`, 
      rejectedItems.map(item => ({ category: item.category, status: item.itemStatus, amount: item.actualAmount }))
    );

    // Keep only approved items in the database
    event.claimBill.expenses = approvedItems;

    // Recalculate totals based on approved items only
    const totalApprovedAmount = approvedItems.reduce(
      (sum, item) => sum + (item.approvedAmount || item.actualAmount || item.amount || 0), 0
    );

    event.claimBill.totalBudgetAmount = totalApprovedAmount;
    event.claimBill.totalExpenditure = totalApprovedAmount;
    event.claimBill.totalApprovedAmount = totalApprovedAmount;

    // Update budget breakdown to reflect only approved items
    if (event.budgetBreakdown && event.budgetBreakdown.expenses) {

      // Filter budget breakdown expenses to only include approved items
      const approvedBudgetExpenses = event.budgetBreakdown.expenses.filter(budgetExp => {
        return approvedItems.some(approvedExp => 
          approvedExp.category === budgetExp.category
        );
      });

      // Update amounts in budget breakdown to reflect approved amounts
      approvedBudgetExpenses.forEach(budgetExp => {
        const matchingApprovedExp = approvedItems.find(approvedExp => 
          approvedExp.category === budgetExp.category
        );
        if (matchingApprovedExp) {
          budgetExp.amount = matchingApprovedExp.approvedAmount || matchingApprovedExp.actualAmount || matchingApprovedExp.amount || 0;
        }
      });

      // Update budget breakdown with only approved expenses
      event.budgetBreakdown.expenses = approvedBudgetExpenses;
      event.budgetBreakdown.totalExpenditure = approvedBudgetExpenses.reduce(
        (sum, exp) => sum + (exp.amount || 0), 0
      );

    }

    // Update claim status
    if (approvedItems.length === 0) {
      event.claimBill.status = "rejected";
    } else {
      event.claimBill.status = "approved";
    }

    // Mark fields as modified and save
    event.markModified('claimBill');
    event.markModified('budgetBreakdown');
    await event.save();

    res.json({
      message: `Successfully removed ${rejectedItems.length} rejected items from database`,
      removedItems: rejectedItems.length,
      remainingApprovedItems: approvedItems.length,
      newTotalAmount: totalApprovedAmount,
      updatedStatus: event.claimBill.status,
      removedItemCategories: rejectedItems.map(item => item.category)
    });

  } catch (error) {
    console.error('Error removing rejected items:', error);
    res.status(500).json({
      message: 'Error removing rejected items',
      error: error.message
    });
  }
});