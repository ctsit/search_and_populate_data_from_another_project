<?php

namespace STPipe\ExternalModule;

use ExternalModules\AbstractExternalModule;
use DataEntry;

class ExternalModule extends AbstractExternalModule
{

    function redcap_every_page_top($project_id)
    {
        if ($project_id && $this->isPage('ExternalModules/manager/project.php')) {
            $this->setJsSettings([
                'modulePrefix' => $this->PREFIX,
                'sourceProjectId' => $this->getProjectSetting('target_pid'),
                'thisProjectId' => $project_id
            ]);
            $this->includeJs('js/config_menu.js');
        }
    }

    function redcap_data_entry_form_top($project_id, $record, $instrument, $event_id, $group_id, $repeat_instance)
    {

        // only spawn search interface on specified form
        if (!in_array($instrument, (array) $this->getProjectSetting('show_on_form'))) return;
        $target_pid = $this->getProjectSetting('target_pid');

        // collect source project's field labels if needed
        $source_fields_mapping = [];
        if ($this->getProjectSetting('limit_fields')) {
            $mapping = $this->fetchMappings($instrument);
            $source_fields = array_keys($mapping);

            /* FIXME: EM query does not like field_name IN
             * mysqli_result object is not behaving with fetch_all
             */
            // $sql = "SELECT field_name, element_label
            //     FROM redcap_metadata
            //     WHERE project_id = ?
            //         AND field_name IN (?)";
            // $source_fields_mapping = $this->framework->
            //                        query($sql,
            //                              [$target_pid,
            //                               implode(",`", $source_fields)
            //                              ]
            //                        )->fetch_all(MYSQLI_ASSOC);

            // HACK: fetch the entire data dictionary just to get the field labels
            // TODO: replace this with direct query for better performance
            $source_fields_mapping =\MetaData::getDataDictionary(/*$returnFormat= */ 'array',
                                                                 /*$returnCsvLabelHeaders= */true,
                                                                 /*$fields= */$source_fields,
                                                                 /*$forms= */array(),
                                                                 /*$isMobileApp= */false,
                                                                 /*$draft_mode= */false,
                                                                 /*$revision_id= */null,
                                                                 /*$project_id_override= */$target_pid
                                                                 /*$delimiter=','*/);

            foreach($source_fields_mapping as $k => $v) {
                $source_fields_mapping[$k] = $v['field_label'];
            }
        }

        // get redcap version
        $version_support = null;
        // set support boolean
        if (
            (\REDCap::versionCompare(REDCAP_VERSION, '14.5.35', '>=') &&
                \REDCap::versionCompare(REDCAP_VERSION, '14.6.0', '<')) ||
            \REDCap::versionCompare(REDCAP_VERSION, '15.0.1', '>')
        ) {
            $version_support = true;
        } else {
            $version_support = false;
        }
        $this->setJsSettings([
            'target_pid' => $target_pid,
            'ajaxpage' => $this->getUrl('ajaxpage.php'),
            'limit_fields' => $this->getProjectSetting('limit_fields'),
            'source_fields_mapping' => $source_fields_mapping,
            'version_support' => $version_support
        ]);
        $this->includeJs('js/custom_data_search.js');
        DataEntry::renderSearchUtility();

        include 'data_confirm_modal.html';
        echo '</br>';
    }

    function getPersonInfo($record_id, $instrument)
    {

        if (!$record_id | !$instrument) return false;
        $target_project_id = $this->getProjectSetting('target_pid');

        $mapping = $this->fetchMappings($instrument);

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

        if (!isset($redcap_data[$record_id])) {
            return [];
        }
        $all_person_data = array_merge_recursive($redcap_data[$record_id]);

        $source_person_data = $all_person_data[0]; // only data from non-repeat events

        $target_person_data = $source_person_data; //initially they are the same
        // replace source field names with mapped target field names
        array_walk_recursive(
            $source_person_data,
            function ($value, $source_key) use ($mapping, &$source_person_data, $all_person_data, &$target_person_data) {

                $target_key = array_key_exists($source_key, $mapping) ? $mapping[$source_key] : false;
                if ($target_key !== false) {
                    if (!$value) {
                        // dig into repeat_instances and pull out non-null values
                        $value = $this->digNestedData($all_person_data, $source_key);
                    }
                    $value = $this->convertDateFormat($target_key, $value);
                    $target_person_data[$target_key] = $value;

                    // to prevent removing keys that need to remain.
                    if (!in_array($source_key, $mapping)) {
                        unset($target_person_data[$source_key]);
                    }
                }
            }
        );

        return $target_person_data;
    }

    // Copied nearly exactly from the DataQuality class because it's a private function
    // TODO: utilize DateTimeRC::datetimeConvert, but this does all the lifting
    private function convertDateFormat($field, $value)
    {
        global $Proj;
        // Get field validation type, if exists
        $valType = $Proj->metadata[$field]['element_validation_type'];
        // If field is a date[time][_seonds] field with MDY or DMY formatted, then reformat the displayed date for consistency
        if (
            $value != '' && !is_array($value) && substr($valType, 0, 4) == 'date'
            && (substr($valType, -4) == '_mdy' || substr($valType, -4) == '_dmy')
        ) {
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
                list($this_date, $this_time) = explode(" ", $value);
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

    protected function includeJs($file)
    {
        echo '<script src="' . $this->getUrl($file) . '"></script>';
    }

    protected function setJsSettings($settings)
    {
        echo '<script>STPipe = ' . json_encode($settings) . ';</script>';
    }

    function digNestedData($subject_data_array, $key)
    {
        $value = null;
        if (is_array($subject_data_array)) {
            if (array_key_exists($key, $subject_data_array)) {
                $value = $subject_data_array[$key];
            } else {
                // Search nested arrays recursively
                array_walk_recursive(
                    $subject_data_array,
                    function ($v, $k) use ($key, &$value) {
                        if ("$key" == "$k") {
                            $value = $v;
                        }
                    }
                );
            }
        }
        // If it's an object, use property_exists
        else if (is_object($subject_data_array)) {
            if (property_exists($subject_data_array, $key)) {
                $value = $subject_data_array->{$key};
            } else {
                // Search nested objects recursively
                $array_data = (array)$subject_data_array;
                array_walk_recursive(
                    $array_data,
                    function ($v, $k) use ($key, &$value) {
                        if ("$key" == "$k") {
                            $value = $v;
                        }
                    }
                );
            }
        }

        return $value;
    }

    function fetchMappings($instrument)
    {
        $target_forms = $this->getProjectSetting('show_on_form');
        $instrument_index = array_search($instrument, $target_forms);
        $mapping = json_decode($this->getProjectSetting('mapping')[$instrument_index], true);
        return $mapping;
    }
}
