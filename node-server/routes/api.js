var express = require('express');
var router = express.Router();
var fs=require("fs");

/* GET users listing. */
router.get('/', function(req, res, next) {
    fs.readFile('./api/comments.json',"utf-8",function(err,data){
        if(err){
            return console.error(err);
        }
        res.write(data);
        res.end();
    });

});

module.exports = router;
