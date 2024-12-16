import React from "react";
import "./App2.css";
import { Link } from "react-router-dom";

const App = () => {
  return (
    <div className="container">
      {/* Header Section */}
      <header className="header">
      <h1 className="logo">PrintWise</h1>
        <nav className="nav">
  <Link to="/">Home</Link>
  <Link to="/pricing">Pricing</Link>
  <Link to="/login">Log in</Link>
</nav>
      </header>

      {/* Main Content Section */}
      <main className="main">
        <h2 className="title">Welcome to PrintWise</h2>
        <p className="subtitle">A faster, more secure, and user-friendly solution to eliminate the hassles of traditional printing shops.</p>
        <Link to="/editor"><button className="start-button">Get Started</button></Link>
        <p className="subtitle">Upload documents, make payment and receive your prints rightaway.</p>
      </main>

      {/* Background Design */}
      <div className="background-design"></div>
    </div>
  );
};

export default App;

