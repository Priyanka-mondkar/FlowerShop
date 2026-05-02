import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "moonflowers662@gmail.com",  
    pass: "qxcuetptusxlisxd"        
  }
});

const sendMail = async (name, email, message) => {

  const mailOptions = {
    from: "moonflowers@gmail.com",
    to: email,
    subject: "Moon Flowers - Message Received 🌸",
    html: `
      <h3>Hello ${name}</h3>
      <p>Thank you for contacting Moon Flowers.</p>

      <p><b>Your Message:</b></p>
      <p>${message}</p>

      <p>Our team will contact you soon.</p>

      <br>
      <p>Moon Flowers Team 🌸</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;