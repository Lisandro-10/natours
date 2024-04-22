const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = mongoose.Schema(
	{
		review: {
			type: String,
			required: [true, 'A review must have some text!'],
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
		},
		createdAt: {
			type: Date,
			select: false,
			default: Date.now(),
		},
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'Review must belong to a tour.'],
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a user.'],
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (next) {
	// this.populate({
	// 	path: 'user',
	// 	select: 'name -_id',
	// }).populate({
	// 	path: 'tour',
	// 	select: 'name photo',
	// })

	this.populate({
		path: 'user',
		select: 'name photo',
	})
	next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
	const stats = await this.aggregate([
		{
			$match: { tour: tourId },
		},
		{
			$group: {
				_id: '$tour',
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' },
			},
		},
	])
	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating,
		})
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5,
		})
	}
}

reviewSchema.post('save', function () {
	//this points to current review
	this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
	//doc is expected to be a review
	this.doc = await this.findOne()
	next()
})

reviewSchema.post(/^findOneAnd/, async function () {
	// this.doc = await this.findOne(); does NOT work here, query has already executed

	//this.r is a property we saved in the pre middleware
	await this.doc.constructor.calcAverageRatings(this.doc.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
