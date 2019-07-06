const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt-nodejs');
const db = require('../models');

const { User, Tweet } = db;

// setup passport strategy
passport.use(
  new LocalStrategy(
    // customize user field
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    // authenticate user
    async (req, username, password, cb) => {
      const user = await User.findOne({ where: { email: username } });
      if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'));
      if (!bcrypt.compareSync(password, user.password)) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'));
      return cb(null, user);
    },
  ),
);

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  const user = await User.findByPk(
    id,
    {
      include: [
        { model: User, as: 'Following' },
        { model: User, as: 'Follower' },
        { model: Tweet, as: 'LikedTweets' },
      ],
    },
  );
  user.role = Number(user.role); // 為了讓前端辨識admin身份，number 0才會是falsy
  return cb(null, user);
});

module.exports = passport;
