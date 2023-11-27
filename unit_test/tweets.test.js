const tweetController = require('../controllers/tweet_controller');
const tweetController = require('../controllers/tweet_controller');
const Tweet = require('../models/tweet_model');
jest.mock('../models/tweet_model');
const User = require('../models/user_model');
jest.mock('../models/user_model');
const tweetHelper = require('../controllers/tweet_helper');
jest.mock('../controllers/tweet_helper');
const extract_hashtags = require('../utils/extract_hashtags');
jest.mock('../utils/extract_hashtags');
const tweetHelper = require('../controllers/tweet_helper');
jest.mock('../controllers/tweet_helper');

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

describe('GET Tweet by Tweet Id', () => {
  describe('given invalid tweet id or valid id but the tweet is deleted', () => {
    test('should respond with a status code 404', async () => {
      req.params = {
        tweetId: '654c3ccbe5edfa32058ce4',
      };
      res.status = jest.fn((x) => x);
      res.json = jest.fn((x) => x);
      const tweetData = {};
      const userData = {};

      tweetHelper.getTweetDatabyId.mockResolvedValue(null);

      await tweetController.getTweet(req, res);

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
        referredTweetId: '654c34d7a2df40f7f59b020d',
        description: 'last tweet last',
        viewsNum: 120,
        likesNum: 43,
        repliesNum: 3,
        repostsNum: 2,
        media: {},
        type: 'tweet',
        creation_time: '2023-11-09T01:55:43.798+00:00',
      };
      const userData = {};
      tweetHelper.getTweetDatabyId.mockResolvedValue(tweetData);
      tweetHelper.getUserDatabyId.mockResolvedValue(null);

      await tweetController.getTweet(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'Fail',
        message: 'Can not Find This Tweet Owner',
      });
    });
  });

  describe('given valid tweet id and valid user id', () => {
    test('should respond with a status code 200', async () => {
      req.params = {
        tweetId: '654c3c2fcbe5edfa32058ce4',
      };
      req.user = '65493dfd0e3d2798726f8f5b';
      res.status = jest.fn((x) => x);
      res.json = jest.fn((x) => x);
      User.findOne = jest.fn(() => {
        return null;
      });
      const tweetData = {
        id: '654c3c2fcbe5edfa32058ce4',
        userId: '65493dfd0e3d2798726f8f5b',
        referredTweetId: '654c34d7a2df40f7f59b020d',
        description: 'last tweet last',
        viewsNum: 120,
        likesNum: 43,
        repliesNum: 3,
        repostsNum: 2,
        media: [],
        type: 'tweet',
        creation_time: '2023-11-09T01:55:43.798+00:00',
      };
      const userData = {
        id: '654c3c2fcbe5edfa32058ce4',
        username: 'karreeem',
        nickname: 'Kareem Alaa',
        bio: 'lesgooo',
        profile_image:
          'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
        followers_num: 26,
        following_num: 51,
      };
      tweetHelper.getTweetDatabyId.mockResolvedValue(tweetData);
      tweetHelper.getUserDatabyId.mockResolvedValue(userData);
      tweetData.tweet_owner = userData;
      await tweetController.getTweet(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'Tweet Get Success',
        data: tweetData,
      });
    });
  });
});

describe('GET Tweet Replies by Tweet Id', () => {
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

      await tweetController.getTweetReplies(req, res);

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

      await tweetController.getTweetReplies(req, res);
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
      req.body = {
        count: 2,
        page: 1,
      };
      res.status = jest.fn((x) => x);
      res.json = jest.fn((x) => x);
      const tweetData = {
        id: '654c3c2fcbe5edfa32058ce4',
        userId: '65493dfd0e3d2798726f8f5b',
      };
      const userData = {};
      Tweet.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(tweetData),
      });
      tweetHelper.getUserDatabyId.mockResolvedValue('454545');

      Tweet.aggregate.mockResolvedValue([
        {
          paginatedResults: [
            {
              userId: '65608e9d4fd4d82a7970d82b',
              description: 'tweet 1 about not dynamic programming',
              media: [
                {
                  data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
                  type: 'jpg',
                },
              ],
              type: 'tweet',
              id: '6562c830ad1774eb296f87bc',
              creation_time: '2023-11-26T04:12:53.933Z',
              viewsNum: 0,
              repliesNum: 0,
              repostsNum: 1,
              likesNum: 0,
              isLiked: false,
              isRetweeted: true,
              tweet_owner: [
                {
                  username: 'karreeem2',
                  nickname: 'kareem alaa 2',
                  bio: 'Im the real batmal',
                  id: '65608e9d4fd4d82a7970d82b',
                  followers_num: 1,
                  following_num: 1,
                },
              ],
            },
            {
              userId: '65608e9d4fd4d82a7970d82b',
              description: 'tweet 2 about not dynamic programming',
              media: [
                {
                  data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
                  type: 'jpg',
                },
              ],
              type: 'tweet',
              id: '6562c830ad7274ee296f87bc',
              creation_time: '2023-11-26T04:12:53.933Z',
              viewsNum: 0,
              repliesNum: 0,
              repostsNum: 1,
              likesNum: 0,
              isLiked: false,
              isRetweeted: true,
              tweet_owner: [
                {
                  username: 'karreeem2',
                  nickname: 'kareem alaa 2',
                  bio: 'Im the real batmal',
                  id: '65608e9d4fd4d82a7970d82b',
                  followers_num: 1,
                  following_num: 1,
                },
              ],
            },
          ],
          totalCount: [1, 2],
        },
      ]);

      await tweetController.getTweetReplies(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'Success',
        message: 'Tweet Replies Get Success',
        data: [
          {
            userId: '65608e9d4fd4d82a7970d82b',
            description: 'tweet 1 about not dynamic programming',
            media: [
              {
                data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
                type: 'jpg',
              },
            ],
            type: 'tweet',
            id: '6562c830ad1774eb296f87bc',
            creation_time: '2023-11-26T04:12:53.933Z',
            viewsNum: 0,
            repliesNum: 0,
            repostsNum: 1,
            likesNum: 0,
            isLiked: false,
            isRetweeted: true,
            tweet_owner: [
              {
                username: 'karreeem2',
                nickname: 'kareem alaa 2',
                bio: 'Im the real batmal',
                id: '65608e9d4fd4d82a7970d82b',
                followers_num: 1,
                following_num: 1,
              },
            ],
          },
          {
            userId: '65608e9d4fd4d82a7970d82b',
            description: 'tweet 2 about not dynamic programming',
            media: [
              {
                data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
                type: 'jpg',
              },
            ],
            type: 'tweet',
            id: '6562c830ad7274ee296f87bc',
            creation_time: '2023-11-26T04:12:53.933Z',
            viewsNum: 0,
            repliesNum: 0,
            repostsNum: 1,
            likesNum: 0,
            isLiked: false,
            isRetweeted: true,
            tweet_owner: [
              {
                username: 'karreeem2',
                nickname: 'kareem alaa 2',
                bio: 'Im the real batmal',
                id: '65608e9d4fd4d82a7970d82b',
                followers_num: 1,
                following_num: 1,
              },
            ],
          },
        ],
      });
    });
  });
});

describe('Add Tweet', () => {
  describe('given tweet without media and description', () => {
    test('should respond with a status code 404', async () => {
      req.params = {
        tweetId: '654c3ccbe5edfa32058ce4',
      };
      req.body = {
        type: 'tweet',
      };
      res.status = jest.fn((x) => x);
      res.json = jest.fn((x) => x);
      const tweetData = {};
      const userData = {};

      await tweetController.addTweet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'bad request',
        message: 'no media and no description',
      });
    });
  });

  describe('given valid tweet data', () => {
    test('should respond with a status code 201', async () => {
      req.params = {
        tweetId: '654c3c2fcbe5edfa32058ce4',
      };
      req.body = {
        description: 'reply 1 on reply 2 about not dynamic programming',
        media: [
          {
            data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
            type: 'jpg',
          },
        ],
        type: 'tweet',
      };
      res.status = jest.fn((x) => x);
      res.json = jest.fn((x) => x);

      const userData = {
        id: '65608e9d4fd4d82a7970d82b',
        username: 'karreeem2',
        nickname: 'kareem alaa 2',
        bio: 'Im the real batmal',
        followers_num: 1,
        following_num: 1,
      };

      Tweet.create.mockResolvedValue({
        _doc: {
          _id: '656491bf08a885a38d5c034f',
          userId: '65608e9d4fd4d82a7970d82b',
          description: 'reply 1 on reply 2 about not dynamic programming',
          views: 0,
          likersList: [],
          repliesList: [],
          quoteRetweetList: [],
          media: [
            {
              data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
              type: 'jpg',
              _id: '656491bf08a885a38d5c0350',
            },
          ],
          type: 'tweet',
          createdAt: '2023-11-24T12:32:31.896Z',
        },
      });
      tweetHelper.getUserDatabyId.mockResolvedValue(userData);
      tweetHelper.getRequiredTweetDatafromTweetObject.mockResolvedValue({
        id: '656491bf08a885a38d5c034f',
        userId: '65608e9d4fd4d82a7970d82b',
        description: 'reply 1 on reply 2 about not dynamic programming',
        viewsNum: 0,
        likesNum: 0,
        repliesNum: 0,
        repostsNum: 0,
        media: [
          {
            data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
            type: 'jpg',
            _id: '656491bf08a885a38d5c0350',
          },
        ],
        type: 'tweet',
        creation_time: '2023-11-24T12:32:31.896Z',
      });
      User.findByIdAndUpdate.mockImplementation(() => {});
      extract_hashtags.mockResolvedValue(null);
      await tweetController.addTweet(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'Tweet Add Success',
        data: {
          id: '656491bf08a885a38d5c034f',
          userId: '65608e9d4fd4d82a7970d82b',
          description: 'reply 1 on reply 2 about not dynamic programming',
          viewsNum: 0,
          likesNum: 0,
          repliesNum: 0,
          repostsNum: 0,
          media: [
            {
              data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
              type: 'jpg',
              _id: '656491bf08a885a38d5c0350',
            },
          ],
          type: 'tweet',
          creation_time: '2023-11-24T12:32:31.896Z',
          tweet_owner: userData,
        },
      });
    });
  });
});
