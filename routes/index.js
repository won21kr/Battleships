var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {title: 'Battleships - online game'});
});

router.post('/', function(req, res) {
  res.render('index', {title: 'Battleships - online game'});
});

module.exports = router;
