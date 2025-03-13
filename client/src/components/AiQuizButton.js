import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/Builder.module.css';

export function AiQuizButton({ blocks, setBlocks }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQuiz = async () => {
    setError(null);
    
    // Only use theory blocks for quiz generation
    const theoryBlocks = blocks.filter(b => b.type === 'theory');
    const combinedText = theoryBlocks.map(b => b.content).join(' ');
    
    if (theoryBlocks.length === 0) {
      setError('Please add at least one theory block before generating a quiz');
      return;
    }
    
    if (combinedText.trim().length < 50) {
      setError('Theory content should be more detailed before generating a quiz');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/ai/generateQuiz', {
        text: combinedText
      });
      
      const { questions, error: apiError } = response.data;
      
      if (apiError) {
        console.warn('API used fallback questions:', apiError);
      }

      if (!questions || questions.length === 0) {
        throw new Error('No quiz questions were generated');
      }

      // We'll add a new block called 'quiz' that holds the questions
      const newQuizBlock = {
        id: 'quiz-' + Date.now(),
        type: 'quiz',
        content: JSON.stringify(questions) // Store as JSON string to maintain compatibility
      };
      
      setBlocks(prev => [...prev, newQuizBlock]);
    } catch (error) {
      console.error('Quiz generation error:', error);
      setError('Failed to generate quiz. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.quizButtonContainer}>
      <button
        onClick={generateQuiz}
        disabled={isLoading}
        className={styles.quizButton}
      >
        {isLoading ? 'Generating Quiz...' : 'Generate Quiz from AI'}
      </button>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
}
