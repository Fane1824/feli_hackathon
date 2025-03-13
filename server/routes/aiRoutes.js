const express = require('express');
const router = express.Router();
const axios = require('axios');

// Basic test route
router.get('/test', (req, res) => {
  res.json({ message: 'AI routes working!' });
});

router.post('/convertLesson', async (req, res) => {
  try {
    const { lesson, mode, difficulty } = req.body;
    const geminiApiKey = 'AIzaSyDnDeZtje4cWWsESFwRlCtTfsexDuNcEeY';

    if (mode === 'experiment') {
      // Build dynamic prompt based on difficulty
      let promptText;
      if (difficulty === 'harder') {
        promptText = `Generate a harder experiment idea for the lesson: ${lesson}. Include additional challenges and advanced variables.`;
      } else if (difficulty === 'easier') {
        promptText = `Generate an easier experiment idea for the lesson: ${lesson}. Simplify the instructions and reduce complexity.`;
      } else {
        promptText = `Generate an experiment idea for the lesson: ${lesson}`;
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: promptText }]
          }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]) {
        const description = response.data.candidates[0].content.parts[0].text.trim();
        return res.json({
          result: {
            title: `${difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ' ' : ''}Experiment for ${lesson}`,
            description,
            difficulty
          }
        });
      }
      throw new Error('Invalid response format from AI API');
    } else if (mode === 'search') {
      // ...existing search mode logic...
    } else {
      return res.status(400).json({ message: 'Invalid mode' });
    }
  } catch (error) {
    console.error('Error in convertLesson:', error.response?.data || error);
    return res.status(500).json({
      error: 'Failed to generate experiment idea',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;
