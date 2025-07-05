// controllers/coordinator/pdfController.js
import PDFDocument from 'pdfkit';
import TrainingProgramme from '../../models/TrainingProgramme.js';

export const generateProgrammePDF = asyncHandler(async (req, res) => {
  const programme = await TrainingProgramme.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });

  if (!programme) {
    res.status(404);
    throw new Error('Programme not found');
  }

  // Create a PDF document
  const doc = new PDFDocument();
  const filename = `Programme_${programme._id}.pdf`;
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Pipe the PDF to the response
  doc.pipe(res);

  // Add content to the PDF in the required format
  doc.fontSize(12).text(`Centre : DEPARTMENT OF CSE & CENTRE FOR CYBER SECURITY`, { align: 'left' });
  doc.moveDown();
  doc.text(`Letter No.: Lr. No. 1/TrainingProgramme/CSE&CCS/${new Date().getFullYear()}`, { align: 'left' });
  doc.moveDown();
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'left' });
  doc.moveDown(2);
  
  doc.fontSize(14).text('NOTE SUBMITTED TO THE CONVENOR COMMITTEE:', { align: 'center', underline: true });
  doc.moveDown();
  
  doc.fontSize(12).text(`Sub: DCSE & CCS – Request for Permission and Approval to conduct a ${programme.duration} ${programme.mode} Training Programme on "${programme.title}" - reg.,`);
  doc.moveDown();
  doc.text('******');
  doc.moveDown();
  
  // Add the main content
  doc.text(`The Department of Computer Science and Engineering (DCSE) and the Centre for Cyber Security (CCS) seek kind permission and approval to organize a ${programme.duration} ${programme.mode} Training Programme on ${programme.type}, titled "${programme.title}" in the month of ${new Date(programme.startDate).toLocaleString('default', { month: 'long' })}, ${new Date(programme.startDate).getFullYear()} [Tentative Dates: ${new Date(programme.startDate).toLocaleDateString('en-IN')} and ${new Date(programme.endDate).toLocaleDateString('en-IN')}] with ${programme.coordinators.map(c => `Dr. ${c.name}`).join(' and ')} as coordinators.`);
  doc.moveDown();
  
  doc.text(programme.objectives);
  doc.moveDown();
  
  // Add the training programme details table
  doc.text('The Training Programme Details are as follows:', { underline: true });
  doc.moveDown(0.5);
  doc.font('Courier').fontSize(12);
  // Create a neat two-column layout for details
const labelWidth = 20; // adjust spacing here

const programmeDetails = [
  ['Mode', `${programme.mode} (via MS Teams)`],
  ['Duration', `${programme.duration} (4 sessions per day)`],
  ['Target Audience', Array.isArray(programme.targetAudience) ? programme.targetAudience.join(', ') : programme.targetAudience.split(',').map(item => item.trim()).join(', ')],
  ['Resource Persons', Array.isArray(programme.resourcePersons) ? programme.resourcePersons.join(', ') : programme.resourcePersons.split(',').map(item => item.trim()).join(', ')]
];

// Format and print each line
programmeDetails.forEach(([label, value]) => {
  doc.text(`${label.padEnd(labelWidth)}: ${value}`);
});

  doc.moveDown();
  
  // Add the registration fee table
  doc.text('It is requested that permission may be granted to conduct the training programme and to host the details in the Anna University website. It is also requested that permission may be granted to collect registration fee from the participants as detailed in the table below. The tentative budget for the training programme is given in the annexure attached.');
  doc.moveDown();
  
  doc.text('Sl. No.    Category                            Registration Fee', { underline: true });
  programme.registrationFees.forEach((fee, index) => {
    doc.text(`${index + 1}.         ${fee.category.padEnd(30)} Rs. ${fee.amount}/- + ${fee.gstPercentage}% GST`);
  });
  
  doc.moveDown(3);
  doc.text('Hence, it is kindly requested that permission may be given to conduct the training programme and the registration fees may be collected in the form of Demand Draft / Online payment favouring "The Director, CSRC, Anna University, Chennai".');
  
  doc.moveDown(5);
  
  // Add the signature section
  doc.text('Co-ordinator(s)');
  programme.coordinators.forEach(coord => {
    doc.text(`(${coord.name})`);
    doc.text(`${coord.designation}, ${coord.department}`);
  });
  
  // Add the approval section
  doc.moveDown(2);
  doc.text('APPROVED / NOT APPROVED', { align: 'center' });
  doc.moveDown(3);
  doc.text('CHAIRMAN', { align: 'center' });
  doc.text('Convenor Committee, Anna University', { align: 'center' });
  
  // Add the budget section
  doc.addPage();
  doc.text('TENTATIVE BUDGET', { align: 'center', underline: true });
  doc.moveDown();
  
  // Budget table
  doc.text('Income', { underline: true });
  doc.text(`Registration fee = ${programme.budgetBreakdown.income.expectedParticipants} × Rs. ${programme.budgetBreakdown.income.perParticipantAmount} = Rs. ${programme.budgetBreakdown.income.total}/-`);
  
  doc.moveDown();
  doc.text('Expenditure', { underline: true });
  programme.budgetBreakdown.expenses.forEach(expense => {
    doc.text(`${expense.category.padEnd(30)} ${expense.amount}`);
  });
  doc.text(`University Overhead 30% ${programme.budgetBreakdown.universityOverhead}`);
  doc.text(`GST ${programme.budgetBreakdown.gstAmount}`);
  
  doc.moveDown();
  doc.text(`Total ${programme.budgetBreakdown.totalExpenditure}`);
  
  doc.moveDown();
  doc.text('The above budget is tentative. This may vary depending on the number of participants attending the program.');
  
  // Finalize the PDF
  doc.end();
});