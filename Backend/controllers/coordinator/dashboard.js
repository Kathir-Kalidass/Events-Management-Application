import event from "../../models/eventModel.js";
import user from "../../models/userModel.js";
import PDFDocument from "pdfkit";
import pkg from "number-to-words";
const { toWords } = pkg;

// Create a new training programme
export const createProgramme = async (req, res) => {
  console.log("dashboard2");
  console.log("📥 Received POST request");
  try {
    console.log(req.body);

    if (!req.body.title || !req.body.startDate || !req.body.endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const programme = new event({
      title: req.body.title,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      venue: req.body.venue,
      mode: req.body.mode || "Online",
      duration: req.body.duration,
      type: req.body.type,
      objectives: req.body.objectives,
      outcomes: req.body.outcomes,
      budget: Number(req.body.budget) || 0,
      coordinators: JSON.parse(req.body.coordinators || "[]"),
      targetAudience: JSON.parse(req.body.targetAudience || "[]"),
      resourcePersons: JSON.parse(req.body.resourcePersons || "[]"),

      approvers: JSON.parse(req.body.approvers || "[]"),

      budgetBreakdown: JSON.parse(req.body.budgetBreakdown || "{}"),
      createdBy: req.body.createdBy,
      reviewedBy: req.body.reviewedBy,
    });

    if (req.file) {
      programme.brochure = {
        fileName: req.file.filename,
        filePath: req.file.path,
        contentType: req.file.mimetype,
      };
    }

    const savedProgramme = await programme.save();
    console.log("✅ Saved Programme:", savedProgramme);
    res.status(201).json(savedProgramme);
  } catch (error) {
    console.error("❌ Error creating programme:", error);
    res.status(500).json({
      message: "Error creating programme",
      error: error.message,
    });
  }
};
//TrainingProgramme
// Get all programmes
export const getProgrammes = async (req, res) => {
  try {
    const programmes = await event
      .find({})
      .select("-brochure")
      .sort({ createdAt: -1 });
    res.json(programmes);
  } catch (error) {
    console.error("❌ Error fetching programmes:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single programme by ID
export const getProgrammeById = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }
    res.json(programme);
  } catch (error) {
    console.error("❌ Error fetching programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update programme
export const updateProgramme = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    const {
      title,
      startDate,
      endDate,
      venue,
      mode,
      duration,
      type,
      objectives,
      outcomes,
      budget,
      coordinators,
      targetAudience,
      resourcePersons,
      registrationFees,
      approvers,
      paymentDetails,
      budgetBreakdown,
    } = req.body;

    programme.title = title || programme.title;
    programme.startDate = startDate ? new Date(startDate) : programme.startDate;
    programme.endDate = endDate ? new Date(endDate) : programme.endDate;
    programme.venue = venue || programme.venue;
    programme.mode = mode || programme.mode;
    programme.duration = duration || programme.duration;
    programme.type = type || programme.type;
    programme.objectives = objectives || programme.objectives;
    programme.outcomes = outcomes || programme.outcomes;
    programme.budget = budget ? Number(budget) : programme.budget;
    programme.coordinators = coordinators
      ? JSON.parse(coordinators)
      : programme.coordinators;
    programme.targetAudience = targetAudience
      ? JSON.parse(targetAudience)
      : programme.targetAudience;
    programme.resourcePersons = resourcePersons
      ? JSON.parse(resourcePersons)
      : programme.resourcePersons;

    programme.approvers = approvers
      ? JSON.parse(approvers)
      : programme.approvers;

    programme.budgetBreakdown = budgetBreakdown
      ? JSON.parse(budgetBreakdown)
      : programme.budgetBreakdown;

    if (req.file) {
      programme.brochure = {
        fileName: req.file.filename,
        filePath: req.file.path,
        contentType: req.file.mimetype,
      };
    }

    const updatedProgramme = await programme.save();
    res.json(updatedProgramme);
  } catch (error) {
    console.error("❌ Error updating programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete programme
export const deleteProgramme = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }
    await programme.deleteOne();
    res.json({ message: "Programme removed" });
  } catch (error) {
    console.error("❌ Error deleting programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// Handle claim bill submission
export const handleClaimBillSubmission = async (req, res) => {
  console.log("claimbill submission");
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    const { expenses } = req.body;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res
        .status(400)
        .json({ message: "Expenses should be a non-empty array" });
    }

    // Calculate total expenditure
    const totalExpenditure = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    // ✅ Store under new 'claimBill' field
    programme.claimBill = {
      expenses,
      totalExpenditure,
    };

    await programme.save();

    res.status(200).json({ message: "Claim bill stored successfully" });
  } catch (error) {
    console.error("❌ Error submitting claim bill:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ... (your existing imports and other controller functions)
export const generateProgrammePDF = async (req, res) => {
  console.log("controller-1");
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `NoteOrder_${programme.title.replace(/\s+/g, "_")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // HEADER
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Centre  :  DEPARTMENT OF CSE & CENTRE FOR CYBER SECURITY")
      .moveDown(0.3)
      .text(
        `Letter No.:  Lr. No. 1/TrainingProgramme/CSE&CCS/${new Date().getFullYear()}`
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

    // SUBJECT
    doc
      .font("Helvetica")
      .text("Sub: DCSE & CCS – Request for ", { continued: true })
      .font("Helvetica-Bold")
      .text("Permission and Approval", { continued: true })
      .font("Helvetica")
      .text(" to conduct a ", { continued: true })
      .font("Helvetica-Bold")
      .text(`${programme.duration} ${programme.mode} Training Programme`, {
        continued: true,
      })
      .text(" on ", { continued: true })
      .text(`“${programme.title}”`, { continued: true })
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

    doc
      .font("Helvetica")
      .text(
        `The Department of Computer Science and Engineering (DCSE) and the Centre for Cyber Security (CCS) seek kind permission and approval to organize a ${
          programme.duration
        } ${programme.mode} Training Programme titled “${
          programme.title
        }” in the month of ${month}, ${year} [Tentative Dates: ${startDate.toLocaleDateString(
          "en-IN"
        )} and ${endDate.toLocaleDateString(
          "en-IN"
        )}] with ${programme.coordinators
          .map((c) => `Dr. ${c.name}`)
          .join(" and ")} as coordinators.`
      )
      .moveDown();

    doc
      .text(
        "LaTeX is a widely adopted document preparation system designed for producing scientific and technical content. The objective of this training programme is to equip ",
        { continued: true }
      )
      .font("Helvetica-Bold")
      .text("students, research scholars, and faculty members", {
        continued: true,
      })
      .font("Helvetica")
      .text(" with essential skills to effectively use LaTeX for preparing ", {
        continued: true,
      })
      .font("Helvetica-Bold")
      .text("research papers, reports, theses, and professional documentation.")
      .moveDown();

    // PROGRAMME DETAILS
    doc
      .font("Helvetica-Bold")
      .text("The Training Programme Details are as follows:")
      .moveDown(0.5);

    doc.font("Courier-Bold");
    const labelWidth = 18;
    const details = [
      { label: "Mode", value: `${programme.mode} (via MS Teams)` },
      { label: "Duration", value: programme.duration },
      { label: "Target Audience", value: programme.targetAudience.join(", ") },
      {
        label: "Resource Persons",
        value: programme.resourcePersons.join(", "),
      },
    ];
    details.forEach(({ label, value }) => {
      const paddedLabel = label.padEnd(labelWidth, " ");
      doc.text(`${paddedLabel}: ${value}`);
    });

    doc
      .moveDown(2)
      .font("Helvetica")
      .text(
        "It is requested that permission may be granted to conduct the training programme and to host the details in the Anna University website. It is also requested that permission may be granted to collect registration fee from the participants as detailed in the table below. The tentative budget for the training programme is given in the annexure attached."
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
          `Rs. ${fee.perParticipantAmount}/- + ${fee.gstPercentage}% GST`,
          tableX + colWidths[0] + colWidths[1] + 5,
          y
        );
    });

    doc.moveDown(fees.length + 2);
    doc
      .text(
        'Hence, it is kindly requested that permission may be given to conduct the training programme and the registration fees may be collected in the form of Demand Draft / Online payment favouring "The Director, CSRC, Anna University, Chennai".'
      )
      .moveDown(2);

    // COORDINATORS
    doc.fontSize(10);
    const baseY = doc.y;
    const colGap = 110; // horizontal spacing
    const colX = [
      50,
      50 + colGap * 1,
      50 + colGap * 2,
      50 + colGap * 3,
      50 + colGap * 4,
    ];
    // SIGNATORY ROW: Titles
    doc.font("Helvetica-Bold");
    doc.text("Co-ordinator(s)", colX[0], baseY);
    doc.text("HOD, DCSE", colX[1], baseY);
    doc.text("DIRECTOR, CCS", colX[2], baseY);
    doc.text("DIRECTOR, CSRC", colX[3], baseY);
    doc.text("REGISTRAR", colX[4], baseY);

    // Coordinator names under "Co-ordinator(s)"
    doc.font("Helvetica");
    programme.coordinators.forEach((coord, idx) => {
      doc.text(`(Dr. ${coord.name})`, colX[0], baseY + 15 + idx * 15);
    });

    // APPROVAL
    doc
      .moveDown(2)
      .font("Helvetica-Bold")
      .text("APPROVED / NOT APPROVED", { align: "center" })
      .moveDown(2);
    doc.text("CHAIRMAN", { align: "center" });
    doc.text("Convenor Committee, Anna University", { align: "center" });

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
      const total = expected * amt * (1 + gst / 100);
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

    const expenses = [
      ...(programme.budgetBreakdown.expenses || []),
      {
        category: "University Overhead (30%)",
        amount: programme.budgetBreakdown.universityOverhead || 0,
      },
      {
        category: "Total Expenditure",
        amount: programme.budgetBreakdown.totalExpenditure || 0,
      },
    ];

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
        "The above budget is tentative. This may vary depending on the number of participants attending the program."
      );
    doc.moveDown(3);
    doc.text("HoD, DCSE & Director, CCS", { align: "right" });

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

export const generateClaimBillPDF = async (req, res) => {
  console.log(req.params.id);
  try {
    const programme = await event.findById(req.params.id);
    console.log(programme.claimBill);
    if (!programme || !programme.claimBill) {
      return res
        .status(404)
        .json({ message: "Programme or Claim Bill not found" });
    }

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

    // PDF content generation
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("BUDGET", { align: "center" })
      .moveDown(1.5);

    // Co-ordinators
    programme.coordinators.forEach((coord) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Co-ordinator", { continued: true })
        .font("Helvetica")
        .text(`  Dr. ${coord.name}, ${coord.designation}, ${coord.department}`);
    });

    doc.moveDown(1.5);

    // Table Header

    doc.fontSize(12).font("Helvetica-Bold");
    doc
      .text("S.No", 60)
      .text("Head of the Expenditure", 120)
      .text("Amount (in rupees)", 400, { align: "right" });
    console.log("580");
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    const expenses = programme.claimBill.expenses || [];
    console.log("Expenses:", expenses);
    let total = 0;
    doc.font("Helvetica");
    expenses.forEach((exp, idx) => {
      const amt = Number(exp.amount);

      if (isNaN(amt)) {
        console.warn(`❌ Skipping invalid amount in expense[${idx}]:`, exp);
        return;
      }

      total += amt;

      doc.text(`${idx + 1}.`, 60); // Serial No.
      doc.text(exp.category || "N/A", 120); // Category
      doc.text(`₹ ${amt.toFixed(2)}`, 400, { align: "right" }); // Amount
      doc.moveDown(0.5);
    });

    // Total
    doc.moveDown(1).font("Helvetica-Bold");
    doc.text(`Total`, 120);
    doc.text(`₹ ${total.toFixed(2)}`, 400, { align: "right" });

    doc.moveDown(2);
    doc.text("HoD, DCSE\n&\nDirector, CCS", { align: "left" });

    // Page 2
    doc.addPage();
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("CENTRE FOR CYBER SECURITY (CCS)", { align: "center" });
    doc.text("And\nDEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)", {
      align: "center",
    });

    doc.moveDown(1);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "Head Of Account: CCS – 2–23–23–47 – Administrative and General Expenses/"
      );

    const categoryText = expenses.map((e) => e.category).join(", ");
    doc.font("Helvetica-Oblique").text(`66 – "${categoryText}"`);

    doc.moveDown(1);
    doc
      .font("Helvetica")
      .text(
        `Proceeding No.: AU/CCS/Training Programme/2025-26, Dated: ${new Date().toLocaleDateString(
          "en-IN"
        )}`
      );

    doc.moveDown(1.5);
    const eventTitle = programme.title;
    const venue = programme.venue;
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
        ` in connection with conduct of online training programme on “${eventTitle}” held on ${dateFrom} and ${dateTo} in the Department of Computer Science and Engineering, ${venue}, CEG Campus Anna University, Chennai – 25.`
      );

    doc.moveDown(1);
    console.log(`total : ${total}`);
    const safeTotal = isNaN(total) ? 0 : total;
    console.log(safeTotal);

    const totalAmount = `Rs. ${safeTotal.toFixed(2)}/-`;

    doc.text(
      `The bill is in order and may be passed for payment of Rs. ${totalAmount}/- (Rupees ${convertToWords(
        safeTotal
      )} Only).`
    );
    doc.text(`The bill amount has not been claimed previously.`);

    doc.moveDown(2);
    programme.coordinators.forEach((coord) => {
      doc.font("Helvetica-Bold").text(`Co-ordinator`);
      doc
        .font("Helvetica")
        .text(`Dr. ${coord.name}, ${coord.designation}, ${coord.department}`)
        .moveDown(1);
    });

    doc
      .font("Helvetica-Bold")
      .text("HoD, DCSE\n&\nDirector, CCS", { align: "left" });

    doc.moveDown(3);
    doc.text(
      "Bill passed for Rs. ____________\n(Rupees _____________________________ )"
    );

    doc.moveDown(2);
    doc.text("Director\nCentre for Cyber Security", { align: "right" });

    console.log("Total (for words):", safeTotal);
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

export const getHod = async (req, res) => {
  try {
    const hod = await user
      .findOne({
        role: { $regex: "^HOD$", $options: "i" },
        department: { $regex: "^CSE$", $options: "i" },
      })
      .select("-password");

    res.status(200).send(hod);
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
};

function convertToWords(amount) {
  return toWords(amount).replace(/\b\w/g, (l) => l.toUpperCase());
}
