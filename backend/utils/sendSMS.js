import axios from 'axios';

const sendSMS = async (numbers, message) => {
    try {
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                authorization: process.env.FAST2SMS_API_KEY,
                message: message,
                language: 'english',
                route: 'q',
                numbers: numbers,
            }
        });

        console.log(`📩 SMS Sent to ${numbers}:`, response.data);
        return response.data;
    } catch (error) {
        console.error("❌ SMS Error:", error.response ? error.response.data : error.message);
        throw new Error("Failed to send SMS");
    }
};

export default sendSMS;
