const multer = require('multer');

const userController = require('../controllers/userController');

const upload = multer({ dest: 'temp/' });

module.exports = (app) => {
  app.get('/users/:id/tweets', userController.getUser);
  app.get('/users/:id/edit', userController.editUser);
  app.put('/users/:id/tweets', upload.single('avatar'), userController.putUser);
  app.get('/users/:id/likes', userController.getLike);
};
