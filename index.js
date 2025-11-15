const express = require("express");
const fetch =  require("node-fetch");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));

app.get("/auth/facebook", (req, res) => {
  const redirectURL =
    "https://www.facebook.com/v20.0/dialog/oauth?" +
    new URLSearchParams({
      client_id: process.env.FB_APP_ID,
      redirect_uri: process.env.FB_REDIRECT_URL,
      scope: "email,public_profile"
    }).toString();

  res.redirect(redirectURL);
});

app.get("/auth/facebook/callback", async (req, res) => {
  const code = req.query.code;

  // 1. Exchange Code → Access Token
  const tokenURL =
    "https://graph.facebook.com/v20.0/oauth/access_token?" +
    new URLSearchParams({
      client_id: process.env.FB_APP_ID,
      client_secret: process.env.FB_APP_SECRET,
      redirect_uri: process.env.FB_REDIRECT_URL,
      code
    }).toString();

  const tokenResponse = await fetch(tokenURL);
  const tokenData = await tokenResponse.json();

  // 2. Fetch Facebook Profile
  const profileURL =
    "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" +
    tokenData.access_token;

  const profileResponse = await fetch(profileURL);
  const profile = await profileResponse.json();

  // 3. Redirect back to frontend with user data
  const frontendURL =
    "https://testing-frontend-alpha.vercel.app/facebook-success?" +
    new URLSearchParams(profile).toString();

  res.redirect(frontendURL);
});

app.get('/', (req, res) => {
  res.status(200).send('Server is running')
})

app.listen("https://testing-backend-xi.vercel.app", () => console.log("Server running on port 5000"));