import nodemailer from "nodemailer";
import "dotenv/config";

const transport = nodemailer.createTransport({
  host: "smtp.ukr.net",
  port: 465,
  auth: {
    // user: process.env.MAILTRAP_USERNAME,
    // pass: process.env.MAILTRAP_PASSWORD,
    user: "bodernet555@ukr.net",
    pass: "Asr3KAoce3ZT6UnK",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function sendMail(message) {
  return transport.sendMail(message);
}

export default { sendMail };
