const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review has to be provided'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating must be provided'],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unqiue: true });
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name ',
  }).populate({
    path: 'user',
    select: 'name photo ',
  });
  next();
});

reviewSchema.statics.calculateAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    { $group: { _id: '$tour', nRating: { $sum: 1 }, avgRating: { avg: '$rating' } } },
  ]);
  if (stats.length)
    return await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  return await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: 0,
    ratingsAverage: 4.5,
  });
};

reviewSchema.pre(/^findByIdAnd/, async function (next) {
  const current_doc = await this.findOne();
  this.current_doc = current_doc;
  next();
});

reviewSchema.post(/^findByIdAnd/, async function () {
  await this.constructor.current_doc.calculateAverageRatings(this.current_doc.tour);
});

reviewSchema.post('save', async function () {
  await this.current_doc.constructor.calculateAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
