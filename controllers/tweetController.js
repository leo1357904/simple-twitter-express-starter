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
	      	// console.log(users)

	      	users = users.map(user => ({
	          ...user.dataValues,
	          FollowerCount: user.Followers.length,
	          isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
	        }))
	        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
	        users = users.slice(0, 10)
	        // console.log(users)

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
  	const textLength = req.body.text.length
  	if ((textLength > 0) && (textLength < 140)) {
			return Tweet.create({
				UserId: req.user.id,
				description: req.body.text,
			}).then((tweet) => {
			  res.redirect('/tweets')
			})
		} else {
			req.flash('error_messages', 'segmentation fault! REBOOT ur computer and try again')
      return res.redirect('/tweets')
		}
	},

	getTweet: (req, res) => {
	  return Tweet.findByPk(req.params.id, {
      include: [
        // Reply, 
        { model: Reply, include: [User] },
        { model: User, as: 'LikedUsers' },
        { model: User, include: [Tweet] }
      ]}).then(tweet => {
      	// console.log(tweet.Replies)
      	const likedUsersCount = tweet.LikedUsers.length
      	const repliesCount = tweet.Replies.length
      	const tweetsCount = tweet.User.Tweets.length
      	// console.log(likedUsersCount, repliesCount, tweetsCount)
        const isLiked = tweet.LikedUsers.map(d => d.id).includes(req.user.id)
        User.findByPk(tweet.UserId, {
        	include: [
        		{ model: User, as: 'Followers' },
        		{ model: User, as: 'Followings' },
        		{ model: Tweet, as: 'LikedTweets' },
        ]}).then(user => {
        	// console.log(user)
        	const followersCount = user.Followers.length
        	const followingsCount = user.Followings.length
        	const likedTweetsCount = user.LikedTweets.length
        	const isFollowed = user.Followers.map(d => d.id).includes(req.user.id)
        	// console.log(followersCount, followingsCount, likedTweetsCount)
        	return res.render('tweet', { 
	          tweet: tweet, 
	          user: user,
	          likedUsersCount: likedUsersCount,
	          repliesCount: repliesCount,
	          tweetsCount: tweetsCount,
	          isLiked: isLiked,
	          followersCount: followersCount,
	          followingsCount: followingsCount,
	          likedTweetsCount: likedTweetsCount,
	          isFollowed: isFollowed
	        })
        })
      })
	},

	postReply: (req, res) => {
		const textLength = req.body.text.length
  	if (textLength !== 0) {
			return Reply.create({
				UserId: req.user.id,
				TweetId: req.body.tweetId,
				comment: req.body.text,
			}).then((reply) => {
			  res.redirect(`/tweets/${req.body.tweetId}/replies`)
			})
		} else {
			req.flash('error_messages', 'segmentation fault! REBOOT ur computer and try again')
      return res.redirect(`/tweets/${req.body.tweetId}/replies`)
		}
	},

	addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      TweetId: req.params.id
    }).then((like) => {
      return res.redirect('/back')
    })
  },

  removeLike: (req, res) => {
    return Like.findOne({where: {
      UserId: req.user.id,
      TweetId: req.params.id
    }}).then((like) => {
      like.destroy()
      .then((like) => {
        return res.redirect('/back')
      })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.id
    }).then((followship) => {
      return res.redirect('/back')
    })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({where: {
      followerId: req.user.id,
      followingId: req.params.id
    }}).then((followship) => {
      followship.destroy()
      .then((followship) => {
        return res.redirect('/back')
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
