import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // New import for markdown rendering
import styles from '../styles/Lesson.module.css';

export function AiLessonConverter() {
  const [lesson, setLesson] = useState('');
  const [mode, setMode] = useState('experiment');
  const [difficulty, setDifficulty] = useState('easier'); // New state for difficulty
  const [result, setResult] = useState(null);

  const handleConvert = async () => {
    try {
      console.log('Sending request to server...', { lesson, mode, difficulty });
      const response = await axios.post('http://localhost:5001/api/ai/convertLesson', { 
        lesson, 
        mode,
        difficulty // Pass the difficulty along
      });
      console.log('Server response:', response.data);
      setResult(response.data.result);
    } catch (error) {
      console.error('Full error details:', error);
      alert('Conversion failed: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className={styles.inputArea}>
      <label>
        Lesson/Instruction:{' '}
        <input 
          value={lesson} 
          onChange={(e) => setLesson(e.target.value)} 
          className={styles.textArea}
        />
      </label>
      <br />
      <label>
        Mode:{' '}
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value)}
          className="input-field"
        >
          <option value="experiment">Experiment Idea</option>
          <option value="search">Search Lab</option>
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
              className="input-field"
            >
              <option value="easier">Easier</option>
              <option value="harder">Harder</option>
            </select>
          </label>
          <br />
        </>
      )}
      <button onClick={handleConvert} className="btn btn-primary">
        Convert
      </button>
      {result && (
        <div className={styles.resultArea}>
          <h3>{result.title}</h3>
          <div className={styles.experimentDescription}>
            <ReactMarkdown>{result.description}</ReactMarkdown>
          </div>
          {result.meta && (
            <div className={styles.metaInfo}>
              <small>
                (Finish Reason: {result.meta.finishReason} | Avg LogProb: {result.meta.averageLogProbabilities})
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
