const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user_model');
const { signToken } = require('../controllers/auth_controller');
const Notification = require('../models/notification_model');
const Tweet = require('../models/tweet_model');
const notificationsController = require('../controllers/notifications_controller'); // replace with the actual path to your Notification model

let testNotifier;
let testNotified;
let testNotified2;
let testTweet;
let testReply;
let testQuote;
beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  //create a tweet

  // Create a user who will be the notifier
  testNotifier = await User.create({
    email: 'notifier@example.com',
    username: 'notifier',
    active: true,
  });

  // Create another user who will be the notified
  testNotified = await User.create({
    email: 'notified@example.com',
    username: 'notified',
    active: true,
  });
  testNotified2 = await User.create({
    email: 'notified2@example.com',
    username: 'notified2',
    active: true,
  });
  testTweet = await Tweet.create({
    description: 'test tweet @notifier @notified @notified2 @nonexistent',
    userId: testNotified._id,
    type: 'tweet',
    isDeleted: false,
  });
  testReply = await Tweet.create({
    content: 'This is a test reply',
    userId: testNotifier._id,
    type: 'reply',

    referredTweetId: testTweet._id,
    isDeleted: false,
  });
  testQuote = await Tweet.create({
    content: 'This is a test quote',
    userId: testNotifier._id,
    type: 'quote',

    referredTweetId: testTweet._id,
    isDeleted: false,
  });
  // Generate a bearer token
  let token = `Bearer ${signToken(testNotifier._id)}`;
  testNotifier.token = token;
  token = `Bearer ${signToken(testNotified._id)}`;
  testNotified.token = token;
});

afterAll(async () => {
  // Delete the user
  await User.deleteMany({});
  await Tweet.deleteMany({});
  await Notification.deleteMany({});
  await mongoose.disconnect();
});

describe('notifications', () => {
  afterEach(async () => {
    // Delete all notifications after each test
    await Notification.deleteMany({ notified: testNotified._id });
  });

  //###################### getNotifications ######################
  describe('GET /api/user/notifications', () => {
    it('should return 200 and notifications data', async () => {
      let notification1 = await Notification.create({
        description: 'Test notification',
        type: 'follow',
        destination: testTweet._id,
        notifier: testNotifier._id,
        notified: testNotified._id,
        creation_time: new Date(),
      });
      const notification2 = await Notification.create({
        description: 'Test notification',
        type: 'follow',
        destination: testTweet._id,
        notifier: testNotifier._id,
        notified: testNotified._id,
        creation_time: new Date(),
      });
      const response = await request(app)
        .get('/api/user/notifications')
        .set('Authorization', testNotified.token);
      console.log(response.body.data.notifications);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.notifications.length).toBe(2);

      expect(response.body.data.notifications[0]._id).toEqual(
        String(notification2._id),
      );
      expect(response.body.data.notifications[1]._id).toEqual(
        String(notification1._id),
      );

      await Notification.deleteOne({ _id: notification1._id });
      await Notification.deleteOne({ _id: notification2._id });
    });

    it('should return 200 with an empty array if no notifications are found', async () => {
      const response = await request(app)
        .get('/api/user/notifications')
        .set('Authorization', testNotified.token);
      console.log(response.body);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.notifications).toHaveLength(0);
    });
  });

  //###################### count ######################
  describe('GET /api/user/notifications/unseenCount', () => {
    it('should return 200 and notifications count', async () => {
      // Create two notifications for the user
      await Notification.create({
        description: 'Test notification 1',
        type: 'follow',
        destination: testTweet._id,
        notifier: testNotifier._id,
        notified: testNotified._id,
        creation_time: new Date(),
        seen: false,
      });

      await Notification.create({
        description: 'Test notification 2',
        type: 'follow',
        destination: testTweet._id,
        notifier: testNotifier._id,
        notified: testNotified._id,
        creation_time: new Date(),
        seen: false,
      });
      const response = await request(app)
        .get('/api/user/notifications/unseenCount')
        .set('Authorization', testNotified.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.notificationsCount).toBe(2);
    });

    it('should return 200 with count of 0 if no unseen notifications are found', async () => {
      // Create a seen notification for the user
      await Notification.create({
        description: 'Test notification',
        type: 'follow',
        destination: testTweet._id,
        notifier: testNotifier._id,
        notified: testNotified._id,
        creation_time: new Date(),
        seen: true,
      });

      const response = await request(app)
        .get('/api/user/notifications/unseenCount')
        .set('Authorization', testNotifier.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.notificationsCount).toBe(0);
    });

    // Add more test cases as needed
  });

  //###################### markAllAsSeen ######################
  describe('POST /api/user/notifications/markAllAsSeen', () => {
    it('should mark all notifications as seen', async () => {
      // Create two unseen notifications for the user
      const notification1 = await Notification({
        description: 'Test notification 1',
        type: 'follow',
        destination: testTweet._id,
        notifier: testNotifier._id,
        notified: testNotified._id,
        creation_time: new Date(),
        seen: false,
      });

      const notification2 = await Notification({
        description: 'Test notification 2',
        type: 'follow',
        destination: testTweet._id,
        notifier: testNotifier._id,
        notified: testNotified._id,
        creation_time: new Date(),
        seen: false,
      });
      notification1.save();
      notification2.save();
      // Call the endpoint to mark all notifications as seen
      const response = await request(app)
        .post('/api/user/notifications/markAllAsSeen')
        .set('Authorization', testNotified.token);
      console.log(response.body.data.notifications);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.notifications.modifiedCount).toBe(2); // Assuming both notifications are marked as seen

      // Check if the notifications are actually marked as seen in the database
      const updatedNotification1 = await Notification.findById(
        notification1._id,
      );
      const updatedNotification2 = await Notification.findById(
        notification2._id,
      );

      expect(updatedNotification1.seen).toBe(true);
      expect(updatedNotification2.seen).toBe(true);
    });

    // Add more test cases as needed
  });
  //###################### addFollowNotification ######################
  describe('addFollowNotification', () => {
    it('should create a follow notification', async () => {
      // Call the function to add a follow notification
      const notification = await notificationsController.addFollowNotification(
        testNotifier,
        testNotified,
      );

      // Assert that the notification is created

      expect(notification).toBeTruthy();
      expect(notification.description).toBe(
        `${testNotifier.username} started following you`,
      );
      expect(notification.type).toBe('follow');
      expect(notification.destination).toEqual(testNotifier._id.toString());
      expect(notification.notifier).toEqual(testNotifier._id);
      expect(notification.notified).toEqual(testNotified._id);
    });

    // Add more test cases as needed
  });

  //###################### addLikeNotification ######################
  describe('addLikeNotification', () => {
    it('should create a like notification', async () => {
      // Call the function to add a like notification
      const notification = await notificationsController.addLikeNotification(
        testNotifier,
        testTweet,
      );
      // Assert that the notification is created
      expect(notification).toBeTruthy();
      expect(notification.description).toBe(
        `${testNotifier.username} liked your tweet`,
      );
      expect(notification.type).toBe('like');
      expect(notification.destination).toEqual(testTweet._id.toString());
      expect(notification.notifier).toEqual(testNotifier._id);
      expect(notification.notified).toEqual(testNotified._id);
    });

    // Add more test cases as needed
  });

  //###################### addReplyNotification ######################
  describe('addReplyNotification', () => {
    it('should create a reply notification', async () => {
      // Call the function to add a reply notification
      const notification = await notificationsController.addReplyNotification(
        testNotifier,
        testNotified,
        testReply,
      );

      // Assert that the notification is created
      expect(notification).toBeTruthy();
      expect(notification.description).toBe(
        `${testNotifier.username} replied to your tweet`,
      );
      expect(notification.type).toBe('reply');
      expect(notification.destination).toEqual(testReply._id.toString());
      expect(notification.notifier).toEqual(testNotifier._id);
      expect(notification.notified).toEqual(testNotified._id);
    });

    // Add more test cases as needed
  });

  //###################### addQuoteNotification ######################
  describe('addQuoteNotification', () => {
    it('should create a quote notification', async () => {
      // Call the function to add a quote notification
      const notification = await notificationsController.addQuoteNotification(
        testNotifier,
        testNotified,
        testQuote,
      );

      // Assert that the notification is created
      expect(notification).toBeTruthy();
      expect(notification.description).toBe(
        `${testNotifier.username} quoted your tweet`,
      );
      expect(notification.type).toBe('quote');
      expect(notification.destination).toEqual(testQuote._id.toString());
      expect(notification.notifier).toEqual(testNotifier._id);
      expect(notification.notified).toEqual(testNotified._id);
    });

    // Add more test cases as needed
  });
  //###################### getMentions ######################
  describe('getMentions', () => {
    it('should extract mentions from a tweet', () => {
      const tweet = {
        description: 'This is a test tweet mentioning @user1 and @user2',
      };

      const mentions = notificationsController.getMentions(tweet);

      expect(mentions).toEqual({ user1: true, user2: true });
    });

    it('should handle tweets with no mentions', () => {
      const tweet = {
        description: 'This is a test tweet with no mentions',
      };

      const mentions = notificationsController.getMentions(tweet);

      expect(mentions).toEqual({});
    });

    it('should handle tweets with multiple mentions of the same user', () => {
      const tweet = {
        description: 'This is a test tweet mentioning @user1 and @user1 again',
      };

      const mentions = notificationsController.getMentions(tweet);

      expect(mentions).toEqual({ user1: true });
    });

    it('should handle tweets with mentions at the beginning and end', () => {
      const tweet = {
        description: '@user1 This is a test tweet mentioning @user2 at the end',
      };

      const mentions = notificationsController.getMentions(tweet);

      expect(mentions).toEqual({ user1: true, user2: true });
    });

    // Add more test cases as needed
  });

  //###################### addMentionNotification ######################
  describe('addMentionNotification', () => {
    it('should create mention notifications for mentioned users', async () => {
      // Call the function to add mention notifications
      await notificationsController.addMentionNotification(
        testNotifier,
        testTweet,
      );

      // Retrieve notifications created in the database
      const notifications = await Notification.find({
        notifier: testNotifier._id,
      });

      // Assert that the notifications are created
      expect(notifications).toHaveLength(2); // Assuming there are two mentions in the test tweet

      // Add more assertions based on your specific logic
    });

    it('should not create mention notifications for the notifier', async () => {
      // Call the function to add mention notifications
      await notificationsController.addMentionNotification(
        testNotifier,
        testTweet,
      );

      // Retrieve notifications created in the database
      const notifications = await Notification.find({
        notifier: testNotifier._id,
        notified: testNotifier._id,
      });

      // Assert that the notifications are not created for the notifier
      expect(notifications).toHaveLength(0);
    });

    it('should not create mention notifications for non-existing users', async () => {
      // Modify the test tweet to include a non-existing mention
      const modifiedTestTweet = await Tweet.findByIdAndUpdate(testTweet._id, {
        description: 'This is a test tweet mentioning @nonexistinguser',
      });

      await Notification.deleteMany({ notifier: testNotifier._id });
      const testxTweet = await Tweet.findById(testTweet._id);
      // Call the function to add mention notifications
      await notificationsController.addMentionNotification(
        testNotifier,
        testxTweet,
      );
      console.log(testxTweet);
      // Retrieve notifications created in the database
      const notifications = await Notification.find({
        notifier: testNotifier._id,
      });

      // Assert that the notifications are not created for non-existing users
      expect(notifications).toHaveLength(0);
    });

    // Add more test cases as needed
  });
});
