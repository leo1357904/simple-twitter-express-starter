const bcrypt = require('bcrypt-nodejs');
const imgur = require('imgur-node-api');
const helpers = require('../_helpers');

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
    const userEmail = await User.findOne({ where: { email: req.body.email } });
    if (userEmail) {
      req.flash('error_messages', '信箱重複！');
      return res.redirect('/signup');
    }

    const userName = await User.findOne({ where: { name: req.body.name } });
    if (userName) {
      req.flash('error_messages', '使用者名稱重複！');
      return res.redirect('/signup');
    }

    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！');
      return res.redirect('/signup');
    }

    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
      role: 0,
      avatar: 'https://i.imgur.com/Uzs2ty3.jpg',
      introduction: '',
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
    User
      .findByPk(req.params.id, {
        include: [
          { model: Tweet, include: [User, Reply, Like] },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Tweet, as: 'LikedTweets' },
        ],
      })
      .then((user) => {
        const tweetCount = user.Tweets.length;
        const FollowerCount = user.Followers.length;
        const FollowingCount = user.Followings.length;
        const LikedCount = user.LikedTweets.length;
        const isFollowed = helpers.getUser(req).Followings.map(d => d.id).includes(user.id);

        const tweets = user.Tweets
          .map(tweet => ({
            ...tweet.dataValues,
            isLiked: helpers.getUser(req).LikedTweets.map(d => d.id).includes(tweet.id),
          }))
          .sort((a, b) => b.createdAt - a.createdAt);

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
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      return res.redirect('/')
    }
    User
      .findByPk(req.params.id)
      .then((user) => {
        res.render('user/edit', { user });
      });
  },

  putUser: async (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '用戶名稱未填寫');
      return res.redirect('back');
    }

    const userName = await User.findOne({ where: { name: req.body.name } });
    if (userName) {
      req.flash('error_messages', '用戶名稱重複');
      return res.redirect('back');
    }
    const { file } = req;
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        User
          .findByPk(req.params.id)
          .then((user) => {
            user
              .update({
                name: req.body.name,
                introduction: req.body.introduction,
                avatar: file ? img.data.link : user.avatar,
              })
              .then(() => {
                req.flash('success_messages', '個人資料修改成功');
                res.redirect(`/users/${req.params.id}/tweets`);
              });
          });
      });
    } else {
      User
        .findByPk(req.params.id)
        .then((user) => {
          user
            .update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: user.avatar,
            })
            .then(() => {
              req.flash('success_messages', '個人資料修改成功');
              res.redirect(`/users/${req.params.id}/tweets`);
            });
        });
    }
  },

  getLike: (req, res) => {
    User
      .findByPk(req.params.id, {
        include: [
          { model: Tweet, include: [User, Reply, Like] },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Tweet, as: 'LikedTweets', include: [User, Reply, Like] },
        ],
      })
      .then((user) => {
        const tweetCount = user.Tweets.length;
        const FollowerCount = user.Followers.length;
        const FollowingCount = user.Followings.length;
        const LikedCount = user.LikedTweets.length;
        const isFollowed = helpers.getUser(req).Followings.map(d => d.id).includes(user.id);

        const likes = user.LikedTweets
          .map(tweet => ({
            ...tweet.dataValues,
            isLiked: helpers.getUser(req).LikedTweets.map(d => d.id).includes(tweet.id),
            likeCreatedAt: tweet.Like.createdAt,
          }))
          .sort((a, b) => b.likeCreatedAt - a.likeCreatedAt);

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
    if (helpers.getUser(req).id === Number(req.body.id)) {
      return res.send('cannot follow yourself!');
    }
    return Followship
      .create({
        followerId: helpers.getUser(req).id,
        followingId: req.body.id,
      })
      .then(() => {
        res.redirect('back');
      });
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
      const isFollowed = helpers.getUser(req).Followings.map(d => d.id).includes(user.id);

      const followers = user.Followers
        .map(follower => ({
          ...follower.dataValues,
          introduction: follower.introduction,
          isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(follower.id),
          createdAt: Followship
            .findOne({
              where: {
                followerId: follower.id,
                followingId: req.params.id,
              },
            })
            .then(followship => followship.createdAt),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

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
      const isFollowed = helpers.getUser(req).Followings.map(d => d.id).includes(user.id);

      const followings = user.Followings
        .map(following => ({
          ...following.dataValues,
          introduction: following.introduction,
          createdAt: Followship
            .findOne({
              where: {
                followerId: req.params.id,
                followingId: following.id,
              },
            })
            .then(followship => followship.createdAt),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

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
