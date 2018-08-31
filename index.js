const ldfetch = require('ldfetch');
const LRU = require("lru-cache");

// TODO: childrelations can be on another webpage

class TreeParser {

    constructor(fetch) {
        if (fetch === undefined) {
            this.fetch = new ldfetch({});
        } else {
            this.fetch = fetch;
        }
    }

    parseTree(url, singles = new Set()) {
        return this.fetch.get(url).then((result) => {
            return this._parse(result.triples, singles);
        });
    }

    async _parse(triples, singles) {
        let nodes = {};
        let collections = {};
        let members = {};
        let childrelations = {};

        let unidentified = {};
        let listItems = {};

        for (let i = 0; i < triples.length; i++) {
            let triple = triples[i];
            let subject = triple.subject.value;
            let predicate = triple.predicate.value;
            let object = triple.object.value;

            // Fix list items
            if (object.slice(0, 2) === "_:") {
                let objectCopy = object;
                if (listItems.hasOwnProperty(objectCopy)) {
                    object = listItems[objectCopy];
                } else {
                    object = {};
                    listItems[objectCopy] = object;
                }
            }

            if (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && object === "https://w3id.org/tree#Node") {
                this._addTriple(nodes, subject, predicate, object, singles.has(predicate));
                copyOver(unidentified, nodes, subject);
            } else if (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && object === "http://www.w3.org/ns/hydra/core#Collection") {
                this._addTriple(collections, subject, predicate, object, singles.has(predicate));
                copyOver(unidentified, nodes, subject);
            } else if (subject.slice(0, 2) === "_:") {
                this._addTriple(listItems, subject, predicate, object, singles.has(predicate));
            } else {
                if (nodes.hasOwnProperty(subject)) {
                    this._addTriple(nodes, subject, predicate, object, singles.has(predicate));
                } else if (collections.hasOwnProperty(subject)) {
                    this._addTriple(collections, subject, predicate, object, singles.has(predicate));
                } else {
                    this._addTriple(unidentified, subject, predicate, object, singles.has(predicate));
                }
            }
        }

        removeEmptyNodes(nodes);
        return {
            nodes: nodes,
            collections: collections
        };
    }

    _addTriple(obj, subject, predicate, object, single) {
        if (!obj.hasOwnProperty(subject)) {
            obj[subject] = {};
        }

        let sub = obj[subject];
        if (single) {
            sub[predicate] = object;
        } else {
            if (! sub.hasOwnProperty(predicate)) {
                sub[predicate] = []
            }
            sub[predicate].push(object);
        }
    }

}

function removeEmptyNodes(nodes) {
    let keys = Object.keys(nodes);
    for (let i = 0; i < keys.length; i++) {
        let obj = nodes[keys[i]];
        if (!obj.hasOwnProperty("https://w3id.org/tree#value")) {
            delete nodes[keys[i]];
        }
    }
}

function copyOver(from, to, subject) {
    // Copy unidentified data
    let toAdd = from[subject];
    if (toAdd !== undefined) {
        to[subject] = Object.assign(to[subject], toAdd);
        delete from[subject];
    }
}

module.exports = TreeParser;