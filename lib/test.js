let TreeParser = require('../index.js');

main();
async function main() {
    let parser = new TreeParser();

    let url = 'https://amoryhoste.com/bikes/tree/t0.jsonld';

    let singles = new Set([
        "https://w3id.org/tree#value",
        "http://www.w3.org/ns/hydra/core#totalItems",
    ]);

    let dat = await parser.parseTree(url, singles);
    console.log(JSON.stringify(dat, null, 2));
}
