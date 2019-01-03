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

    function one() {
        return new Promise(resolve => {
            axios.get("https://www.realmadrid.com/en/").then(function (response) {

                var $ = cheerio.load(response.data);

                $("article.m_highlight").each(function (i, element) {

                    var title = $(element).find("h2").text().trim();
                    var summary = $(element).find("p").text().trim();

                    if (summary === "See video") {
                        var link = "https://www.realmadrid.com" + $(element).find("a:nth-child(2)").attr("href");
                    } else {
                        var link = "https://www.realmadrid.com" + $(element).find("a").attr("href");

                    }
                    var imgArray = []
                    imgArray.push($(element).find("img").attr("data-srcset"))
                    var imgArraySplit = imgArray[0].split(" ");
                    var img = "https://www.realmadrid.com" + imgArraySplit[2];

                    db.ArticleScraper.create({
                        "title": title,
                        "summary": summary,
                        "link": link,
                        "image": img
                    })
                        .then(function (dbArticle) {
                            // console.log(dbArticle);
                            console.log("first");
                        })
                    // .catch(function (err) {
                    //     return res.json(err);
                    //     // console.log(err)
                    // });
                })

            })
            resolve()
        })
    }


    function two() {
        return new Promise(resolve => {
            setTimeout(() => {
                db.ArticleScraper.find().sort({ date: -1 })
                    .then(function (dbarticlesScraper2) {

                        var articleObject2 = {
                            articleView2: dbarticlesScraper2
                        }
                        res.render("scrape", articleObject2)
                        // res.json(dbarticlesScraper)
                    })
                // .catch(function (err) {
                //     res.json(err);
                // });
                resolve();
            }, 1000);
        })
    }

    one().then(two);
})

app.get("/", function (req, res) {
    db.ArticleScraper.find().sort({ date: -1 })
        .then(function (dbarticlesScraper) {

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
