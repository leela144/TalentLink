import sendSMS from '../utils/sendSMS.js';

export const sendSupportMessage = async (req, res) => {
    try {
        const { agentNumber, message, senderName } = req.body;

        if (!agentNumber || !message) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Format message
        // Note: Fast2SMS Quick Route ('q') might be strict about templates or length.
        // We will try sending a direct message.
        const smsBody = `From: ${senderName}\nMsg: ${message}`;

        await sendSMS(agentNumber, smsBody);

        return res.status(200).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        console.error("Support Controller Error:", error);
        return res.status(500).json({
            message: error.message || "Failed to send message",
            details: error.response?.data
        });
    }
};
