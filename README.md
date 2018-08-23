# fragmented_rdf_tree_parser

## what

Simple parsing tool for fragmented rdf tree.
Parses trees saved in different fragments/files in rdf data-format based on the Tree ontology by P.Colpaert found at https://github.com/pietercolpaert/TreeOntology.


## installation
Installation is done through npm:
```
npm install simple_rdf_tree_parser.
```


## usage
``` javascript
let tree_parser = require('simple_rdf_tree_parser')
let parsed_tree = tree_parser.parse_tree(url, options).then((data) => console.log(data))
```

## parameters

 - url: url from where the file needs to be loaded
 - options:
      -> single predicates: The objects of these predicates are stored as a value and not as a list.
      -> aliases: These predicates are changed to the given alias in the returned objects.
      -> removable prefixes: These predicate prefixes are removed for readability and later processing.

``` javascript
var options = {};
options["aliases"] = {};
options["removable_prefixes"] = new Set();
options["single_predicates"] = new Set();

options["aliases"]["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] = "type";
options["removable_prefixes"].add("http://www.w3.org/ns/hydra/core#");
options["single_predicates"].add("http://www.w3.org/ns/hydra/core#value");
options["single_predicates"].add("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
```
The order of execution is:
First the predicate is checked on being a single predicate.
Then the predicate is checked on having an alias.
Lastly the prefixes are removed from the predicates where possible.
