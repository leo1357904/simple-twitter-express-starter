const db = require('../models');

const { Tweet, User } = db;

const adminController = {
  getTweets: async (req, res) => {
    const tweets = await Tweet.findAll();

    const shortTweets = tweets.map(tweet => ({
      ...tweet.dataValues,
      description: tweet.dataValues.description.substring(0, 50),
    }));

    return res.render('admin/tweets', { tweets: shortTweets });
  },

  deleteTweet: async (req, res) => {
    const tweet = await Tweet.findByPk(req.params.id);
    await tweet.destroy();
    return res.redirect('/admin/tweets');
  },

  getUsers: async (req, res) => {
    const userData = await User.findAll(
      {
        include: [
          { model: User, as: 'Follower' },
          { model: User, as: 'Following' },
          {
            model: Tweet,
            include: [
              { model: User, as: 'LikedUsers' },
            ],
          },
        ],
      },
    );
    const users = userData
      .map(user => ({
        ...user.dataValues,
        followingCount: user.dataValues.Following.length,
        followerCount: user.dataValues.Follower.length,
        tweetCount: user.dataValues.Tweets.length,
        tweetLikeCount: user.dataValues.Tweets
          .reduce((acc, tweet) => acc + tweet.LikedUsers.length, 0),
      }))
      .sort((a, b) => b.tweetCount - a.tweetCount);
    return res.render('admin/users', { users });
  },
};

module.exports = adminController;
