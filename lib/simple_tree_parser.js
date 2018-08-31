let ldfetch = require('ldfetch');

let fetch = new ldfetch({});

// PARSING LIBRARY FOR RDF TREE-STRUCTURED DATA TRIPLES
function parseldfdata(data, options) {
    let parsed_data = {};
    let parsed_data_missing_object = [];
    let parsed_metadata = {};
    data = data.triples;

    for (let i = 0; i < data.length; i++) {
        let quad = data[i];

        if (quad.subject.value.startsWith("_")) {
            check_and_add_quad_to_data(parsed_metadata, quad, options);
        } else if (quad.object.value.startsWith("_")) {
            parsed_data_missing_object.push(check_and_add_quad_to_data(parsed_data, quad, options));
        } else {
            check_and_add_quad_to_data(parsed_data, quad, options);
        }
    }

    for (let i = 0; i < parsed_data_missing_object.length; i++) {
        let to_fix = parsed_data_missing_object[i];
        let fix_index = to_fix[0][to_fix[1]].indexOf(to_fix[2]);
        to_fix[0][to_fix[1]][fix_index] = parsed_metadata[to_fix[2]];
    }

    return parsed_data;
}

function check_and_add_quad_to_data(parsed_data, quad, options) {
    let subject = {};
    if (parsed_data.hasOwnProperty(quad.subject.value)) {
        subject = parsed_data[quad.subject.value];
    } else {
        parsed_data[quad.subject.value] = subject;
    }
    return check_property_and_add(
        subject,
        quad.predicate.value,
        quad.object.value,
        options
    );
}

function check_property_and_add(subject, predicate, object, options) {
    let single_predicate = false;
    if (options.single_predicates.has(predicate)) {
        single_predicate = true;
    }
    if (options.aliases.hasOwnProperty(predicate)) {
        predicate = options.aliases[predicate];
    } else {
        options.removable_prefixes.forEach(function(value) {
            if (predicate.startsWith(value)) {
                predicate = predicate.substr(value.length, predicate.length);
            }
        });
    }
    if (subject.hasOwnProperty(predicate)) {
        if (single_predicate) {
            throw "Predicate already exists for this subject, and is a single predicate!\
                Use single_predicate = false to add objects as an array to subject!";
        } else {
            subject[predicate].push(object);
        }
    } else {
        if (single_predicate) {
            subject[predicate] = object;
        } else {
            subject[predicate] = [object];
        }
    }
    return [subject, predicate, object];
}

module.exports.parse_tree = function(uri, options = { aliases: {}, removable_prefixes: new Set(), single_predicates: new Set() }) {
    let fetcher = options.hasOwnProperty(ldfetch) ? options[ldfetch] : fetch;

    return fetcher.get(uri).then((data) => {
        return parseldfdata(data, options)
    }).catch((err) => {
        throw err;
    });
};