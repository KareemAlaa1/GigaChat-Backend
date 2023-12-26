const fs = require('fs');
const faker = require('faker');

const coolImages = require('cool-images');

function generateObjectId() {
  // Convert timestamp to hexadecimal
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);

  // Generate a 5-byte random hexadecimal value
  const randomValue = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0'),
  ).join('');

  // Generate a 3-byte incrementing counter as a hexadecimal value
  const counter = (Math.floor(Math.random() * 16777215) + 1)
    .toString(16)
    .padStart(6, '0');

  return timestamp + randomValue + counter;
}

function generateUsers() {
  const users = [];
  for (let i = 0; i < 1000; i++) {
    users.push({
      _id: {
        $oid: generateObjectId(),
      },
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthDate: {
        $date: faker.date.past(),
      },
      profileImage: null, // TODO 
      phone: 0,
      nickname: faker.internet.userName(),
      mutedUsers: [],
      blockingUsers: [],
      followingUsers: [],
      followersUsers: [],
      likedTweets: [],
      notificationList: [],
      chatList: [],
      mentionList: [],
      joinedAt: {
        $date: faker.date.recent(),
      },
      isDeleted: false,
      active: true,
      tweetList: [],
    });
  }
  return users;
}

function generatetweets(users) {
  const tweets = [];
  for (let i = 0; i < 2000; i++) {
    const random_number = Math.floor(Math.random() * users.length);
    const author = users[random_number];
    const current_date = faker.date.recent();

    const tweet = {
      _id: {
        $oid: generateObjectId(),
      },
      userId: {
        $oid: author._id,
      },
      description: faker.lorem.sentence(),
      media: [],
      views: 0,
      repliesCount: 0,
      likersList: [],
      retweetList: [],
      quoteRetweetList: [],
      type: 'tweet',
      createdAt: {
        $date: current_date,
      },
      isDeleted: false,
    };

    tweets.push(tweet);
    users[random_number].tweetList.push({
      tweetId: tweet._id,
      type: tweet.type,
      _id: {
        $oid: generateObjectId(),
      },
      createdAt: {
        $date: current_date,
      },
    });
  }
  return tweets;
}

function generateHashtag() {
  const hashtags = [];
  for (let i = 0; i < 6; i++) {
    hashtags.push({
      _id: generateObjectId(),
      title: faker.lorem.words(),
      count: faker.datatype.number(),
      tweet_list: [],
    });
  }
  return hashtags;
}
function likeTweets(users, tweets) {
  for (let i = 0; i < 600; i++) {
    const random_user = Math.floor(Math.random() * users.length);
    const random_tweet = Math.floor(Math.random() * tweets.length);
    if (
      !tweets[random_tweet].likersList.includes(users[random_user]._id) &&
      !users[random_user].likedTweets.includes(tweets[random_tweet]._id)
    ) {
      tweets[random_tweet].likersList.push(users[random_user]._id);
      users[random_user].likedTweets.push(tweets[random_tweet]._id);
    }
  }
}

function followEachOthers(users) {
  for (let i = 0; i < 700; i++) {
    const random_user1 = Math.floor(Math.random() * users.length);
    const random_user2 = Math.floor(Math.random() * users.length);
    const follower = users[random_user1];
    const followee = users[random_user2];

    if (
      !follower.followingUsers.includes(followee._id) &&
      !follower.blockingUsers.includes({
        $oid: followee._id,
      }) &&
      !followee.blockingUsers.includes(follower._id)
    ) {
      follower.followingUsers.push(followee._id);
      followee.followersUsers.push(follower._id);
    }
  }
}

function blockEachOthers(users) {
  for (let i = 0; i < 8000; i++) {
    const random_user1 = Math.floor(Math.random() * users.length);
    const random_user2 = Math.floor(Math.random() * users.length);
    const blocker = users[random_user1];
    const blocked = users[random_user2];
    if (
      !blocker.blockingUsers.includes(blocked._id) &&
      !blocker.followingUsers.includes(blocked._id)
    ) {
      blocker.blockingUsers.push(blocked._id);
    }
  }
}

const users = generateUsers();
const tweets = generatetweets(users);
const hashtags = generateHashtag();
likeTweets(users, tweets);
followEachOthers(users);
blockEachOthers(users);

fs.writeFileSync('.\\dev-data\\users.json', JSON.stringify(users, null, 2));
fs.writeFileSync('.\\dev-data\\tweets.json', JSON.stringify(tweets, null, 2));
// fs.writeFileSync(
//   '.\\dev-data\\hashtags.json',
//   JSON.stringify(hashtags, null, 2),
// );

console.log('Data generated! 10000 new users and tweets created.');
