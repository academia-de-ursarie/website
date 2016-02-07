var fs = require('fs'),
    request = require('sync-request'),
    cheerio = require('cheerio');

var fileContent = fs.readFileSync('../Version-1/academia-de-ursarie-version-1.txt', 'UTF-8'),
    allLines = fileContent.split('\n'),
    urlRegexp = /(http|https):\/\/(.+)/;

var allObjectInfo = [];

function makeTheRequest(url) {
  try {
    var req = request('GET', url);
    if(req.statusCode != 200) {
      return;
    }
    
    if(req.headers['content-type'].substring(0, 'text/html'.length) != 0) {
      var body = req.getBody();
      var doc = cheerio.load(body);

      allObjectInfo.push({
        url: url,
        title: doc('title').text().trim(),
        desc: doc('meta[name="description"]').attr('content') === undefined ? '': doc('meta[name="description"]').attr('content').trim()
      })
    } else {
      allObjectInfo.push({
        url: url,
        title: '',
        desc: ''
      })
    }
  } catch (e) {
    console.log(`Eroare: ${e}`)
  }
}

allLines.map(line => {
  var urlFromLine = urlRegexp.exec(line);
  if(urlFromLine !== null) {
    console.log(`Make request: ${urlFromLine[0]}`);
    makeTheRequest(urlFromLine[0]);
  }
});


fs.writeFile("../links.json", JSON.stringify(allObjectInfo), 'UTF-8');
console.log(`Rezultat: ${JSON.stringify(allObjectInfo)}`);
