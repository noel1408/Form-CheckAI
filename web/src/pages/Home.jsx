import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to FormCheckAI</h1>
      <p>Analyze your workout form using AI and get instant feedback.</p>
      <div>
        <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
      </div>
    </div>
  );
}

export default Home;
