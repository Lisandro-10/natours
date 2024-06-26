const express = require('express')
const reviewController = require('./../controllers/reviewController')
const authController = require('./../controllers/authController')

//This option is for getting the tourId from the tourRoute
const router = express.Router({ mergeParams: true })

router.use(authController.protect)

router
	.route('/')
	.get(reviewController.getAllReviews)
	.post(
		authController.restrictTo('user'),
		reviewController.setTourUserIds,
		reviewController.createReview
	)

router
	.route('/:id')
	.get(reviewController.getReview)
	.patch(
		authController.restrictTo('user', 'admin'),
		reviewController.updateReview
	)
	.delete(
		authController.restrictTo('user', 'admin'),
		reviewController.deleteReview
	)

module.exports = router
