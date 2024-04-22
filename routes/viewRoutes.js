const express = require('express')
const viewsController = require('./../controllers/viewsController')
const authController = require('./../controllers/authController')

const router = express.Router()

// router.get('/', viewsController.getOverview)

router.get('/', authController.isLoggedIn, viewsController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour)
router.get('/login', authController.isLoggedIn, viewsController.getLogin)
router.get('/me', authController.protect, viewsController.getAccount)
router.get('/signup', viewsController.getSignUp)

router.post(
	'/submit-user-data',
	authController.protect,
	viewsController.updateUserData
)

module.exports = router
