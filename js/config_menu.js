const json_lint_button = $("<input type='button' onclick='prettyPrint(this)' value='Validate JSON'></input>");
const sample_map = JSON.stringify(
        {
            "source_field_1" : "target_field_1",
            "source_field_2" : "target_field_2"
        },
        undefined,
        2
        );
$(document).ready(function() {
    const source_codebook = `<a target='_blank' href='${app_path_webroot_full}${app_path_webroot.slice(1)}Design/data_dictionary_codebook.php?pid=${STPipe.sourceProjectId}'><button>Source codebook</button></a>`;
    const target_codebook = `<a target='_blank' href='${app_path_webroot_full}${app_path_webroot.slice(1)}Design/data_dictionary_codebook.php?pid=${STPipe.thisProjectId}'><button>Target codebook</button></a>`;
    var $modal = $('#external-modules-configure-modal');

    $modal.on('show.bs.modal', function() {
        console.log('modal happened');
        if ( $(this).data('module') != STPipe.modulePrefix ) {
            return;
        }

        if (typeof ExternalModules.Settings.prototype.resetConfigInstancesOld === 'undefined') {
            ExternalModules.Settings.prototype.resetConfigInstancesOld = ExternalModules.Settings.prototype.resetConfigInstances;
        }

        ExternalModules.Settings.prototype.resetConfigInstances = function() {
            ExternalModules.Settings.prototype.resetConfigInstancesOld();
            if ( $modal.data('module') != STPipe.modulePrefix ) {
                return;
            }
            // Force the descriptive field to show codebook buttons
            $("tr[field='codebook_shortcuts']")
                .children(":first")
                .removeAttr('colspan')
                .next() // hijack existing empty td for buttons
                .html(source_codebook + target_codebook)
                .attr('colspan', 2);

            let $tfield = $("textarea[name*='mapping___']");
            $tfield.attr('placeholder', sample_map);
            $tfield.after(json_lint_button);
            // FIXME: buttons remain after eliminating a repeatable subsetting
            // TODO: detect click of $(button.external-modules-remove-instance) and remove convenience buttons for relevant Enabled Form
        }

    });
});

function prettyPrint(element) {
    let $field = $(element).prev();
    let ugly = $field.val();
    if (ugly) {
        try {
            let pretty = JSON.stringify(JSON.parse(ugly), undefined, 2);
            $field.val(pretty);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert("There is an error in your JSON syntax:\n" + err.message);
            }
        }
    }
}
