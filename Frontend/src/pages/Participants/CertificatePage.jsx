import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "../../styles/CertificatePage.css";

const CertificatePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEligibleEvents = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("userToken")); // replace with correct key if different
      const res = await axios.get("http://localhost:5000/participant/completed-events", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEvents(res.data);
    } catch (err) {
      alert("Failed to fetch eligible events");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (event) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const doc = new jsPDF();

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CERTIFICATE OF PARTICIPATION", 30, 30);

    doc.setFont("normal");
    doc.setFontSize(14);
    doc.text(`This is to certify that`, 20, 50);
    doc.setFont("bold");
    doc.text(`${user.name}`, 20, 60);

    doc.setFont("normal");
    doc.text(`has participated in the event`, 20, 70);
    doc.setFont("bold");
    doc.text(`"${event.title}"`, 20, 80);

    doc.setFont("normal");
    doc.text(`conducted from ${new Date(event.startDate).toDateString()} to ${new Date(event.endDate).toDateString()}.`, 20, 90);

    doc.setFont("italic");
    doc.text(`Department of ${user.department}, Anna University, CEG`, 20, 110);
    doc.text("Coordinator Signature", 150, 140);

    doc.save(`${user.name}_${event.title}_certificate.pdf`);
  };

  useEffect(() => {
    fetchEligibleEvents();
  }, []);

  if (loading) return <p className="center-text">Loading events...</p>;

  return (
    <div className="certificate-container">
      <h2 className="certificate-heading">Download Your Certificates</h2>
      {events.length === 0 ? (
        <p className="center-text">No certificates available yet. Participate and wait for completion!</p>
      ) : (
        <ul className="certificate-list">
          {events.map((event) => (
            <li key={event.eventId} className="certificate-item">
              <span>{event.title} ({new Date(event.startDate).toDateString()})</span>
              <button onClick={() => generatePDF(event)}>Download</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CertificatePage;
