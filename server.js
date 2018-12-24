var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");

var PORT = process.env.PORT || 8080;

var app = express();
// Make public a static folder
app.use(express.static("public"));


// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.realmadrid.com/en/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        // Now, we grab every h2 within an article tag, and do the following:
        $("article.m_highlight").each(function (i, element) {

            var title = $(element).find("h2").text().trim();
            var summary = $(element).find("p").text().trim();
            var link = "https://www.realmadrid.com" + $(element).find("a").attr("href");
            var imgArray = []
            imgArray.push($(element).find("img").attr("data-srcset"))
            var imgArraySplit = imgArray[0].split(" ");
            var img = "https://www.realmadrid.com" + imgArraySplit[2];

            // Create a new Article using the `result` object built from scraping
            db.ArticleScraper.create({
                "title": title,
                "summary": summary,
                "link": link,
                "image": img
            })
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    // console.log(err);
                    return res.json(err);
                });
        });
        // res.json(results)
        // console.log(results)
    })

    res.send("Scrape Complete");
})

app.get("/", function (req, res) {
    db.ArticleScraper.find({})
        .then(function (dbarticlesScraper) {
            // res.json(dbarticlesScraper);
            // console.log(dbarticlesScraper)
            // res.render("test");

            var articleObject = {
                articleView: dbarticlesScraper
            }
            res.render("index", articleObject)
        })
        .catch(function (err) {
            res.json(err);
        });

});
app.get("/saved", function (req, res) {
    db.ArticleScraper.find({})
        .then(function (dbarticlesScraper) {
            // res.json(dbarticlesScraper);
            // console.log(dbarticlesScraper)
            // res.render("test");

            var articleObject = {
                articleView: dbarticlesScraper
            }
            res.render("saved", articleObject)
        })
        .catch(function (err) {
            res.json(err);
        });
});


app.put("/saved/:id", function (req, res) {

    savedId = req.params.id

    db.ArticleScraper.findByIdAndUpdate(req.params.id, { saved: req.body.saved }, { new: true })
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });

});

app.put("/savednot/:id", function (req, res) {

    savedId = req.params.id

    db.ArticleScraper.findByIdAndUpdate(req.params.id, { saved: req.body.saved }, { new: true })
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });

});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {

    // save the new note that gets posted to the Notes collection
    db.NoteScraper.create(req.body)
        .then(function (dbNoteScraper) {
            return db.ArticleScraper.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNoteScraper._id } }, { new: true })
        })
        .then(function (dbArticleScraper) {
            res.json(dbArticleScraper);
            console.log(dbArticleScraper)
        })
        .catch(function (err) {
            res.json(err);
        });

});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {

    db.ArticleScraper.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticleScraper) {
            res.json(dbArticleScraper);
        })
        .catch(function (err) {
            res.json(err);
        });

});

app.put("/notes/:id", function (req, res) {

    noteId = req.params.id

    db.NoteScraper.findByIdAndUpdate(req.params.id, { body: req.body.body }, { new: true })
        .then(function (dbNote) {
            res.json(dbNote)
        })
        .catch(function (err) {
            res.json(err);
        });

});

app.delete("/notes/:id", function (req, res) {
    db.NoteScraper.deleteOne({ _id: req.params.id })
        .then(function (dbNote) {
            res.json(dbNote);
        })
        .catch(function (err) {
            res.json(err);
        });

});








// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
