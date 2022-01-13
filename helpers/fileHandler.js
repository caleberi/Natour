const fs = require('fs');
const path = require('path');
const { codes } = require('./constants');
const { AppError } = require('./error');

exports.removePreviousAssociateProfileName = (
  dirpath,
  { userId, latestFileTime }
) => {
  fs.readdir(dirpath, (err, files) => {
    if (err)
      throw new AppError(
        `Error occurred while reading directory :${dirpath}`,
        codes.INTERNAL_SERVER,
        true
      );

    const fileDetails = files.map((file) => {
      const fragments = file.split('-');
      const userId = fragments[0];
      const createdDate = new Date(parseInt(fragments[2]));
      return {
        userId,
        createdDate,
        filepath: path.join(dirpath, file),
      };
    });
    fileDetails.forEach((details) => {
      if (
        userId == details.userId &&
        new Date(latestFileTime) > details.createdDate
      )
        fs.unlink(details.filepath, (err) => {
          if (err) throw err;
          console.log(`${details.filepath} was deleted`);
        });
    });
  });
};
