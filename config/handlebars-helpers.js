const moment = require('moment');

module.exports = {
  ifCond: function (a, b, options) {
    if (a !== b) { return options.fn(this) }
    return options.inverse(this)
  },

  moment: function (a) {
    return moment(a).format('YYYY-MM-DD, hh:mm');
  },

  ifMatch: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },
}