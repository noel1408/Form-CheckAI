import React from 'react';
import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="app-layout">
      <nav className="navbar" style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <h2 style={{ display: 'inline-block', margin: 0, marginRight: '20px' }}>FormCheckAI</h2>
        <Link style={{ marginRight: '10px' }} to="/dashboard">Dashboard</Link>
        <Link style={{ marginRight: '10px' }} to="/upload">Upload</Link>
        <Link style={{ marginRight: '10px' }} to="/reports">Reports</Link>
        <Link style={{ marginRight: '10px' }} to="/profile">Profile</Link>
      </nav>
      <main className="main-content" style={{ padding: '0 1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
