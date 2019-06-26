const bcrypt = require('bcrypt-nodejs');
const db = require('../models');

const { User } = db;

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
    User.findByPk(req.params.id).then(user => {
      res.render('user/user', { profile: user })
    })
  }
};

module.exports = userController;
