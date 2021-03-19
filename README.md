todo:
- create mapping when creating the index.


- create timestamp for all docs in the index
https://stackoverflow.com/questions/17136138/how-to-make-elasticsearch-add-the-timestamp-field-to-every-document-in-all-indic

$curl -XPOST localhost:9200/test -d '{
"settings" : {
    "number_of_shards" : 1
},
"mappings" : {
    "_default_":{
        "_timestamp" : {
            "enabled" : true,
            "store" : true
        }
    }
  }
}'
// That will then automatically create a _timestamp for all stuff that you put in the index. Then after indexing something when requesting the _timestamp field it will be returned.


- move api to built on swagger file