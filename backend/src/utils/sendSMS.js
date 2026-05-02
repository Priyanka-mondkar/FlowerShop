// import twilio from "twilio";

// const client = twilio("ACCOUNT_SID","AUTH_TOKEN");

// export const sendSMS = async (phone,message)=>{

// try{

// await client.messages.create({
// body: message,
// from: "+1234567890",
// to: `+91${phone}`
// });

// console.log("SMS Sent Successfully");

// }catch(error){

// console.log("SMS Error:",error.message);

// }

// };

import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("TOKEN:", process.env.TWILIO_AUTH_TOKEN);
export const sendSMS = async (phone, message) => {

  try {

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`
    });

    console.log("SMS Sent Successfully");
    return true

  } catch (error) {

    console.log("SMS Error:", error.message);
    return false


  }

};