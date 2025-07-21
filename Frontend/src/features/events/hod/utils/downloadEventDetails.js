import { jsPDF } from "jspdf";

function DownloadPDF(eventData) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Event Details", 20, 20);

  doc.setFontSize(12);
  doc.text(`Event Name: ${eventData.eventName}`, 20, 40);
  doc.text(`Date: ${eventData.date}`, 20, 50);
  doc.text(`Organizer: ${eventData.organizer}`, 20, 60);
  doc.text(`Venue: ${eventData.venue}`, 20, 70);
  doc.text("Description:", 20, 80);
  doc.text(eventData.description, 20, 90, { maxWidth: 170 });

  doc.save(`${eventData.eventName}_Details.pdf`);
}

export default DownloadPDF;
