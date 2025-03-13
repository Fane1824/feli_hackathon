const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');

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
app.post('/api/ai/convertLesson', (req, res) => {
  console.log('Received conversion request:', req.body);
  try {
    const { lesson, mode } = req.body;
    
    // Simple mock response for now
    const result = {
      original: lesson,
      converted: mode === 'experiment' 
        ? `Experiment idea for "${lesson}": Set up a simple demonstration to show...`
        : `Related lab activities for "${lesson}": 1. Basic observation...`
    };
    
    console.log('Sending response:', result);
    res.json({ result });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Server error converting lesson' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
