<?php
require "../header.php";
// sendback json to AJAX
if (isset($_POST['jsonUri'])) {
    $uriPath = $dbIB . $_POST['jsonUri'];
    echo file_get_contents($uriPath);
} else {
    echo 'ERROR Loading file';
}

?>
