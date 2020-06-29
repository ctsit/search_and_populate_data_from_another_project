<?php

namespace STPipe\ExternalModule;

use ExternalModules\AbstractExternalModule;
use DataEntry;

class ExternalModule extends AbstractExternalModule {

    function redcap_every_page_top($project_id) {
        if ($project_id && strpos(PAGE, 'ExternalModules/manager/project.php') !== false) {
            $this->setJsSettings([
                    modulePrefix => $this->PREFIX
            ]);
            $this->includeJs('js/config_menu.js');
        }
    }

    function redcap_data_entry_form_top($project_id, $record, $instrument, $event_id, $group_id, $repeat_instance) {

        $this->setJsSettings([
                'target_pid' => $this->framework->getProjectSetting('target_pid'),
                'ajaxpage' => $this->framework->getUrl('ajaxpage.php')
        ]);
        $this->includeJs('js/custom_data_search.js');
        DataEntry::renderSearchUtility();
        echo '</br>';
    }

    function getPersonInfo($ufid) {

        if (!$ufid) return false;

        $project_id = $this->framework->getProjectSetting('target_pid');

        $get_data = [
            'project_id' => $project_id,
            'records' => $ufid,
            //'events' => $event,
            //'fields' => $fields,
            ];

        $redcap_data = \REDCap::getData($get_data);

        /*
         * this code left here and commented out incase I need it
        foreach($redcap_data as $record_id => $events) {
            foreach($events as $event_id => $fields) {
                if ($fields = array_filter($fields)) { // make sure there's anything at all before continuing
                    // do something if needed
                }
            }
        }
        */


        return $redcap_data[$ufid];
    }

    protected function includeJs($file) {
        echo '<script src="' . $this->getUrl($file) . '"></script>';
    }

    protected function setJsSettings($settings) {
        echo '<script>STPipe = ' . json_encode($settings) . ';</script>';
    }

}
