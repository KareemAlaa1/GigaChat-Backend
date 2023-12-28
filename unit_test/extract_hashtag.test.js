const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Hashtag = require('../models/hashtag_model');
const app = require('../app');
const extractHashtag = require('../utils/extract_hashtags');
const { beforeEach } = require('@jest/globals');

const mockTweet = {
  description: '',
  id: '654e82d4640b446e8089210c',
};
const mockAnotherTweet = {
  description: '',
  id: '654e82d4640b446e8089210c',
};

let mongoServer; // Declare the variable to store the MongoDB memory server instance

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  } catch (error) {
    console.error('Error during setup:', error);
  }
});
beforeEach(async () => {
  await deleteAllHashtags();
});

async function deleteAllHashtags() {
  await Hashtag.deleteMany();
}

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop(); // Stop the MongoDB memory server
});

describe('Testing Extract Hashtag Function', () => {
  it('insert three hashtags found in the description of the tweet', async () => {
    mockTweet.description = 'bla #hash1 bla #hash2 bla bla #hash3';
    await extractHashtag(mockTweet);
    const insertedHashtags = await Hashtag.find();
    expect(insertedHashtags.length).toBe(3);
    expect(insertedHashtags[0].title).toBe('#hash1');
  });
  it('insert no hashtags found in the description of the tweet', async () => {
    mockTweet.description = 'no hashtags in this tweeeet ^^';
    await extractHashtag(mockTweet);
    const insertedHashtags = await Hashtag.find();
    expect(insertedHashtags.length).toBe(0);
  });
  it('insert two duplicate hashtags in the description of the tweet', async () => {
    mockTweet.description = '#haha #haha';
    await extractHashtag(mockTweet);
    const insertedHashtags = await Hashtag.find();
    expect(insertedHashtags.length).toBe(1);
    expect(insertedHashtags[0].count).toBe(1);
  });
  it('empty tweet description', async () => {
    mockTweet.description = '';
    await extractHashtag(mockTweet);
    const insertedHashtags = await Hashtag.find();
    expect(insertedHashtags.length).toBe(0);
  });
  it('undefined tweet description', async () => {
    mockTweet.description = '#something';
    mockAnotherTweet.description = '#something';
    await extractHashtag(mockTweet);
    await extractHashtag(mockAnotherTweet);
    const insertedHashtags = await Hashtag.find();
    expect(insertedHashtags.length).toBe(1);
    expect(insertedHashtags[0].count).toBe(2);
    expect(insertedHashtags[0].tweet_list.length).toBe(2);
  });
});
