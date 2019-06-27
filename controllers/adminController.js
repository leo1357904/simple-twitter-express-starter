const adminController = {
  getRestaurants: (req, res) => { // eslint-disable-line
    return res.render('restaurants');
  },
};

module.exports = adminController;
