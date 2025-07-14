import React from 'react';
import EnhancedCertificateViewer from '../../../components/EnhancedCertificateViewer';

const EnhancedCertificates = ({ onDataChange }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
  const participantId = userInfo._id;

  return <EnhancedCertificateViewer userId={participantId} showPreview={true} />;
};

export default EnhancedCertificates;