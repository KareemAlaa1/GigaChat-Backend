const express = require('express');
const User = require('../models/user_model');
const Tweet = require('../models/tweet_model');
const mongoose = require('mongoose');

exports.follow = async (req, res) => {
    try {
        const username = req.params.username;
        const currUser = req.user;

        if (!username) return res.status(400).send({ error: "Bad request, send username" });

        const followedUser = await User.findOne({ username });

        if (!followedUser) return res.status(404).send({ error: "user not found" });

        if (followedUser.followersUsers.includes(currUser._id))
            return res.status(400).send({ error: "Bad request, User already followed" });
        if (currUser.followingUsers.includes(followedUser._id))
            return res.status(400).send({ error: "Bad request, User already followed" });

        followedUser.followersUsers.push(currUser._id);
        currUser.followingUsers.push(followedUser._id);

        await followedUser.save();
        await currUser.save();

        return res.status(204).end();
    } catch (error) {
        // Handle and log errors
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

exports.unfollow = async (req, res) => {
    try {
        const username = req.params.username;
        const currUser = req.user;

        if (!username) return res.status(400).send({ error: "Bad request" });

        const followedUser = await User.findOne({ username });

        if (!followedUser) return res.status(404).send({ error: "user not found" });

        if (!followedUser.followersUsers.includes(currUser._id))
            return res.status(400).send({ error: "Bad request, User is not followed" });
        if (!currUser.followingUsers.includes(followedUser._id))
            return res.status(400).send({ error: "Bad request, User is not followed" });

        followedUser.followersUsers = followedUser.followersUsers.filter(_id => _id.toString() !== currUser._id.toString());
        currUser.followersUsers = currUser.followersUsers.filter(_id => _id.toString() !== followedUser._id.toString());

        await followedUser.save();
        await currUser.save();

        return res.status(204).end();
    } catch (error) {
        // Handle and log errors
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

exports.like = async (req, res) => {
    try {

        const tweetId = req.params.tweetId;
        const currUser = req.user;

        if (!tweetId) return res.status(400).send({ error: "Bad request, send ID" });

        const likedTweet = await Tweet.findById(tweetId);

        if (!likedTweet) return res.status(404).send({ error: "tweet not found" });

        if (likedTweet.likersList.includes(currUser._id))
            return res.status(400).send({ error: "Bad request, User already like this tweet" });
        if (currUser.likedTweets.includes(likedTweet._id))
            return res.status(400).send({ error: "Bad request, User already like this tweet" });

        likedTweet.likersList.push(currUser._id);
        currUser.likedTweets.push(likedTweet._id);

        await likedTweet.save();
        await currUser.save();

        return res.status(204).end();
    } catch (error) {
        // Handle and log errors
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

exports.unlike = async (req, res) => {
    try {

        const tweetId = req.params.tweetId;
        const currUser = req.user;

        if (!tweetId) return res.status(400).send({ error: "Bad request, send ID" });

        const likedTweet = await Tweet.findById(tweetId);

        if (!likedTweet) return res.status(404).send({ error: "tweet not found" });

        if (!likedTweet.likersList.includes(currUser._id))
            return res.status(400).send({ error: "Bad request, User already doesn't like this tweet1" });
        if (!currUser.likedTweets.includes(likedTweet._id))
            return res.status(400).send({ error: "Bad request, User already doesn't like this tweet2" });

        likedTweet.likersList = likedTweet.likersList.filter(_id => _id.toString() !== currUser._id.toString());
        currUser.likedTweets = currUser.likedTweets.filter(_id => _id.toString() !== likedTweet._id.toString());

        await likedTweet.save();
        await currUser.save();

        return res.status(204).end();
    } catch (error) {
        // Handle and log errors
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        
    } catch (error) {
        // Handle and log errors
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

exports.getFollowings = async (req, res) => {
    try {

    } catch (error) {
        // Handle and log errors
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};
