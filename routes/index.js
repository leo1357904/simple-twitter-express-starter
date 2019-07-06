const multer = require('multer');
const adminController = require('../controllers/adminController.js');
const tweetController = require('../controllers/tweetController.js');
const userController = require('../controllers/userController.js');
const { ensureAuthenticated } = require('../_helpers');


const upload = multer({ dest: 'temp/' });

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (!ensureAuthenticated(req)) {
      return res.redirect('/signin');
    }
    return next();
  };

  const authenticatedAdmin = (req, res, next) => {
    if (!ensureAuthenticated(req)) {
      return res.redirect('/signin');
    }
    if (req.user.role) {
      return next();
    }
    return res.redirect('/');
  };

  // 註冊登入
  app.get('/signup', userController.signUpPage);
  app.post('/signup', userController.signUp);

  app.get('/signin', userController.signInPage);
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn);

  app.get('/logout', userController.logout);

  // 使用者功能
  app.get('/', authenticated, (req, res) => res.redirect('/tweets'));

  app.get('/tweets', authenticated, tweetController.getTweets);
  app.post('/tweets', authenticated, tweetController.postTweet);

  app.get('/tweets/:tweet_id/replies', authenticated, tweetController.getReplies);
  app.post('/tweets/:tweet_id/replies', authenticated, tweetController.postReply);

  app.post('/tweets/:id/like', authenticated, tweetController.addLike);
  app.delete('/tweets/:id/unlike', authenticated, tweetController.removeLike);

  app.post('/followships', authenticated, userController.addFollowing);
  app.delete('/followships/:id', authenticated, userController.removeFollowing);

  app.get('/users/:id/tweets', authenticated, userController.getUser);
  app.get('/users/:id/edit', authenticated, userController.editUser);
  app.put('/users/:id/tweets', authenticated, upload.single('avatar'), userController.putUser);
  app.get('/users/:id/likes', authenticated, userController.getLike);
  app.get('/users/:id/followers', authenticated, userController.getFollower);
  app.get('/users/:id/followings', authenticated, userController.getFollowing);

  // 後台
  app.get('/admin', (req, res) => res.redirect('/admin/tweets'));
  app.get('/admin/tweets', authenticatedAdmin, adminController.getTweets);
  app.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweet);
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers);
};
