import React, { useState } from 'react';
import { DragDropBuilder } from '../components/DragDropBuilder';
import { AiQuizButton } from '../components/AiQuizButton';
import axios from 'axios';

const BuilderPage = () => {
  const [labTitle, setLabTitle] = useState('My Awesome Lab');
  const [blocks, setBlocks] = useState([
    // each block: { id, type, content }
    { id: '1', type: 'theory', content: 'Explain the theory here...' },
    { id: '2', type: 'procedure', content: 'Procedure steps...' },
  ]);

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/labs', {
        title: labTitle,
        blocks,
      });
      alert('Lab saved! ' + response.data.lab.id);
    } catch (err) {
      console.error(err);
      alert('Error saving lab.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Lab Builder</h2>
      <label>
        Title:{" "}
        <input
          value={labTitle}
          onChange={(e) => setLabTitle(e.target.value)}
          style={{ width: '300px' }}
        />
      </label>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <DragDropBuilder blocks={blocks} setBlocks={setBlocks} />
        <AiQuizButton blocks={blocks} setBlocks={setBlocks} />
      </div>

      <button onClick={handleSave} style={{ marginTop: '1rem' }}>
        Save Lab
      </button>
    </div>
  );
};

export default BuilderPage;
