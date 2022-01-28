const { codes, messages } = require('../helpers/constants');
const { AppError } = require('../helpers/error');
const util = require('../helpers/utils');
const Email = require('../helpers/email');
module.exports = {
  createfn(model, { name, email, url, template }) {
    return async (body, res, req) => {
      try {
        const doc = await model.create(body);
        if (!doc) {
          return next(
            new AppError(messages.NOT_CREATED(name), codes.BAD_REQUEST, false)
          );
        }
        if (email) {
          let url = `${req.protocol}://${req.get('host')}/me`;
          await new Email(doc, url).sendWelcome();
        }
        return util.createSendWithToken(
          doc,
          codes.CREATED,
          res,
          { doc },
          { template }
        );
      } catch (err) {
        console.log(err);
        throw err;
      }
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
    return util.createSendWithToken(doc, codes.OK, res);
  },
};
