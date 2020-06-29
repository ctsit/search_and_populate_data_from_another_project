const json_lint_button = $("<input type='button' onclick='prettyPrint()' value='Validate JSON'></input>");
$(document).ready(function() {
    const source_codebook = $(`<a target='_blank' href='${app_path_webroot_full}${app_path_webroot.slice(1)}Design/data_dictionary_codebook.php?pid=${STPipe.sourceProjectId}'><button>Source codebook</button></a>`);
    const target_codebook = $(`<a target='_blank' href='${app_path_webroot_full}${app_path_webroot.slice(1)}Design/data_dictionary_codebook.php?pid=${STPipe.thisProjectId}'><button>Target codebook</button></a>`);
    var $modal = $('#external-modules-configure-modal');

    $modal.on('show.bs.modal', function() {
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

            let $tfield = $("textarea[name='mapping']");
            fillIfBlank($tfield);
            $tfield.after(json_lint_button);
            $tfield.before(source_codebook);
            $tfield.before(target_codebook);

        }

    });
});

function prettyPrint() {
    let $field = $("textarea[name='mapping']");
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

function fillIfBlank($field) {
    if ( !$field.val() ) {
        default_map = {
            "source_field_1" : "target_field_1",
            "source_field_2" : "target_field_2"
        };
        $field.val(JSON.stringify(default_map, undefined, 2));
    }
}

