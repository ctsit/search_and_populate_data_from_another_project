<?php

namespace UF_CTSI\SAPDAP;
require_once __DIR__ . '/SAPDAP.php';

$record_id = $_REQUEST['recordId'];
$instrument = $_REQUEST['instrument'];

$EM = new SAPDAP();
$result = $EM->getPersonInfo($record_id, $instrument);
echo json_encode($result);
