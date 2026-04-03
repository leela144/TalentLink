import axios from "axios";

// Allowed TalentLink-related keywords
const allowedKeywords = [
  "talentlink", "hire", "freelancer", "client", "project",
  "support", "help", "issue", "problem", "complaint", "contact",
  "service", "account", "notification", "portfolio",
  "jobs", "job", "workspace", "contract", "proposal",
  "password", "reset", "login", "signin", "sign in", "sign up"
];

// Function to check if the message contains allowed keywords
function isAllowed(message) {
  return allowedKeywords.some(k =>
    message.toLowerCase().includes(k)
  );
}

// Context prompt including FAQ-style questions
const context_prompt = `
You are the TalentLink Help Centre AI Support Bot.
Respond only to questions related to TalentLink features, hiring, freelancers, client work, projects, accounts, passwords, and payments.

Below are examples of frequently asked questions and their style of answers:

Q: hi?
A: Hello! How can I assist you with TalentLink today?

Q: I need support / I need help immediately.
A: Please describe your difficulty. You can also visit the Contact Us page to get assistance from our support team.

Q: Can someone call me about my issue?
A: Sure. Please explain your difficulty and fill out the form on the Contact Us page. A support representative will connect with you shortly.

Q: Where can I submit a complaint?
A: You can submit complaints through the Contact Us page. Please explain your difficulty there and our team will address it quickly.

Q: I have an issue that is not listed here. What should I do?
A: Please type your difficulty and also reach out through the Contact Us page so our customer support personnel can help you directly.

Q: I can't solve my issue even after trying the steps.
A: No problem. Please describe your difficulty and visit the Contact Us page so our support team can assist you personally.

Q: How do I talk to customer service?
A: Simply share your difficulty in short, and our customer support personnel will assist you through the Contact Us page.

Q: Can I get personalised support?
A: Yes. Please share your difficulty and submit your details in the Contact Us page. Our team will respond as soon as possible.

Always give short, step-by-step and helpful answers.
If a question is not related to TalentLink, reply: "Sorry, I can only answer TalentLink-related questions."
`;

export const chatController = async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "Please enter a valid message." });
  }

  // Handle simple greetings locally
  if (/^(hi|hello|hey)$/i.test(message.trim())) {
    return res.json({
      reply: "Hello 👋 Welcome to TalentLink Support. How can I help you today?"
    });
  }

  // Restrict messages to TalentLink domain
  if (!isAllowed(message)) {
    return res.json({
      reply:
        "I can help with TalentLink-related questions such as login issues, jobs, projects, proposals, payments, or account support."
    });
  }

  try {
    // Call Gemini API with context prompt + user question
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `
${context_prompt}

User question:
${message}
                `.trim()
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300
        }
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    res.json({ reply });

  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    res.status(500).json({
      reply: "Support service is temporarily unavailable. Please try again later."
    });
  }
};
