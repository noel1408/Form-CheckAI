import React from 'react';
import { useParams } from 'react-router-dom';

function Reports() {
  // If no ID is provided, this could list all reports. If ID is provided, it shows a specific report.
  const { id } = useParams();

  return (
    <div className="reports-container">
      {id ? (
        <>
          <h2>Analysis Report #{id}</h2>
          <p>Detailed form feedback will appear here.</p>
        </>
      ) : (
        <>
          <h2>Your Reports</h2>
          <p>List of your past form check analyses.</p>
        </>
      )}
    </div>
  );
}

export default Reports;
