function ensureAuthenticated(req) {
  return req.isAuthenticated();
}

function getUser(req) {
  return req.user;
}

const moment = require('moment')
function time(a) {
  return moment(a).format("YYYY-MM-DD, HH:mm")
}

module.exports = {
  ensureAuthenticated,
  getUser,
  time
};