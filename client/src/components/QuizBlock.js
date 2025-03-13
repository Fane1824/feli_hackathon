import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/Builder.module.css';

export function QuizBlock({ content }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  let quizData;
  try {
    quizData = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (e) {
    return <div>Invalid quiz format</div>;
  }

  const handleSaveTemplate = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);
      
      const defaultTitle = `Quiz Template ${new Date().toLocaleString()}`;
      
      // Save to server with error handling
      const response = await axios.post('http://localhost:5001/api/templates', {
        title: defaultTitle,
        content: quizData // Send the parsed quiz data
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSaveSuccess(true);
        
        // Create local file
        const quizText = formatQuizForDownload(quizData);
        downloadQuizFile(quizText, defaultTitle);
      } else {
        throw new Error('Server did not indicate success');
      }
    } catch (error) {
      console.error('Detailed save error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const formatQuizForDownload = (quizData) => {
    return quizData.map((q, index) => {
      return `Question ${index + 1}: ${q.question}\n` +
        `Options:\n${q.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n` +
        `Correct Answer: ${q.answer}\n\n`;
    }).join('---\n\n');
  };

  const downloadQuizFile = (content, title) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (Array.isArray(quizData)) {
    return (
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <h3>Quiz Questions</h3>
          <div className={styles.saveTemplateControls}>
            <button 
              onClick={handleSaveTemplate}
              className={styles.saveTemplateButton}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save as Template'}
            </button>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {saveSuccess && <div className={styles.successMessage}>Template saved!</div>}
          </div>
        </div>
        {quizData.map((question, index) => (
          <div key={index} className={styles.quizQuestion}>
            <p className={styles.questionText}><strong>Q{index + 1}:</strong> {question.question}</p>
            <ul className={styles.optionsList}>
              {question.options && question.options.map((option, optIdx) => (
                <li key={optIdx} className={option === question.answer ? styles.correctOption : styles.option}>
                  {option}
                  {option === question.answer && <span className={styles.correctBadge}> ✓ </span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return <div>No questions available</div>;
}
