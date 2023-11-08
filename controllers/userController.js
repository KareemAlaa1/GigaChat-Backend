
const User = require('../models/user_model');
const express = require('express');

const UserController = {
  
  getProfile: async (req, res) => {
    try {
      const username = req.params.username;
      if(!username) return res.status(400).send({error: 'Bad Request'});

      const user = await User
        .findOne({username: username})
        .select('username nickname _id bio profileImage bannerImage location website birthDate joinedAt followingUsers followersUsers');

        if(!user) return res.status(404).send({error: 'user not found'});
        
        const result = {};
        result.status = 'success';
        result.user = {
          username: user.username,
          nickname: user.nickname,
          _id:user._id, 
          bio: user.bio, 
          profile_image: user.profileImage,
          banner_image: user.bannerImage, 
          location: user.location, 
          website: user.website, 
          birth_date: user.birthDate, 
          joined_date: user.joinedAt, 
          followings_num: user.followersUsers.length, 
          followers_num: user.followingUsers.length
        };

        return res.status(200).send(result);

    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  updateProfile: async (req, res) => {
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

        if(Object.keys(updatedProfileData).length === 0) return res.status(400).send('Bad Request');
        // update tha user
        const user = await User.findByIdAndUpdate(req.query._id, updatedProfileData, {new: true});

        // check if the user doesn't exist
        if (!user) return res.status(404).send('user not Found');

        return res.status(204).end();
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

};

module.exports = UserController;
