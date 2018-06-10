// import modules
const fs = require('fs')
const osmosis = require('osmosis')
const csv = require('fast-csv')

// check Data folder exist, if not, create one.
if (!fs.existsSync('data')) fs.mkdirSync('./data')

// scrape, write to csv file, handle error if any.
getData().then(write).catch(handleError)

function getData() {
	return new Promise((resolve, reject) => {
		const content = []
		osmosis
	    .get('http://shirts4mike.com/shirt.php')
	    .find('.products a')
	    .set({'URL': '@href'})
	    .follow('@href')
	    .set({
	    	'Title': '.shirt-details h1',
	    	'Price': '.price',
	    	'ImageURL': '.shirt-picture img@src'
	    })
	    .data(data => content.push(process(data)))
	    .done(() => resolve(content))
	    .error(reject)
	})
}

function write(array) { 
	const t = new Date();
	const fname = `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`;
	csv
		.writeToPath(`./data/${fname}.csv`, array, {headers: true})
		.on("finish", () => console.log("Done Scraping!"))
}

function handleError(e) {
	if (e.toString().includes('NOTFOUND')) console.log('Cannot connect to http://shirts4mike.com.')
	else console.log('Having problem retrieving the content.')
	// log error to log file
	fs.appendFile('scraper-error.log', `[${Date()}] <${e}> \n`, () => {
		console.log('Error logged.')
	})
}

function process(data) {
	const obj = {};
	// re-arrange props order in data object 
	obj['Title'] = data['Title']
	obj['Price'] = data['Price']
	obj['ImageURL'] = data['ImageURL']
	obj['URL'] = data['URL']
	obj['Time'] = Date()
	for (let prop in obj) {
		// convert URI to URL (Osmosis only retrieve URI)
		if (prop.includes('URL')) obj[prop] = 'http://shirts4mike.com/' + obj[prop]
		if (prop === 'Title') obj[prop] = obj[prop].slice(4)
	}
	return obj;
}