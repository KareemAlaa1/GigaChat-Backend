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
  const users =
    tweet.retweeter !== undefined
      ? [tweet.tweetOwner, tweet.retweeter]
      : [tweet.tweetOwner];
  const apiFeatures = new APIFeatures(users, req.query).limitFields();
  tweet.tweetOwner = await apiFeatures.query[0];
  tweet.retweeter = await apiFeatures.query[1];
};

selectNeededInfoForTweets = async (tweets, req) => {
  req.query.type = 'array';
  req.query.fields =
    '_id,description,media,type,referredTweetId,likersList,repliesList,retweetList,likesNum,repliesNum,repostsNum,isLiked,views,createdAt,tweetOwner,retweeter';
  const apiFeatures = new APIFeatures(tweets, req.query)
    .sort()
    .paginate()
    .limitFields();
  tweets = await apiFeatures.query;
  tweets = tweets.map((tweet) => {
    tweet.isLiked = tweet.likersList.includes(req.user._id.toString());
    // console.log(req.user.followingUsers)

    tweet.isTweetOwnerFollowed = tweet.tweetOwner.followersUsers.includes(
      req.user._id.toString(),
    );
    tweet.likesNum = tweet.likersList.length;
    tweet.repliesNum = tweet.repliesList.length;
    tweet.repostsNum = tweet.retweetList.length;
    return tweet;
  });
  return tweets;
};

module.exports = {
  APIFeatures,
  selectNeededInfoForUser,
  selectNeededInfoForTweets,
};
