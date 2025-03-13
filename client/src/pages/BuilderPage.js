import React, { useState, useEffect } from 'react';
import { DragDropBuilder } from '../components/DragDropBuilder';
import { AiQuizButton } from '../components/AiQuizButton';
import { TemplateManager } from '../components/TemplateManager';
import axios from 'axios';

const BuilderPage = () => {
  const [labTitle, setLabTitle] = useState('My Awesome Lab');
  const [blocks, setBlocks] = useState([
    // each block: { id, type, content }
    { id: '1', type: 'theory', content: 'Explain the theory here...' },
    { id: '2', type: 'procedure', content: 'Procedure steps...' },
  ]);
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/labs');
        setLabs(response.data.labs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLabs();
  }, []);

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/labs', {
        title: labTitle,
        blocks,
      });
      alert('Lab saved! ' + response.data.lab.id);
      setLabs([...labs, response.data.lab]);
    } catch (err) {
      console.error(err);
      alert('Error saving lab.');
    }
  };

  const loadLab = (blocks) => {
    setBlocks(blocks);
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

      <TemplateManager setBlocks={setBlocks} />

      <div style={{ marginTop: '2rem' }}>
        <h3>Available Labs</h3>
        <ul>
          {labs.map(lab => (
            <li key={lab.id}>
              {lab.title}
              <button onClick={() => loadLab(lab.blocks)} style={{ marginLeft: '1rem' }}>
                Load
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BuilderPage;
