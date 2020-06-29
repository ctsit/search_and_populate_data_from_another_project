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

        $mapping = json_decode($this->framework->getProjectSetting('mapping'), true);
        $source_fields = array_keys($mapping);

        $get_data = [
            'project_id' => $project_id,
            'records' => $ufid,
            //'events' => $event,
            'fields' => $source_fields,
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


        // eliminate event-level of array and promote fields
        $o_person_data = $redcap_data[$ufid];
        $o_person_data = array_merge_recursive($redcap_data[$ufid])[0];
        // replace original keys with mapped values
        $person_data = array_combine(array_merge($o_person_data, $mapping), $o_person_data);

        //return array_merge_recursive($redcap_data[$ufid])[0];
        return $person_data;
    }

    protected function includeJs($file) {
        echo '<script src="' . $this->getUrl($file) . '"></script>';
    }

    protected function setJsSettings($settings) {
        echo '<script>STPipe = ' . json_encode($settings) . ';</script>';
    }

}
