import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BuilderPage from './pages/BuilderPage';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/">Home</Link> |{" "}
        <Link to="/builder">Open Lab Builder</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder" element={<BuilderPage />} />
      </Routes>
    </Router>
  );
}

function HomePage() {
  return (
    <div style={{ margin: '1rem' }}>
      <h1>Welcome to the Virtual Lab Builder PoC</h1>
      <p>This is a slightly-more-than-minimal demonstration.</p>
    </div>
  );
}

export default App;
