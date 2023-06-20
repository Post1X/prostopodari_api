var express = require('express');
var app   = express();
var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var data = '';

// Create a readable stream
var readerStream = fs.createReadStream('./countries.json');

// Set the encoding to be utf8.
readerStream.setEncoding('UTF8');

var outstream = new stream();
var r1 = readline.createInterface(readerStream, outstream);
var lineCount = 0;

r1.on('line', function (line) {
    // increment line count
    lineCount++;
    data = JSON.parse(line);

    saveRecord(data);
})

const res = [];
let id = 1;

function saveRecord(data) {
    data.forEach(({CityName, CitySize, FullName}) => {
        res.push({
            id,
            city_name: CityName,
            is_active: false,
            city_size: CitySize,
            full_name: FullName
        })
        id++
    })
    fs.writeFile(__dirname + '/result.json', JSON.stringify(res, null, 4), {encoding: 'utf8'}, () => {
        console.log('done')
    })
}


console.log("Program Ended");
