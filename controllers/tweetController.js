const tweetController = {
  getTweets: (req, res) => { // eslint-disable-line
    return res.render('tweets');
  },
};

module.exports = tweetController;
