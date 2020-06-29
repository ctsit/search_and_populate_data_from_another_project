<?php

namespace STPipe\ExternalModule;

use ExternalModules\AbstractExternalModule;
use DataEntry;

class ExternalModule extends AbstractExternalModule {

    function redcap_every_page_top($project_id) {
        if ($project_id && strpos(PAGE, 'ExternalModules/manager/project.php') !== false) {
            $this->setJsSettings([
                    'modulePrefix' => $this->PREFIX,
                    'sourceProjectId' => $this->framework->getProjectSetting('target_pid'),
                    'thisProjectId' => $project_id

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

        $target_project_id = $this->framework->getProjectSetting('target_pid');

        $mapping = json_decode($this->framework->getProjectSetting('mapping'), true);
        $source_fields = array_keys($mapping);

        $get_data = [
            'project_id' => $target_project_id,
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
        $all_person_data = array_merge_recursive($redcap_data[$ufid]);

        $person_data = $all_person_data[0]; // only data from non-repeat events

        // replace source field names with mapped target field names
        array_walk_recursive($person_data, function($value,$source_key) use ($mapping,&$person_data, $all_person_data) {
                $target_key = array_key_exists($source_key, $mapping) ? $mapping[$source_key] : false;
                if ($target_key !== false) {
                    $person_data[$target_key] = $value;
                    if (!$person_data[$target_key]) {
                        // dig into repeat_instances and pull out non-null values
                        $value = $this->digNestedData($all_person_data, $source_key);
                        $person_data[$target_key] = $value;
                    }
                    unset($person_data[$source_key]);
                }
            });

        return $person_data;
    }

    protected function includeJs($file) {
        echo '<script src="' . $this->getUrl($file) . '"></script>';
    }

    protected function setJsSettings($settings) {
        echo '<script>STPipe = ' . json_encode($settings) . ';</script>';
    }

    function digNestedData($subject_data_array, $key) {
        $value = null;
        if (property_exists($subject_data_array, $key)) {
            $value = $subject_data_array->{$key};
        } else {
            // keys nested in objects were not being found
            array_walk_recursive($subject_data_array,
                                 function($v, $k) use ($key, &$value) {
                                     if ("$key" == "$k") {
                                         $value = $v;
                                     }
                                 }
            );
        }

        return $value;
    }

}
