import event from "../../models/eventModel.js";
import PDFDocument from "pdfkit";
import pkg from "number-to-words";
const { toWords } = pkg;

// Helper function to generate fund transfer request page
const generateFundTransferRequest = (doc, programme, approvalDate) => {
  try {
    console.log('=== Generating Fund Transfer Request ===');
    console.log('Programme title:', programme.title);
    console.log('Approval date:', approvalDate);
    
    // Add new page for fund transfer request
    doc.addPage();
    
    // Get dynamic department information
    const primaryDept = programme.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING";
    const associativeDepts = programme.organizingDepartments?.associative || [];
    
    console.log('Primary department:', primaryDept);
    console.log('Associative departments:', associativeDepts);
    
    // Create department header text
    let deptHeaderText = primaryDept;
    if (associativeDepts.length > 0) {
      deptHeaderText += `\n\nAND\n\n${associativeDepts.join("\n\nAND\n\n")}`;
    }
    
    // Header
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(deptHeaderText.toUpperCase(), { align: "center" })
      .moveDown(2);
    
    // Date
    const formattedDate = new Date(approvalDate).toLocaleDateString("en-IN");
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Date: ${formattedDate}`, { align: "right" })
      .moveDown(1);
    
    // To section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("To")
      .moveDown(0.5);
    doc
      .font("Helvetica")
      .text("The Director,")
      .moveDown(0.5)
      .text("CSRC,")
      .moveDown(0.5)
      .text("Anna University, Chennai.")
      .moveDown(2);
    
    // Dear section
    doc.text("Dear Prof.,").moveDown(1);
    
    // Subject
    doc
      .font("Helvetica-Bold")
      .text("Subject: Request to transfer the training programme fund to the centre's fund")
      .font("Helvetica")
      .moveDown(1);
    
    // Calculate registration income and amounts
    console.log('Budget breakdown income array:', programme.budgetBreakdown?.income);
    
    const registrationIncome = programme.budgetBreakdown?.income?.find(inc => {
      const category = inc.category?.toLowerCase() || '';
      const isRegistration = category.includes('registration');
      const isFee = category.includes('fee');
      const isParticipant = category.includes('participant');
      
      console.log(`Checking income category: "${inc.category}" - registration: ${isRegistration}, fee: ${isFee}, participant: ${isParticipant}`);
      console.log(`Income amount for this category: ${inc.income}`);
      
      return isRegistration || isFee || isParticipant;
    });
    
    console.log('Registration income found:', registrationIncome);
    
    // If no specific registration income found, try to get the total income or first income entry
    let totalRegistrationFee = 0;
    if (registrationIncome) {
      totalRegistrationFee = Number(registrationIncome.income) || 0;
    } else if (programme.budgetBreakdown?.income?.length > 0) {
      // If no registration-specific income found, use the total of all income
      totalRegistrationFee = programme.budgetBreakdown.income.reduce((total, inc) => {
        return total + (Number(inc.income) || 0);
      }, 0);
      console.log('No registration income found, using total income:', totalRegistrationFee);
    }
    
    console.log('Final total registration fee:', totalRegistrationFee);
    const gstPercentage = registrationIncome ? registrationIncome.gstPercentage || 0 : 0;
    const universityOverhead = programme.budgetBreakdown?.universityOverhead || (totalRegistrationFee * 0.30);
    
    console.log('Fund transfer calculations:', {
      totalRegistrationFee,
      gstPercentage,
      universityOverhead
    });
    
    // Calculate amounts excluding GST and overhead
    const amountExcludingGSTAndOverhead = totalRegistrationFee - (totalRegistrationFee * gstPercentage / 100) - universityOverhead;
    
    // Calculate overhead for centre (if applicable)
    let overheadForCentre = associativeDepts.length > 0 ? (totalRegistrationFee * 0.10) : 0; // 10% overhead for centre
    
    const totalTransferAmount = amountExcludingGSTAndOverhead + overheadForCentre;
    
    // Main content with validation
    const eventStartDate = new Date(programme.startDate).toLocaleDateString("en-IN");
    const eventEndDate = new Date(programme.endDate).toLocaleDateString("en-IN");
    const programmeTitle = programme.title && programme.title !== 'undefined' ? programme.title : 'Training Programme';
    
    doc
      .text(`The registration fee of Rs. ${totalRegistrationFee.toLocaleString('en-IN')}/-`, { continued: true })
      .text(` (Rupees ${convertToWords(totalRegistrationFee)} Only)`, { continued: true })
      .text(` was credited to the CSRC account for the training programme `)
      .font("Helvetica-Bold")
      .text(`"${programmeTitle}"`, { continued: true })
      .font("Helvetica")
      .text(` conducted on ${eventStartDate}`, { continued: true });
    
    if (eventStartDate !== eventEndDate) {
      doc.text(` and ${eventEndDate}`, { continued: true });
    }
    
    doc
      .text(`. I request you to transfer the funds as detailed below to the ${associativeDepts.length > 0 ? associativeDepts[0] : 'Centre for Cyber Security'}.`)
      .moveDown(1.5);
    
    // Table
    doc.font("Helvetica-Bold");
    
    // Table headers
    const tableStartY = doc.y;
    doc
      .text("S.No.", 60, tableStartY)
      .text("Head of the account", 120, tableStartY)
      .text("Amount", 400, tableStartY);
    
    doc.moveDown(0.5);
    
    // Table line
    const lineY = doc.y;
    doc.moveTo(50, lineY).lineTo(550, lineY).stroke();
    doc.moveDown(0.5);
    
    // Table content
    doc.font("Helvetica");
    
    // Row 1
    doc
      .text("1.", 60)
      .text("Amount excluding GST and the overheads", 120)
      .text(`${Math.round(amountExcludingGSTAndOverhead).toLocaleString('en-IN')}/-`, 400);
    doc.moveDown(0.5);
    
    // Row 2 - Calculate overhead for centre (if applicable)
    overheadForCentre = associativeDepts.length > 0 ? (totalRegistrationFee * 0.10) : 0; // 10% overhead for centre
    if(associativeDepts.length > 0){
      doc
        .text("2.", 60)
        .text(`Overhead for the ${associativeDepts[0]}`, 120)
        .text(`${Math.round(overheadForCentre).toLocaleString('en-IN')}/-`, 400);
      doc.moveDown(0.5);
    }
    // Total line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    
    // Total
    doc
      .font("Helvetica-Bold")
      .text("TOTAL:", 120)
      .text(`${Math.round(totalTransferAmount).toLocaleString('en-IN')}/-`, 400);
    
    doc.moveDown(1.5);
    
    // Account details section
  // Account details - Left aligned
  doc
    .font("Helvetica")
    .text(
      "The account details of the centre are as follows:",
      72,
      doc.y,
      { width: 500, align: 'left' }
    );
  doc.moveDown(2);

  // Empty space for actual account details 
  doc.moveDown(2);

  // Thank you
  doc
    .font("Helvetica-Bold")
    .text(
      "Thanking You,",
      72,
      doc.y,
      { width: 500, align: 'center' }
    );
  doc.moveDown(2);

  // Coordinators with fallback
  const coordinatorsForFundTransfer = [];
  
  // First, try to use programme.coordinators
  if (programme.coordinators && programme.coordinators.length > 0) {
    programme.coordinators.forEach(coord => {
      if (coord.name) {
        coordinatorsForFundTransfer.push({
          name: coord.name,
          designation: coord.designation || 'Coordinator',
          department: coord.department || primaryDept
        });
      }
    });
  }
  
  // If no coordinators found, use createdBy as fallback
  if (coordinatorsForFundTransfer.length === 0 && programme.createdBy) {
    coordinatorsForFundTransfer.push({
      name: programme.createdBy.name || 'Coordinator',
      designation: programme.createdBy.designation || 'Coordinator',
      department: programme.createdBy.department || primaryDept
    });
  }
  
  // If still no coordinators, use default
  if (coordinatorsForFundTransfer.length === 0) {
    coordinatorsForFundTransfer.push({
      name: 'Dr. Coordinator',
      designation: 'Coordinator',
      department: primaryDept
    });
  }

  coordinatorsForFundTransfer.forEach((coord) => {
    doc
      .font("Helvetica-Bold")
      .text(
        "Co-ordinator",
        72,
        doc.y,
        { width: 500, align: 'left' }
      )
      .font("Helvetica")
      .text(
        `Dr. ${coord.name}, ${coord.designation}, ${coord.department}`,
        72,
        doc.y,
        { width: 500, align: 'left' }
      );
    doc.moveDown(0.5);
  });

  doc.moveDown(1);

    
    doc.moveDown(1);
    
    // HOD signatures
    const primaryAbbrev = getDeptAbbreviation(primaryDept);
    const associativeAbbrevs = associativeDepts.map(d => getDeptAbbreviation(d));
    
    if (associativeAbbrevs.length > 0) {
      doc
        .font("Helvetica-Bold")
        .text(`HoD, ${primaryAbbrev}`, { align: "left" })
        .text("&", { align: "left" });
      associativeAbbrevs.forEach(abbrev => {
        doc.text(`Director, ${abbrev}`, { align: "left" });
      });
    } else {
      doc
        .font("Helvetica-Bold")
        .text(`HoD, ${primaryAbbrev}`, { align: "left" });
    }
    
    console.log('Fund transfer request page generated successfully');
  } catch (error) {
    console.error('Error generating fund transfer request:', error);
    throw error;
  }
};

// Helper function for department abbreviations (moved outside for reuse)
const getDeptAbbreviation = (deptName) => {
  if (!deptName) return "UNKNOWN";
  if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "EEE";
  if (deptName.includes("CYBER SECURITY")) return "CCS";
  if (deptName.includes("INFORMATION TECHNOLOGY")) return "IT";
  if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "ECE";
  if (deptName.includes("MECHANICAL")) return "MECH";
  if (deptName.includes("CIVIL")) return "CIVIL";
  if (deptName.includes("COMPUTER SCIENCE")) return "DCSE";
  return deptName.replace(/[^A-Z]/g, '') || "DEPT";
};

export const generateClaimBillPDF = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id)
      .populate('createdBy', 'name email department designation')
      .populate('reviewedBy', 'name email department designation')
      .populate('claimBill.expenses.reviewedBy', 'name email department designation')
      .populate('claimBill.approvedBy', 'name email department designation');
        
    if (!programme || !programme.claimBill) {
      return res
        .status(404)
        .json({ message: "Programme or Claim Bill not found" });
    }

    // Get dynamic department information
    const primaryDept = programme.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)";
    const associativeDepts = programme.organizingDepartments?.associative || [];
    
    // Helper function for department abbreviations
    const getDeptAbbreviation = (deptName) => {
      if (!deptName) return "UNKNOWN";
      if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "EEE";
      if (deptName.includes("CYBER SECURITY")) return "CCS";
      if (deptName.includes("INFORMATION TECHNOLOGY")) return "IT";
      if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "ECE";
      if (deptName.includes("MECHANICAL")) return "MECH";
      if (deptName.includes("CIVIL")) return "CIVIL";
      if (deptName.includes("COMPUTER SCIENCE")) return "DCSE";
      return deptName.replace(/[^A-Z]/g, '') || "DEPT";
    };
    
    // Create department header text
    let deptHeaderText = primaryDept;
    if (associativeDepts.length > 0) {
      deptHeaderText += ` & ${associativeDepts.join(" & ")}`;
    }
    
    // Create abbreviations for signatures
    const primaryAbbrev = getDeptAbbreviation(primaryDept);
    const associativeAbbrevs = associativeDepts.map(d => getDeptAbbreviation(d));

    const doc = new PDFDocument({ margin: 50 });

    // Collect PDF in buffer
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);

      // Store PDF in MongoDB
      programme.claimPDF = {
        data: pdfData,
        contentType: "application/pdf",
        fileName: `ClaimBill_${programme.title.replace(/\s+/g, "_")}.pdf`,
      };

      await programme.save();

      // Send PDF to browser
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${programme.claimPDF.fileName}"`
      );
      res.end(pdfData);
    });

    // Filter expenses to show only approved items with updated amounts
    const expenses = programme.claimBill.expenses || [];
    console.log('🔍 Raw expenses from database:', expenses.map(exp => ({
      category: exp.category,
      itemStatus: exp.itemStatus,
      amount: exp.amount,
      approvedAmount: exp.approvedAmount,
      actualAmount: exp.actualAmount
    })));
    
    const approvedExpenses = expenses.filter(exp => exp.itemStatus === 'approved');
    
    // Use approved amounts instead of original amounts for budget display
    const expensesToShow = approvedExpenses.map((exp, index) => {
      const sanitizedCategory = exp.category && exp.category !== 'undefined' && exp.category.trim() !== '' 
        ? exp.category.trim() 
        : `Expense Item ${index + 1}`;
      
      const amount = exp.approvedAmount || exp.actualAmount || exp.amount || 0;
      
      console.log(`🔍 Processing expense ${index + 1}:`, {
        originalCategory: exp.category,
        sanitizedCategory,
        amount,
        itemStatus: exp.itemStatus
      });
      
      return {
        ...exp,
        // Use approved amount as the display amount
        amount: amount,
        actualAmount: amount,
        // Ensure category is never undefined/null/empty
        category: sanitizedCategory
      };
    });

    console.log('📊 Generating claim PDF with approved expenses only:', {
      totalExpenses: expenses.length,
      approvedExpenses: approvedExpenses.length,
      rejectedExpenses: expenses.length - approvedExpenses.length,
      expensesToShow: expensesToShow.map(exp => ({ category: exp.category, amount: exp.amount }))
    });

    // PDF content generation
    doc
      // PDF content generation - Page 1
      // Add department header
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(deptHeaderText.toUpperCase(), { align: "center" })
      .moveDown(2);

    // Add Budget title with box
    const budgetText = "BUDGET (APPROVED AMOUNTS)";
    const budgetWidth = doc.widthOfString(budgetText) + 40;
    const budgetX = (doc.page.width - budgetWidth) / 2;
    
    // Draw box around BUDGET
    doc.rect(budgetX, doc.y, budgetWidth, 30)
       .fillColor('#e6e6e6')
       .fill()
       .strokeColor('#000000')
       .stroke();
    
    // Draw BUDGET text
    doc.fillColor('#000000')
       .fontSize(16)
       .font("Helvetica-Bold")
       .text(budgetText, budgetX, doc.y - 0, { width: budgetWidth, align: "center" })
       .moveDown(2);

    // Add creation date and approval status
    if (programme.claimBill.createdAt) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Claim Bill Created: ${new Date(programme.claimBill.createdAt).toLocaleDateString("en-IN")} at ${new Date(programme.claimBill.createdAt).toLocaleTimeString("en-IN")}`, { align: "right" })
        .text(`Status: ${programme.claimBill.status?.toUpperCase() || 'PENDING'}`, { align: "right" })
        .text(`Approved Items: ${approvedExpenses.length} of ${expenses.length}`, { align: "right" })
        .moveDown(1);
    }

    // Co-ordinators box with fallback to createdBy
    const coordinatorsToShow = [];
    
    // First, try to use programme.coordinators
    if (programme.coordinators && programme.coordinators.length > 0) {
      programme.coordinators.forEach(coord => {
        if (coord.name && coord.name !== 'undefined' && coord.name.trim() !== '') {
          coordinatorsToShow.push({
            name: coord.name,
            designation: coord.designation && coord.designation !== 'undefined' ? coord.designation : 'Coordinator',
            department: coord.department && coord.department !== 'undefined' ? coord.department : primaryDept
          });
        }
      });
    }
    
    // If no coordinators found, use createdBy as fallback
    if (coordinatorsToShow.length === 0 && programme.createdBy) {
      const createdByName = programme.createdBy.name && programme.createdBy.name !== 'undefined' ? programme.createdBy.name : null;
      if (createdByName && createdByName.trim() !== '') {
        coordinatorsToShow.push({
          name: createdByName,
          designation: programme.createdBy.designation && programme.createdBy.designation !== 'undefined' ? programme.createdBy.designation : 'Coordinator',
          department: programme.createdBy.department && programme.createdBy.department !== 'undefined' ? programme.createdBy.department : primaryDept
        });
      }
    }
    
    // If still no coordinators, use default
    if (coordinatorsToShow.length === 0) {
      coordinatorsToShow.push({
        name: 'Dr. Coordinator',
        designation: 'Coordinator',
        department: primaryDept
      });
    }

    if (coordinatorsToShow.length > 0) {
      const coordStartY = doc.y;
      const coordHeight = (coordinatorsToShow.length * 25) + 20;
      
      // Draw coordinator box
      doc.rect(50, coordStartY, 500, coordHeight)
         .fillColor('#f9f9f9')
         .fill()
         .strokeColor('#000000')
         .stroke();

      coordinatorsToShow.forEach((coord, index) => {
        doc
          .fillColor('#000000')
          .fontSize(11)
          .font("Helvetica-Bold")
          .text("Co-ordinator:", 60, coordStartY + 10 + (index * 25), { continued: true })
          .font("Helvetica")
          .text(` Dr. ${coord.name}, ${coord.designation}, ${coord.department}`);
      });

      doc.moveDown(2);
    }

    // Table Header with borders
    const tableTop = doc.y;
    const tableWidth = 500;
    const columns = {
      sno: { x: 50, width: 50, title: "S.No" },
      description: { x: 100, width: 250, title: "Head of the Expenditure" },
      status: { x: 350, width: 80, title: "Status" },
      amount: { x: 430, width: 120, title: "Approved Amount (Rs)" }
    };
    const rowHeight = 30;

    // Draw table header with grey background
    doc.rect(50, tableTop, tableWidth, rowHeight)
       .fillColor('#e6e6e6')
       .fill()
       .strokeColor('#000000')
       .stroke();

    // Draw header text
    doc.fillColor('#000000')
       .fontSize(11)
       .font("Helvetica-Bold");

    // Draw header columns with vertical lines
    Object.values(columns).forEach(col => {
      // Draw vertical lines
      doc.moveTo(col.x, tableTop)
         .lineTo(col.x, tableTop + rowHeight)
         .stroke();

      // Draw column headers
      doc.text(
        col.title,
        col.x + 5,
        tableTop + 10,
        { width: col.width - 10, align: col.title.includes("Amount") ? "right" : "left" }
      );
    });

    // Draw final vertical line
    doc.moveTo(550, tableTop)
       .lineTo(550, tableTop + rowHeight)
       .stroke();

    let currentY = tableTop + rowHeight;
    let total = 0;

    // Draw table content with boxes - only approved items
    expensesToShow.forEach((exp, idx) => {
      const amt = parseFloat(exp.amount) || 0;
      
      if (amt <= 0) {
        console.warn(`❌ Invalid amount in approved expense[${idx}]:`, exp);
        return;
      }
      total += amt;

      // Draw row box with alternating background
      doc.rect(50, currentY, tableWidth, rowHeight)
         .fillColor(idx % 2 === 0 ? '#ffffff' : '#f8f8f8')
         .fill()
         .strokeColor('#000000')
         .stroke();

      // Draw vertical lines
      Object.values(columns).forEach(col => {
        doc.moveTo(col.x, currentY)
           .lineTo(col.x, currentY + rowHeight)
           .stroke();
      });
      doc.moveTo(550, currentY)
         .lineTo(550, currentY + rowHeight)
         .stroke();

      // Draw cell content
      doc.fillColor('#000000')
         .fontSize(10)
         .font("Helvetica")
         .text(`${idx + 1}.`, columns.sno.x + 5, currentY + 10, { width: columns.sno.width - 10, align: "center" })
         .text(exp.category, columns.description.x + 5, currentY + 10, { width: columns.description.width - 10 })
         .fillColor('#008000')
         .text("APPROVED", columns.status.x + 5, currentY + 10, { width: columns.status.width - 10, align: "center" })
         .fillColor('#000000')
         .text(new Intl.NumberFormat('en-IN', {
           minimumFractionDigits: 2,
           maximumFractionDigits: 2
         }).format(amt), columns.amount.x + 5, currentY + 10, { width: columns.amount.width - 10, align: "right" });

      currentY += rowHeight;
    });

    // Draw total row with distinct styling
    doc.rect(50, currentY, tableWidth, rowHeight)
       .fillColor('#e6e6e6')
       .fill()
       .strokeColor('#000000')
       .lineWidth(1)
       .stroke();

    // Draw vertical lines for total row
    Object.values(columns).forEach(col => {
      doc.moveTo(col.x, currentY)
         .lineTo(col.x, currentY + rowHeight)
         .stroke();
    });
    doc.moveTo(550, currentY)
       .lineTo(550, currentY + rowHeight)
       .stroke();

    // Draw total text and amount
    doc.fillColor('#000000')
       .font("Helvetica-Bold")
       .fontSize(11)
       .text("Total Approved", columns.description.x + 5, currentY + 10, { width: columns.description.width - 10 })
       .text(new Intl.NumberFormat('en-IN', {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2
       }).format(total), columns.amount.x + 5, currentY + 10, { width: columns.amount.width - 10, align: "right" });

    doc.moveDown(3);

    // Add note about rejected items
    if (expenses.length > approvedExpenses.length) {
      const rejectedCount = expenses.length - approvedExpenses.length;
      doc.fontSize(10)
         .fillColor('#ff0000')
         .text(`Note: ${rejectedCount} item(s) were rejected and removed from this budget. Only approved amounts are shown.`, 50)
         .fillColor('#000000')
         .moveDown(1);
    }

    // Add signature section with box
    const signatureY = doc.y;
    doc.rect(50, signatureY, 500, 80)
       .fillColor('#f9f9f9')
       .fill()
       .strokeColor('#000000')
       .stroke();

    // Dynamic signature based on organizing departments
    doc.fillColor('#000000')
       .fontSize(11)
       .font("Helvetica-Bold");

    if (associativeAbbrevs.length > 0) {
      doc.text(`HOD of ${primaryAbbrev}`, 60, signatureY + 20);
      doc.text("&", 60, signatureY + 40);
      associativeAbbrevs.forEach((abbrev, idx) => {
        doc.text(`HOD of ${abbrev}`, 60, signatureY + 40 + ((idx + 1) * 20));
      });
    } else {
      doc.text(`HOD of ${primaryAbbrev}`, 60, signatureY + 30);
    }

    doc.moveDown(2);
    
    // Generate separate pages for each approved expense category
    expensesToShow.forEach((expense, expenseIndex) => {
      // Add new page for each expense
      doc.addPage();
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(deptHeaderText.toUpperCase(), { align: "center" });

      doc.moveDown(1);
      
      // Dynamic Head of Account based on primary department
      const headOfAccount = associativeAbbrevs.length > 0 
        ? `${primaryAbbrev} & ${associativeAbbrevs.join(" & ")} – 2–23–23–47 – Administrative and General Expenses/`
        : `${primaryAbbrev} – 2–23–23–47 – Administrative and General Expenses/`;
      
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Head Of Account: ${headOfAccount}`);

      // Use only this expense's category instead of all categories
      const categoryText = expense.category || 'Miscellaneous Expense';
      doc.font("Helvetica-Oblique").text(`66 ÿýÿý "${categoryText}"`);

      doc.moveDown(1);
      
      // Dynamic Proceeding No. - Use original claim creation date instead of current date
      const proceedingDepts = associativeAbbrevs.length > 0 
        ? `${primaryAbbrev}/${associativeAbbrevs.join("/")}`
        : primaryAbbrev;
      
      // Use the original claim creation date if available, otherwise use current date
      const proceedingDate = programme.claimBill.createdAt 
        ? new Date(programme.claimBill.createdAt).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN");
      
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const financialYear = `${currentYear}-${nextYear.toString().slice(-2)}`;
      
      doc
        .font("Helvetica")
        .text(
          `Proceeding No.: AU/${proceedingDepts}/Training Programme/${financialYear}, Dated: ${proceedingDate}`
        );

      doc.moveDown(1.5);
      
      // Validate and sanitize event details
      const eventTitle = programme.title && programme.title !== 'undefined' ? programme.title : 'Training Programme';
      const venue = programme.venue && programme.venue !== 'undefined' ? programme.venue : 'CEG Campus';
      const mode = programme.mode && programme.mode !== 'undefined' ? programme.mode.toLowerCase() : 'online';
      const dateFrom = new Date(programme.startDate).toLocaleDateString("en-IN");
      const dateTo = new Date(programme.endDate).toLocaleDateString("en-IN");

      doc
        .text("Certified that the expenditure is incurred paid towards ", {
          continued: true,
        })
        .font("Helvetica-Bold")
        .text(`"${categoryText}"`, { continued: true })
        .font("Helvetica")
        .text(
          ` in connection with conduct of ${mode} training programme on "${eventTitle}" held on ${dateFrom} to ${dateTo} in the ${deptHeaderText}, ${venue}, CEG Campus Anna University, Chennai – 25.`
        );

      doc.moveDown(1);
      
      // Use approved amount for this expense
      const expenseAmount = parseFloat(expense.amount) || 0;
      const totalAmount = `${expenseAmount.toFixed(2)}`;

      doc.text(
        `The bill is in order and may be passed for payment of Rs. ${totalAmount}/- (Rupees ${convertToWords(
          expenseAmount
        )} Only).`
      );
      doc.text(`The bill amount has not been claimed previously.`);
      doc.text(`Status: APPROVED - Amount reflects final approved budget.`);

      doc.moveDown(2);
      coordinatorsToShow.forEach((coord) => {
        doc.font("Helvetica-Bold").text(`Co-ordinator`);
        doc
          .font("Helvetica")
          .text(`Dr. ${coord.name}, ${coord.designation}, ${coord.department}`)
          .moveDown(1);
      });

      doc
        .font("Helvetica-Bold");
        
      // Dynamic signature based on organizing departments
      if (associativeAbbrevs.length > 0) {
        doc.text(`HOD of ${primaryAbbrev}`, { align: "left" });
        doc.text("&", { align: "left" });
        associativeAbbrevs.forEach(abbrev => {
          doc.text(`HOD of ${abbrev}`, { align: "left" });
        });
      } else {
        doc.text(`HOD of ${primaryAbbrev}`, { align: "left" });
      }

      doc.moveDown(3);
      doc.text(
        `Bill passed for Rs. ${totalAmount}/-\n\n(Rupees ${convertToWords(expenseAmount)} Only)`,
      );

      doc.moveDown(2);
      
      // Dynamic HOD signature - using only abbreviations
      const directorTitle = associativeAbbrevs.length > 0
        ? `HOD\n${primaryAbbrev} & ${associativeAbbrevs.join(" & ")}`
        : `HOD\n${primaryAbbrev}`;
      
      doc.text(directorTitle, { align: "right" });
    });

    // REMOVE REJECTED ITEMS FROM DATABASE PERMANENTLY
    console.log('🗑️ Removing rejected items from database...');
    const rejectedItems = expenses.filter(exp => exp.itemStatus === 'rejected');
    
    if (rejectedItems.length > 0) {
      console.log(`Removing ${rejectedItems.length} rejected items from database:`, 
        rejectedItems.map(item => ({ category: item.category, status: item.itemStatus }))
      );
      
      // Keep only approved items in the database
      programme.claimBill.expenses = approvedExpenses;
      
      // Update totals to reflect only approved items
      programme.claimBill.totalBudgetAmount = approvedExpenses.reduce(
        (sum, exp) => sum + (exp.approvedAmount || exp.actualAmount || exp.amount || 0), 0
      );
      programme.claimBill.totalExpenditure = programme.claimBill.totalBudgetAmount;
      programme.claimBill.totalApprovedAmount = programme.claimBill.totalBudgetAmount;
      
      console.log('✅ Rejected items removed from database. Remaining approved items:', approvedExpenses.length);
    }

    // APPEND ALL RECEIPTS FOR APPROVED ITEMS WITH DYNAMIC DATA
    console.log('📄 Appending individual receipts for approved items with dynamic data...');
    
    expensesToShow.forEach((expense, index) => {
      // Add new page for each receipt
      doc.addPage();
      
      // Generate receipt for this approved item with proper formatting and dynamic data
      generateReceiptInClaimPDF(doc, programme, expense, index + 1);
    });

    // Update the programme's budget breakdown to reflect only approved amounts
    if (programme.budgetBreakdown && programme.budgetBreakdown.expenses) {
      console.log('🔄 Updating budget breakdown to reflect only approved amounts...');
      
      // Filter budget breakdown expenses to only include approved items
      const approvedBudgetExpenses = programme.budgetBreakdown.expenses.filter(budgetExp => {
        return approvedExpenses.some(approvedExp => 
          approvedExp.category === budgetExp.category
        );
      });

      // Update amounts in budget breakdown to reflect approved amounts
      approvedBudgetExpenses.forEach(budgetExp => {
        const matchingApprovedExp = approvedExpenses.find(approvedExp => 
          approvedExp.category === budgetExp.category
        );
        if (matchingApprovedExp) {
          budgetExp.amount = matchingApprovedExp.approvedAmount || matchingApprovedExp.actualAmount || matchingApprovedExp.amount || 0;
        }
      });

      // Update budget breakdown with only approved expenses
      programme.budgetBreakdown.expenses = approvedBudgetExpenses;
      programme.budgetBreakdown.totalExpenditure = approvedBudgetExpenses.reduce(
        (sum, exp) => sum + (exp.amount || 0), 0
      );

      console.log('✅ Budget breakdown updated to reflect only approved amounts');
    }

    // Save all changes to database
    await programme.save();
    console.log('💾 All changes saved to database');

    // Add fund transfer request page if event is approved and has registration income
    console.log('=== Fund Transfer Request Debug ===');
    console.log('Programme status:', programme.status);
    console.log('Programme budget breakdown income:', programme.budgetBreakdown?.income);
    
    const hasRegistrationIncome = programme.budgetBreakdown?.income?.some(inc => {
      const categoryLower = inc.category?.toLowerCase() || '';
      const hasRegistration = categoryLower.includes('registration');
      const hasFee = categoryLower.includes('fee');
      console.log(`Income category: "${inc.category}" -> registration: ${hasRegistration}, fee: ${hasFee}`);
      return hasRegistration || hasFee;
    });
    
    console.log('Has registration income:', hasRegistrationIncome);
    console.log('Event approved:', programme.status === 'approved');
    
    // Modified condition: Include fund transfer request if event is approved OR if it has registration income
    // This ensures the fund transfer request appears even if the approval status check fails
    if (programme.status === 'approved' || hasRegistrationIncome) {
      console.log('Adding fund transfer request page');
      // Use approval date if available, otherwise use current date
      const approvalDate = programme.departmentApprovers?.find(approver => approver.approved)?.approvedDate || new Date();
      generateFundTransferRequest(doc, programme, approvalDate);
    } else {
      console.log('Fund transfer request not added - conditions not met');
    }

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error generating Claim Bill PDF",
        error: error.message,
      });
    }
  }
};

// New endpoint to generate only the fund transfer request PDF
export const generateFundTransferRequestPDF = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // Check if event is approved
    if (programme.status !== 'approved') {
      return res.status(400).json({ 
        message: "Fund transfer request can only be generated for approved events" 
      });
    }

    // Check if event has registration income
    const hasRegistrationIncome = programme.budgetBreakdown?.income?.some(inc => 
      inc.category?.toLowerCase().includes('registration') || 
      inc.category?.toLowerCase().includes('fee')
    );

    if (!hasRegistrationIncome) {
      return res.status(400).json({ 
        message: "Fund transfer request can only be generated for events with registration income" 
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    // Collect PDF in buffer
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);

      // Send PDF to browser
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Fund_Transfer_Request_${programme.title.replace(/\s+/g, "_")}.pdf"`
      );
      res.end(pdfData);
    });

    // Use approval date if available, otherwise use current date
    const approvalDate = programme.departmentApprovers?.find(approver => approver.approved)?.approvedDate || new Date();
    
    // Generate only the fund transfer request page
    generateFundTransferRequest(doc, programme, approvalDate);

    doc.end();
  } catch (error) {
    console.error("Fund transfer request PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error generating Fund Transfer Request PDF",
        error: error.message,
      });
    }
  }
};

// Helper function to generate receipt within the claim PDF
function generateReceiptInClaimPDF(doc, programme, expense, receiptNumber) {
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  // Get dynamic department information
  const primaryDept = programme.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING";
  const associativeDepts = programme.organizingDepartments?.associative || [];
  
  // Get coordinator details from programme with fallback
  const coordinatorName = programme.coordinators?.[0]?.name || programme.createdBy?.name || 'Coordinator';
  const coordinatorDesignation = programme.coordinators?.[0]?.designation || programme.createdBy?.designation || 'Coordinator';
  const coordinatorDepartment = programme.coordinators?.[0]?.department || programme.createdBy?.department || 'DCSE';
  
  // Create dynamic header based on organizing departments
  let headerText = primaryDept.toUpperCase();
  if (associativeDepts.length > 0) {
    headerText = `${associativeDepts[0].toUpperCase()}\n\nAND\n\n${primaryDept.toUpperCase()}`;
  }
  
  // Header with dynamic departments
  doc.fontSize(16).font('Helvetica-Bold')
     .text(headerText, { align: 'center' })
     .moveDown(3);

  // Receipt title with border
  const receiptTitleY = doc.y;
  doc.rect(200, receiptTitleY - 5, 150, 35)
     .fillColor('#f0f0f0')
     .fill()
     .strokeColor('#000000')
     .stroke();
  
  doc.fillColor('#000000')
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('RECEIPT', 200, receiptTitleY + 5, { width: 150, align: 'center' })
     .moveDown(3);

  // Date (right aligned) with dynamic formatting
  doc.fontSize(12).font('Helvetica')
     .text(`Date: ${currentDate}`, 400, doc.y)
     .moveDown(2);

  // Event details box
  const eventDetailsY = doc.y;
  doc.rect(50, eventDetailsY, 500, 60)
     .fillColor('#f9f9f9')
     .fill()
     .strokeColor('#000000')
     .stroke();

  doc.fillColor('#000000')
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('Event Details:', 60, eventDetailsY + 10)
     .font('Helvetica')
     .text(`Programme: ${programme.title}`, 60, eventDetailsY + 25)
     .text(`Duration: ${new Date(programme.startDate).toLocaleDateString('en-IN')} to ${new Date(programme.endDate).toLocaleDateString('en-IN')}`, 60, eventDetailsY + 40)
     .moveDown(3);

  // Receipt content with enhanced formatting
  const approvedAmount = expense.approvedAmount || expense.actualAmount || expense.amount || 0;
  const amountInWords = convertToWords(approvedAmount);
  
  doc.fontSize(12).font('Helvetica')
     .text(`Received a sum of Rs. ${approvedAmount.toLocaleString('en-IN')}/-`, 50, doc.y)
     .font('Helvetica-Bold')
     .text(`(Rupees ${amountInWords} only)`, 50, doc.y + 20)
     .font('Helvetica')
     .moveDown(2);

  // From section with dynamic department
  const fromDept = associativeDepts.length > 0 ? associativeDepts[0] : 'Centre For Cyber Security';
  doc.text(`From ${fromDept}, Anna University, Chennai - 600025`, 50, doc.y)
     .font('Helvetica-Bold')
     .text(`towards ${expense.category}`, 50, doc.y + 20)
     .font('Helvetica')
     .moveDown(2);

  doc.text(`in connection with a training programme on "${programme.title}".`, 50, doc.y)
     .moveDown(4);

  // Payment details section
  if (expense.description) {
    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .text(`Details: ${expense.description}`, 50, doc.y)
       .font('Helvetica')
       .moveDown(2);
  }

  // Signature section with enhanced formatting
  const signatureY = doc.y;
  doc.rect(50, signatureY, 500, 120)
     .fillColor('#f9f9f9')
     .fill()
     .strokeColor('#000000')
     .stroke();

  doc.fillColor('#000000')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Received by:', 60, signatureY + 15)
     .font('Helvetica')
     .moveDown(1);
  
  doc.text('Signature     :', 60, doc.y)
     .text('_________________________', 150, doc.y)
     .moveDown(2);
  
  doc.text(`Name           : ${coordinatorName}`, 60, doc.y)
     .moveDown(1);
  
  doc.text(`Designation   : ${coordinatorDesignation}`, 60, doc.y)
     .text(`Department    : ${coordinatorDepartment}, CEG, Anna University`, 60, doc.y + 15)
     .moveDown(3);

  // Receipt footer with enhanced information
  const receiptNo = expense.receiptNumber || `RCP-${new Date().getFullYear()}-${String(receiptNumber).padStart(6, '0')}`;
  const footerY = doc.page.height - 120;
  
  doc.rect(50, footerY, 500, 80)
     .fillColor('#e6e6e6')
     .fill()
     .strokeColor('#000000')
     .stroke();

  doc.fillColor('#000000')
     .fontSize(10)
     .font('Helvetica-Bold')
     .text('Receipt Information:', 60, footerY + 10)
     .font('Helvetica')
     .text(`Receipt No: ${receiptNo}`, 60, footerY + 25)
     .text(`Generated on: ${currentDate}`, 60, footerY + 40)
     .text(`Status: APPROVED - Amount: Rs. ${approvedAmount.toLocaleString('en-IN')}/-`, 60, footerY + 55);

  // Add approval details if available
  if (expense.reviewDate) {
    doc.text(`Approved on: ${new Date(expense.reviewDate).toLocaleDateString('en-IN')}`, 300, footerY + 25);
  }
  
  if (expense.reviewedBy) {
    doc.text(`Approved by: ${expense.reviewedBy.name || 'System'}`, 300, footerY + 40);
  }
}

function convertToWords(amount) {
  // Safety check for invalid numbers
  if (isNaN(amount) || amount === null || amount === undefined) {
    console.warn("convertToWords received invalid amount:", amount);
    amount = 0;
  }

  // Ensure it's a valid number
  const safeAmount = Number(amount) || 0;

  try {
    return pkg.toWords(safeAmount).replace(/\b\w/g, (l) => l.toUpperCase());
  } catch (error) {
    console.error("Error in convertToWords:", error, "amount:", safeAmount);
    return "Zero";
  }
}