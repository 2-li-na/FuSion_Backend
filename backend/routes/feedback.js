const express = require('express');
const mailjet = require('node-mailjet').apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

const router = express.Router();

// The feedback sending logic
router.post('/send-feedback', async (req, res) => {
  const { rating, problem, additionalFeedback, username } = req.body;

  const request = mailjet.post("send", { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: "tulina.maharjan@informatik.hs-fulda.de",
          Name: "FuSion",
        },
        To: [
          {
            Email: "fusion2024hsp@gmail.com",
            Name: "Feedback von FuSion",
          },
        ],
        Subject: "FuSion App Feedback",
        TextPart: `User: ${username}\nRating: ${rating}\nProblem: ${problem}\nAdditional Feedback: ${additionalFeedback}`,
      },
    ],
  });

  try {
    const result = await request;
    res.status(200).send('Feedback sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send feedback');
  }
});

module.exports = router;