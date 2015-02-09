var fs = require('fs')
var util = require('./util');

KeywordNavigation(
    ['http://dbpedia.org/resource/Keanu_Reeves'],
    ['starring'],
    0,
    []
);
fs.writeFile('out.json', '')
function KeywordNavigation(inputURIs, keywords,
                           currKeywordIdx, MT) {
    var T = [],
        P = [],
        MP = [],
        currKeyword = keywords[currKeywordIdx];
    if(!currKeyword) {
        return MT;
    }

    MT = [];

    MT_unique = {}
    T_unique = {}
    P_unique = {}
    MP_unique = {}
    for(var i=0; i<inputURIs.length; i++) {
        var uri = inputURIs[i];
        util.dereference(uri, function(triples) {
            for(var i=0; i<triples.length; i++) {
                var triple = triples[i];
                T_push(triple);
            }
            util.predicateResolution(triples, function(t) {
                P_push(t);
            });
            util.edgeResolution(uri, triples, function(t) {
                T_push(t);
            });
        });
    }
    function T_push(triple) {
        if(T_unique[triple.subject + triple.predicate + triple.object])
            return;
        T.push(triple);
        T_unique[triple.subject + triple.predicate + triple.object] = true;
        if(util.contains(triple, currKeyword)) {
            MT_push(triple);
        }
    }
    function P_push(triple) {
        if(P_unique[triple.subject + triple.predicate + triple.object])
            return;
        P.push(triple);
        P_unique[triple.subject + triple.predicate + triple.object] = true;
        if(util.contains(triple, currKeyword)) {
            MP_push(triple);
        }
    }
    function MP_push(triple) {
        if(MP_unique[triple.subject + triple.predicate + triple.object])
            return;
        MP.push(triple);
        MP_unique[triple.subject + triple.predicate + triple.object] = true;
        for(var i=0; i<T.length; i++) {
            var T_triple = T[i];
            if(T_triple.predicate == triple.subject) {
                MT_push(T_triple);
            }
        }
    };
    var URIs = {}
    function MT_push(triple) {
        if(MT_unique[triple.subject + triple.predicate + triple.object])
            return;
        MT.push(triple);
        MT_unique[triple.subject + triple.predicate + triple.object] = true;
        var uris = util.getSubjectObjectUris(triple);

        for(var i in uris) {
            var uri = uris[i]
            if(URIs[uri])
                continue;
            if(!(inputURIs.indexOf(uri) > -1)) {
                if(uri.indexOf('http') == 0) {
                    /*
                    KeywordNavigation([uri], keywords,
                                      currKeywordIdx + 1, MT);
                    */

                    fs.appendFile('out.json', uri + '\n')
                    URIs[uri] = true;
                }
            }
        }
        
    }
}
