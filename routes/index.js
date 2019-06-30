const adminController = require('../controllers/adminController.js');
const tweetController = require('../controllers/tweetController.js');
const userController = require('../controllers/userController.js');

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/signin');
  };

  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.role) {
        return next();
      }
      return res.redirect('/');
    }
    return res.redirect('/signin');
  };

  // 註冊登入流程
  app.get('/signup', userController.signUpPage);
  app.post('/signup', userController.signUp);

  app.get('/signin', userController.signInPage);
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn);

  app.get('/logout', userController.logout);

  // 如果使用者訪問首頁，就導向 /tweets 的頁面
  app.get('/', (req, res) => res.redirect('/tweets'));
  // 在 /tweets 底下則交給 tweetController.getTweets 來處理
  app.get('/tweets', authenticated, tweetController.getTweets);

  app.get('/admin', (req, res) => res.redirect('/admin/tweets'));
  app.get('/admin/tweets', authenticatedAdmin, adminController.getTweets);
  app.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweet);
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers);
};
