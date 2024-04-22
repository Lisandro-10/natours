const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const compression = require('compression')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')

const app = express()
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

//GLOABL MIDDLEWARE -- function that modifies income data
//serving static file
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public')))

//set security HTTP headers
// app.use(helmet())

//HELMET-MAPBOX - security policy
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'", 'data:', 'blob:'],
			baseUri: ["'self'"],
			fontSrc: ["'self'", 'https:', 'data:'],
			scriptSrc: ["'self'", 'https://*.cloudflare.com'],
			scriptSrc: ["'self'", 'https://*.stripe.com'],
			scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],
			frameSrc: ["'self'", 'https://*.stripe.com'],
			objectSrc: ["'none'"],
			styleSrc: ["'self'", 'https:', 'unsafe-inline'],
			workerSrc: ["'self'", 'data:', 'blob:'],
			childSrc: ["'self'", 'blob:'],
			imgSrc: ["'self'", 'data:', 'blob:'],
			connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],
			upgradeInsecureRequests: [],
		},
	})
)

//development login
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

//allows 100 requests from the same API on an hour
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many request from this IP, please try again in an hour!',
})
app.use('/api', limiter) //it will have effect on every request that goes through this route

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

//data sanitization against NoSQL query injection
app.use(mongoSanitize())
//data sanitization against XSS
app.use(xss())
//prevent parameter pollution
app.use(
	hpp({
		whitelist: [
			'duration',
			'price',
			'ratingsAverage',
			'ratingsQuantity',
			'maxGroupSize',
			'difficulty',
		],
	})
)

app.use(compression())

//test middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString()
	next()
})

//ROUTES
app.use('/', viewRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/reviews', reviewRouter)

//if the url matched with one of the routers it will never reach this code.
app.all('*', (req, res, next) => {
	// const err = new Error(`Can't find ${req.originalUrl} on this server!`)
	// err.status = 'fail'
	// err.statusCode = 404
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app
