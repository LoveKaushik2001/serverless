const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.MAILING_SERVICE,
  secure: true,
  port: 465,
  auth: {
    user: process.env.AUTH_MAIL_ID,
    pass: process.env.AUTH_PASSWORD,
  },
});

const sendMail = async (text, userMailID, subject) => {
  try {
    const mailOptions = {
      from: process.env.AUTH_MAIL_ID,
      to: userMailID,
      subject: subject,
      text: text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    throw new Error("Error sending email > " + error.message);
  }
};

module.exports = { sendMail };
