const mongoose = require('mongoose')

const Filme = mongoose.model('Filme', { 
    Title: String,
    description: String,
    lancamento: String,
    trailerUrl: String 
});

module.exports = Filme