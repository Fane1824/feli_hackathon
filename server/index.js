const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Initialize database with proper error handling
let db;
try {
  const dbPath = path.join(__dirname, 'database.sqlite');
  db = new Database(dbPath, { verbose: console.log });
  console.log('Database connected successfully');
  
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

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'quiz',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (err) {
  console.error('Database initialization failed:', err);
  process.exit(1); // Exit if database fails to initialize
}

// Dummy labs array to support "search" mode in /api/ai/convertLesson
const labs = []; // Added dummy labs declaration

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
// Update the AI quiz generation endpoint to use Gemini API
app.post('/api/ai/generateQuiz', async (req, res) => {
  const { text } = req.body;
  console.log('Received text for quiz generation:', text);
  const geminiApiKey = 'AIzaSyDnDeZtje4cWWsESFwRlCtTfsexDuNcEeY'; // Use the existing API key
  
  // Create a structured prompt for quiz generation
  const prompt = `
  Based on the following text, generate 3-5 multiple-choice quiz questions.
  Each question should have 4 options with exactly one correct answer.

  Text: "${text}"

<<<<<<< HEAD
  Format your response as a JSON array with the following structure:
  [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "The correct option text"
    },
    ...more questions...
  ]

  Make sure each question:
  - Is directly related to the text
  - Has clear, unambiguous wording
  - Has a single clear correct answer
  - Has plausible distractors (wrong options)
  `;

  try {
    console.log('Sending quiz generation request to Gemini API...');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000
=======
// POST "AI" lesson conversion route: return an experiment idea or search for closest lab
app.post('/api/ai/convertLesson', async (req, res) => {
  // Updated destructuring to include difficulty
  const { lesson, mode, difficulty } = req.body;
  const geminiApiKey = 'AIzaSyDnDeZtje4cWWsESFwRlCtTfsexDuNcEeY'; // Replace with your actual Gemini API key

  if (mode === 'experiment') {
    try {
      // Build dynamic prompt based on difficulty
      let promptText;
      if (difficulty === 'harder') {
        promptText = `Generate a harder experiment idea for the lesson: ${lesson}. Include additional challenges and advanced variables.`;
      } else if (difficulty === 'easier') {
        promptText = `Generate an easier experiment idea for the lesson: ${lesson}. Simplify the instructions and reduce complexity.`;
      } else {
        promptText = `Generate an experiment idea for the lesson: ${lesson}`;
      }

      // Updated axios call using promptText
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: promptText }]
          }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 seconds timeout
>>>>>>> f6cd8b39b1c2e43afff3ce136c6c7e24bee45c1d
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000 // 15 seconds timeout
      }
    );

    console.log('Received response from Gemini API');
    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const candidate = response.data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const rawText = candidate.content.parts[0].text;
        
        // Extract JSON array from the response
        // This regex finds content between square brackets
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          try {
            // Parse the extracted JSON
            const questions = JSON.parse(jsonMatch[0]);
            return res.json({ questions });
          } catch (parseError) {
            console.error('Failed to parse JSON from response:', parseError);
            console.error('Raw text:', rawText);
            throw new Error('Invalid JSON format in AI response');
          }
        } else {
          console.error('Could not extract JSON from response:', rawText);
          throw new Error('No valid JSON found in AI response');
        }
      }
    }
    throw new Error('Invalid or unexpected response format from AI API');
  } catch (error) {
    console.error('Error generating quiz:', error.message);
    // Fall back to mock quiz questions if the API fails
    const fallbackQuestions = [
      { 
        question: `What might be a key concept in: "${text.substring(0, 50)}..."?`, 
        options: ['Conceptual understanding', 'Practical application', 'Theoretical foundation', 'Historical context'], 
        answer: 'Theoretical foundation' 
      },
      { 
        question: 'When might this knowledge be most useful?', 
        options: ['Academic research', 'Practical experimentation', 'Everyday scenarios', 'All of the above'], 
        answer: 'All of the above' 
      }
    ];
    
    res.json({ 
      questions: fallbackQuestions,
      error: 'Used fallback questions due to API error',
      errorMessage: error.message
    });
  }
});

// GET templates
app.get('/api/templates', (req, res) => {
  try {
    const templates = db.prepare('SELECT * FROM templates ORDER BY createdAt DESC').all();
    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// POST save template - Updated with better error handling
app.post('/api/templates', (req, res) => {
  try {
    const { title, content } = req.body;
    console.log('Received template save request:', { title, contentType: typeof content });
    
    if (!title || !content) {
      console.log('Missing required fields:', { title, hasContent: !!content });
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const contentString = typeof content === 'object' ? JSON.stringify(content) : content;
    console.log('Prepared content string length:', contentString.length);
    
    const stmt = db.prepare('INSERT INTO templates (title, content) VALUES (?, ?)');
    const result = stmt.run(title, contentString);
    console.log('Template saved successfully:', result);

    res.status(201).json({
      success: true,
      template: {
        id: result.lastInsertRowid,
        title,
        content: contentString,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Detailed error saving template:', error);
    res.status(500).json({ 
      error: 'Failed to save template',
      details: error.message 
    });
  }
});

// GET single template
app.get('/api/templates/:id', (req, res) => {
  try {
    const { id } = req.params;
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server with error handling
app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  if (db) {
    db.close();
  }
  process.exit(0);
});