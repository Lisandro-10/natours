const mongoose = require('mongoose')
const slugify = require('slugify')
// const User = require('./userModel')

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true,
			maxlength: [
				40,
				'A tour name must have less or equal then 40 characters',
			],
			minlength: [
				10,
				'A tour name must have more or equal then 10 characters',
			],
			// validate: [
			// 	validator.isAlpha,
			// 	,
			// 	'Tour name must only contain characters',
			// ],
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration'],
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a group size'],
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficult is either: easy, medium or difficult',
			},
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1.0'],
			max: [5, 'Rating must be below 5.0'],
			set: (val) => Math.round(val * 10) / 10,
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price'],
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (val) {
					//this won't work on an update request
					//this only points to current doc on NEW document creation
					return val < this.price
				},
				message:
					'Discount price ({VALUE}) should be below regular price',
			},
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a description'],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image'],
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false,
		},
		startLocation: {
			//geoJSON
			type: {
				type: String,
				default: 'Point',
				enum: ['Point'],
			},
			coordinates: [Number],
			address: String,
			description: String,
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point'],
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number,
			},
		],
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
	},
	//A virtual property is a field that is not stored in the database,so for that property to be shown we
	//need the configuration below.
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

//indexing the database
// tourSchema.index({ price: 1 })
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

//Virtual populate
tourSchema.virtual('durationWeeks').get(function () {
	return this.duration / 7
})

tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id',
})

//DOCUMENT MIDDLEWARE: runs before .save() and .create() -- only on this actions will be executed
tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true })
	next()
})

tourSchema.pre(/^find/, function (next) {
	//'this' always points to the actual query
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt',
	})
	next()
})

//middleware function: this.guides.map returns promises because User.findById is a promise.
//The guides parameter will contain user ids, so for every id it will search for the user
// so the outcome is an array of users
// tourSchema.pre('save', async function (next) {
// 	const guidesPromises = this.guides.map(
// 		async (id) => await User.findById(id)
// 	)
// 	this.guides = await Promise.all(guidesPromises)
// 	next()
// })

/*
This has to be done when the users are embedded in the tour document. Now it's related by reference.
For the future, the implementation above has to be also done when a user is updated. I leave it
to myself because jona does not implement it.
*/

// tourSchema.pre('save', function (next) {
// 	console.log('Will save document...')
// 	next()
// })

// tourSchema.post('save', function (doc, next) {
// 	console.log(doc)
// 	next()
// })

//QUERY MIDDLEWARE
// tourSchema.pre(/^find/, function (next) {
// 	// tourSchema.pre('find', function (next) {
// 	this.find({ secretTour: { $ne: true } })

// 	this.start = Date.now()
// 	next()
// })

// tourSchema.post(/^find/, function (docs, next) {
// 	console.log(`Query took ${Date.now() - this.start} miliseconds`)
// 	next()
// })

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
// 	console.log(this.pipeline())
// 	this.pipeline().unshift({
// 		$match: { secretTour: { $ne: true } },
// 	})
// 	next()
// })

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
