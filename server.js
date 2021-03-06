const express = require("express");
const environment = require("dotenv").config();
const axios = require('axios');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views"));
app.set("view engine", "ejs");
const port = 4004;
const threshold = 0.5;

app.get("/", (req, res) => {
  res.render("main", { API_KEY: process.env.CLIENT_API_KEY });
});

app.post("/verify", (req, res) => {

  const serverKey = process.env.SERVER_API_KEY;
  const reponse = req.body["g-recaptcha-response"];
  const url = "https://www.google.com/recaptcha/api/siteverify"

  axios({
    method: 'post',
    url: `${url}?secret=${serverKey}&response=${reponse}`
  })
    .then((result) => {

      const templateVars = { botResult: JSON.stringify(result.data) };

      if (result.data.score < threshold) {
        templateVars["isBot"] = true;
        res.render("results", templateVars);
      }

      if (result.data.score >= threshold) {
        templateVars["isBot"] = false;
        res.render("results", templateVars);
      }

      if (result.data.success === false) {
        res.send(`Authentication unsuccessful: ${JSON.stringify(result.data)}`)
      }

    })
    .catch((e) => {
      res.send(`An error has occurred ${e}`);
      console.log(e);
    })
});

app.listen(process.env.PORT || port, () => {
  console.log(`I'll see if you're a bot! ${port}`);
});