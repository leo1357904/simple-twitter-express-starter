const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Reply = db.Reply
const Like = db.Like
const Followship = db.Followship

const tweetController = {
  getTweets: (req, res) => {
  	// console.log(req.user)
  	Tweet.findAll({
  		order: [
  		  ['createdAt', 'DESC']
  		],
  		include: [
  		  User, 
  		  Reply, 
  		  { model: User, as: 'LikedUsers' }
  		]
  	}).then((tweets) => {
		  // console.log(tweets[0])

		  User.findAll({
	      include: [
	        { model: User, as: 'Followers' }
	      ]}).then(users => {
	      	console.log(users)

	      	users = users.map(user => ({
	          ...user.dataValues,
	          FollowerCount: user.Followers.length,
	          isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
	        }))
	        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)

	      	tweets = tweets.map((tweet) => ({
		        ...tweet.dataValues,
		        description: tweet.dataValues.description.substring(0, 50),//
		        replyCount: tweet.Replies.length,
		        likeCount: tweet.LikedUsers.length,
		        isLiked: tweet.LikedUsers.map(d => d.id).includes(req.user.id)//
		      }))
				  return res.render('tweets', { 
				  	tweets: tweets,
				  	users: users
				  })
	      })
  	})
  },

  postTweet: (req, res) => {
		return Tweet.create({
			UserId: req.user.id,
			description: req.body.text,
		}).then((tweet) => {
		  res.redirect('/tweets')
		})
	},

	getTweet: (req, res) => {
	  return Tweet.findByPk(req.params.id, {
      include: [
        User,
        Reply, 
        // { model: User, as: 'FavoritedUsers' },
        // { model: User, as: 'LikedUsers' },
        // { model: Comment, include: [User] }
      ]}).then(tweet => {
      	console.log(tweet)
        // const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
        // const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
        
        return res.render('tweet', { 
          tweet: tweet, 
          // isFavorited: isFavorited, 
          // isLiked: isLiked 
        })
        
      })
	},

	addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      TweetId: req.params.id
    }).then((like) => {
      return res.redirect('/tweets')
    })
  },

  removeLike: (req, res) => {
    return Like.findOne({where: {
      UserId: req.user.id,
      TweetId: req.params.id
    }}).then((like) => {
      like.destroy()
      .then((like) => {
        return res.redirect('/tweets')
      })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.id
    }).then((followship) => {
      return res.redirect('/tweets')
    })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({where: {
      followerId: req.user.id,
      followingId: req.params.id
    }}).then((followship) => {
      followship.destroy()
      .then((followship) => {
        return res.redirect('/tweets')
      })
    })
  },

	signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
  	// console.log('log in!')
    // console.log(req.session.passport.user)
    res.redirect('/tweets')
  },
}
module.exports = tweetController
