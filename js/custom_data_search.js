$( document ).ready( function() {
    // hide the field selector because its options are for the target, not source project
    $("#field_select").parent().parent().hide()
    
    // setting up the dialog for the search confirmation before copying
    $( "#dialog-data-stp" ).dialog( {
        autoOpen: false,
        draggable: true,
        resizable: true,
        closeOnEscape: true,
        minWidth: 500,
        modal: true,
        open: function () {
            // clicking the background of the modal closes the modal
            $( '.ui-widget-overlay' ).bind( 'click', function () {
                $( '#dialog-data-stp' ).dialog( 'close' );
            } )
        }
    } );

    // copy relevant function and override it
    function enableDataSearchAutocomplete(field,arm) {
        search = null;
        search = 	$('#search_query').autocomplete({
                        source: app_path_webroot+'DataEntry/search.php?field='+field+'&pid='+STPipe.target_pid+'&arm='+arm,
                        minLength: 1,
                        delay: 50,
                        select: function( event, ui ) {
                            // Reset value in textbox
                            $('#search_query').val('');
                            // Get record and event_id values and redirect to form
                            var data_arr = ui.item.value.split('|',4);
                            /****
                             * The following 2 lines constitute the override,
                             * use custom project as target and open in new tab
                             */
                            let record_url = app_path_webroot+'DataEntry/index.php?pid='+STPipe.target_pid+'&page='+data_arr[1]+'&event_id='+data_arr[2]+'&id='+data_arr[3]+'&instance='+data_arr[0];
                            ajaxGet(data_arr[3]);
                            //window.open(record_url);
                            // end of override
                            return false;
                        },
                        focus: function (event, ui) {
                            // Reset value in textbox
                            $('#search_query').val('');
                            return false;
                        },
                        response: function (event, ui) {
                            // When it opens, hide the progress icon/text
                            $('#search_progress').fadeOut('fast');
                        }
                    })
                    .data('ui-autocomplete')._renderItem = function( ul, item ) {
                        return $("<li></li>")
                            .data("item", item)
                            .append("<a>"+item.label+"</a>")
                            .appendTo(ul);
                    };
    }
    $(function(){
        // Enable searching via auto complete
        enableDataSearchAutocomplete($('#field_select option:first').val(),'1');
        // If user selects new field for Data Search, set search query input to blank
        $('#field_select').change(function(){
            // Reset query text
            $('#search_query').val('');
            // Enable searching via auto complete
            enableDataSearchAutocomplete($(this).val(),'1');
        });
        // Make progress gif appear when loading new results
        $('#search_query').keydown(function(e){
            if (e.which == 40) return; // If down arrow is clicked, then stop
            $('ul.ui-autocomplete:last').hide();
            $('ul.ui-autocomplete:last li').each(function(){
                $(this).remove();
            });
            showSearchProgress(1);
        });
    });
    // end of imported function

});

function ajaxGet(record_id) {
    const urlParams = new URLSearchParams(window.location.search);
    $.get({
        url: STPipe.ajaxpage,
        data: {
                recordId: record_id,
                instrument: urlParams.get('page')
              },
        })
    .done(function(data) {
        response_data = JSON.parse(data);
        showDataConfirmModal(response_data);
    });
}

function pasteValues(values) {
    for (let [key, value] of Object.entries(values)) {
        let $target_field = $(`input[name='${key}']`);
        if ($target_field.attr('class') == 'hiddenradio') {
            // collect all radio fields in all layouts
            let $inputs = $target_field.siblings('[class*="choice"]');
            // select radio assuming target coded value matches source coded value
            $inputs.find(`[value='${value}']`).click();
        } else {
            // FIXME: does not honor desired date formatting
            $target_field.val(`${value}`);
            $target_field.blur();
        }
    }
}

function showDataConfirmModal( copyData ) {
    // show the modal
    $( "#dialog-data-stp" ).dialog( "open" );
    
    // hold onto the data in its current form
    $( "#dialog-data-stp" ).data( 'copyData', copyData );
    
    // clear the rows from any previous search
    $( '#body-for-stp-modal' ).empty();
    for ( let [key, value] of Object.entries( copyData ) ) {
        // Add the rows from the current search
        $( '#body-for-stp-modal' ).append( "<tr><td>" + key + "</td><td>" + value + "</td></tr>" );
    }
    
}

function hideDataConfirmModal( isCopy ) {
    // close the modal
    $( "#dialog-data-stp" ).dialog( "close" );
    // get the data from the html
    copydata = $( "#dialog-data-stp" ).data( 'copyData' );
    if ( isCopy > 0 ) {
        // copy the data into the form
        pasteValues( copydata );
    }
    // clean up afterwards
    $( "#dialog-data-stp" ).removeData( 'copyData' );
}
