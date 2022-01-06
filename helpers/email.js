const nodemailer = require('nodemailer');
const { readFileSync } = require('fs');
const config = require('../config');
const htmlTemplate = (data) =>
  readFileSync(`${__dirname}/../emails/reset.html`, 'utf-8').replace(
    '{%urlResetToken%}',
    data.urlResetToken
  );

exports.sendEmail = async (options) => {
  try {
    const opts =
      options.mailingOptions || config.mailOptions
        ? JSON.parse(config.mailOptions)
        : undefined;
    const transporter = nodemailer.createTransport(
      opts || {
        host: config.emailHost,
        port: config.emailPort,
        auth: {
          user: config.emailUsername,
          pass: config.emailPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }
    );

    const { details } = options;
    const message = {
      from: 'Natours <caleberioluwa@gmail.com>',
      to: details.email,
      subject: details.subject,
      html: htmlTemplate(details),
      attachments: [
        {
          filename: 'email.png',
          content: readFileSync(`${__dirname}/../img/email.png`),
          cid: 'cid:logo@natour.com',
        },
      ],
    };
    await transporter.sendMail(message);
  } catch (err) {
    console.log(err);
    throw err;
  }
};
