const db = require('../models');
const helpers = require('../_helpers');

const {
  Tweet,
  User,
  Reply,
  Like,
} = db;

const tweetController = {
  getTweets: (req, res) => {
    Tweet
      .findAll({
        order: [
          ['createdAt', 'DESC'],
        ],
        include: [
          User,
          Reply,
          { model: User, as: 'LikedUsers' },
        ],
      })
      .then((tweetData) => {
        User.findAll({
          include: [
            { model: User, as: 'Followers' },
          ],
        }).then((userData) => {
          const users = userData
            .map(user => ({
              ...user.dataValues,
              FollowerCount: user.Followers.length,
              isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id),
            }))
            .sort((a, b) => b.FollowerCount - a.FollowerCount)
            .slice(0, 10);

          const tweets = tweetData.map((tweet) => {
            const { description } = tweet;
            return {
              ...tweet.dataValues,
              description: description.length > 50
                ? `${description.substring(0, 50)} ...`
                : description,
              replyCount: tweet.Replies.length,
              likeCount: tweet.LikedUsers.length,
              isLiked: tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id),
            };
          });
          return res.render('tweets', {
            tweets,
            users,
            reqUId: helpers.getUser(req).id,
          });
        });
      });
  },

  postTweet: (req, res) => {
    const textLength = req.body.text.length;
    if ((textLength === 0) || (textLength >= 140)) {
      req.flash('error_messages', 'Tweet should not be empty or more than 139 letters');
      return res.redirect('/tweets');
    }
    return Tweet
      .create({
        UserId: helpers.getUser(req).id,
        description: req.body.text,
      })
      .then(() => res.redirect('/tweets'));
  },

  getReplies: (req, res) => {
    return Tweet
      .findByPk(req.params.tweet_id, {
        include: [
          { model: Reply, include: [User] },
          { model: User, as: 'LikedUsers' },
          { model: User, include: [Tweet] },
        ],
      })
      .then((tweet) => {
        const likedUsersCount = tweet.LikedUsers.length;
        const repliesCount = tweet.Replies.length;
        const tweetsCount = tweet.User.Tweets.length;
        const isLiked = tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id);
        User
          .findByPk(tweet.UserId, {
            include: [
              { model: User, as: 'Followers' },
              { model: User, as: 'Followings' },
              { model: Tweet, as: 'LikedTweets' },
            ],
          })
          .then((user) => {
            const followersCount = user.Followers.length;
            const followingsCount = user.Followings.length;
            const likedTweetsCount = user.LikedTweets.length;
            const isFollowed = user.Followers.map(d => d.id).includes(helpers.getUser(req).id);
            return res.render('tweet', {
              tweet,
              user,
              likedUsersCount,
              repliesCount,
              tweetsCount,
              isLiked,
              followersCount,
              followingsCount,
              likedTweetsCount,
              isFollowed,
              reqUId: helpers.getUser(req).id,
            });
          });
      });
  },

  postReply: (req, res) => {
    const tweetId = req.params.tweet_id;
    const textLength = req.body.text.length;
    if (textLength === 0) {
      req.flash('error_messages', 'Reply should not be empty');
      return res.redirect(`/tweets/${tweetId}/replies`);
    }
    return Reply
      .create({
        UserId: helpers.getUser(req).id,
        TweetId: tweetId,
        comment: req.body.text,
      })
      .then(() => res.redirect(`/tweets/${tweetId}/replies`));
  },

  addLike: (req, res) => {
    return Like
      .create({
        UserId: helpers.getUser(req).id,
        TweetId: req.params.id,
      })
      .then(() => res.redirect('back'));
  },

  removeLike: (req, res) => {
    return Like
      .findOne(
        {
          where: {
            UserId: helpers.getUser(req).id,
            TweetId: req.params.id,
          },
        },
      )
      .then((like) => {
        like
          .destroy()
          .then(() => res.redirect('back'));
      });
  },
};

module.exports = tweetController;
