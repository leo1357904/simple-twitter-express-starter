const db = require('../models')
const User = db.User

const userController = {
  getUser: (req, res) => {
    User.findByPk(req.params.id).then(user => {
      res.render('user/user', { profile: user })
    })
  }
}

module.exports = userController