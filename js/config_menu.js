const json_lint_button = $("<input type='button' onclick='prettyPrint()' value='Validate JSON'></input>");
$(document).ready(function() {
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

