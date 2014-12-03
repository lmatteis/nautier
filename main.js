var predicates = {}
var resolvedPredicates = {}

function resolveURI(URI) {
    $.ajax({
        url: URI,
        headers: { 'Accept': 'text/turtle' }
    }).done(function(data) {
        var parser = N3.Parser();
        parser.parse(data, function(err, triple, prefixes) {
            if(triple) {
                // add it to a global predicates whatever
                if(triple.subject == URI) {

                    if(!predicates[triple.predicate]) {
                        // this predicate doesn't exist!
                        // resolve it only if it's not already resolved
                        if(!resolvedPredicates[triple.predicate]) {
                            resolvePredicate(triple.predicate)
                        }

                        predicates[triple.predicate] = [];
                    }
                    predicates[triple.predicate].push(triple.object);
                }

                /*
                if(URI == triple.object) { // means it's predicate OF

                    //predicates[triple.predicate].push(triple.subject);
                } else {
                    predicates[triple.predicate].push(triple.object);
                }
                */
            } else {
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
        for(var uri in predicates) {
            var result = uri.match(new RegExp(val, 'i'));
            if(result) {

                $type.append('<li><a href="'+uri+'">' + uri + ' - ['+predicates[uri].length+']</a></li>')
            }
        }


        $type.append('<li>resolved matches:</li>')
        for(var uri in resolvedPredicates) {
            var result = resolvedPredicates[uri].match(new RegExp(val, 'i'));
            if(result) {
                $type.append('<li><a href="'+uri+'">' + uri + ' - ['+predicates[uri].length+']</a></li>')
            }
        }
    })

    $(document).on('click', 'ul.type-ahead li a', function(e) {
        $('.type').val($(this).attr('href'))
        e.preventDefault()
        e.stopPropagation()

    })

    $('button.submit').click(function(e) {
        var val = $('.type').val()
        // slash represent path
        var matches = predicates[val];
        console.log(matches)

        e.preventDefault()
        e.stopPropagation()
    })
    $('a.new_path').click(function() {
        // get data from previous path
        var val = $('.type').val()
        var matches = predicates[val];
        if(!matches) matches = [val];

        // remove all .type classes
        $('.type').each(function() { $(this).removeClass('type') })
        $('.path').append("<input type='text' class='type' />")

        $('.type-ahead').html('')

        // XXX reset predicate state
        predicates = {}
        for(var i in matches) {
            var uri = matches[i];
            resolveURI(uri)
        }
        
    })

})
