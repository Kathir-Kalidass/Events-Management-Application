import React from "react";
import { useNavigate } from "react-router-dom";
import CertificatePage from "../CertificatePage";
import { Button } from "@mui/material";


const MyCertificates = () => {

  const navigate = useNavigate();

  function handleCertificate(){
    console.log('certificate');
    navigate("/certificate");
  }

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
      <Button
        style={{
          padding: '12px 32px',
          fontSize: 18,
          borderRadius: 6,
          background: 'black',
          color: '#fff',
          border: 'none',
          boxShadow: '0 2px 8px #0003',
          cursor: 'pointer',
          fontWeight: 600,
          letterSpacing: 1,
        }}
        onClick={handleCertificate}
      >
        Get Certificates
      </Button>
    </div>
  );
};

export default MyCertificates;
