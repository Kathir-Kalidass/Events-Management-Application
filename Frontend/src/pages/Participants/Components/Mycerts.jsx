import React from "react";

const MyCertificates = () => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
      <button
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
        onClick={() => alert('Get Certificates clicked!')}
      >
        Get Certificates
      </button>
    </div>
  );
};

export default MyCertificates;
