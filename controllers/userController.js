const imgur = require('imgur-node-api');
const db = require('../models');

const { User } = db;
const { Tweet } = db;


const { IMGUR_CLIENT_ID } = process.env;

const userController = {
  getUser: (req, res) => {
    User.findByPk(req.params.id, { include: { model: Tweet, include: [User] } }).then((user) => {
      const tweetCount = user.Tweets.length;
      res.render('user/user', { profile: user, tweetCount });
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
};

module.exports = userController;
