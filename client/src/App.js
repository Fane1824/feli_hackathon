import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BuilderPage from './pages/BuilderPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CreateCommunityPage from './pages/CreateCommunityPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import LessonPage from './pages/LessonPage';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/create-community" element={<CreateCommunityPage />} />
          <Route path="/community/:id" element={<CommunityDetailPage />} />
          <Route path="/lesson" element={<LessonPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div style={{ 
      margin: '2rem auto',
      maxWidth: '800px',
      padding: '0 1rem'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem',
        marginBottom: '1.5rem',
        color: '#2c3e50'
      }}>
        Reimagining Virtual Labs 🔬
      </h1>
      
      <div style={{ 
        backgroundColor: '#f8f9fa',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
          Why Virtual Labs Need Innovation
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#34495e' }}>
          Current virtual labs often feel static and disconnected from real classroom experiences. 
          Our hackathon project aims to bridge this gap by:
        </p>
        <ul style={{ 
          listStyle: 'none',
          padding: '1rem 0'
        }}>
          {[
            '🎯 Converting traditional lessons into interactive experiments',
            '🤝 Building communities around specific topics',
            '🔄 Making learning more dynamic and engaging',
            '🌟 Providing real-world context to theoretical concepts'
          ].map(item => (
            <li key={item} style={{ 
              margin: '0.8rem 0',
              fontSize: '1.1rem',
              color: '#34495e'
            }}>{item}</li>
          ))}
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
          A Felicity Hackathon 2024 Project
        </p>
      </div>
    </div>
  );
}

export default App;
