const nodemailer = require("nodemailer");
let transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendVerifyEmail(name, toEmail, verifiedLink) {
  const mailOptions = {
    from: "verifyaccount@expense-tracker.com", // Sender address
    to: toEmail, // List of recipients
    subject: "Verfied Account", // Subject line
    html: `Hi ${name}!, Please click the link to verify your account. <br/> <a href="${verifiedLink}">Verify Account</a>`, // Plain text body
  };

  transport.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
}

function sendResetPasswordLink(name, toEmail, resetLink) {
  const mailOptions = {
    from: "reset-password@expense-tracker.com", // Sender address
    to: toEmail, // List of recipients
    subject: "Reset Password", // Subject line
    html: `Hi ${name}!, Please click the link to reset your account password. <br/> <a href="${resetLink}">Reset Password</a>`, // Plain text body
  };

  transport.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
}

module.exports = {
  sendVerifyEmail: sendVerifyEmail,
  sendResetPasswordLink: sendResetPasswordLink,
};
