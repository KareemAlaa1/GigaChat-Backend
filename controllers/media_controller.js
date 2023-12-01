const express = require('express');
const Media = require('../models/media_model');
const { bucket, uuidv4 } = require('../utils/firebase');

exports.addMedia = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).send({ error: 'Bad Request - No files provided' });
        }

        if (files.length > 4) {
            return res.status(400).send({ error: 'Bad Request - Maximum 4 files allowed' });
        }

        const uploadedFiles = [];
        for (const file of files) {

            // Check if the file type is an image, video, or gif
            const isImage = file.mimetype.startsWith('image/');
            const isVideo = file.mimetype.startsWith('video/');

            if (!isImage && !isVideo) {
                return res.status(400).send({ error: 'Bad Request - Unsupported file type' });
            }

            // Continue with uploading to cloud storage...

            const fileName = `${uuidv4()}-${file.originalname}`;
            const cloudFile = bucket.file(fileName);

            await cloudFile.createWriteStream().end(file.buffer);

            const [url] = await cloudFile.getSignedUrl({
                action: 'read',
                expires: '12-3-9999', // Set the expiration date to infinity :D
            });

            uploadedFiles.push({
                url: url,
                type: isImage ? 'image' : 'video',
                cloudStrogePath: fileName,
            });
        }

        await Media.insertMany(uploadedFiles);
        res.status(200).send({
            status: 'Files uploaded successfully',
            data: {
                usls: uploadedFiles.map((item) => item.url)
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.deleteMedia = async (req, res) => {

    try {
        const { url } = req.body;

        if(!url) return res.status(400).send({error: "Bad request"});

        const media = await Media.findOneAndDelete({url: url});

        if(!media) return res.status(404).send({error: "The file doesn't exist"});
        
        const file = bucket.file(media.cloudStrogePath);
        
        file.delete();

        return res.status(200).send({ status: 'File deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}