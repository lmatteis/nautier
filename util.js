var request = require('request');
var N3 = require('n3');

var exports = module.exports = {};
exports.dereference = function(uri, cb) {
    request({
        url: uri,
        headers: { 'Accept': 'text/turtle' }
    },function(err, response, data) {
        var parser = N3.Parser();
        var triples = [];
        parser.parse(data, function(err, triple, prefixes) {
            if (triple) {
                if(triple.subject == uri || triple.object == uri)
                    triples.push(triple);
            } else {
                cb(triples);
            }
        })
    });
}
exports.predicateResolution = function(triples, cb) {
    var predicates = {};
    for(var i=0; i<triples.length; i++) {
        var triple = triples[i];
        var predicate = triple.predicate;
        if(predicates[predicate]) continue;
        predicates[predicate] = true;
        exports.dereference(predicate, function(triples) {
            for(var i in triples)
                cb(triples[i])
        });
    }
}
exports.edgeResolution = function(uri, triples, cb) {
    var edges = {};
    for(var i=0; i<triples.length; i++) {
        var triple = triples[i];
        var edge = triple.subject; 
        if(edge == uri)
            edge = triple.object;
        if(edges[edge]) continue;
        edges[edge] = true;

        exports.dereference(edge, function(triples) {
            for(var i in triples)
                cb(triples[i])
        });
    }
}
exports.contains = function(triple, keyword) {
    var str = triple.subject + triple.predicate + triple.object;
    return str.match(new RegExp(keyword, 'i'));
}

exports.getSubjectObjectUris = function(triple) {
    return [triple.subject, triple.object];
    var edge = triple.subject; 
    if(edge == uri)
        edge = triple.object;
    return edge;
}
