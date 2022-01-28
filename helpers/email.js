const nodemailer = require('nodemailer');
const { readFileSync } = require('fs');
const config = require('../config');
const pug = require('pug');
const path = require('path');
const htmlToText = require('html-to-text');
const { AppError } = require('./error');
const { codes } = require('./constants');

module.exports = class Email {
  constructor(user, url) {
    this.user = user;
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.from = config.emailSender;
    this.url = url;
  }
  newTransport() {
    if (config.currentEnviroment === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: { user: config.sendgridUsername, pass: config.sendgridPassword },
      });
    }
    return nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      secure: false,
      auth: {
        user: config.emailUsername,
        pass: config.emailPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async send(template, subject) {
    try {
      const html = pug.renderFile(
        path.join(__dirname, `../views/email/${template}.pug`),
        {
          firstName: this.firstName,
          subject,
          url: this.url,
        }
      );
      const message = {
        from: this.from,
        to: this.to,
        subject: subject,
        html: html,
        text: htmlToText.convert(html, { wordwrap: 130 }),
      };

      await this.newTransport().sendMail(message);
    } catch (err) {
      console.log(err);
      throw new AppError('Error sending email', codes.INTERNAL_SERVER, true);
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome To Natour Family');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your 10Min password reset token');
  }
};
/********************************************************* */
//                 DEPRECATED
/********************************************************* */
// const htmlTemplate = (data) =>
//   readFileSync(`${__dirname}/../emails/reset.html`, 'utf-8').replace(
//     '{%urlResetToken%}',
//     data.urlResetToken
//   );

// async function sendEmail(options) {
//   try {
//     const opts =
//       options.mailingOptions || config.mailOptions
//         ? JSON.parse(config.mailOptions)
//         : undefined;
//     const transporter = nodemailer.createTransport(
//       opts || {
//         host: config.emailHost,
//         port: config.emailPort,
//         auth: {
//           user: config.emailUsername,
//           pass: config.emailPassword,
//         },
//         tls: {
//           rejectUnauthorized: false,
//         },
//       }
//     );

//     const { details } = options;
//     const message = {
//       from: config.emailSender,
//       to: details.email,
//       subject: details.subject,
//       html: htmlTemplate(details),
//       attachments: [
//         {
//           filename: 'email.png',
//           content: readFileSync(`${__dirname}/../img/email.png`),
//           cid: 'cid:logo@natour.com',
//         },
//       ],
//     };
//     await transporter.sendMail(message);
//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// }
