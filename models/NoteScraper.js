var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteScraperSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'ArticleScraper' },
  body: String
});

var NoteScraper = mongoose.model("NoteScraper", NoteScraperSchema);

module.exports = NoteScraper;
