const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      maxlength: [40, 'A tour must not have more than 40 characters'],
      minlength: [10, 'A tour must have at least 10 characters'],
      message: 'Tour name must only contain characters',
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour should have a duration'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: 'Discount price ({VALUE}) should be less than the price',
      },
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
        message: 'Difficulty is either easy , medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'The rating cannot be more than 5.0'],
      min: [1, 'The rating cannot be less than 1.0'],
      set: (val) => Math.floor(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    likeCount: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      maxlength: 750,
      minlength: 50,
    },
    description: {
      type: String,
      require: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinate: [Number],
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
        coordinate: [Number],
        address: String,
        description: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1, difficulty: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// using virtuals
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  localField: '_id',
  foreignField: 'tour',
  ref: 'Review',
});

// using query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, async function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -lastPasswordModifiedAt',
  });
  next();
});

// document middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  this.finish = Date.now();
  console.log(`Query took ${this.finish - this.start} milliseconds!`);
  console.log(docs);
  next();
});

tourSchema.post('save', function (doc, next) {
  // console.log(`document was saved ${JSON.stringify(doc)}`);
  next();
});

//aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
