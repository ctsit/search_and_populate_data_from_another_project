$( document ).ready( function() {

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
        enableDataSearchAutocomplete($('#field_select option:first').val(),'<?php echo getArm() ?>');
        // If user selects new field for Data Search, set search query input to blank
        $('#field_select').change(function(){
            // Reset query text
            $('#search_query').val('');
            // Enable searching via auto complete
            enableDataSearchAutocomplete($(this).val(),'<?php echo getArm() ?>');
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
    $.get({
        url: STPipe.ajaxpage,
        data: {
                recordId: record_id
              },
        })
    .done(function(data) {
        response_data = JSON.parse(data);
        pasteValues(response_data);
    });
}

function pasteValues(values) {
    for (let [key, value] of Object.entries(values)) {
        $(`input[name='${key}']`).val(`${value}`);
        // FIXME: does not honor desired date formatting
        // TODO: only works on text input fields
    }
}
