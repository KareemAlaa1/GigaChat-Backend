const arrayFeatures = require('./features/arrayFeature');
const mongooseFeatures = require('./features/mongooseFeature');

// Factory: CarFactory
class APIFeatures {
  constructor(query, queryString) {
    switch (queryString.type) {
      case 'array':
        return new arrayFeatures(query, queryString);
      default:
        return new mongooseFeatures(query, queryString);
    }
  }
}

selectNeededInfoForUser = async (tweet, req) => {
  req.query.type = 'array';
  req.query.fields =
    '_id,username,nickname,bio,profileImage,followingUsers,followersUsers';
  const apiFeatures = new APIFeatures(
    [tweet.tweetOwner],
    req.query,
  ).limitFields();
  tweet.tweetOwner = await apiFeatures.query;
};

selectNeededInfoForTweets = async (tweets, req) => {
  req.query.type = 'array';
  req.query.fields =
    '_id,description,media,type,referredTweetId,likersList,repliesList,retweetList,views,createdAt,tweetOwner,';
  const apiFeatures = new APIFeatures(tweets, req.query)
    .sort()
    .paginate()
    .limitFields();
  return await apiFeatures.query;
};

module.exports = {
  APIFeatures,
  selectNeededInfoForUser,
  selectNeededInfoForTweets,
};
