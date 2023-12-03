const express = require('express');
const User = require('../models/user_model');
const Tweet = require('../models/tweet_model');
const mongoose = require('mongoose');

exports.follow = async (req, res) => {
    try {
        const username = req.params.username;
        const currUser = req.user;

        if (!username) return res.status(400).send({ error: "Bad request, send username" });

        const followedUser = await User.findOne({ username: username, isDeleted: false, active: true });

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

        const followedUser = await User.findOne({ username: username, isDeleted: false, active: true });

        if (!followedUser) return res.status(404).send({ error: "user not found" });

        if (!followedUser.followersUsers.includes(currUser._id))
            return res.status(400).send({ error: "Bad request, User is not followed" });
        if (!currUser.followingUsers.includes(followedUser._id))
            return res.status(400).send({ error: "Bad request, User is not followed" });

        followedUser.followersUsers = followedUser.followersUsers.filter(_id => _id.toString() !== currUser._id.toString());
        currUser.followingUsers = currUser.followingUsers.filter(_id => _id.toString() !== followedUser._id.toString());
        
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

        if (!likedTweet || likedTweet.isDeleted) return res.status(404).send({ error: "tweet not found" });

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

        if (!likedTweet && likedTweet.isDeleted) return res.status(404).send({ error: "tweet not found" });

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
        const username = req.params.username;
        const currUser = req.user;
        if (!username) return res.status(400).send({ error: "Bad request, send username" });

        const user = await User.aggregate([
            {
                $match: { username: username, isDeleted: false, active: true},
            }
        ]).lookup({
            from: 'users',
            localField: 'followersUsers',
            foreignField: '_id',
            as: 'followersUsers',
        })      
        .project({
            followersUsers: 1,
        })
        .unwind('followersUsers')
            .addFields({
                'followersUsers.is_followed': {
                    $in: [currUser._id, '$followersUsers.followersUsers'],
                },
                'followersUsers.followers_num': { $size: '$followersUsers.followersUsers' },
                'followersUsers.followings_num': { $size: '$followersUsers.followingUsers' },
            })
            .project({
                'followersUsers._id': 1,
                'followersUsers.is_followed': 1,
                'followersUsers.profileImage': 1,
                'followersUsers.bio': 1,
                'followersUsers.username': 1,
                'followersUsers.nickname': 1,
                'followersUsers.followers_num': 1,
                'followersUsers.followings_num': 1,
            });
        return res.status(200).send({
            status: 'success',
            users: typeof user[0].followersUsers === 'object' ? [user[0].followersUsers] : user[0].followersUsers, 
        });
    } catch (error) {
        // Handle and log errors
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

exports.getFollowings = async (req, res) => {
    try {
        const username = req.params.username;
        const currUser = req.user;
        if (!username) return res.status(400).send({ error: "Bad request, send username" });

        const user = await User.aggregate([
            {
                $match: { username: username },
            }
        ]).lookup({
            from: 'users',
            localField: 'followingUsers',
            foreignField: '_id',
            as: 'followingUsers',
        })      
        .project({
            followingUsers: 1,
        })
        .unwind('followingUsers')
            .addFields({
                'followingUsers.is_followed': {
                    $in: [currUser._id, '$followingUsers.followersUsers'],
                },
                'followingUsers.followers_num': { $size: '$followingUsers.followersUsers' },
                'followingUsers.followings_num': { $size: '$followingUsers.followingUsers' },
            })
            .project({
                'followingUsers._id': 1,
                'followingUsers.is_followed': 1,
                'followingUsers.profileImage': 1,
                'followingUsers.bio': 1,
                'followingUsers.username': 1,
                'followingUsers.nickname': 1,
                'followingUsers.followers_num': 1,
                'followingUsers.followings_num': 1,
            });

        return res.status(200).send({
            status: 'success',
            users: typeof user[0].followingUsers === 'object' ? [user[0].followingUsers] : user[0].followingUsers, 
        });
    } catch (error) {
        // Handle and log errors
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};