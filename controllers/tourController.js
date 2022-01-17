const { cache } = require('../container');
const { TourQueryApi } = require('../helpers/queries');
const { AppError } = require('../helpers/error');
const db = require('../model/tourModel');
const { codes, messages } = require('../helpers/constants');
const { createSuccessResponse } = require('../helpers/utils');
const { isLatLong, isNumeric } = require('validator').default;
const config = require('../config');
const Jimp = require('jimp');
const {
  createfn,
  deletefn,
  getOnefn,
  updatefn,
} = require('../factories/dbFactoryHandlers');
const actions = {
  async getTour(req, res, next) {
    return getOnefn(db, {
      id: req.params.id,
      res,
      populate: 'reviews',
      name: 'Tour',
    });
  },

  async getAllTours(req, res, next) {
    const key = Object.keys(req.query).length
      ? JSON.stringify(req.query)
      : 'all';
    const presentInCache = await cache.get(key);
    if (presentInCache) {
      return res.status(codes.OK).json(
        createSuccessResponse({
          data: {
            tours: presentInCache,
            results: presentInCache.length,
          },
        })
      );
    }

    const qsx = new TourQueryApi(db.find(), req.query)
      .filter()
      .sortBy()
      .limitFields()
      .paginate();
    const tours = await qsx.query;
    if (!presentInCache)
      await cache.set(key, tours, {
        PX: config.redisDeleteTime,
        NX: true,
      });

    return res.status(codes.OK).json(
      createSuccessResponse({
        data: {
          results: tours.length,
          tours,
        },
      })
    );
  },

  async updateTour(req, res, next) {
    await updatefn(db, res, {
      body: req.body,
      id: req.params.id,
      newDoc: true,
      upsert: true,
      name: 'Tour',
      runValidators: true,
    });
  },

  async createTour(req, res, next) {
    return await createfn(db, { name: 'Tour' })(req.body, res);
  },

  async deleteTour(req, res, next) {
    return deletefn(db, { id: req.params.id, res });
  },

  async getTourStats(req, res, next) {
    const [matchStage, groupStage, sortStage] = [
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgPrice: 1 } },
    ];
    const additionalStages = {
      $match: { _id: { $ne: 'EASY' } },
    };

    const stats = await db.aggregate([
      matchStage,
      groupStage,
      sortStage,
      additionalStages,
    ]);
    return res
      .status(codes.OK)
      .json(createSuccessResponse({ data: { stats } }));
  },
  async getMonthlyPlan(req, res, next) {
    const year = req.params.year * 1;
    const plan = await db.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numOfTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
      { $sort: { numOfTourStarts: -1 } },
    ]);

    if (!plan) {
      return next(
        new AppError(messages.NO_TOUR_PLAN(year), codes.NOT_FOUND, false)
      );
    }
    res.status(codes.OK).json(createSuccessResponse({ data: { plan } }));
  },

  async getToursWithin(req, res, next) {
    const { distance, unit, latlng } = req.params;
    const [lat, lng] = latlng.split(',');
    const validateParams = {
      isLatLong: lat && lng && latlng && isLatLong(latlng) ? true : false,
      isDistance: isNumeric(distance),
    };
    if (!unit) unit = 'mi';
    if (!validateParams.isLatLong)
      return new AppError(messages.INVALID_LATLONG, codes.BAD_REQUEST, false);
    if (!validateParams.isDistance)
      return new AppError(messages.INVALID_DISTANCE, codes.BAD_REQUEST, false);
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    const tours = await db.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });
    return res
      .status(codes.OK)
      .json(createSuccessResponse({ results: tours.length, data: { tours } }));
  },
  async getTourDistances(req, res, next) {
    const { unit, latlng } = req.params;
    const [lat, lng] = latlng.split(',');
    const validateParams = {
      isLatLong: lat && lng && latlng && isLatLong(latlng) ? true : false,
    };
    if (!unit) unit = 'mi';
    if (!validateParams.isLatLong)
      return new AppError(messages.INVALID_LATLONG, codes.BAD_REQUEST, false);
    if (!validateParams.isDistance)
      return new AppError(messages.INVALID_DISTANCE, codes.BAD_REQUEST, false);
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    const distances = await db.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinate: [lng * 1, lat * 1],
            distanceField: 'distance',
            distanceMultiplier: multiplier,
          },
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);
    return res.status(codes.OK).json(
      createSuccessResponse({
        results: distances.length,
        data: { distances },
      })
    );
  },
};

module.exports = actions;
