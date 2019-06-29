const bcrypt = require('bcrypt-nodejs');
const imgur = require('imgur-node-api');
const db = require('../models');

const { User, Tweet, Followship } = db;
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
    const user = await User.findOne({ where: { email: req.body.email }});
    if (user) {
      req.flash('error_messages', '信箱重複！');
      return res.redirect('/signup');
    }

    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
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
        { model: Tweet, include: [User] },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
      ],
    }).then((user) => {
      const tweetCount = user.Tweets.length;
      const FollowerCount = user.Followers.length;
      const FollowingCount = user.Followings.length;
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id);
      res.render('user/user', {
        profile: user,
        tweetCount,
        FollowerCount,
        FollowingCount,
        isFollowed,
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
    User.findByPk(req.params.id, { include: { model: Tweet, include: [User] } }).then((user) => {
      const tweetCount = user.Tweets.length;
      res.render('user/like', { user, tweetCount });
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
        { model: User, as: 'Followers' },
      ],
    }).then((users) => {
      const followerUsers = users.map((user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id),
      })));
      const sortUsers = followerUsers.sort({ createdAt: 'desc' });
      res.render('user/follower', { sortUsers });
    });
  },
};

module.exports = userController;
