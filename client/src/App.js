import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BuilderPage from './pages/BuilderPage';
import CommunitiesPage from './pages/CommunitiesPage';
import LessonPage from './pages/LessonPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/lesson" element={<LessonPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
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
