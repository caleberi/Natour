const dotenv = require('dotenv');
const mongoose = require('mongoose');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const commands = yargs(hideBin(process.argv));

dotenv.config({ path: '../config.env' });

const db = process.env.MONGO_USE_LOCAL
  ? process.env.MONGO_DATABASE_LOCAL
  : process.env.MONGO_DATABASE_PRODUCTION.replace(
      '<MONGO_PASSWORD>',
      process.env.MONGO_PASSWORD
    );

const cmd = commands
  .usage('Usage: $0 <command> [options]')
  .command('action', 'task to perform')
  .example('$0 action -a import', 'populate database with data')
  .alias('a', 'action')
  .command('filename', 'file to use ')
  .alias('f', 'filename')
  .command('modelpath', 'filepath to database model ')
  .alias('m', 'modelpath')
  .nargs('a', 1)
  .nargs('f', 1)
  .nargs('m', 1)
  .demandOption(['a', 'f', 'm'])
  .help('h')
  .alias('h', 'help').argv;

const loadData = (filename) => {
  return require('fs').readFileSync(
    path.resolve(`${__dirname}/../data/${filename}.json`),
    'utf-8'
  );
};

const importData = async (model, payload) => {
  try {
    const data = JSON.parse(payload);
    data.forEach(async (dt) => {
      try {
        delete dt.id;
        await model.create(dt, { runValidators: false });
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(`Error occurred while populating database with tour : ${err}`);
  }
};

const clearDB = async (model) => {
  try {
    await model.deleteMany({});
  } catch (err) {
    console.log(`Error occurred while clearing database with tour : ${err}`);
  }
};

mongoose
  .connect(db, {
    useNewUrlParser: true,
    retryReads: true,
    retryWrites: true,
  })
  .then(async (_conn) => {
    const model = require(cmd.modelpath);
    let data;
    if (cmd.filename) data = loadData(cmd.filename);
    console.log('DB Connection was successful !!!');
    switch (cmd.action) {
      case 'import':
        {
          try {
            await importData(model, data);
          } catch (err) {
            console.log(err);
          }
        }
        break;
      default: {
        try {
          await clearDB(model);
        } catch (err) {
          console.log(err);
        }
      }
    }
    setTimeout(() => {
      console.log('closing script after 10000ms ');
      process.exit(1);
    }, 10000);
  })
  .catch((err) => {
    console.log(err);
    console.log('DB Connection was unsuccessful !!!');
  });
