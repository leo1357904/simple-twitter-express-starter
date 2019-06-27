const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const userController = {
  getUser: (req, res) => {
    User.findByPk(req.params.id, { include: { model: Tweet, include: [User] } }).then(user => {
      res.render('user/user', { profile: user })
    })
  }
}

module.exports = userController