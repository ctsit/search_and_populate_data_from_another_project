<?php

namespace UF_CTSI\SAPDAP;
require_once __DIR__ . '/SAPDAP.php';

$record_id = $_REQUEST['recordId'];
$instrument = $_REQUEST['instrument'];
$source_event_id = $_REQUEST['eventId'] ?? null;
$source_form = $_REQUEST['form'] ?? null;
$source_instance = $_REQUEST['instance'] ?? null;

$EM = new SAPDAP();
$result = $EM->getPersonInfo($record_id, $instrument, $source_event_id, $source_form, $source_instance);
echo json_encode($result);
