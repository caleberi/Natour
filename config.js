const dotenv = require('dotenv');
const _ = require('lodash');
const { messages } = require('./helpers/constants');
const { ConfigurationError } = require('./helpers/error');

dotenv.config({
  path: `./config.env`,
});

var configurationInstance = null;

const baseConfiguration = {
  currentEnviroment: getEnvironmentVariable('NODE_ENV'),
  appPort: parseInt(getEnvironmentVariable('PORT')),
  mongoDatabaseProduction: getEnvironmentVariable('MONGO_DATABASE_PRODUCTION'),
  mongoDatabaseLocal: getEnvironmentVariable('MONGO_DATABASE_LOCAL'),
  mongoPassword: getEnvironmentVariable('MONGO_PASSWORD'),
  redisServerUrl: getEnvironmentVariable('REDIS_SERVER_URL'),
  jwtSecret: getEnvironmentVariable('JWT_SECRET'),
  jwtExpires: getEnvironmentVariable('JWT_EXPIRES'),
  jwtCookieExpires: parseInt(getEnvironmentVariable('JWT_COOKIE_EXPIRES')),
  jwtAlgorithm: getEnvironmentVariable('JWT_ALGORITHM'),
  emailUsername: getEnvironmentVariable('EMAIL_USERNAME'),
  emailPassword: getEnvironmentVariable('EMAIL_PASSWORD'),
  emailHost: getEnvironmentVariable('EMAIL_HOST'),
  emailPort: parseInt(getEnvironmentVariable('EMAIL_PORT')),
};

function getEnvironmentVariable(key) {
  const parsedKey = _.toUpper(key);
  if (!(parsedKey in process.env)) {
    throw new ConfigurationError(messages.CONFIG_MSG(key));
  }
  return process.env[parsedKey];
}

const configuration = function (options = {}) {
  if (_.isNull(configurationInstance))
    configurationInstance = _.assign({}, baseConfiguration, options);
  return configurationInstance;
};

module.exports = configuration({
  mongoUseLocal: Boolean(getEnvironmentVariable('MONGO_USE_LOCAL')),
  twilioAccountSid: getEnvironmentVariable('TWILIO_ACCOUNT_SID'),
  twilioAuthToken: getEnvironmentVariable('TWILIO_AUTH_TOKEN'),
  twilioPhoneNumber: getEnvironmentVariable('TWILIO_PHONE_NUMBER'),
  redisDeleteTime: parseInt(getEnvironmentVariable('REDIS_DELETE_TIME')),
  admins: JSON.parse(getEnvironmentVariable('ADMINS')),
  imageHeight: parseInt(getEnvironmentVariable('IMAGE_HEIGHT')),
  imageWidth: parseInt(getEnvironmentVariable('IMAGE_WIDTH')),
  imageQuality: parseInt(getEnvironmentVariable('IMAGE_QUALITY')),
});
