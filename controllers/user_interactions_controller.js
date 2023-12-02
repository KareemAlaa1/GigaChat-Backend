const express = require('express');
const User = require('../models/user_model');
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
            return res.status(400).send({ error: "Bad request, User is not followed followed" });
        if (!currUser.followingUsers.includes(followedUser._id))
            return res.status(400).send({ error: "Bad request, User is not followed followed" });

        followedUser.followersUsers = followedUser.followersUsers.filter(_id => _id !== currUser._id);
        currUser.followersUsers = currUser.followersUsers.filter(_id => _id !== followedUser._id);

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

    } catch (error) {
        // Handle and log errors
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

exports.unlike = async (req, res) => {
    try {

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
