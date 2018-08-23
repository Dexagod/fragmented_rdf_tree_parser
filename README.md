# fragmented_rdf_tree_parser
Simple parsing for fragmented rdf tree given uri.

exports parse_tree(uri, options);

options parameter has three collections:
- aliases (dictionary)
- removable_prefixes (set of uri's)
- single_predicates (set of uri's)

First single_predicates that match an rdf-predicate will save their argument as a value instead of a list.

Afterwards aliases will rename aall given dictionary keys for their respective values.

Lastly the removeable prefixes will be stripped from the received predicates. (not from the identifyers as that could complicate things after parsing.
