import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function TemplateManager({ setBlocks }) {
  const [templates, setTemplates] = useState([]);
  const [templateTitle, setTemplateTitle] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/templates');
        setTemplates(response.data.templates);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTemplates();
  }, []);

  const saveTemplate = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/templates', {
        title: templateTitle,
        blocks: [],
      });
      setTemplates([...templates, response.data.template]);
      alert('Template saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving template.');
    }
  };

  const loadTemplate = (blocks) => {
    setBlocks(blocks);
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Manage Templates</h3>
      <label>
        Template Title:{" "}
        <input
          value={templateTitle}
          onChange={(e) => setTemplateTitle(e.target.value)}
          style={{ width: '300px' }}
        />
      </label>
      <button onClick={saveTemplate} style={{ marginLeft: '1rem' }}>
        Save Template
      </button>

      <h4>Available Templates</h4>
      <ul>
        {templates.map(template => (
          <li key={template.id}>
            {template.title}
            <button onClick={() => loadTemplate(template.blocks)} style={{ marginLeft: '1rem' }}>
              Load
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
