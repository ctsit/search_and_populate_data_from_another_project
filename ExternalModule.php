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

        // only spawn search interface on specified form
        if (!in_array($instrument, (array) $this->framework->getProjectSetting('show_on_form'))) return;

        $this->setJsSettings([
                'target_pid' => $this->framework->getProjectSetting('target_pid'),
                'ajaxpage' => $this->framework->getUrl('ajaxpage.php')
        ]);
        $this->includeJs('js/custom_data_search.js');
        DataEntry::renderSearchUtility();

        include( 'data_confirm_modal.html' );
        echo '</br>';
    }

    function getPersonInfo($record_id, $instrument) {

        if (!$record_id | !$instrument) return false;

        $target_project_id = $this->framework->getProjectSetting('target_pid');

        $target_forms = $this->framework->getProjectSetting('show_on_form');

        $instrument_index = array_search($instrument, $target_forms);

        $mapping = json_decode($this->framework->getProjectSetting('mapping')[$instrument_index], true);

        $source_fields = array_keys($mapping);

        $get_data = [
            'project_id' => $target_project_id,
            'records' => $record_id,
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
        $all_person_data = array_merge_recursive($redcap_data[$record_id]);

        $source_person_data = $all_person_data[0]; // only data from non-repeat events

        $target_person_data = $source_person_data; //initially they are the same
        // replace source field names with mapped target field names
        array_walk_recursive(
            $source_person_data, 
            function ( $value, $source_key ) use ( $mapping, &$source_person_data, $all_person_data, &$target_person_data ) {

                $target_key = array_key_exists( $source_key, $mapping ) ? $mapping[$source_key] : false;
                if ( $target_key !== false ) {
                    if ( !$value ) {
                        // dig into repeat_instances and pull out non-null values
                        $value = $this->digNestedData( $all_person_data, $source_key );
                    }
                    $value = $this->convertDateFormat($target_key, $value);
                    $target_person_data[$target_key] = $value;

                    // to prevent removing keys that need to remain.
                    if ( !in_array( $source_key, $mapping ) ) {
                        unset( $target_person_data[$source_key] );
                    }
                }
            }
        );

        return $target_person_data;
    }

    // Copied nearly exactly from the DataQuality class because it's a private function
    // TODO: utilize DateTimeRC::datetimeConvert, but this does all the lifting
    private function convertDateFormat($field, $value) {
        global $Proj;
        // Get field validation type, if exists
        $valType = $Proj->metadata[$field]['element_validation_type'];
        // If field is a date[time][_seonds] field with MDY or DMY formatted, then reformat the displayed date for consistency
        if ($value != '' && !is_array($value) && substr($valType, 0, 4) == 'date'
            && (substr($valType, -4) == '_mdy' || substr($valType, -4) == '_dmy') ) {
            // Get array of all available validation types
            $valTypes = getValTypes();
            $valTypes['date_mdy']['regex_php'] = $valTypes['date_ymd']['regex_php'];
            $valTypes['date_dmy']['regex_php'] = $valTypes['date_ymd']['regex_php'];
            $valTypes['datetime_mdy']['regex_php'] = $valTypes['datetime_ymd']['regex_php'];
            $valTypes['datetime_dmy']['regex_php'] = $valTypes['datetime_ymd']['regex_php'];
            $valTypes['datetime_seconds_mdy']['regex_php'] = $valTypes['datetime_seconds_ymd']['regex_php'];
            $valTypes['datetime_seconds_dmy']['regex_php'] = $valTypes['datetime_seconds_ymd']['regex_php'];
            // Set regex pattern to use for this field
            $regex_pattern = $valTypes[$valType]['regex_php'];
            // Run the value through the regex pattern
            preg_match($regex_pattern, $value, $regex_matches);
            // Was it validated? (If so, will have a value in 0 key in array returned.)
            $failed_regex = (!isset($regex_matches[0]));
            if ($failed_regex) return $value;
            // Dates
            if ($valType == 'date_mdy') {
                $value = \DateTimeRC::date_ymd2mdy($value);
            } elseif ($valType == 'date_dmy') {
                $value = \DateTimeRC::date_ymd2dmy($value);
            } else {
                // Datetime and Datetime seconds
                list ($this_date, $this_time) = explode(" ", $value);
                if ($valType == 'datetime_mdy' || $valType == 'datetime_seconds_mdy') {
                    $value = trim(\DateTimeRC::date_ymd2mdy($this_date) . " " . $this_time);
                } elseif ($valType == 'datetime_dmy' || $valType == 'datetime_seconds_dmy') {
                    $value = trim(\DateTimeRC::date_ymd2dmy($this_date) . " " . $this_time);
                }
            }
        }
        // Return the value
        return $value;
    }

    protected function includeJs($file) {
        echo '<script src="' . $this->getUrl($file) . '"></script>';
    }

    protected function setJsSettings($settings) {
        echo '<script>STPipe = ' . json_encode($settings) . ';</script>';
    }

    function digNestedData( $subject_data_array, $key ) {
        $value = null;
        if ( property_exists( $subject_data_array, $key ) ) {
            $value = $subject_data_array->{$key};
        } else {
            // keys nested in objects were not being found
            array_walk_recursive(
                $subject_data_array,
                function ( $v, $k ) use ( $key, &$value ) {
                    if ( "$key" == "$k" ) {
                        $value = $v;
                    }
                }
            );
        }

        return $value;
    }
}
