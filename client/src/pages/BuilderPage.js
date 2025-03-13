import React, { useState, useEffect } from 'react';
import { DragDropBuilder } from '../components/DragDropBuilder';
import { AiQuizButton } from '../components/AiQuizButton';
import { TemplateManager } from '../components/TemplateManager';
import axios from 'axios';
import styles from '../styles/Builder.module.css';

const BuilderPage = () => {
  const [labTitle, setLabTitle] = useState('');
  const [blocks, setBlocks] = useState([]); // Start with empty blocks
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/labs');
        setLabs(response.data.labs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLabs();
  }, []);

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/labs', {
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
    <div className={styles.builderContainer}>
      <h2>Lab Builder</h2>
      <label className={styles.titleInput}>
        Title:{" "}
        <input
          value={labTitle}
          onChange={(e) => setLabTitle(e.target.value)}
        />
      </label>

      <div className={styles.builderLayout}>
        <div className={styles.dragDropArea}>
          <DragDropBuilder blocks={blocks} setBlocks={setBlocks} />
        </div>
        
        <div className={styles.sideControls}>
          <AiQuizButton blocks={blocks} setBlocks={setBlocks} />
        </div>
      </div>

      <button onClick={handleSave} className={styles.saveButton}>
        Save Lab
      </button>

      <TemplateManager setBlocks={setBlocks} />

      <div style={{ marginTop: '2rem', maxWidth: '800px', margin: '2rem auto' }}>
        <h3>Available Labs</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {labs.map(lab => (
            <li key={lab.id}>
              <span>{lab.title}</span>
              <button onClick={() => loadLab(lab.blocks)}>
                Load Lab
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BuilderPage;
