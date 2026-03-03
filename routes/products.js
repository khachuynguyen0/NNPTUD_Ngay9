var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let result = await productModel.find({}) 
  res.send(result);
});
router.get('/id', function(req, res, next) {
  res.send('hahah');
});

module.exports = router;
