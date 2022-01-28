const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const redisTemplate = {
  client: redisClient,
  setup({ url, getValueFunc, setKeyFunc, deleteKeyFunc }) {
    try {
      const self = this;
      if (url)
        this.client
          .connect({ url })
          .then(() => console.log('Redis Client Connected'))
          .catch((err) => console.log(err));
      else
        this.client
          .connect({ url })
          .then(() => console.log('Redis Client Connected'))
          .catch((err) => console.log(err));

      return {
        get: getValueFunc.bind(self),
        set: setKeyFunc.bind(self),
        del: deleteKeyFunc.bind(self),
      };
    } catch (err) {
      console.log(err);
    }
  },
};

const cacheFactory = ({ url, getValueFunc, setKeyFunc, deleteKeyFunc }) => {
  const baseCache = Object.create(redisTemplate);
  return Object.assign(
    {},
    baseCache.setup({ url, getValueFunc, setKeyFunc, deleteKeyFunc })
  );
};

module.exports = cacheFactory;
