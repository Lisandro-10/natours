const multer = require('multer')
const sharp = require('sharp')
const AppError = require('../utils/appError')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

// const multerStorage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'public/img/users')
// 	},
// 	filename: (req, file, cb) => {
// 		//user-75755757sdfs-33332452255.jpeg
// 		const ext = file.mimetype.split('/')[1]
// 		cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
// 	},
// })
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
	//test if the uploaded file is an image
	if (file.mimetype.startsWith('image')) {
		cb(null, true)
	} else {
		cb(new AppError('Not an image! Please upload only images.', 400), false)
	}
}

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
})

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
	if (!req.file) return next()

	req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

	await sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/img/users/${req.file.filename}`)

	next()
})

const filterObj = (obj, ...allowedFields) => {
	let newObj = {}
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el]
	})
	return newObj
}

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id
	next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
	//1) Create error if user POSTs password data
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'This route is not for password updates! Please use /updateMyPassword',
				400
			)
		)
	}

	//2) Update user document
	const filteredBody = filterObj(req.body, 'name', 'email')
	if (req.file) filteredBody.photo = req.file.filename

	const updatedUser = await User.findByIdAndUpdate(
		req.user.id,
		filteredBody,
		{
			new: true,
			runValidators: true,
		}
	)

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser,
		},
	})
})

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false })

	res.status(204).json({
		status: 'success',
		data: null,
	})
})

exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
exports.createUser = factory.createOne(User)
