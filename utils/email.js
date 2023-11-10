const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    //we will use fake sending email ->mailTrap
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // if we want to use gmail we will write insteed of the previous two line -> the next line
    //service: 'Gmail', //and we will activate in that gmail account somthing called the less secure app option
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'ahmed Omer <ahmed@hello.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
