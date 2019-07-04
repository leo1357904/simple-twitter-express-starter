const db = require('../models');
const helpers = require('../_helpers');

const {
  Tweet,
  User,
  Reply,
  Like,
  Followship,
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

          const tweets = tweetData.map(tweet => ({
            ...tweet.dataValues,
            description: tweet.dataValues.description.substring(0, 50),
            replyCount: tweet.Replies.length,
            likeCount: tweet.LikedUsers.length,
            isLiked: tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id),
          }));
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
    if ((textLength > 0) && (textLength < 140)) {
      return Tweet
        .create({
          UserId: helpers.getUser(req).id,
          description: req.body.text,
        })
        .then(() => res.redirect('/tweets'));
    }
    req.flash('error_messages', 'segmentation fault! REBOOT ur computer and try again');
    return res.redirect('/tweets');
  },

  getTweet: (req, res) => {
    return Tweet
      .findByPk(req.params.id, {
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
    const textLength = req.body.text.length;
    if (textLength !== 0) {
      return Reply
        .create({
          UserId: helpers.getUser(req).id,
          TweetId: req.body.tweetId,
          comment: req.body.text,
        })
        .then(() => res.redirect(`/tweets/${req.body.tweetId}/replies`));
    }
    req.flash('error_messages', 'segmentation fault! REBOOT ur computer and try again');
    return res.redirect(`/tweets/${req.body.tweetId}/replies`);
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

  addFollowing: (req, res) => {
    return Followship
      .create({
        followerId: helpers.getUser(req).id,
        followingId: req.body.userId,
      }).then(() => res.redirect('back'));
  },

  removeFollowing: (req, res) => {
    return Followship
      .findOne(
        {
          where: {
            followerId: helpers.getUser(req).id,
            followingId: req.params.id,
          },
        },
      )
      .then((followship) => {
        followship
          .destroy()
          .then(() => res.redirect('back'));
      });
  },

  signInPage: (req, res) => {
    res.render('signin');
  },

  signIn: (req, res) => {
    res.redirect('/tweets');
  },
};

module.exports = tweetController;
