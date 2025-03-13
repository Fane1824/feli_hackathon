// Basic Node/Express server with in-memory storage and a mock AI endpoint.
const express = require('express');
const cors = require('cors');

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

// Start server
app.listen(4000, () => {
  console.log('Server listening on http://localhost:4000');
});
