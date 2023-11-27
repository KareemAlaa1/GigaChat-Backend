const { describe } = require('@jest/globals');
const {
  getAllHashtages,
  getHastagTweets,
} = require('../controllers/hashtag_controller'); // Update with the correct path

const Hashtag = require('../models/hashtag_model');

jest.mock('../models/hashtag_model');

jest.mock('../utils/api_features', () => ({
  APIFeatures: jest.fn().mockImplementation((data, query) => {
    const apiFeatures = {
      query: data,
      sort: jest.fn().mockReturnThis(),
      limitFields: jest.fn().mockReturnThis(),
      paginate: jest.fn().mockReturnThis(),
    };
    return apiFeatures;
  }),
  selectNeededInfoForUser: jest.fn().mockReturnThis(),
  selectNeededInfoForTweets: jest.fn().mockReturnThis(),
}));

describe('Get All HashTags', () => {
  // Mocking the request and response objects
  const req = { query: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  // Mocking the next function
  const next = jest.fn((error) => {
    res.status(400).send(error);
  });
  const fake_hashtags = [
    {
      _id: '1',
      title: '#trend_1',
      count: 4,
    },
    {
      _id: '1',
      title: '#trend_2',
      count: 4,
    },
  ];

  describe('Get All Available Hashtags [GET  api/trends/all]', () => {
    it('should return all hashtags with status code 200', async () => {
      Hashtag.find.mockResolvedValue(fake_hashtags);

      // Execute the function
      await getAllHashtages(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(fake_hashtags);
      expect(next).not.toHaveBeenCalled(); // Ensure next was not called
    });

    it('should return an error with status code 400', async () => {
      Hashtag.find.mockImplementationOnce(() => {
        throw new Error('There is some error');
      });

      // Execute the function
      await getAllHashtages(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(new Error('There is some error'));
      expect(next).toHaveBeenCalled();
    });
  });
});

describe('Get Hashtag Tweets [GET api/trends/:trend]', () => {
  it('should return tweets for a valid hashtag', async () => {
    const mockHashtag = {
      title: '#test',
      tweet_list: [
        {
          isDeleted: false,
          type: 'tweet',
          userId: 'user1',
        },
        {
          isDeleted: false,
          type: 'tweet',
          userId: 'user2',
        },
      ],
    };

    // Mocking the request and response objects
    const req = {
      query: {},
      params: {
        trend: 'test',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    // Mocking the next function
    const next = jest.fn((error) => {
      res.status(400).send(error);
    });

    Hashtag.findOne.mockImplementation(() => {
      return {
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHashtag),
      };
    });
    await getHastagTweets(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 404 for an invalid hashtag', async () => {
    // Mocking the request and response objects
    const req = {
      params: {
        trend: 'invalid',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    // Mocking the next function
    const next = jest.fn((error) => {
      res.status(400).send(error);
    });

    Hashtag.findOne.mockImplementation(() => {
      return {
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
    });

    await getHastagTweets(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      status: 'fail',
      message: 'HashTag not found',
    });
  });
  it('should return an error with status code 404 because of not sent hashtag param', async () => {
    // Mocking the request and response objects
    const req = {
      query: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    // Mocking the next function
    const next = jest.fn((error) => {
      res.status(404).send(new Error('Hashtag is not found'));
    });
    Hashtag.find.mockImplementationOnce(() => {
      'Should not reach here';
    });

    // Execute the function
    await getHastagTweets(req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(new Error('Hashtag is not found'));
    expect(next).toHaveBeenCalled();
  });
});
