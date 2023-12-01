const express = require('express');
const mediaController = require('../controllers/media_controller');
const { protect } = require('../controllers/auth_controller');
const { upload } = require('../utils/firebase');
const router = new express.Router();

router.post('/', [protect, upload.array('media')], mediaController.addMedia);

router.delete('/', protect, mediaController.deleteMedia);

module.exports = router;
