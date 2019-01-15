var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = process.env.PORT || 8080;
var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScraper";
mongoose.connect(MONGODB_URI);

// Routes

app.get("/scrape", function(req, res) {

  axios.get("https://old.reddit.com/r/phillies/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("p.title").each(function(i, element) {
      var headline = $(element).text();
      var url = $(element).children().attr("href");
      var result = {
        headline: headline,
        url: url
      }

      db.Article.create(result)
      .then(function(dbArticle) {
        console.log(dbArticle);
      })
      .catch(function(err) {
        return res.json(err);
      });

    });
    res.send("scrape complete");

  });
});

app.get("/", function(req, res) {
  console.log("route hit");
  db.Article.find({})
    .then(function(dbArticle) {
      hbsObject = {
        articles: dbArticle
      }
      // res.json(dbArticle);
      console.log(hbsObject);
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Listen on the port
app.listen(PORT, function() {
  console.log("Listening on port: " + PORT);
});