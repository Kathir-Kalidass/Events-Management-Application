import event from "../../models/eventModel.js";
import user from "../../models/userModel.js";
import PDFDocument from "pdfkit";

function convertToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
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
  
  if (num >= 10000000) { // Crores
    return convertHundreds(Math.floor(num / 10000000)) + 'Crore ' + convertToWords(num % 10000000);
  } else if (num >= 100000) { // Lakhs
    return convertHundreds(Math.floor(num / 100000)) + 'Lakh ' + convertToWords(num % 100000);
  } else if (num >= 1000) { // Thousands
    return convertHundreds(Math.floor(num / 1000)) + 'Thousand ' + convertToWords(num % 1000);
  } else {
    return convertHundreds(num);
  }
}

export const generateClaimBillPDF2 = async (req, res) => {

  try {
    const programme = await event.findById(req.params.id);
    
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

    // Collect PDF in buffer - Fixed variable name
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    
    // Create a promise that resolves when PDF is complete
    const pdfPromise = new Promise((resolve, reject) => {
      doc.on("end", async () => {
        try {
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
          res.send(pdfData);
          resolve();
        } catch (error) {
          console.error("Error in PDF end handler:", error);
          reject(error);
        }
      });

      doc.on("error", (error) => {
        console.error("PDF generation error:", error);
        reject(error);
      });
    });

    // PDF content generation - Page 1
    // Add department header
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(deptHeaderText, { align: "center" })
      .moveDown(0.5);

    // Add creation timestamp
    doc.fontSize(10)
       .font("Helvetica")
       .text(`Claim Bill Created: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, { align: "right" })
       .moveDown(1);

    // Add Budget title with box
    const budgetText = "BUDGET";
    const budgetWidth = doc.widthOfString(budgetText) + 40;
    const budgetX = (doc.page.width - budgetWidth) / 2;
    
    // Draw box around BUDGET
    doc.rect(budgetX, doc.y, budgetWidth, 30)
       .fillColor('#f0f0f0')
       .fill()
       .strokeColor('#000000')
       .stroke();
    
    // Draw BUDGET text
    doc.fillColor('#000000')
       .fontSize(16)
       .font("Helvetica-Bold")
       .text(budgetText, budgetX, doc.y - 25, { width: budgetWidth, align: "center" })
       .moveDown(2);

    // Programme Title if available
    if (programme.title) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`Programme Title: ${programme.title}`, { align: "left" })
        .moveDown(1);
    }

    // Co-ordinators section with box
    if (programme.coordinators && programme.coordinators.length > 0) {
      const coordStartY = doc.y;
      const coordHeight = (programme.coordinators.length * 25) + 20;
      
      // Draw coordinator box
      doc.rect(50, coordStartY, 500, coordHeight)
         .fillColor('#f9f9f9')
         .fill()
         .strokeColor('#000000')
         .stroke();

      programme.coordinators.forEach((coord, index) => {
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

    // Table Header
    const tableTop = doc.y;
    const tableWidth = 500;
    const columns = {
      sno: { x: 50, width: 50, title: "S.No" },
      description: { x: 100, width: 300, title: "Head of the Expenditure" },
      amount: { x: 400, width: 150, title: "Amount (₹)" }
    };
    const rowHeight = 30;

    // Draw table header
    doc.rect(50, tableTop, tableWidth, rowHeight)
       .fillColor('#e6e6e6')
       .fill()
       .strokeColor('#000000')
       .stroke();

    // Draw header text
    doc.fillColor('#000000')
       .fontSize(11)
       .font("Helvetica-Bold");

    Object.values(columns).forEach(col => {
      doc.text(
        col.title,
        col.x,
        tableTop + 10,
        { width: col.width, align: col.title === "Amount (₹)" ? "right" : "left" }
      );
      
      // Draw vertical lines
      doc.moveTo(col.x, tableTop)
         .lineTo(col.x, tableTop + rowHeight)
         .stroke();
    });

    // Draw final vertical line
    doc.moveTo(550, tableTop)
       .lineTo(550, tableTop + rowHeight)
       .stroke();

    // Process expenses
    const expenses = programme.claimBill.expenses || [];
    let currentY = tableTop + rowHeight;
    let total = 0;

    // Draw table content
    expenses.forEach((exp, idx) => {
      const amt = Number(exp.amount);
      if (isNaN(amt)) return;
      total += amt;

      // Draw row background and border
      doc.rect(50, currentY, tableWidth, rowHeight)
         .fillColor(idx % 2 === 0 ? '#ffffff' : '#f8f8f8')
         .fill()
         .strokeColor('#000000')
         .stroke();

      // Draw cell content
      doc.fillColor('#000000')
         .fontSize(10)
         .font("Helvetica");

      // Draw S.No
      doc.text(
        `${idx + 1}.`,
        columns.sno.x + 5,
        currentY + 10,
        { width: columns.sno.width - 10, align: "center" }
      );

      // Draw Description
      doc.text(
        exp.category || "N/A",
        columns.description.x + 5,
        currentY + 10,
        { width: columns.description.width - 10 }
      );

      // Draw Amount
      doc.text(
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2
        }).format(amt).replace('INR', '₹'),
        columns.amount.x + 5,
        currentY + 10,
        { width: columns.amount.width - 10, align: "right" }
      );

      // Draw vertical lines
      Object.values(columns).forEach(col => {
        doc.moveTo(col.x, currentY)
           .lineTo(col.x, currentY + rowHeight)
           .stroke();
      });
      doc.moveTo(550, currentY)
         .lineTo(550, currentY + rowHeight)
         .stroke();

      currentY += rowHeight;
    });

    // Draw total row
    doc.rect(50, currentY, tableWidth, rowHeight)
       .fillColor('#e6e6e6')
       .fill()
       .strokeColor('#000000')
       .stroke();

    doc.fillColor('#000000')
       .font("Helvetica-Bold")
       .fontSize(11);

    // Draw "Total" text
    doc.text(
      "Total",
      columns.description.x + 5,
      currentY + 10,
      { width: columns.description.width - 10 }
    );

    // Draw total amount
    doc.text(
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      }).format(total).replace('INR', '₹'),
      columns.amount.x + 5,
      currentY + 10,
      { width: columns.amount.width - 10, align: "right" }
    );

    // Draw vertical lines for total row
    Object.values(columns).forEach(col => {
      doc.moveTo(col.x, currentY)
         .lineTo(col.x, currentY + rowHeight)
         .stroke();
    });
    doc.moveTo(550, currentY)
       .lineTo(550, currentY + rowHeight)
       .stroke();

    // Reset position and move down
    doc.moveDown(2);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text("Head Of Account: CCS – 2–23–23–47 – Administrative and General Expenses/")
      .moveDown(0.5);

    const categoryText = expenses.map((e) => e.category).join(", ");
    doc.font("Helvetica-Oblique").text(`66 – "${categoryText}"`)
      .moveDown(1);

    doc
      .font("Helvetica")
      .text(
        `Proceeding No.: AU/CCS/Training Programme/2025-26, Dated: ${new Date().toLocaleDateString(
          "en-IN"
        )}`
      )
      .moveDown(1.5);

    const eventTitle = programme.title || "Training Programme";
    const venue = programme.venue || "CEG Campus";
    const dateFrom = programme.startDate ? new Date(programme.startDate).toLocaleDateString("en-IN") : "TBD";
    const dateTo = programme.endDate ? new Date(programme.endDate).toLocaleDateString("en-IN") : "TBD";

    doc
      .text("Certified that the expenditure is incurred paid towards ", {
        continued: true,
      })
      .font("Helvetica-Bold")
      .text(`"${categoryText}"`, { continued: true })
      .font("Helvetica")
      .text(
        ` in connection with conduct of online training programme on "${eventTitle}" held on ${dateFrom} to ${dateTo} in the Department of Computer Science and Engineering, ${venue}, CEG Campus Anna University, Chennai – 25.`
      )
      .moveDown(1);

    const safeTotal = isNaN(total) ? 0 : total;

    const totalAmount = `Rs. ${safeTotal.toFixed(2)}/-`;
    const totalInWords = convertToWords(Math.floor(safeTotal));
   
    doc.text(
      `The bill is in order and may be passed for payment of ${totalAmount} (Rupees ${totalInWords}Only).`
    )
    .moveDown(0.5);

    doc.text("The bill amount has not been claimed previously.")
      .moveDown(2);

    if (programme.coordinators && programme.coordinators.length > 0) {
      programme.coordinators.forEach((coord) => {
        doc.font("Helvetica-Bold").text("Co-ordinator");
        doc
          .font("Helvetica")
          .text(`Dr. ${coord.name}, ${coord.designation}, ${coord.department}`)
          .moveDown(1);
      });
    }

    doc
      .font("Helvetica-Bold")
      .text("HoD, DCSE")
      .text("&")
      .text("Director, CCS")
      .moveDown(3);

    doc.text(
      "Bill passed for Rs. ____________"
    )
    .moveDown(0.5);
    
    doc.text("(Rupees _____________________________ )")
      .moveDown(2);

    doc.text("Director", { align: "right" });
    doc.text("Centre for Cyber Security", { align: "right" });

    // End the document to trigger the 'end' event
    doc.end();
    
    // Wait for the PDF to be processed
    await pdfPromise;
    
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

/*
function convertToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
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
  
  if (num >= 10000000) { // Crores
    return convertHundreds(Math.floor(num / 10000000)) + 'Crore ' + convertToWords(num % 10000000);
  } else if (num >= 100000) { // Lakhs
    return convertHundreds(Math.floor(num / 100000)) + 'Lakh ' + convertToWords(num % 100000);
  } else if (num >= 1000) { // Thousands
    return convertHundreds(Math.floor(num / 1000)) + 'Thousand ' + convertToWords(num % 1000);
  } else {
    return convertHundreds(num);
  }
}
export const generateClaimBillPDF2 = async (req, res) => {

  try {
    const programme = await event.findById(req.params.id);
    
    if (!programme || !programme.claimBill) {

      return res
        .status(404)
        .json({ message: "Programme or Claim Bill not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    // Collect PDF in buffer
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    
    // Set up the end handler but don't call doc.end() inside it
    const pdfEndPromise = new Promise((resolve) => {
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
        resolve();
      });
    });

    // PDF content generation - Page 1
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("BUDGET", { align: "center" })
      .moveDown(1.5);

    // Co-ordinators
    if (programme.coordinators && programme.coordinators.length > 0) {
      programme.coordinators.forEach((coord) => {
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("Co-ordinator: ", { continued: true })
          .font("Helvetica")
          .text(`Dr. ${coord.name}, ${coord.designation}, ${coord.department}`)
          .moveDown(0.5);
      });
    }

    doc.moveDown(1);

    // Table Header
    const startY = doc.y;
    doc.fontSize(12).font("Helvetica-Bold");
    
    // Use moveDown and proper positioning
    doc.text("S.No", 60, startY);
    doc.text("Head of the Expenditure", 120, startY);
    doc.text("Amount (in rupees)", 400, startY);
    
    doc.moveDown(0.5);
    const lineY = doc.y;
    doc.moveTo(50, lineY).lineTo(550, lineY).stroke();
    doc.moveDown(0.5);

    const expenses = programme.claimBill.expenses || [];

    let total = 0;
    
    doc.font("Helvetica");
    expenses.forEach((exp, idx) => {
      const amt = Number(exp.amount);

      if (isNaN(amt)) {
        console.warn(`❌ Skipping invalid amount in expense[${idx}]:`, exp);
        return;
      }

      total += amt;
      
      const currentY = doc.y;
      doc.text(`${idx + 1}.`, 60, currentY);
      doc.text(exp.category || "N/A", 120, currentY);
      doc.text(`₹ ${amt.toFixed(2)}`, 400, currentY);
      doc.moveDown(0.5);
    });

    // Total
    doc.moveDown(0.5);
    const totalY = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Total", 120, totalY);
    doc.text(`₹ ${total.toFixed(2)}`, 400, totalY);

    doc.moveDown(2);
    doc.text("HoD, DCSE");
    doc.text("&");
    doc.text("Director, CCS");

    // Page 2
    doc.addPage();
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("CENTRE FOR CYBER SECURITY (CCS)", { align: "center" })
      .moveDown(0.5);
    
    doc.text("And", { align: "center" })
      .moveDown(0.5);
    
    doc.text("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)", {
      align: "center",
    })
    .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text("Head Of Account: CCS – 2–23–23–47 – Administrative and General Expenses/")
      .moveDown(0.5);

    const categoryText = expenses.map((e) => e.category).join(", ");
    doc.font("Helvetica-Oblique").text(`66 – "${categoryText}"`)
      .moveDown(1);

    doc
      .font("Helvetica")
      .text(
        `Proceeding No.: AU/CCS/Training Programme/2025-26, Dated: ${new Date().toLocaleDateString(
          "en-IN"
        )}`
      )
      .moveDown(1.5);

    const eventTitle = programme.title || "Training Programme";
    const venue = programme.venue || "CEG Campus";
    const dateFrom = programme.startDate ? new Date(programme.startDate).toLocaleDateString("en-IN") : "TBD";
    const dateTo = programme.endDate ? new Date(programme.endDate).toLocaleDateString("en-IN") : "TBD";

    doc
      .text("Certified that the expenditure is incurred paid towards ", {
        continued: true,
      })
      .font("Helvetica-Bold")
      .text(`"${categoryText}"`, { continued: true })
      .font("Helvetica")
      .text(
        ` in connection with conduct of online training programme on "${eventTitle}" held on ${dateFrom} to ${dateTo} in the Department of Computer Science and Engineering, ${venue}, CEG Campus Anna University, Chennai – 25.`
      )
      .moveDown(1);

    const safeTotal = isNaN(total) ? 0 : total;

    const totalAmount = `Rs. ${safeTotal.toFixed(2)}/-`;
    const totalInWords = convertToWords(Math.floor(safeTotal));
   
    doc.text(
      `The bill is in order and may be passed for payment of ${totalAmount} (Rupees ${totalInWords}Only).`
    )
    .moveDown(0.5);

    doc.text("The bill amount has not been claimed previously.")
      .moveDown(2);

    if (programme.coordinators && programme.coordinators.length > 0) {
      programme.coordinators.forEach((coord) => {
        doc.font("Helvetica-Bold").text("Co-ordinator");
        doc
          .font("Helvetica")
          .text(`Dr. ${coord.name}, ${coord.designation}, ${coord.department}`)
          .moveDown(1);
      });
    }

    doc
      .font("Helvetica-Bold")
      .text("HoD, DCSE")
      .text("&")
      .text("Director, CCS")
      .moveDown(3);

    doc.text(
      "Bill passed for Rs. ____________"
    )
    .moveDown(0.5);
    
    doc.text("(Rupees _____________________________ )")
      .moveDown(2);

    doc.text("Director", { align: "right" });
    doc.text("Centre for Cyber Security", { align: "right" });

    console.log("Total (for words):", safeTotal);
    
    // End the document AFTER all content is added
    doc.on('end', async () => {
  try {
    const pdfBuffer = Buffer.concat(chunks);
    
    // Store in database
    const storeResult = await storePDFInDatabase(
      req.params.id, 
      pdfBuffer, 
      programme.title
    );
    
    if (storeResult.success) {

      // Send PDF to browser
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${storeResult.data.fileName}"`
      );
      res.send(pdfBuffer);
    } else {
      throw new Error(storeResult.error);
    }
    
  } catch (error) {
    console.error("Error storing PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error storing PDF",
        error: error.message,
      });
    }
  }
});
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

*/