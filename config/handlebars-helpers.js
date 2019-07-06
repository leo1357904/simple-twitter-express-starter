const moment = require('moment');

module.exports = {
  ifNotEqual: function (a, b, options) { // eslint-disable-line
    if (a !== b) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  moment: function (a) { // eslint-disable-line
    return moment(a).format('YYYY-MM-DD, hh:mm');
  },

  ifMatch: function (a, b, options) { // eslint-disable-line
    if (a === b) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
};
