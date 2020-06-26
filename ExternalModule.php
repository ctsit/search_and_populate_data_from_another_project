<?php

namespace STPipe\ExternalModule;

use ExternalModules\AbstractExternalModule;
use DataEntry;

class ExternalModule extends AbstractExternalModule {

    function redcap_data_entry_form_top($project_id, $record, $instrument, $event_id, $group_id, $repeat_instance) {

        $this->setJsSettings([
                'target_pid' => $this->framework->getProjectSetting('target_pid')
        ]);
        $this->includeJs('js/custom_data_search.js');
        DataEntry::renderSearchUtility();
        echo '</br>';
    }

    protected function includeJs($file) {
        echo '<script src="' . $this->getUrl($file) . '"></script>';
    }

    protected function setJsSettings($settings) {
        echo '<script>STPipe = ' . json_encode($settings) . ';</script>';
    }

}
