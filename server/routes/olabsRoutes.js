const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// OLabs subject mapping
const subjects = [
  { name: 'Physics', param: 'pg=topMenu&id=', code: '343', baseUrl: 'https://www.olabs.edu.in/' },
  { name: 'Chemistry', param: 'pg=topMenu&id=', code: '342', baseUrl: 'https://www.olabs.edu.in/' },
  { name: 'Biology', param: 'sub=', code: '79', baseUrl: 'https://www.olabs.edu.in/' },
  { name: 'Maths', param: 'sub=', code: '80', baseUrl: 'https://cdac.olabs.edu.in/' },
  { name: 'Science', param: 'sub=', code: '96', baseUrl: 'https://amrita.olabs.edu.in/' },
  { name: 'Computer', param: 'sub=', code: '97', baseUrl: 'https://www.olabs.edu.in/' }
];

// Extract experiments from OLabs HTML response
function extractExperiments(html, subject) {
  const $ = cheerio.load(html);
  const experiments = [];

  // Find all experiment entries
  $('.experiment-gallery-new .row .col-xs-12').each((i, element) => {
    const titleElement = $(element).find('p a');
    const title = titleElement.text().trim();
    const url = titleElement.attr('href');
    
    if (title && url) {
      const fullUrl = url.startsWith('http') ? url : 
                      url.startsWith('?') ? `${subject.baseUrl}${url}` : 
                      `${subject.baseUrl}/${url}`;
      
      // Find the class name (look for the nearest previous class-title)
      let classTitle = $(element).parent().parent().parent().find('.class-title a').first().text().trim();
      if (!classTitle) {
        classTitle = 'N/A';
      }

      experiments.push({
        title,
        url: fullUrl,
        subject: subject.name,
        class: classTitle
      });
    }
  });

  return experiments;
}

// Add a basic test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'OLabs routes working!' });
});

// Search OLabs for matching experiments
router.post('/search', async (req, res) => {
  try {
    console.log('Received search request:', req.body);
    const { keyword, subject: subjectCode } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Search keyword is required' });
    }

    const results = [];
    const subjectsToSearch = subjectCode === 'all' 
      ? subjects 
      : subjects.filter(s => s.code === subjectCode);
    
    console.log(`Searching ${subjectsToSearch.length} subjects for keyword: ${keyword}`);
    
    for (const subject of subjectsToSearch) {
      const url = `${subject.baseUrl}?${subject.param}${subject.code}`;
      console.log(`Fetching from URL: ${url}`);
      
      try {
        const response = await axios.get(url);
        const experiments = extractExperiments(response.data, subject);
        console.log(`Found ${experiments.length} experiments for ${subject.name}`);
        
        // Filter experiments by keyword
        const matchingExperiments = experiments.filter(exp => 
          exp.title.toLowerCase().includes(keyword.toLowerCase())
        );
        console.log(`Found ${matchingExperiments.length} matching experiments for ${subject.name}`);
        
        results.push(...matchingExperiments);
      } catch (error) {
        console.error(`Error fetching ${subject.name} experiments:`, error.message);
      }
    }
    
    console.log(`Total results: ${results.length}`);
    res.json({ results });
  } catch (error) {
    console.error('OLabs search error:', error);
    res.status(500).json({ error: 'Failed to search OLabs experiments' });
  }
});

module.exports = router;
