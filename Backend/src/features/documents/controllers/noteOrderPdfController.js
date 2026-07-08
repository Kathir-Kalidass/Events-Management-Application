import PDFDocument from 'pdfkit';
import Event from '../../../shared/models/eventModel.js';

const currency = (n) => (Number(n || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const generateNoteOrderPDF = async (req, res) => {
  try {
    const { eventId } = req.params;
    const programme = await Event.findById(eventId)
      .populate('noteOrder')
      .populate('organizingCommittee.member', 'name designation department');

    if (!programme) return res.status(404).json({ message: 'Event not found' });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="NoteOrder_${programme.title || 'event'}.pdf"`);
    doc.pipe(res);

    // Header
    doc.font('Helvetica-Bold').fontSize(16).text('NOTE ORDER (PROPOSAL)', { align: 'center' });
    doc.moveDown(1);

    // Event details
    doc.fontSize(12).font('Helvetica-Bold').text('Event Title: ', { continued: true }).font('Helvetica').text(programme.title || '');
    doc.font('Helvetica-Bold').text('Dates: ', { continued: true }).font('Helvetica')
      .text(`${new Date(programme.startDate).toLocaleDateString('en-IN')} - ${new Date(programme.endDate).toLocaleDateString('en-IN')}`);
    doc.font('Helvetica-Bold').text('Venue: ', { continued: true }).font('Helvetica').text(programme.venue || '');
    doc.font('Helvetica-Bold').text('Mode: ', { continued: true }).font('Helvetica').text(programme.mode || '');
    doc.font('Helvetica-Bold').text('Status: ', { continued: true }).font('Helvetica').text((programme.status || 'pending').toUpperCase());
    doc.font('Helvetica-Bold').text('Locked: ', { continued: true }).font('Helvetica').text(programme.noteOrder?.locked ? 'Yes' : 'No');
    doc.moveDown(1);

    // Income table
    doc.font('Helvetica-Bold').fontSize(13).text('Planned Income');
    doc.moveDown(0.5);
    const startY = doc.y;
    doc.font('Helvetica-Bold').text('Category', 50, startY).text('Participants', 220, startY).text('Amount/Person', 320, startY).text('GST %', 430, startY).text('Income', 500, startY);
    doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();
    doc.moveDown(1);
    doc.font('Helvetica');
    const income = programme.noteOrder?.income || [];
    income.forEach((i, idx) => {
      const y = doc.y;
      doc.text(i.category || '-', 50, y)
        .text(String(i.expectedParticipants ?? '-'), 220, y)
        .text(currency(i.perParticipantAmount), 320, y)
        .text(String(i.gstPercentage ?? 0), 430, y)
        .text(currency(i.income), 500, y);
      doc.moveDown(0.5);
    });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Total Income:', 430).text(`${currency(programme.noteOrder?.totalIncome)}`, 500);
    doc.moveDown(1);

    // Expenses table
    doc.font('Helvetica-Bold').fontSize(13).text('Planned Expenses');
    doc.moveDown(0.5);
    const expHeaderY = doc.y;
    doc.font('Helvetica-Bold').text('Category', 50, expHeaderY).text('Amount', 500, expHeaderY);
    doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();
    doc.moveDown(1);
    doc.font('Helvetica');
    const expenses = programme.noteOrder?.expenses || [];
    expenses.forEach(e => {
      const y = doc.y;
      doc.text(e.category || '-', 50, y).text(currency(e.amount), 500, y);
      doc.moveDown(0.5);
    });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Total Expenditure:', 350).text(`${currency(programme.noteOrder?.totalExpenditure)}`, 500);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('University Overhead (30%):', 350).text(`${currency(programme.noteOrder?.universityOverhead)}`, 500);
    doc.moveDown(1);

    // Entries log
    if (programme.noteOrder?.entries?.length) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(13).text('Note Order Entries');
      doc.moveDown(0.5);
      programme.noteOrder.entries.forEach((entry, idx) => {
        doc.font('Helvetica-Bold').text(`${idx + 1}. ${entry.type?.toUpperCase()}`, { continued: true })
          .font('Helvetica').text(` — ${new Date(entry.createdAt).toLocaleString('en-IN')}`);
        if (entry.author?.name) {
          doc.text(`By: ${entry.author.name}`);
        }
        doc.text(entry.message || '-');
        doc.moveDown(0.75);
      });
    }

    doc.end();
  } catch (err) {
    console.error('Error generating Note Order PDF:', err);
    res.status(500).json({ message: 'Failed to generate Note Order PDF', error: err.message });
  }
};

export default generateNoteOrderPDF;
