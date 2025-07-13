import React from 'react';
import ParticipantCertificates from '../../../components/ParticipantCertificates';

const EnhancedCertificates = ({ onDataChange }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
  const participantId = userInfo._id;

  return <ParticipantCertificates userId={participantId} />;
};

export default EnhancedCertificates;