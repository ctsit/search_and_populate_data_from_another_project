<?php

namespace STPipe\ExternalModule;
require_once(__DIR__ . '/ExternalModule.php');

$record_id = $_REQUEST['recordId'];
$instrument = $_REQUEST['instrument'];

$EM = new ExternalModule();
$result = $EM->getPersonInfo($record_id, $instrument);
echo json_encode($result);
