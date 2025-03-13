// Basic Node/Express server with in-memory storage and a mock AI endpoint.
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Add axios for making API calls

const app = express();
app.use(cors());
app.use(express.json());  // parse JSON bodies

// In-memory "database" for labs
let labs = [];

// GET all labs (for debugging/demo)
app.get('/api/labs', (req, res) => {
  res.json({ labs });
});

// POST create/update a lab
app.post('/api/labs', (req, res) => {
  const { title, blocks } = req.body;
  
  // For simplicity, just push an object. In real app: store in DB with an ID
  const newLab = {
    id: 'lab-' + Date.now(),
    title,
    blocks,
  };
  labs.push(newLab);

  res.json({ message: 'Lab saved successfully!', lab: newLab });
});

// POST "AI" route: generate quiz from text
app.post('/api/ai/generateQuiz', (req, res) => {
  const { text } = req.body;
  
  // Here you'd call a real AI model (OpenAI, HuggingFace, etc.)
  // For PoC, let's respond with mock quiz questions:
  const quizQuestions = [
    { question: `What is the main topic of: "${text}"?`, options: ['Option A','Option B'], correctAnswer: 'Option A' },
    { question: `Why is "${text}" important?`, options: ['Because','Because not'], correctAnswer: 'Because' }
  ];

  res.json({ questions: quizQuestions });
});

// POST "AI" lesson conversion route: return an experiment idea or search for closest lab
app.post('/api/ai/convertLesson', async (req, res) => {
  const { lesson, mode } = req.body;
  const geminiApiKey = 'AIzaSyDnDeZtje4cWWsESFwRlCtTfsexDuNcEeY'; // Replace with your actual Gemini API key

  if (mode === 'experiment') {
    try {
      // Replace with actual Gemini API call
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: `Generate an experiment idea for the lesson: ${lesson}` }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Gemini API response:', response.data); // Log the entire response

      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        if (
          candidate.content &&
          Array.isArray(candidate.content.parts) &&
          candidate.content.parts.length > 0 &&
          typeof candidate.content.parts[0].text === 'string'
        ) {
          const experimentIdea = candidate.content.parts[0].text.trim();
          res.json({ result: { title: `Experiment for ${lesson}`, description: experimentIdea } });
        } else {
          throw new Error('Invalid content structure from Gemini API');
        }
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error generating experiment idea:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'Failed to generate experiment idea', error: error.response ? error.response.data : error.message });
    }
  } else if (mode === 'search') {
    // Simulate scraping labs and searching for the best match based on title terms.
    const terms = lesson.split(' ');
    let bestMatch = null;
    let maxScore = 0;
    labs.forEach(lab => {
      let score = 0;
      terms.forEach(term => {
        if (lab.title.toLowerCase().includes(term.toLowerCase())) {
          score++;
        }
      });
      if (score > maxScore) {
        maxScore = score;
        bestMatch = lab;
      }
    });
    res.json({ result: bestMatch || { message: 'No matching lab found' } });
  } else {
    res.status(400).json({ message: 'Invalid mode' });
  }
});

// Start server
app.listen(4000, () => {
  console.log('Server listening on http://localhost:4000');
});
