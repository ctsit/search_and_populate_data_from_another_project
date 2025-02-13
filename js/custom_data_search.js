$(document).ready(function () {
    if (STPipe.limit_fields) {
        // field selector options are initially for the target, not source project
        // replace them with only those defined in the project config
        $("#field_select").empty();
        $.each(STPipe.source_fields_mapping, function (key, label) {
            $("#field_select").append($("<option></option>").val(key).html(label));
        });
    } else {
        $("#field_select").parent().parent().hide()
    }

    // setting up the dialog for the search confirmation before copying
    $("#dialog-data-stp").dialog({
        autoOpen: false,
        draggable: true,
        resizable: true,
        closeOnEscape: true,
        minWidth: 500,
        modal: true,
        open: function () {
            // clicking the background of the modal closes the modal
            $('.ui-widget-overlay').bind('click', function () {
                $('#dialog-data-stp').dialog('close');
            })
        }
    });

    // based on the redcap version call different enableDataSearchAutocomplete functions
    if (STPipe.version_support) {
        // copy relevant function and override it
        function enableDataSearchAutocomplete(field, arm) {
            search = null;
            search = $('#search_query').autocomplete({
                source: app_path_webroot + 'DataEntry/search.php?field=' + field + '&pid=' + STPipe.target_pid + '&arm=' + arm,
                minLength: 1,
                delay: 50,
                select: function (event, ui) {
                    // Reset value in textbox
                    $('#search_query').val('');
                    // Get record and event_id values and redirect to form
                    var data_arr = ui.item.value.split('|', 5);
                    if (data_arr[1] == '') {
                        let record_url = app_path_webroot + 'DataEntry/record_home.php?pid=' + STPipe.target_pid + '&id=' + data_arr[4] + '&arm=' + data_arr[3];
                        ajaxGet(data_arr[4]);
                    } else {
                        let record_url = app_path_webroot + 'DataEntry/index.php?pid=' + STPipe.target_pid + '&page=' + data_arr[1] + '&event_id=' + data_arr[2] + '&id=' + data_arr[4] + '&instance=' + data_arr[0];
                        ajaxGet(data_arr[4]);
                    }
                    event.stopImmediatePropagation();
                    //end of override
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
                .data('ui-autocomplete')._renderItem = function (ul, item) {
                    return $("<li></li>")
                        .data("item", item)
                        .append("<a>" + item.label + "</a>")
                        .appendTo(ul);
                };
        }
        $(function () {
            // Enable searching via auto complete
            enableDataSearchAutocomplete($('#field_select').val(), '<?=getArm()?>');
            // If user selects new field for Data Search, set search query input to blank
            $('#field_select').change(function () {
                // Reset query text
                $('#search_query').val('');
                // Enable searching via auto complete
                enableDataSearchAutocomplete($(this).val(), '<?=getArm()?>');
            });
            // Make progress gif appear when loading new results
            $('#search_query').keydown(function (e) {
                if ([13, 38, 40].indexOf(e.which) > -1) return; // Ignore left, right, up and down arrow keys
                $('ul.ui-autocomplete:last').hide();
                $('ul.ui-autocomplete:last li').each(function () {
                    $(this).remove();
                });
                if (e.which == 27) {
                    e.target.value = '';
                    showSearchProgress(0);
                }
                else {
                    showSearchProgress(1);
                }
            });
        });
        // end of imported function
    } else {
        // copy relevant function and override it
        function enableDataSearchAutocomplete(field, arm) {
            search = null;
            search = $('#search_query').autocomplete({
                source: app_path_webroot + 'DataEntry/search.php?field=' + field + '&pid=' + STPipe.target_pid + '&arm=' + arm,
                minLength: 1,
                delay: 50,
                select: function (event, ui) {
                    // Reset value in textbox
                    $('#search_query').val('');
                    // Get record and event_id values and redirect to form
                    var data_arr = ui.item.value.split('|', 4);
                    /****
                     * The following 2 lines constitute the override,
                     * use custom project as target and open in new tab
                     */
                    let record_url = app_path_webroot + 'DataEntry/index.php?pid=' + STPipe.target_pid + '&page=' + data_arr[1] + '&event_id=' + data_arr[2] + '&id=' + data_arr[3] + '&instance=' + data_arr[0];
                    ajaxGet(data_arr[3]);
                    //window.open(record_url);
                    event.preventDefault(); // stop the browser default behavior
                    event.stopImmediatePropagation(); // stop other handlers from running on that same event
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
                .data('ui-autocomplete')._renderItem = function (ul, item) {
                    return $("<li></li>")
                        .data("item", item)
                        .append("<a>" + item.label + "</a>")
                        .appendTo(ul);
                };
        }
        $(function () {
            // Enable searching via auto complete
            enableDataSearchAutocomplete($('#field_select option:first').val(), '1');
            // If user selects new field for Data Search, set search query input to blank
            $('#field_select').change(function () {
                // Reset query text
                $('#search_query').val('');
                // Enable searching via auto complete
                enableDataSearchAutocomplete($(this).val(), '1');
            });
            // Make progress gif appear when loading new results
            $('#search_query').keydown(function (e) {
                if (e.which == 40) return; // If down arrow is clicked, then stop
                $('ul.ui-autocomplete:last').hide();
                $('ul.ui-autocomplete:last li').each(function () {
                    $(this).remove();
                });
                showSearchProgress(1);
            });
        });
        // end of imported function
    }
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
        .done(function (data) {
            response_data = JSON.parse(data);
            showDataConfirmModal(response_data);
        });
}

function pasteValues(values) {
    for (let [key, value] of Object.entries(values)) {
        let $target_field = $(`input[name='${key}']`);
        if ($target_field.length == 0) {
            // not found by name attr, field may be present as a dropdown
            selectFromDropdown(key, value);
        }
        // radio and regular text boxes
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

        if (typeof value === 'object' && value !== null) {
            handleCheckboxGroup(key, value);
        }

    }
}

function handleCheckboxGroup(fieldName, valuesObj) {
    // Build a selector based on checkbox naming convention.
    const selector = `input[name="__chkn__${fieldName}"]`;
    const $checkboxes = $(selector);

    if ($checkboxes.length === 0) {
        return;
    }

    Object.entries(valuesObj).forEach(([pos, ticked]) => {
        // Convert position to a zero-based index.
        const index = parseInt(pos, 10) - 1;
        const $checkbox = $checkboxes.eq(index);

        if ($checkbox.length) {
            const shouldBeChecked = ticked == "1" || ticked == 1;
            if ($checkbox.prop('checked') !== shouldBeChecked) {
                $checkbox.click();
            }
        }
    });
}

function selectFromDropdown(key, value) {
    const $target_row = $(`tr[sq_id='${key}']`);
    const $ac_target_field = $($target_row.find("input")[0]); // ac = auto complete
    const $select_field = $(`select[name='${key}']`);

    // used to handle cases where the value provided is the displayed value of the desired option,
    // rather than the coded value (value attribute)
    const displayed_option_value = $select_field
        .children()
        .filter((i, e) => {
            return ($(e).html() == value);
        })
        .val();

    // autocomplete fields
    if ($ac_target_field.attr('class') == 'x-form-text x-form-field rc-autocomplete ui-autocomplete-input') {
        // the non-coded value must be put in the text box to allow the user to see the pipe occured
        // if displayed_value is undefined, this function sets the value to nothing
        const displayed_value = $select_field
            .children(`[value='${value}']`)
            .html();
        $ac_target_field.val(displayed_value);

        if ($ac_target_field.val() != value && displayed_option_value != undefined) {
            // TODO: handle the possibilty that this value could go in an "other" field behind branching logic
            $ac_target_field.val(value);
        }
        return;
    }

    // non autocomplete fields
    $select_field.val(value);
    if ($select_field.val() != value && displayed_option_value != undefined) {
        // TODO: handle the possibilty that this value could go in an "other" field behind branching logic
        $select_field.val(displayed_option_value);
    }
}

function showDataConfirmModal(copyData) {
    $("#dialog-data-stp").dialog("open");
    $("#dialog-data-stp").data('copyData', copyData);

    // clear the rows from any previous search
    $('#body-for-stp-modal').empty();

    // Iterate over each key/value in the data object
    Object.entries(copyData).forEach(([key, value]) => {
        let displayValue = '';
        if (typeof value === 'object' && value !== null) {
            displayValue = Object.entries(value)
                .map(([pos, state]) => `Checkbox ${pos}: ${state == "1" ? "checked" : "unchecked"}`)
                .join(', ');
        } else {
            displayValue = value;
        }
        // Append a row to the modal table with the field name and its display value.
        $('#body-for-stp-modal').append(
            `<tr><td>${key}</td><td>${displayValue}</td></tr>`
        );
    });
}

function hideDataConfirmModal(isCopy) {
    // close the modal
    $("#dialog-data-stp").dialog("close");
    // get the data from the html
    copydata = $("#dialog-data-stp").data('copyData');
    if (isCopy > 0) {
        // copy the data into the form
        pasteValues(copydata);
    }
    // clean up afterwards
    $("#dialog-data-stp").removeData('copyData');
}
