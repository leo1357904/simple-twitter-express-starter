const bcrypt = require('bcrypt-nodejs');
const imgur = require('imgur-node-api');
// const helpers = require('../_helpers');

const db = require('../models');


const {
  User,
  Tweet,
  Followship,
  Reply,
  Like,
} = db;

const { IMGUR_CLIENT_ID } = process.env;

const userController = {
  signUpPage: (req, res) => res.render('signup'),

  signUp: async (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！');
      return res.redirect('/signup');
    }

    // confirm unique user
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      req.flash('error_messages', '信箱重複！');
      return res.redirect('/signup');
    }

    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
    });
    req.flash('success_messages', '成功註冊帳號！');
    return res.redirect('/signin');
  },

  signInPage: (req, res) => res.render('signin'),

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！');
    res.redirect('/tweets');
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！');
    req.logout();
    res.redirect('/signin');
  },

  getUser: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Tweet, include: [User, Reply, Like] },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Tweet, as: 'LikedTweets' },
      ],
    }).then((user) => {
      const tweetCount = user.Tweets.length;
      const FollowerCount = user.Followers.length;
      const FollowingCount = user.Followings.length;
      const LikedCount = user.LikedTweets.length;
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id);

      const tweets = [];

      user.Tweets.map((tweet) => { // eslint-disable-line
        tweets.push({
          ...tweet.dataValues,
          isLiked: req.user.LikedTweets.map(d => d.id).includes(tweet.id),
        });
      });

      tweets.sort((a, b) => b.createdAt - a.createdAt);

      res.render('user/user', {
        profile: user,
        tweetCount,
        FollowerCount,
        FollowingCount,
        isFollowed,
        LikedCount,
        tweets,
      });
    });
  },

  editUser: (req, res) => {
    User.findByPk(req.params.id).then((user) => {
      res.render('user/edit', { user });
    });
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '用戶名稱未填寫');
      res.redirect('back');
    } else {
      const { file } = req;
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID);
        imgur.upload(file.path, (err, img) => {
          User.findByPk(req.params.id).then((user) => {
            user.update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: file ? img.data.link : user.avatar,
            }).then(() => {
              req.flash('success_messages', '個人資料修改成功');
              res.redirect(`/users/${req.params.id}/tweets`);
            });
          });
        });
      } else {
        User.findByPk(req.params.id).then((user) => {
          user.update({
            name: req.body.name,
            introduction: req.body.introduction,
            avatar: user.avatar,
          }).then(() => {
            req.flash('success_messages', '個人資料修改成功');
            res.redirect(`/users/${req.params.id}/tweets`);
          });
        });
      }
    }
  },

  getLike: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Tweet, include: [User, Reply, Like] },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Tweet, as: 'LikedTweets', include: [User, Reply, Like] },
      ],
    }).then((user) => {
      const tweetCount = user.Tweets.length;
      const FollowerCount = user.Followers.length;
      const FollowingCount = user.Followings.length;
      const LikedCount = user.LikedTweets.length;
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id);

      const likes = [];

      user.LikedTweets.map((tweet) => { // eslint-disable-line
        likes.push({
          ...tweet.dataValues,
          isLiked: req.user.LikedTweets.map(d => d.id).includes(tweet.id),
          createdAt: tweet.Like.createdAt,
        });
      });

      likes.sort((a, b) => b.createdAt - a.createdAt);

      res.render('user/like', {
        profile: user,
        tweetCount,
        FollowerCount,
        FollowingCount,
        isFollowed,
        LikedCount,
        likes,
      });
    });
  },

  addFollowing: (req, res) => {
    Followship.create({
      FollowerId: req.user.id,
      FollowingId: req.params.userId,
    }).then(() => {
      res.redirect('back');
    });
  },

  removeFollowing: (req, res) => {
    Followship.findOne({
      where: {
        FollowerId: req.user.id,
        FollowingId: req.params.userId,
      },
    }).then((followship) => {
      followship.destroy().then(() => {
        res.redirect('back');
      });
    });
  },

  getFollower: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Tweet, include: [User] },
        { model: User, as: 'Followers', include: [{ model: User, as: 'Followers' }] },
        { model: User, as: 'Followings' },
        { model: Tweet, as: 'LikedTweets' },
      ],
    }).then((user) => {
      const tweetCount = user.Tweets.length;
      const FollowerCount = user.Followers.length;
      const FollowingCount = user.Followings.length;
      const LikedCount = user.LikedTweets.length;
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id);

      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: user.id,
        },
      }).then(followship => (followship ? followship.dataValues.id : ''));

      const followers = [];

      user.Followers.map((user) => { // eslint-disable-line
        followers.push({
          ...user.dataValues,
          introduction: user.introduction,
          isFollowed: req.user.Followings.map(d => d.id).includes(user.id),
          createdAt: Followship.findOne({
            where: {
              followerId: req.user.id,
              followingId: user.id,
            },
          }).then(followship => followship.createdAt),
        });
      });

      followers.sort((a, b) => b.createdAt - a.createdAt);

      res.render('user/follower', {
        profile: user,
        tweetCount,
        FollowerCount,
        FollowingCount,
        LikedCount,
        isFollowed,
        followers,
      });
    });
  },

  getFollowing: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Tweet, include: [User] },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings', include: [{ model: User, as: 'Followers' }] },
        { model: Tweet, as: 'LikedTweets' },
      ],
    }).then((user) => {
      const tweetCount = user.Tweets.length;
      const FollowerCount = user.Followers.length;
      const FollowingCount = user.Followings.length;
      const LikedCount = user.LikedTweets.length;
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id);

      const followings = [];

      user.Followings.map((user) => { // eslint-disable-line
        followings.push({
          ...user.dataValues,
          introduction: user.introduction,
          createdAt: Followship.findOne({
            where: {
              followerId: req.user.id,
              followingId: user.id,
            },
          }).then(followship => followship.createdAt),
        });
      });

      followings.sort((a, b) => b.createdAt - a.createdAt);

      res.render('user/following', {
        profile: user,
        tweetCount,
        FollowerCount,
        FollowingCount,
        LikedCount,
        isFollowed,
        followings,
      });
    });
  },
};

module.exports = userController;
