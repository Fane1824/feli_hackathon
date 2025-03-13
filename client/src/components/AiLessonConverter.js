import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/Lesson.module.css';

export function AiLessonConverter() {
  const [lesson, setLesson] = useState('');
  const [mode, setMode] = useState('experiment');
  const [difficulty, setDifficulty] = useState('easier');
  const [result, setResult] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');

  // OLabs subject mapping
  const subjects = [
    { name: 'Physics', param: 'pg=topMenu&id=', code: '343', baseUrl: 'https://www.olabs.edu.in/' },
    { name: 'Chemistry', param: 'pg=topMenu&id=', code: '342', baseUrl: 'https://www.olabs.edu.in/' },
    { name: 'Biology', param: 'sub=', code: '79', baseUrl: 'https://www.olabs.edu.in/' },
    { name: 'Maths', param: 'sub=', code: '80', baseUrl: 'https://cdac.olabs.edu.in/' },
    { name: 'Science', param: 'sub=', code: '96', baseUrl: 'https://amrita.olabs.edu.in/' },
    { name: 'Computer', param: 'sub=', code: '97', baseUrl: 'https://www.olabs.edu.in/' }
  ];

  const handleConvert = async () => {
    if (mode === 'olabs') {
      await searchOlabs();
      return;
    }

    try {
      setIsSearching(true); // Add loading state
      console.log('Sending request to server...', { lesson, mode, difficulty });
      const response = await axios.post('http://localhost:5001/api/ai/convertLesson', { 
        lesson, 
        mode,
        difficulty
      });
      console.log('Server response:', response.data);
      setResult(response.data.result);
    } catch (error) {
      console.error('Full error details:', error);
      alert('Conversion failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSearching(false); // Remove loading state
    }
  };

  const searchOlabs = async () => {
    setIsSearching(true);
    setSearchResults([]);
    const keyword = lesson.trim().toLowerCase();
    
    if (!keyword) {
      alert('Please enter a search term');
      setIsSearching(false);
      return;
    }

    try {
      console.log('Searching OLabs for:', keyword, 'in subject:', selectedSubject);
      // Make API requests to the server for searching OLabs
      const response = await axios.post('http://localhost:5001/api/olabs/search', {
        keyword,
        subject: selectedSubject
      });
      
      console.log('Search results:', response.data);
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={styles.inputArea}>
      <label>
        Lesson/Search Term:{' '}
        <input 
          value={lesson} 
          onChange={(e) => setLesson(e.target.value)} 
          placeholder={mode === 'olabs' ? 'Enter keyword (e.g., photosynthesis)' : 'Enter lesson topic'}
          className={styles.textArea}
        />
      </label>
      <br />
      <label>
        Mode:{' '}
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value)}
          className={styles.inputField}
        >
          <option value="experiment">Generate Experiment Idea</option>
          <option value="search">Search Existing Labs</option>
          <option value="olabs">Search OLabs Experiments</option>
        </select>
      </label>
      <br />
      {mode === 'experiment' && (
        <>
          <label>
            Difficulty:{' '}
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              className={styles.inputField}
            >
              <option value="easier">Easier</option>
              <option value="harder">Harder</option>
            </select>
          </label>
          <br />
        </>
      )}
      {mode === 'olabs' && (
        <>
          <label>
            Subject:{' '}
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={styles.inputField}
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject, idx) => (
                <option key={idx} value={subject.code}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <br />
        </>
      )}
      <button 
        onClick={handleConvert} 
        disabled={isSearching}
        className={styles.convertButton}
      >
        {isSearching ? 'Searching...' : (mode === 'olabs' ? 'Search OLabs' : 'Convert')}
      </button>
      
      {result && mode !== 'olabs' && (
        <div className={styles.resultArea}>
          <h3>{result.title}</h3>
          <div className={styles.experimentDescription}>
            <ReactMarkdown>{result.description}</ReactMarkdown>
          </div>
          {result.meta && (
            <div className={styles.metaInfo}>
              <small>
                (Finish Reason: {result.meta.finishReason || 'success'})
              </small>
            </div>
          )}
        </div>
      )}

      {mode === 'olabs' && searchResults.length > 0 && (
        <div className={styles.searchResults}>
          <h3>OLabs Experiments ({searchResults.length} results)</h3>
          <ul className={styles.resultsList}>
            {searchResults.map((exp, index) => (
              <li key={index} className={styles.resultItem}>
                <div className={styles.resultHeader}>
                  <a href={exp.url} target="_blank" rel="noopener noreferrer">
                    {exp.title}
                  </a>
                </div>
                <div className={styles.resultDetails}>
                  <span className={styles.badge}>{exp.subject}</span>
                  <span className={styles.badge}>{exp.class}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode === 'olabs' && isSearching && (
        <div className={styles.loadingSpinner}>
          <p>Searching OLabs experiments...</p>
        </div>
      )}

      {mode === 'olabs' && !isSearching && searchResults.length === 0 && lesson.trim() !== '' && (
        <div className={styles.noResults}>
          <p>No matching experiments found. Try different keywords.</p>
        </div>
      )}
    </div>
  );
}
