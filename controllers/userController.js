const db = require('../model/userModel');
const { codes, messages } = require('../helpers/constants');
const { AppError, ValidationError } = require('../helpers/error');
const { createSuccessResponse } = require('../helpers/utils');
const {
  getOnefn,
  getAllfn,
  updatefn,
} = require('../factories/dbFactoryHandlers');
const actions = {
  async getAllUsers(req, res, next) {
    return await getAllfn(db, { name: 'Users' });
  },
  async getUser(req, res, next) {
    return await getOnefn(db, { id: req.params.id, name: 'User' });
  },
  async updateMe(req, res, next) {
    let { body } = req;
    body = util.filterBody(body, 'password', 'passwordConfirm', 'role');
    return await updatefn(db, res, {
      id: req.params.id,
      name: 'User',
      body,
      newDoc: true,
      upsert: false,
      runValidators: true,
    });
  },
  async deleteMe(req, res, next) {
    return this.deleteUser(req, res, next);
  },
  async updateUser(req, res, next) {
    let { body } = req;
    const user = await db.findById(req.params.userId);
    if (!user) {
      return next(
        new AppError(messages.NOT_FOUND_ID('User'), codes.NOT_FOUND, false)
      );
    }
    await db.findByIdAndUpdate(req.params.userId, body, {
      new: true,
      runValidators: true,
    });
    return util.createSendWithToken(user, codes.OK, res, null, {
      template: null,
    });
  },
  async deleteUser(req, res, next) {
    const user = await db.findById(req.params.id).select('+password');
    if (!(await user.verifyPassword(req.params.id, user.password))) {
      return next(
        new ValidationError(
          messages.DELETE_WITH_INVALID_PASSWORD,
          codes.UNAUTHORIZED,
          false
        )
      );
    }
    await db.findByIdAndUpdate(req.params.id, { active: false });
    return res
      .status(codes.N0_CONTENT)
      .json(createSuccessResponse({ data: null }));
  },
};

module.exports = actions;
