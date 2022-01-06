const cacheFactory = require('./helpers/redis');
const config = require('./config');
exports.cache = cacheFactory({
  url: config.redisServerUrl,
  async getValueFunc(key) {
    try {
      return JSON.parse(await this.client.get(key));
    } catch (err) {
      console.log(err);
    }
  },
  async setKeyFunc(key, value, opt) {
    try {
      await this.client.set(key, JSON.stringify(value), { ...opt });
    } catch (err) {
      console.log(err);
    }
  },
  async deleteKeyFunc(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.log(err);
    }
  },
});
