const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

router.get('/', communityController.getAllCommunities);
router.get('/:id', communityController.getCommunityById);
router.post('/', communityController.createCommunity);

module.exports = router;
