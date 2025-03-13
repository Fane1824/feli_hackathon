const { Community, Member } = require('../models');

exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.findAll({
      include: [{
        model: Member,
        attributes: ['id']
      }],
    });
    
    // Format the response to include member count
    const formattedCommunities = communities.map(community => ({
      id: community.id,
      name: community.name,
      lookingFor: community.lookingFor,
      contactEmail: community.contactEmail,
      memberCount: community.Members.length
    }));
    
    res.json(formattedCommunities);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving communities', error: error.message });
  }
};

exports.getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await Community.findByPk(id, {
      include: [{
        model: Member,
        attributes: ['id', 'name', 'biography'],
        required: false  // This makes it a LEFT JOIN
      }],
    });
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    console.log('Raw community data:', JSON.stringify(community, null, 2));
    
    // Convert to plain object and ensure Members exists
    const formattedCommunity = {
      ...community.get({ plain: true }),
      Members: community.Members || []
    };
    
    console.log('Formatted community data:', JSON.stringify(formattedCommunity, null, 2));
    
    res.json(formattedCommunity);
  } catch (error) {
    console.error('Error in getCommunityById:', error);
    res.status(500).json({ message: 'Error retrieving community', error: error.message });
  }
};

exports.createCommunity = async (req, res) => {
  try {
    const { name, lookingFor, contactEmail, members } = req.body;
    
    // Create the community
    const newCommunity = await Community.create({
      name,
      lookingFor,
      contactEmail
    });
    
    // Add members if provided
    if (members && Array.isArray(members) && members.length > 0) {
      const membersToCreate = members.map(member => ({
        ...member,
        CommunityId: newCommunity.id
      }));
      
      await Member.bulkCreate(membersToCreate);
    }
    
    res.status(201).json({ 
      message: 'Community created successfully', 
      communityId: newCommunity.id 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating community', error: error.message });
  }
};
