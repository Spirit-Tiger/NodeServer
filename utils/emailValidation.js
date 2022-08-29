import nodemailer from "nodemailer";

const user = "testnode6@gmail.com";
const pass = "mnwffuldxagzgvvd";

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: user,
    pass: pass,
  },
});

export const sendConfirmationEmail = (name, email, confirmationCode) => {
  console.log("Check");
  transport
    .sendMail({
      from: user,
      to: email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
            <h2>Hello ${name}</h2>
            <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
            <a href=http://localhost:3000/confirm/${confirmationCode}> Click here</a>
            </div>`,
    })
    .catch((err) => console.log(err));
};
