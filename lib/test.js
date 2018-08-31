let treeParser = require('../index.js');

main();
async function main() {
    let url = 'https://amoryhoste.com/bikes/tree/t0.jsonld#3697';

    let singles = new Set([
        "https://w3id.org/tree#value",
        "http://www.w3.org/ns/hydra/core#totalItems",
    ]);

    let dat = await treeParser.parseTree(url, singles);
    console.log(JSON.stringify(dat, null, 2));
}
