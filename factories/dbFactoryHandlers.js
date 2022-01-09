const { codes, messages, errorType } = require('../helpers/constants');
const util = require('../helpers/utils');

module.exports = {
  createfn(model, { name }) {
    return async (body, res) => {
      const doc = await model.create(body);
      if (!doc) {
        return next(
          new AppError(messages.NOT_CREATED(name), codes.BAD_REQUEST, false)
        );
      }
      return util.createSendWithToken(doc, codes.CREATED, res, { doc });
    };
  },
  async deletefn(model, { id, res }) {
    await model.findByIdAndDelete(id);
    return res
      .status(codes.N0_CONTENT)
      .json(createSuccessResponse({ data: null }));
  },
  async getOnefn(model, { id, res, populate, name }) {
    let doc;
    if (populate) doc = await model.findById(id).populate(populate);
    else doc = await model.findById(id);
    if (!doc) {
      return next(
        new AppError(messages.NOT_FOUND_ID(name), codes.NOT_FOUND, false)
      );
    }
    return res.status(codes.OK).json(
      createSuccessResponse({
        data: { doc },
      })
    );
  },
  async getAllfn(model, { name }) {
    const docs = await model.find();
    if (!docs) {
      return next(
        new AppError(messages.NO_ENTITY(name), codes.NOT_FOUND, false)
      );
    }
    return res.status(codes.OK).json(
      createSuccessResponse({
        data: { docs, result: docs.length },
      })
    );
  },
  async updatefn(
    model,
    res,
    { name, id, body, newDoc, upsert, runValidators }
  ) {
    const doc = await model.findById(id);
    if (!doc) {
      return next(
        new AppError(messages.NOT_FOUND_ID(name), codes.NOT_FOUND, false)
      );
    }
    let opts = {};
    if (newDoc) opts = { ...opts, new: true };
    if (upsert) opts = { ...opts, upsert: true };
    if (runValidators) opts = { ...opts, runValidators: true };
    await model.findByIdAndUpdate(id, body, opts);
    return util.createSendWithToken(docs, codes.OK, res);
  },
};
