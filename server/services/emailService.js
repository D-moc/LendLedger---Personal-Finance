import emailjs from "@emailjs/nodejs";

export const sendPasswordResetEmail = async ({
  email,
  name,
  resetUrl,
}) => {
  try {
    const templateParams = {
      to_email: email,
      name: name || "DueLedger User",
      reset_url: resetUrl,
    };

    console.log(
      "[EmailJS] Sending reset email to:",
      email
    );

    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey:
          process.env.EMAILJS_PUBLIC_KEY,

        privateKey:
          process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    console.log(
      "[EmailJS] Response:",
      response.status,
      response.text
    );

    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error(
      "[EmailJS] Send failed:",
      error
    );

    return {
      success: false,
      error,
    };
  }
};