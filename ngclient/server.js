const express = require('express');
const app = express();

app.use(express.static(__dirname + '/dist/oshop'));

//

app.get('/*', (req,res) => {
    res.sendFile(__dirname + '/dist/oshop/index.html');
});

app.listen(process.env.PORT || 8080);