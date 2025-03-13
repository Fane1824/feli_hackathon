import React from 'react';
import axios from 'axios';

export function AiQuizButton({ blocks, setBlocks }) {
  const generateQuiz = async () => {
    // Combine relevant text from all blocks
    const combinedText = blocks.map(b => b.content).join(' ');

    try {
      const response = await axios.post('http://localhost:4000/api/ai/generateQuiz', {
        text: combinedText
      });
      const { questions } = response.data;

      // We'll add a new block called 'quiz' that holds the questions
      const newQuizBlock = {
        id: 'quiz-' + Date.now(),
        type: 'quiz',
        content: JSON.stringify(questions, null, 2)
      };
      setBlocks(prev => [...prev, newQuizBlock]);
    } catch (error) {
      console.error(error);
      alert('Failed to generate quiz.');
    }
  };

  return (
    <div>
      <button onClick={generateQuiz} style={{ marginTop: '2rem' }}>
        Generate Quiz from AI
      </button>
    </div>
  );
}
