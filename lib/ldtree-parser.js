module.exports.parse_tree = function(uri) {
  return fetch_node(uri);
}

let ldftch = require('ldfetch')
let ldfetch = new ldftch({})

async function fetch_node(uri, options = {aliases:{}, removable_prefixes:new Set(), single_predicates: new Set()}) {

  options["single_predicates"].add("http://www.w3.org/ns/hydra/core#value");
  options["single_predicates"].add(
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  );
  options["single_predicates"].add(
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  );
  options["single_predicates"].add(
    "https://w3id.org/tree#child"
  );


  let ldfget = ldfetch.get(uri);
  return ldfget.then((data) => parseldfdata(data, options)).catch((err) => {throw "Something went wrong"});
}

// PARSING LIBRARY FOR RDF TREE-STRUCTURED DATA TRIPLES
function parseldfdata(data, options) {
  let parsed_data = {};
  let parsed_data_missing_object = [];
  let parsed_metadata = {};
  data = data.triples;
  for (var i = 0; i < data.length; i++) {
    let quad = data[i];
    if (quad.subject.value.startsWith("_")) {
      check_and_add_quad_to_data(parsed_metadata, quad, options);
    } else if (quad.object.value.startsWith("_")) {
      parsed_data_missing_object.push(
        check_and_add_quad_to_data(parsed_data, quad, options)
      );
    } else {
      check_and_add_quad_to_data(parsed_data, quad, options);
    }
  }
  for (var i = 0; i < parsed_data_missing_object.length; i++) {
    let to_fix = parsed_data_missing_object[i];
    let fix_index = to_fix[0][to_fix[1]].indexOf(to_fix[2]);
    to_fix[0][to_fix[1]][fix_index] = parsed_metadata[to_fix[2]];
  }

  let children_relation = 'https://w3id.org/tree#hasChildRelation';
  // // if (options.aliases[children_relation] != undefined){
  // //   children_relation = options.aliases[children_relation]
  // // } else{
  // //   options.removable_prefixes.forEach(function(value) {
  // //     if (children_relation.startsWith(value)) {
  // //       children_relation = children_relation.substr(value.length, children_relation.length);
  // //     }
  // //   })
  // // }
  
  Object.keys(data).forEach(key => {
    if (data[key].hasOwnProperty("https://w3id.org/tree#hasChildRelation")){
        let relations = data[key]["https://w3id.org/tree#hasChildRelation"];
        relations.forEach(element => {
            element["value"] = parsed_data[element['https://w3id.org/tree#child']].value;
        }); 
    }
  });
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
  var single_predicate = false;
  if (options.single_predicates.has(predicate)) {
    var single_predicate = true;
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

