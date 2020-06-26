<?php

namespace STPipe\ExternalModule;
require_once(__DIR__ . '/ExternalModule.php');

$record_id = $_REQUEST['recordId'];

$EM = new ExternalModule();

echo json_encode($EM->getPersonInfo($record_id));

?>
