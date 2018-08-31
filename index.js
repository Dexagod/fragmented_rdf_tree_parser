let ldfetch = require('ldfetch');

const fetch = new ldfetch({});

module.exports.parseTree = function(url, singles = new Set()) {

    return fetch.get(url).then((result) => {
        return parse(result.triples, singles);
    });
};


function parse(triples, singles) {
    let nodes = {};
    let unidentified = {};
    let listItems = {};

    triples.forEach((triple) => {
        let subject = triple.subject.value;
        let predicate = triple.predicate.value;
        let object = triple.object.value;

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
            addTriple(nodes, subject, predicate, object, singles.has(predicate));

            // Copy unidentified data to node
            let toAdd = unidentified[subject];
            if (toAdd !== undefined) {
                nodes[subject] = Object.assign(nodes[subject], toAdd);
                delete unidentified[subject];
            }
        } else if (subject.slice(0, 2) === "_:") {
            addTriple(listItems, subject, predicate, object, singles.has(predicate));
        } else {
            if (nodes.hasOwnProperty(subject)) {
                addTriple(nodes, subject, predicate, object, singles.has(predicate));
            } else {
                addTriple(unidentified, subject, predicate, object, singles.has(predicate));
            }
        }
    });

    removeEmptyNodes(nodes);

    return nodes;
}

function addTriple(obj, subject, predicate, object, single) {
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

function removeEmptyNodes(nodes) {
    let keys = Object.keys(nodes);
    for (let i = 0; i < keys.length; i++) {
        let obj = nodes[keys[i]];
        if (!obj.hasOwnProperty("https://w3id.org/tree#value")) {
            delete nodes[keys[i]];
        }
    }
}