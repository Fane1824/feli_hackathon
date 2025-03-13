import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/Lesson.module.css';

export function AiLessonConverter() {
  const [lesson, setLesson] = useState('');
  const [mode, setMode] = useState('experiment');
  const [result, setResult] = useState(null);

  const handleConvert = async () => {
    try {
      console.log('Sending request to server...', { lesson, mode });
      const response = await axios.post('http://localhost:5001/api/ai/convertLesson', { 
        lesson, 
        mode 
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
      <button onClick={handleConvert} className="btn btn-primary">
        Convert
      </button>
      {result && (
        <div className={styles.resultArea}>
          <h4>Result:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
