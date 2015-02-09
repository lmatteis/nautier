var dereference = function(uri, cb) {
    $.ajax({
        url: uri,
        headers: { 'Accept': 'text/turtle' }
    }).done(function(data) {
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
var predicateResolution = function(triples, cb) {
    var predicates = {};
    for(var i=0; i<triples.length; i++) {
        var triple = triples[i];
        var predicate = triple.predicate;
        if(predicates[predicate]) continue;
        predicates[predicate] = true;
        dereference(predicate, function(triples) {
            for(var i in triples)
                cb(triples[i])
        });
    }
}
var edgeResolution = function(uri, triples, cb) {
    for(var i=0; i<triples.length; i++) {
        var triple = triples[i];
        var edge = triple.subject; 
        if(edge == uri)
            edge = triple.object;

        dereference(edge, function(triples) {
            for(var i in triples)
                cb(triples[i])
        });
    }
}
var contains = function(triple, keyword) {
    var str = triple.subject + triple.predicate + triple.object;
    return str.match(new RegExp(keyword, 'i'));
}

var getSubjectObjectUris = function(triple) {
    return [triple.subject, triple.object];
    var edge = triple.subject; 
    if(edge == uri)
        edge = triple.object;
    return edge;
}
