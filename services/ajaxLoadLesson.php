<?php

require "../header.php";

// sendback json to AJAX
if (isset($_POST['jsonUri'])) {
	$jsonFile = $dbLesson . $_POST['jsonUri'] . '.json' ;
	if (file_exists($jsonFile)) {
		echo file_get_contents($jsonFile);
	}
} else {
    echo 'ERROR Loading file';
}

?>
