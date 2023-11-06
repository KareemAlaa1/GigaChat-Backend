
const User = require('../models/user_model');
const express = require('express');

const UserController = {
  update_profile: async (req, res) => {
    try {

        // get the sent data 
        updatedProfileData = {};
        if(req.query.bio)
            updatedProfileData.bio = req.query.bio;
        if(req.query.location)
            updatedProfileData.location = req.query.location;
        if(req.query.website)
            updatedProfileData.website = req.query.website;
        if(req.query.nickname)
            updatedProfileData.nickname = req.query.nickname;
        if(req.query.birthDate)
            updatedProfileData.birthDate = req.query.birthDate;

        // update tha user
        const user = await User.findByIdAndUpdate(req.query._id, updatedProfileData, {new: true});

        // check if the user doesn't exist
        if (!user) return res.status(404).send('user Not Found');

        return res.status(204).end();
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },
};

module.exports = UserController;
