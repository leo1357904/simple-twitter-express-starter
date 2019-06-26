const userController = require('../controllers/userController')

module.exports = (app) => {

  app.get('/users/:id/tweets', userController.getUser)

}