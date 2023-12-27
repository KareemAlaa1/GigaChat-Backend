const express = require('express');
const Media = require('../models/media_model');
const { bucket, uuidv4 } = require('../utils/firebase');




/**
Controller for handling media.
@module controllers/media
*/

/**
 * Upload media files to cloud storage and store their information in the database.
 * Supports image and video file types.
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response object indicating the status of the file upload.
 *
 * @throws {Error} - Throws an error if file upload fails or if the file types are unsupported.
 *
 * @example
 * // Example usage in an Express route
 * app.post('/upload-media', addMedia);
 */
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

/**
 * Check if media with given URLs already exist in the database.
 * @async
 * @function
 * @param {Array} urlList - Array of URLs to check for existence.
 * @returns {Array} - Array of media objects that match the provided URLs.
 *
 * @throws {Error} - Throws an error if the database query fails.
 *
 * @example
 * // Example usage
 * const existingMedia = await checkExistingUrl(['url1', 'url2']);
 */
exports.checkExistingUrl = async ([urlList]) => {
    try {
        const media = await Media.find({ url: { $in: urlList } });

        return media;
    } catch (error) {
        return [];
    }
}

/**
 * Delete media with the provided URL from both the database and cloud storage.
 * @async
 * @function
 * @param {string} url - URL of the media to be deleted.
 * @returns {Object} - Object indicating the status of the deletion.
 *
 * @throws {Error} - Throws an error if the media deletion process fails.
 *
 * @example
 * // Example usage
 * const deletionStatus = await deleteMedia('urlToDelete');
 */
exports.deleteMedia = async (url) => {
    try {
        if (!url) return {error: "no url provided"};
        const media = await Media.findOneAndDelete({ url: url });
        if (!media) return {error: "no media"};
        const file = bucket.file(media.cloudStrogePath);
        file.delete();
        return {status: "deleted succefully"};
    } catch (error) {
        return {error: "Internal server error"};
    }
}