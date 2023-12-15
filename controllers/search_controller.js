const { searchUser, searchTweets, searchHashtag } = require('./search_helper');
const { paginate } = require('../utils/api_features');

/**
 * Description :
 * search for words in tweets or
 * search for users with usernames or with part of their username
 * search for hashtags
 */
exports.search = async (req, res, next) => {
  try {
    let result;
    const type = req.query.type;

    // Check For the type of search

    if (!type || type == undefined)
      return res.status(400).send({
        error:
          'Search request must have a type in query one of these values [ user , tweet , hashtag ] ',
      });

    // Check for the search word if missed

    const searchWord = req.query.word;
    if (!searchWord || searchWord == undefined)
      return res
        .status(400)
        .send({ error: 'Search request must have a search word in query' });
    req.searchWord = searchWord;

    if (type == 'user') {
      // return matching users using their username or screen name or part of them
      result = await searchUser(req, res, next);
    } else if (type == 'tweet') {
      // return tweets that include the search query
      result = await searchTweets(req, res, next);
    } else if (type == 'hashtag') {
      //return hashtags that include the search query
      result = await searchHashtag(req, res, next);
    } else {
      // not allowed search type
      return res.status(400).send({
        error:
          'Only these values [ user , tweet , hashtag ] are allowed in type of search request',
      });
    }

    // paginate result

    try {
      if (result.length == 0)
        return res
          .status(404)
          .send({ error: 'There is no result for this search word' });
      const paginatedResults = paginate(result, req);

      // send result
      return res
        .status(200)
        .send({ status: 'success', results: paginatedResults });
    } catch (error) {
      console.log(error.message);
      return res.status(404).send({ error: error.message });
    }
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};
