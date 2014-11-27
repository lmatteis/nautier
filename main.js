var predicates = {}

function resolveURI(URI) {
    $.ajax({
        url: URI,
        headers: { 'Accept': 'text/turtle' }
    }).done(function(data) {
        predicates[URI] = {}
        var parser = N3.Parser();
        parser.parse(data, function(err, triple, prefixes) {
            if(triple) {
                // add it to a global predicates whatever
                // resolve all predicates LOL
                if(!predicates[triple.predicate]) {
                    // resolve this predicate since it doesn't exist
                    predicates[triple.predicate] = [];

                    /*
                    resolvePredicate(triple.predicate, function() {

                        predicates[triple.predicate] = true;
                    })
                    */
                }
                if(URI == triple.object) { // means it's predicate OF

                    predicates[triple.predicate].push(triple.subject);
                } else {
                    predicates[triple.predicate].push(triple.object);
                }
            } else {
                for(var uri in predicates) {

                    $('.type-ahead').append('<li><a href="'+uri+'">' + uri + ' - ['+predicates[uri].length+']</a></li>')
                }
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
