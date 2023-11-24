const tweetController = require('../controllers/tweetController');
const Tweet = require('../models/tweet_model');
jest.mock('../models/tweet_model');
const User = require('../models/user_model');
jest.mock('../models/user_model');
const tweetHelper = require('../controllers/tweetHelper');
jest.mock('../controllers/tweetHelper');

const req = {};

const res = {};

describe('GET Tweet Likers by Tweet Id', () => {
  describe('given invalid tweet id or valid id but the tweet is deleted', () => {
    test('should respond with a status code 404', async () => {
      req.params = {
        tweetId: '654c3ccbe5edfa32058ce4',
      };
      res.status = jest.fn((x) => x);
      res.json = jest.fn((x) => x);
      const tweetData = {};
      const userData = {};
      Tweet.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      await tweetController.getTweetLikers(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'Fail',
        message: 'Can not Find This Tweet',
      });
    });
  });

  describe('given valid tweet id and invalid user id or valid id but the user is deleted', () => {
    test('should respond with a status code 404', async () => {
      req.params = {
        tweetId: '654c3c2fcbe5edfa32058ce4',
      };
      res.status = jest.fn((x) => x);
      res.json = jest.fn((x) => x);
      const tweetData = {
        id: '654c3c2fcbe5edfa32058ce4',
        userId: '65493dfd0e3d2798726f8f5b',
        likersList: ['654c3c2fcbe5edfa32058ce4', '654c3c2fcbe5edfa32058ce4'],
      };
      const userData = {};
      Tweet.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(tweetData),
      });
      tweetHelper.getUserDatabyId.mockResolvedValue(null);

      await tweetController.getTweetLikers(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'Fail',
        message: 'Can not Find This Tweet',
      });
    });
  });

  describe('given valid tweet id and valid user id', () => {
    test('should respond with a status code 200', async () => {
      req.params = {
        tweetId: '654c3c2fcbe5edfa32058ce4',
      };
      res.status = jest.fn((x) => x);
      res.json = jest.fn((x) => x);
      const tweetData = {
        id: '654c3c2fcbe5edfa32058ce4',
        userId: '65493dfd0e3d2798726f8f5b',
        likersList: ['654c3c2fcbe5edfa32058ce4', '654c3c2fcbe5edfa32058ce4'],
      };
      const userData = {};
      Tweet.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(tweetData),
      });
      tweetHelper.getUserDatabyId.mockResolvedValue('454545');

      User.aggregate.mockResolvedValue([
        {
          _id: '544s5ds',
          username: 'saasa',
          nickname: 'dskdd',
          bio: 'sdasasa',
          profileImage: 'dsdsds',
          followersUsers: 26,
          followingUsers: 20,
        },
        {
          _id: '544s5ds',
          username: 'saasa',
          nickname: 'dskdd',
          bio: 'sdasasa',
          profileImage: 'dsdsds',
          followersUsers: 26,
          followingUsers: 20,
        },
      ]);

      await tweetController.getTweetLikers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'Success',
        message: 'Tweet Likers Get Success',
        data: [
          {
            id: '544s5ds',
            username: 'saasa',
            nickname: 'dskdd',
            bio: 'sdasasa',
            profile_image: 'dsdsds',
            followers_num: 26,
            following_num: 20,
          },
          {
            id: '544s5ds',
            username: 'saasa',
            nickname: 'dskdd',
            bio: 'sdasasa',
            profile_image: 'dsdsds',
            followers_num: 26,
            following_num: 20,
          },
        ],
      });
    });
  });
});
