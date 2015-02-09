KeywordNavigation(
    ['http://dbpedia.org/resource/Keanu_Reeves'],
    ['the matrix'],
    0,
    []
);
function KeywordNavigation(inputURIs, keywords,
                           currKeywordIdx, MT) {
    var T = [],
        P = [],
        MP = [],
        currKeyword = keywords[currKeywordIdx];
    if(!currKeyword) {
        console.log(MT)
        return MT;
    }

    MT = [];
    for(var i=0; i<inputURIs.length; i++) {
        var uri = inputURIs[i];
        dereference(uri, function(triples) {
            for(var i=0; i<triples.length; i++) {
                var triple = triples[i];
                T.push(triple);
                T_push(triple);
            }
            predicateResolution(triples, function(t) {
                P.push(t);
                P_push(t);
            });
            edgeResolution(uri, triples, function(t) {
                T.push(t);
                T_push(t);
            });
        });
    }
    function T_push(triple) {
        if(contains(triple, currKeyword)) {
            MT.push(triple);
            MT_push(triple);
        }
    }
    function P_push(triple) {
        if(contains(triple, currKeyword)) {
            MP.push(triple);
            MP_push(triple);
        }
    }
    function MP_push(M_triple) {
        for(var i=0; i<T.length; i++) {
            var T_triple = T[i];
            if(T_triple.predicate == M_triple.subject) {
                MT.push(T_triple);
                MT_push(T_triple);
            }
        }
    };
    MT_unique = {}
    function MT_push(triple) {
        if(MT_unique[triple.subject + triple.predicate + triple.object])
            return;
        MT_unique[triple.subject + triple.predicate + triple.object] = true;
        var uris = getSubjectObjectUris(triple);
        for(var i in uris) {
            var uri = uris[i]
            if(!(inputURIs.indexOf(uri) > -1)) {
                if(uri.indexOf('http') == 0) {
                    KeywordNavigation([uri], keywords,
                                      currKeywordIdx + 1, MT);
                }
            }
        }
        
    }
}
