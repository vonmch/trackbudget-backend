// src/pages/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // <--- FIX: Correct import { Link }
import './LandingPage.css';

function LandingPage() {
  const features = [
    { icon: "📊", title: "Expense Tracking", desc: "Categorize spending and identify leaks in your budget instantly." },
    { icon: "💰", title: "Income Management", desc: "Track all revenue streams and monitor your monthly cash flow." },
    { icon: "📈", title: "Net Worth Calculator", desc: "Watch your wealth grow by tracking assets versus liabilities over time." },
    { icon: "🏦", title: "Savings Buckets", desc: "Set specific financial goals and track progress toward them effortlessly." },
    { icon: "🧾", title: "Bill Reminders", desc: "Never miss a payment again with automated upcoming bill alerts." },
    { icon: "🏝️", title: "Retirement Planner", desc: "Project your future savings and ensure you are on track for retirement." },
  ];

  return (
    <div className="landing-page">
      
      {/* --- 1. Marketing Header --- */}
      <header className="landing-header">
        <div className="landing-logo-container">
          {/* Ensure you saved the image to client/public/logo-full.png */}
          <img src="/logo-full.png" alt="TrackBudgetBuild Logo" className="landing-logo-img" />
          <h1>TrackBudgetBuild</h1>
        </div>
        <nav className="landing-nav">
          {/* <--- FIX: Uppercase <Link> */}
          <Link to="/login" className="landing-link login-link">Log In</Link>
          <Link to="/signup" className="landing-link signup-btn">Sign Up Free</Link>
        </nav>
      </header>

      {/* --- 2. Hero Section (The Hook) --- */}
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-motto">The weak track excuses.<br />The strong track wealth.</h2>
          <h3 className="hero-question">Which one are you?</h3>
          <p className="hero-subtext">
            Take control of your financial future with the ultimate all-in-one wealth management dashboard.
          </p>
          <div className="hero-ctas">
            {/* <--- FIX: Uppercase <Link> */}
            <Link to="/signup" className="hero-btn primary-btn">Start Building Wealth</Link>
            <Link to="/login" className="hero-btn secondary-btn">Existing User?</Link>
          </div>
        </div>
      </section>

      {/* --- 3. Features Grid --- */}
      <section className="features-section">
        <div className="features-header">
          <h2>Everything You Need to Master Your Money</h2>
          <p>Powerful tools integrated into one seamless dashboard.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- 4. Bottom CTA & Footer --- */}
      <section className="cta-banner">
        <h2>Stop Making Excuses. Start Tracking Today.</h2>
        {/* <--- FIX: Uppercase <Link> */}
        <Link to="/signup" className="landing-link signup-btn large-btn">Create Free Account</Link>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} TrackBudgetBuild. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;