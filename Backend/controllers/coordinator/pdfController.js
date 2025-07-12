import event from "../../models/eventModel.js";
import ConvenorCommittee from "../../models/convenorCommitteeModel.js";
import PDFDocument from "pdfkit";
import pkg from "number-to-words";
const { toWords } = pkg;

export const generateProgrammePDF = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }
    
    // Fetch convenor committee members
    const convenorMembers = await ConvenorCommittee.find({ isActive: true })
      .sort({ role: -1, createdAt: -1 }); // Chairman first, then by creation date

    const doc = new PDFDocument({ margin: 50 });
    const filename = `NoteOrder_${programme.title.replace(/\s+/g, "_")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // HEADER - Dynamic department names
    const primaryDept = programme.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)";
    const associativeDepts = programme.organizingDepartments?.associative || [];
    
    // Helper function to get department abbreviations
    const getDeptAbbreviation = (deptName) => {
      if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "EEE";
      if (deptName.includes("CYBER SECURITY")) return "CCS";
      if (deptName.includes("INFORMATION TECHNOLOGY")) return "IT";
      if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "ECE";
      if (deptName.includes("MECHANICAL")) return "MECH";
      if (deptName.includes("CIVIL")) return "CIVIL";
      if (deptName.includes("COMPUTER SCIENCE")) return "DCSE";
      // Fallback: extract capital letters
      return deptName.replace(/[^A-Z]/g, '');
    };
    
    // Helper function for department full names with proper formatting
    const getDeptFullName = (deptName) => {
      if (!deptName) return "UNKNOWN DEPARTMENT";
      if (deptName.includes("CYBER SECURITY")) return "Centre for Cyber Security (CCS)";
      if (deptName.includes("COMPUTER SCIENCE")) return "Department of Computer Science and Engineering (DCSE)";
      if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "Department of Electrical and Electronics Engineering (EEE)";
      if (deptName.includes("INFORMATION TECHNOLOGY")) return "Department of Information Technology (IT)";
      if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "Department of Electronics and Communication Engineering (ECE)";
      if (deptName.includes("MECHANICAL")) return "Department of Mechanical Engineering (MECH)";
      if (deptName.includes("CIVIL")) return "Department of Civil Engineering (CIVIL)";
      return deptName; // Return as-is for other departments
    };
    
    // Helper function for Centre header text (shows abbreviated form)
    const getCentreHeaderText = (primary, associative) => {
      const primaryAbbrev = getDeptAbbreviation(primary);
      if (associative.length === 0) {
        return `DEPARTMENT OF ${primaryAbbrev}`;
      }
      const associativeAbbrevs = associative.map(d => getDeptAbbreviation(d));
      return `DEPARTMENT OF ${primaryAbbrev} & ${associativeAbbrevs.map(abbrev => 
        abbrev === 'CCS' ? 'CENTRE FOR CYBER SECURITY' : `DEPARTMENT OF ${abbrev}`
      ).join(' & ')}`;
    };
    
    // Create department header text
    let deptHeaderText = primaryDept;
    if (associativeDepts.length > 0) {
      deptHeaderText += ` & ${associativeDepts.join(" & ")}`;
    }
    
    // Create abbreviations for Letter No
    const primaryAbbrev = getDeptAbbreviation(primaryDept);
    const associativeAbbrevs = associativeDepts.map(d => getDeptAbbreviation(d));
    const letterNoAbbrev = associativeAbbrevs.length > 0 
      ? `${primaryAbbrev}&${associativeAbbrevs.join('&')}`
      : primaryAbbrev;
    
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Centre  :  ${getCentreHeaderText(primaryDept, associativeDepts)}`)
      .moveDown(0.3)
      .text(
        `Letter No.:  Lr. No. 1/TrainingProgramme/${letterNoAbbrev}/${new Date().getFullYear()}`
      )
      .text(`Date      :  ${new Date().toLocaleDateString("en-IN")}`)
      .moveDown(1.2);

    // TITLE
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("NOTE SUBMITTED TO THE CONVENOR COMMITTEE:", {
        align: "center",
        underline: true,
      })
      .moveDown();

    // SUBJECT - Dynamic departments using standardized abbreviations
    const subjectDepts = associativeDepts.length > 0 
      ? `DCSE & ${associativeDepts.map(d => getDeptAbbreviation(d)).join(" & ")}`
      : "DCSE";
    
    doc
      .font("Helvetica")
      .text(`Sub: ${subjectDepts} – Request for `, { continued: true })
      .font("Helvetica-Bold")
      .text("Permission and Approval", { continued: true })
      .font("Helvetica")
      .text(" to conduct a ", { continued: true })
      .font("Helvetica-Bold")
      .text(`${programme.duration} ${programme.mode} Training Programme`, {
        continued: true,
      })
      .text(" on ", { continued: true })
      .text(`"${programme.title}"`, { continued: true })
      .font("Helvetica")
      .text(" - reg.")
      .moveDown()
      .font("Helvetica-Bold")
      .text("******", { align: "center" })
      .moveDown();

    // PARAGRAPH
    const startDate = new Date(programme.startDate);
    const endDate = new Date(programme.endDate);
    const month = startDate.toLocaleString("default", { month: "long" });
    const year = startDate.getFullYear();

    // Create dynamic department text for the paragraph
    const primaryFullName = getDeptFullName(primaryDept);
    let paragraphDeptText = primaryFullName;
    if (associativeDepts.length > 0) {
      const associativeFullNames = associativeDepts.map(d => getDeptFullName(d));
      if (associativeFullNames.length === 1) {
        paragraphDeptText += ` and the ${associativeFullNames[0]}`;
      } else {
        const lastDept = associativeFullNames.pop();
        paragraphDeptText += `, ${associativeFullNames.join(", ")} and the ${lastDept}`;
      }
    }

    doc
      .font("Helvetica")
      .text(
        `The ${paragraphDeptText} seek kind permission and approval to organize a ${
          programme.duration
        } ${programme.mode} Training Programme titled "${
          programme.title
        }" in the month of ${month}, ${year} [Tentative Dates: ${startDate.toLocaleDateString(
          "en-IN"
        )} and ${endDate.toLocaleDateString(
          "en-IN"
        )}] with ${programme.coordinators
          .map((c) => `Dr. ${c.name}`)
          .join(" and ")} as coordinators.`,
        { width: 500, align: 'justify' }
      )
      .moveDown();

    // Add programme description (simplified version)
    doc
      .text(`This comprehensive training programme provides participants with essential understanding and practical skills in ${programme.title.toLowerCase()}. The programme is designed to enhance professional competency and industry-relevant expertise through hands-on learning experiences.`, { width: 500, align: 'justify' })
      .moveDown();

    // PROGRAMME DETAILS
    doc
      .font("Helvetica-Bold")
      .text("The Training Programme Details are as follows:")
      .moveDown(0.5);

    doc.font("Courier-Bold");
    const labelWidth = 18;
    
    const details = [
      { 
        label: "Mode", 
        value: programme.mode === "Offline" 
          ? programme.mode 
          : `${programme.mode} (via MS Teams/G meet/Zoom)` 
      },
      { label: "Duration", value: programme.duration },
      { label: "Target Audience", value: Array.isArray(programme.targetAudience) ? programme.targetAudience.join(", ") : programme.targetAudience.split(",").map(item => item.trim()).join(", ") },
      {
        label: "Resource Persons",
        value: Array.isArray(programme.resourcePersons) ? programme.resourcePersons.join(", ") : programme.resourcePersons.split(",").map(item => item.trim()).join(", "),
      },
    ];
    
    details.forEach(({ label, value }) => {
      const paddedLabel = label.padEnd(labelWidth, " ");
      doc.text(`${paddedLabel}: ${value}`, { width: 450, continued: false });
    });

    doc
      .moveDown(2)
      .font("Helvetica")
      .text(
        "It is requested that permission may be granted to conduct the training programme and to host the details in the Anna University website. It is also requested that permission may be granted to collect registration fee from the participants as detailed in the table below. The tentative budget for the training programme is given in the annexure attached.",
        { width: 500, align: 'justify' }
      )
      .moveDown();

    // REGISTRATION FEE TABLE — BOXED AND ALIGNED
    const fees = programme.budgetBreakdown?.income || [];
    doc
      .font("Helvetica-Bold")
      .text("Registration Fee Structure:", { underline: true })
      .moveDown(0.5);

    const tableX = 50;
    const tableY = doc.y;
    const colWidths = [60, 200, 220];
    const rowHeight = 25;

    // Draw table box
    doc
      .rect(
        tableX,
        tableY,
        colWidths.reduce((a, b) => a + b),
        rowHeight * (fees.length + 1)
      )
      .stroke();

    // Table Headers
    doc
      .font("Helvetica-Bold")
      .text("Sl. No.", tableX + 5, tableY + 7)
      .text("Category", tableX + colWidths[0] + 5, tableY + 7)
      .text(
        "Registration Fee",
        tableX + colWidths[0] + colWidths[1] + 5,
        tableY + 7
      );

    // Table Rows
    doc.font("Helvetica");
    fees.forEach((fee, i) => {
      const y = tableY + rowHeight * (i + 1) + 7;
      doc
        .text(`${i + 1}`, tableX + 5, y)
        .text(fee.category || "", tableX + colWidths[0] + 5, y)
        .text(
          `Rs. ${fee.perParticipantAmount || 0}/- + ${fee.gstPercentage || 0}% GST`,
          tableX + colWidths[0] + colWidths[1] + 5,
          y
        );
    });

    doc.moveDown(fees.length + 2);
    doc
      .text(
        'Hence, it is kindly requested that permission may be given to conduct the training programme and the registration fees may be collected in the form of Demand Draft / Online payment favouring "The Director, CSRC, Anna University, Chennai".',
        50,
        doc.y,
        { width: 500, align: 'left' }
      )
      .moveDown(2);

    // COORDINATORS & SIGNATURES - Dynamic departments
    doc.fontSize(10);
    let currentY = doc.y;
    
    // Helper function for department abbreviations (local copy)
    const getDeptAbbreviationLocal = (deptName) => {
      if (!deptName) return "UNKNOWN";
      if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "EEE";
      if (deptName.includes("CYBER SECURITY")) return "CCS";
      if (deptName.includes("INFORMATION TECHNOLOGY")) return "IT";
      if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "ECE";
      if (deptName.includes("MECHANICAL")) return "MECH";
      if (deptName.includes("CIVIL")) return "CIVIL";
      if (deptName.includes("COMPUTER SCIENCE")) return "DCSE";
      // Fallback: extract capital letters
      return deptName.replace(/[^A-Z]/g, '') || "DEPT";
    };
    
    // Build dynamic signatory list
    const signatories = [];
    
    // Add coordinators section
    signatories.push({
      title: "Co-ordinator(s)",
      names: programme.coordinators.map(coord => `(Dr. ${coord.name})`)
    });
    
    // Add HODs for all departments - but only for the actually selected departments
    const departmentApprovers = programme.departmentApprovers || [];
    
    // Get the actual departments that should have HODs based on organizing departments
    const shouldHaveHODs = new Set();
    
    // Always include primary department (DCSE)
    shouldHaveHODs.add("DCSE");
    shouldHaveHODs.add("COMPUTER SCIENCE");
    
    // Add associative departments
    associativeDepts.forEach(dept => {
      const abbrev = getDeptAbbreviationLocal(dept);
      shouldHaveHODs.add(abbrev);
      shouldHaveHODs.add(dept.toUpperCase());
      
      // Add common variations
      if (abbrev === "EEE") {
        shouldHaveHODs.add("ELECTRICAL");
        shouldHaveHODs.add("ELECTRONICS");
      }
    });
    
    // Filter approvers to only include those for relevant departments
    const relevantApprovers = departmentApprovers.filter(approver => {
      if (!approver?.department) return false;
      
      const deptUpper = approver.department.trim().toUpperCase();
      
      // Check if this department is relevant
      const isRelevant = Array.from(shouldHaveHODs).some(relevantDept => 
        deptUpper.includes(relevantDept) || relevantDept.includes(deptUpper)
      );
      
      return isRelevant;
    });
    
    // Remove duplicates and filter out incomplete department names
    const deptNames = relevantApprovers.map(a => a.department?.trim()).filter(Boolean);
    const filteredApprovers = relevantApprovers.filter(approver => {
      if (!approver?.department) return false;
      
      const currentDept = approver.department.trim();
      
      // Skip if this is a substring of another department name
      const isSubstring = deptNames.some(otherDept => 
        otherDept !== currentDept && 
        otherDept.includes(currentDept) && 
        otherDept.length > currentDept.length
      );
      
      return !isSubstring;
    });
    
    // Process filtered approvers and remove final duplicates
    const uniqueDepartments = new Set();
    const validApprovers = [];
    
    filteredApprovers.forEach(approver => {
      if (approver && approver.department) {
        const deptKey = approver.department.trim().toUpperCase();
        if (!uniqueDepartments.has(deptKey)) {
          uniqueDepartments.add(deptKey);
          validApprovers.push(approver);
        }
      }
    });
    
    if (validApprovers.length > 0) {
      validApprovers.forEach(approver => {
        // Use standardized HOD title instead of the potentially messy hodDesignation
        const deptAbbrev = getDeptAbbreviationLocal(approver.department);
        const title = `HOD of ${deptAbbrev}`;
        
        signatories.push({
          title: title,
          names: []
        });
      });
    } else {
      // Fallback to default DCSE if no department approvers
      signatories.push({
        title: "HOD of DCSE",
        names: []
      });
    }
    
    // Add standard signatories
    signatories.push({
      title: "DIRECTOR, CSRC",
      names: []
    });
    signatories.push({
      title: "REGISTRAR", 
      names: []
    });
    
    // Calculate optimal layout
    const pageWidth = 550;
    const marginLeft = 50;
    const availableWidth = pageWidth - marginLeft;
    const numCols = Math.min(signatories.length, 4); // Max 4 columns to avoid crowding
    const colWidth = availableWidth / numCols;
    
    // Render signatures in a grid layout
    doc.font("Helvetica-Bold");
    signatories.forEach((signatory, i) => {
      const col = i % numCols;
      const row = Math.floor(i / numCols);
      const x = marginLeft + col * colWidth;
      const y = currentY + row * 80; // 80px spacing between rows
      
      // Title
      doc.text(signatory.title, x, y, { width: colWidth - 10, align: 'left' });
      
      // Names (for coordinators)
      if (signatory.names.length > 0) {
        doc.font("Helvetica");
        signatory.names.forEach((name, nameIdx) => {
          doc.text(name, x, y + 15 + nameIdx * 12, { width: colWidth - 10, align: 'left' });
        });
        doc.font("Helvetica-Bold");
      }
    });
    
    // Move down past all signatures
    const numRows = Math.ceil(signatories.length / numCols);
    doc.y = currentY + numRows * 80 + 20;

    // APPROVAL
    doc
      .moveDown(1)
      .font("Helvetica-Bold")
      .text("APPROVED / NOT APPROVED",50,doc.y, { align: "center" })
      .moveDown(1);
    
    // Dynamic convenor committee members - Show only Chairman
    if (convenorMembers.length > 0) {
      // Find chairman
      const chairman = convenorMembers.find(member => member.role === 'Vice-Chancellor' || member.role === 'Chairman');
      
      // Render only chairman
      if (chairman) {
        doc.font("Helvetica-Bold")
          .text(`${chairman.name}`, { align: "center" })
          .text(`${chairman.designation}`, { align: "center" });
        
        doc.text("Anna University, Chennai - 25.", { align: "center" });
        
        doc.text(`${chairman.role}`, { align: "center" });
      } else {
        doc.text("CHAIRMAN", { align: "center" });
      }
    } else {
      // Fallback to default structure if no members found
      doc.text("CHAIRMAN", { align: "center" });
      doc.text("Convenor Committee, Anna University", { align: "center" });
    }

    // PAGE 2 — TENTATIVE BUDGET
    doc.addPage();
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("TENTATIVE BUDGET", { align: "center", underline: true })
      .moveDown();

    // INCOME
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Income", { underline: true })
      .moveDown(0.5);
    doc.font("Helvetica");
    fees.forEach((inc) => {
      const expected = inc.expectedParticipants || 0;
      const amt = inc.perParticipantAmount || 0;
      const gst = inc.gstPercentage || 0;
      const total = expected * amt * (1 - gst / 100);
      doc.text(
        `${
          inc.category
        } = ${expected} × Rs. ${amt} + ${gst}% GST = Rs. ${total.toFixed(2)}/-`
      );
    });

    doc.moveDown();

    // EXPENDITURE TABLE
    doc
      .font("Helvetica-Bold")
      .text("Expenditure:", { underline: true })
      .moveDown(0.5);

    // Use claim bill expenses if available, otherwise use budget breakdown expenses
    const activeExpenses = programme.claimBill?.expenses || programme.budgetBreakdown?.expenses || [];

    const expenses = [
      ...activeExpenses,
      {
        category: "University Overhead (30%)",
        amount: programme.budgetBreakdown?.universityOverhead || 0,
      }
    ];
    
    // Calculate correct total expenditure
    const calculatedTotal = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    expenses.push({
      category: "Total Expenditure",
      amount: calculatedTotal,
    });
    
    const expBoxX = 50;
    const expBoxY = doc.y;
    const expColWidths = [350, 150];
    doc
      .rect(
        expBoxX,
        expBoxY,
        expColWidths[0] + expColWidths[1],
        rowHeight * expenses.length
      )
      .stroke();

    expenses.forEach((e, i) => {
      const y = expBoxY + i * rowHeight + 5;
      doc
        .font("Helvetica")
        .text(e.category, expBoxX + 10, y)
        .text(`Rs. ${e.amount.toFixed(2)}`, expBoxX + expColWidths[0] + 10, y);
    });

    doc.moveDown(3);
    doc
      .font("Helvetica")
      .text(
        "The above budget is tentative. This may vary depending on the number of participants attending the program.",
        72,
        doc.y,
        { width: 500, align: 'left' }
      );
    doc.moveDown(3);
    
    // Use dynamic signature based on organizing departments - same format as claim PDF
    const budgetPrimaryAbbrev = getDeptAbbreviationLocal(primaryDept);
    const budgetAssociativeAbbrevs = associativeDepts.map(d => getDeptAbbreviationLocal(d));
    
    const signatureText = budgetAssociativeAbbrevs.length > 0
      ? `HOD\n${budgetPrimaryAbbrev} & ${budgetAssociativeAbbrevs.join(" & ")}`
      : `HOD\n${budgetPrimaryAbbrev}`;
    
    doc.text(signatureText, { align: "right" });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Error generating PDF", error: error.message });
    }
  }
};