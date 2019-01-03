var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleScraperSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  summary: {
    type: String

  },
  link: {
    type: String
  },
  image: {
    type: String
  },
  saved: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: [{
    type: Schema.Types.ObjectId,
    ref: "NoteScraper"
  }]
});

var ArticleScraper = mongoose.model("ArticleScraper", ArticleScraperSchema);

module.exports = ArticleScraper;
