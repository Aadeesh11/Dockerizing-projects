const express = require('express');

exports = module.exports = function(app) {

    app.get('/hello', (req, res) => res.send('Hello World!'))
}
  