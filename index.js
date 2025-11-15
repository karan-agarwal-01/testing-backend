const express = require("express");
const fetch = (...args) =>
import("node-fetch").then(({ default: fetch }) => fetch(...args));
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));


// STEP 1: Redirect user to Facebook login
app.get("/auth/facebook", (req, res) => {
  const redirectURL =
    "https://www.facebook.com/v20.0/dialog/oauth?" +
    new URLSearchParams({
      client_id: process.env.FB_APP_ID,
      redirect_uri: process.env.FB_REDIRECT_URL,
      scope: "email,public_profile",
    }).toString();

  res.redirect(redirectURL);
});


// STEP 2: Handle callback
app.get("/auth/facebook/callback", async (req, res) => {
  const code = req.query.code;

  // Exchange Code → Access Token
  const tokenURL =
    "https://graph.facebook.com/v20.0/oauth/access_token?" +
    new URLSearchParams({
      client_id: process.env.FB_APP_ID,
      client_secret: process.env.FB_APP_SECRET,
      redirect_uri: process.env.FB_REDIRECT_URL,
      code,
    }).toString();

  const tokenResponse = await fetch(tokenURL);
  const tokenData = await tokenResponse.json();

  // Fetch Profile Info
  const profileURL =
    "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" +
    tokenData.access_token;

  const profileResponse = await fetch(profileURL);
  const profile = await profileResponse.json();

  // Extract picture URL safely
  const pictureURL = profile?.picture?.data?.url || "";

  // Redirect to frontend with CLEAN query params
  const frontendURL =
    "https://testing-frontend-alpha.vercel.app/facebook-success?" +
    new URLSearchParams({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      picture: pictureURL,
    }).toString();

  res.redirect(frontendURL);
});


app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});


// IMPORTANT: local development ONLY
// On vercel do NOT use app.listen() — remove this for deployment
app.listen(5000, () => console.log("Server running on port 5000"));
