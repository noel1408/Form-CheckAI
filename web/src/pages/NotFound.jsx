import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="notfound-container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/">Go back home</Link>
    </div>
  );
}

export default NotFound;
