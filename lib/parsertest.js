
const tree_parser = require('../../tree_parser/lib/ldtree-parser')





var options = {};
options["aliases"] = {};
options["removable_prefixes"] = new Set();
options["single_predicates"] = new Set();

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


tree_parser.parse_tree("https://datapiloten.be/patriciastreets/fragment1.jsonld").then((data) => {
//    Object.keys(data).forEach(key => {
//        try{
//            let relations = data[key]["https://w3id.org/tree#hasChildRelation"];
//            relations.forEach(element => {
//                console.log(element)
//            });
//        } catch {
//
//        }
//    }
    console.log(data)
    //)
})
