const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Books = new Schema ({
        id: String,
        title: String,
        authors: Array,
        publisher: String,
        publishedDate: String,
        description: String,
        industryIdentifiers: [],
        readingModes: {},
        pageCount: Number,
        printedPageCount: Number,
        dimensions: {},
        printType: String,
        categories: [],
        averageRating: Number,
        ratingsCount: Number,
        maturityRating: String,
        allowAnonLogging: Boolean,
        contentVersion: String,
        panelizationSummary: {},
        imageLinks: {},
        language: String,
        previewLink: String,
        infoLink: String,
        canonicalVolumeLink: String
})

const Books = mongoose.model('Books', Books);

module.exports = Books;