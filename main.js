var predicates = {}
var resolvedPredicates = {}

var triples = []

function resolveURI(URI) {
    // sometimes URI is a string (literal or integer)
    // check if it starts with http (ugly)
    if (URI.lastIndexOf('http', 0) !== 0) { // doesn't with HTTP

        console.log(URI);
        return;
    }
    $.ajax({
        url: URI,
        headers: { 'Accept': 'text/turtle' }
    }).done(function(data) {
        var parser = N3.Parser();
        parser.parse(data, function(err, triple, prefixes) {
            if(triple) {
                // linked data could return also ?s ?p <uri>
                // and not just <uri> ?p ?o
                if(triple.subject == URI || triple.object == URI) {

                    if(triple.subject == URI) {
                        triples.push(triple);
                    } else {
                        // XXX switching subject with object
                        var subject = triple.subject;
                        triple.subject = triple.object;
                        triple.object = subject

                        triples.push(triple);
                    }

                    /*
                    if(!predicates[triple.predicate]) {
                        // this predicate doesn't exist!
                        // resolve it only if it's not already resolved
                        if(!resolvedPredicates[triple.predicate]) {
                            resolvePredicate(triple.predicate)
                        }

                        predicates[triple.predicate] = [];
                    }
                    if(triple.subject == URI) {
                        predicates[triple.predicate].push(triple.object);
                    } else {
                        predicates[triple.predicate].push(triple.subject);
                    }
                    */
                }

                /*
                if(URI == triple.object) { // means it's predicate OF

                    //predicates[triple.predicate].push(triple.subject);
                } else {
                    predicates[triple.predicate].push(triple.object);
                }
                */
            } else {
                var predicates = {}
                for(var i in triples) {
                    triple = triples[i];
                    if(!predicates[triple.predicate]) {
                        predicates[triple.predicate] = [];
                    }
                    predicates[triple.predicate].push(triple.object);
                }
                for(var uri in predicates) {

                    $('.type-ahead').append('<li><a href="'+uri+'">' + uri + ' - ['+predicates[uri].length+']</a></li>')
                }

            }
        })
    })
}

function resolvePredicate(predicateURI) {
    $.ajax({
        url: predicateURI,
        headers: { 'Accept': 'text/turtle' }
    }).done(function(data) {
        var parser = N3.Parser();
        parser.parse(data, function(err, triple, prefixes) {
            if(triple) {
                if(triple.subject == predicateURI) {
                    // should also add comment or other predicates?
                    if(triple.predicate == 'http://www.w3.org/2000/01/rdf-schema#label') {
                        if(!resolvedPredicates[predicateURI]) {
                            resolvedPredicates[predicateURI] = ''
                        }
                        resolvedPredicates[predicateURI] += triple.object
                    }
                }
            } else {
                // finished parsing
            }
        })
    })
}

// events
$(function() {

    $(document).on('input','.type', function() {
        var $this = $(this);
        var val = $this.val()
        var $type = $('.type-ahead')
        $type.html('')

        for(var i in triples) {
            var triple = triples[i];

            var presult = triple.predicate.match(new RegExp(val, 'i'));
            var oresult = triple.object.match(new RegExp(val, 'i'));

            if(presult || oresult) {
                var $subject = $('[id="'+triple.subject+'"]');
                var $predicate = $('[id="' + triple.subject + triple.predicate+'"]');

                if($predicate.length) {

                    $predicate.find('ul:first').append('<li id="'+triple.subject+triple.predicate+triple.object+'"><a href="'+triple.object+'">' + triple.object + '</a></li>');

                } else {

                    if($subject.length) {

                        $subject.find('ul:first').append('<li id="'+triple.subject + triple.predicate+'"><a href="'+triple.predicate+'">' + triple.predicate + '</a><ul><li id="'+triple.subject+triple.predicate+triple.object+'"><a href="'+triple.object+'">' + triple.object + '</a></li>')

                    } else {

                        $type.append('<li id="'+triple.subject+'"><a href="'+triple.subject+'">' + triple.subject + '</a><ul><li id="'+triple.subject + triple.predicate+'"><a href="'+triple.predicate+'">' + triple.predicate + '</a><ul><li id="'+triple.subject+triple.predicate+triple.object+'"><a href="'+triple.object+'">' + triple.object + '</a></li></ul></li></ul></li>')

                    }

                }
            }
        }


        /*
        $type.append('<li>resolved matches:</li>')
        for(var uri in resolvedPredicates) {
            var result = resolvedPredicates[uri].match(new RegExp(val, 'i'));
            if(result) {
                $type.append('<li><a href="'+uri+'">' + resolvedPredicates[uri] + ' - ['+predicates[uri].length+']</a></li>')
            }
        }
        */
    })

    $(document).on('click', 'ul.type-ahead li a', function(e) {
        $('.type').val($(this).attr('href'))
        e.preventDefault()
        e.stopPropagation()

    })

    $('button.submit').click(function(e) {
        var val = $('.type').val()

        for(var i in triples) {
            var triple = triples[i];
            if(val == triple.subject ||
                val == triple.predicate ||
                val == triple.object) {

                console.log(triple);
                
            }
        }

        e.preventDefault()
        e.stopPropagation()
    })
    $('a.new_path').click(function() {


        var val = $('.type').val()

        // see if we have val, in the triples
        var found = false;
        for(var i in triples) {
            var triple = triples[i];
            if(val == triple.predicate) {
                // we have to decide whether to resolve
                // the subject or object based on the current URI
                resolveURI(triple.object);
                found = true;
            }
            if(val == triple.object) {

                resolveURI(val);
                found = true;
            }
        }

        if(!found) {
            resolveURI(val)
        }

        // reset state
        triples = []

        // remove all .type classes
        $('.type').each(function() { $(this).removeClass('type') })
        $('.path').append("<input type='text' class='type' />")

        $('.type-ahead').html('')
        
    })

})
