import React, { useState } from 'react';
import axios from 'axios';

export function AiLessonConverter() {
  const [lesson, setLesson] = useState('');
  const [mode, setMode] = useState('experiment'); // or 'search'
  const [result, setResult] = useState(null);

  const handleConvert = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/ai/convertLesson', { lesson, mode });
      setResult(response.data.result);
    } catch (error) {
      console.error(error);
      alert('Conversion failed.');
    }
  };

  return (
    <div>
      <label>
        Lesson/Instruction:{' '}
        <input 
          value={lesson} 
          onChange={(e) => setLesson(e.target.value)} 
          style={{ width: '300px' }} 
        />
      </label>
      <br />
      <label>
        Mode:{' '}
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="experiment">Experiment Idea</option>
          <option value="search">Search Lab</option>
        </select>
      </label>
      <br />
      <button onClick={handleConvert} style={{ marginTop: '1rem' }}>
        Convert
      </button>
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Result:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
