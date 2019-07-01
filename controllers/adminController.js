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
    const users = await User.findAll();
    return res.render('admin/users', { users });
  },
};

module.exports = adminController;
