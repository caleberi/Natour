const { filterBodyWithCallback } = require('./utils');

class TourQueryApi {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(...excludedField) {
    excludedField = excludedField.length
      ? excludedField
      : ['page', 'sort', 'limit', 'fields'];
    const queryField = Object.assign({}, this.queryString);
    excludedField.forEach((field) => {
      delete queryField[field];
    });
    let queryFieldString = JSON.stringify(queryField);
    queryFieldString = queryFieldString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matched) => `$${matched}`
    );
    this.query.find(JSON.parse(queryFieldString));
    return this;
  }

  sortBy() {
    if (this.queryString.sort) {
      let sortResultBy = this.queryString.sort.split(',').join(' ');
      this.query.sort(sortResultBy);
    } else {
      this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const selectedFields = this.queryString.fields.split(',').join(' ');
      this.query.select(selectedFields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    if (this.queryString.page) {
      const [start, end] = this.queryString.page.split(',');
      const page = start * 1 || 1;
      const limit = end * 1 || 1;
      const skip = (page - 1) * limit;

      this.query.skip(skip).limit(limit);
    }
    return this;
  }
}

class ReviewQueryApi {
  constructor(query, queryObject) {
    this.query = query;
    this.queryObject = queryObject;
  }

  filter() {
    this.queryObject = filterBodyWithCallback(this.queryObject, function (k) {
      return !['rating', 'tour', 'user', 'sort'].includes(k);
    });
    let queryFieldString = JSON.stringify(this.queryObject);
    queryFieldString = queryFieldString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matched) => `$${matched}`
    );
    this.queryObject = JSON.parse(queryFieldString);
    this.query = this.query.find(this.queryObject);
    return this;
  }

  sort() {
    if (this.queryObject.sort) {
      let sortResultBy = this.queryObject.sort.split(',').join(' ');
      this.query.sort(sortResultBy);
    } else {
      this.query.sort('-createdAt');
    }
    return this;
  }
}
exports.TourQueryApi = TourQueryApi;
exports.ReviewQueryApi = ReviewQueryApi;
