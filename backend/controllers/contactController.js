import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // MUST be false for Gmail
      auth: {
        user: process.env.EMAIL_USER, // talentlink58@gmail.com
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // Verify SMTP connection
    await transporter.verify();

    // Send email
    await transporter.sendMail({
      from: `"TalentLink Support" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,   // TalentLink Gmail
      replyTo: email,               // reply goes to user
      subject: "📩 New Contact Message - TalentLink",
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
        <hr/>
        <small>TalentLink Contact Page</small>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "Message sent successfully. TalentLink team will contact you soon.",
    });
  } catch (error) {
    console.error("Contact Email Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send message. Please try again later.",
    });
  }
};
