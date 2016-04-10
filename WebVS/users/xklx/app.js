var express = require('express');
var app = express();

app.set('port', process.env.PORT || 3000);

app.get('/', function (req, res) {
console.log('asdasdasda')
  res.send('Hello World!');
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});