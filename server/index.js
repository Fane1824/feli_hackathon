const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const axios = require('axios'); // Added axios import

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Initialize database
const db = new Database('./database.sqlite');

// Dummy labs array to support "search" mode in /api/ai/convertLesson
const labs = []; // Added dummy labs declaration

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS communities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lookingFor TEXT NOT NULL,
    contactEmail TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    communityId INTEGER NOT NULL,
    name TEXT NOT NULL,
    biography TEXT,
    FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE
  );
`);

// Routes

// GET all communities
app.get('/api/communities', (req, res) => {
  try {
    const communities = db.prepare('SELECT * FROM communities').all();
    const result = communities.map(community => {
      const members = db.prepare('SELECT COUNT(*) as count FROM members WHERE communityId = ?').get(community.id);
      return {
        ...community,
        memberCount: members.count
      };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching communities' });
  }
});

// GET single community
app.get('/api/communities/:id', (req, res) => {
  try {
    const { id } = req.params;
    const community = db.prepare('SELECT * FROM communities WHERE id = ?').get(id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    const members = db.prepare('SELECT * FROM members WHERE communityId = ?').all(id);
    
    res.json({
      ...community,
      members
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching community details' });
  }
});

// POST create new community
app.post('/api/communities', (req, res) => {
  try {
    const { name, lookingFor, contactEmail, members } = req.body;
    
    // Start a transaction
    const transaction = db.transaction(() => {
      // Insert community
      const communityInsert = db.prepare('INSERT INTO communities (name, lookingFor, contactEmail) VALUES (?, ?, ?)');
      const communityResult = communityInsert.run(name, lookingFor, contactEmail);
      const communityId = communityResult.lastInsertRowid;
      
      // Insert members
      if (members && members.length > 0) {
        const memberInsert = db.prepare('INSERT INTO members (communityId, name, biography) VALUES (?, ?, ?)');
        members.forEach(member => {
          memberInsert.run(communityId, member.name, member.biography);
        });
      }
      
      return communityId;
    });
    
    const newCommunityId = transaction();
    
    res.status(201).json({ id: newCommunityId, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating community' });
  }
});

// AI Lesson conversion endpoint
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
      // Updated axios call with timeout configuration and enhanced logging
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: `Generate an experiment idea for the lesson: ${lesson}` }]
          }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 seconds timeout
        }
      );

      console.log('Gemini API response:', response.data);
      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        // Log full candidate content for debugging
        console.log('Candidate content:', JSON.stringify(candidate.content, null, 2));

        if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
          // Join all parts text for a cleaner description
          const description = candidate.content.parts.map(part => part.text.trim()).join('\n\n');
          // Build a more formatted response
          return res.json({
            result: {
              title: `Experiment for ${lesson}`,
              description,
              meta: {
                finishReason: candidate.finishReason,
                averageLogProbabilities: candidate.avgLogprobs
              }
            }
          });
        } else {
          console.error('Unexpected candidate content structure:', candidate.content);
          throw new Error('Unexpected candidate content structure');
        }
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error generating experiment idea:', error.message, error.config);
      return res.status(500).json({ message: 'Failed to generate experiment idea', error: error.message });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
