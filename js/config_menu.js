const sample_map = JSON.stringify(
    {
        "source_field_1": "target_field_1",
        "source_field_2": "target_field_2"
    },
    undefined,
    2
);
$(document).ready(function () {
    // check if app_path_webroot_full ends with redcap/ if so, remove it and app_path_webroot starts with /redcap/
    if (app_path_webroot_full.endsWith("redcap/") && app_path_webroot.startsWith("/redcap/")) {
        app_path_webroot_full = app_path_webroot_full.slice(0, -7);
    }
    const source_codebook = `<a target='_blank' href='${app_path_webroot_full}${app_path_webroot.slice(1)}Design/data_dictionary_codebook.php?pid=${STPipe.sourceProjectId}'><button>Source codebook</button></a>`;
    const target_codebook = `<a target='_blank' href='${app_path_webroot_full}${app_path_webroot.slice(1)}Design/data_dictionary_codebook.php?pid=${STPipe.thisProjectId}'><button>Target codebook</button></a>`;
    var $modal = $('#external-modules-configure-modal');
    var lastHoveredProjectID;

    /* Dynamically updating the href of the source codebook is accomplished by 
     * capturing the last hovered project in the select dropdown and updating
     * the href when a new project is selected.
    
     * NOTE: Dynamically updating the href cannot be accomplished without the mouseenter event listener.
     * This is because the change event on the select list completes before updating, resulting
     * in the previous option being available rather than the new option that was selected. By keeping
     * track of the last hovered Project in the dropdown, the href can be properly updated.
    **/
    var setSourceCodebook = function () {
        // Attach mouseenter event listener to project list options to capture last hovered project
        $('body').on('mouseenter', 'li.select2-results__option', function (event) {
            var projectText = $(this).text();
            lastHoveredProjectID = $('tr[field="target_pid"]').find('option:contains("' + projectText + '")').attr('value');
        });

        // Attach change event listener to the project select list to update href
        $('tr[field="target_pid"]').find('select').on('change', function (event) {
            var updatedHref = `${app_path_webroot_full}${app_path_webroot.slice(1)}Design/data_dictionary_codebook.php?pid=${lastHoveredProjectID}`;
            $("tr[field='codebook_shortcuts'] a").first().attr('href', updatedHref);
        });
    }

    // Function to attach JSON validation to the save button
    var attachJSONValidation = function () {
        const $saveButton = $modal.find('button.save-btn, button:contains("Save")').first();

        // Remove any previously attached handlers to avoid duplicates
        $saveButton.off('click.validateAllJSON');

        // Add event listener to validate all JSON fields before saving
        $saveButton.on('click.validateAllJSON', function (e) {
            // Find all JSON validation buttons in this module's configuration
            const $validateButtons = $modal.find('input[type="button"][value="Validate & Format JSON"][name^="mapping___"]');
            $validateButtons.each(function () {
                $(this).click();
            });
        });
    };

    $modal.on('show.bs.modal', function () {
        if ($(this).data('module') != STPipe.modulePrefix) {
            return;
        }

        if (typeof ExternalModules.Settings.prototype.resetConfigInstancesOld === 'undefined') {
            ExternalModules.Settings.prototype.resetConfigInstancesOld = ExternalModules.Settings.prototype.resetConfigInstances;
        }

        ExternalModules.Settings.prototype.resetConfigInstances = function () {
            ExternalModules.Settings.prototype.resetConfigInstancesOld();
            if ($modal.data('module') != STPipe.modulePrefix) {
                return;
            }
            // Force the descriptive field to show codebook buttons
            $("tr[field='codebook_shortcuts']")
                .children(":first")
                .removeAttr('colspan')
                .next() // hijack existing empty td for buttons
                .html(source_codebook + target_codebook)
                .attr('colspan', 2);

            $("textarea[name*='mapping___']").attr('placeholder', sample_map);

            // Force validation of JSON fields before save
            attachJSONValidation();

            // Dynamically update source codebook
            setSourceCodebook();
        }
    });
});
