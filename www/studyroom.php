<?php

require "header.php";

sleep(0);

// sendback json to AJAX
if (isset($_GET['s']) && isset($_GET['lesson'])) {

	// resolve the json db by token
	$dbF= file_get_contents($token);
	$activeClass = json_decode($dbF,true);
	if (isset($activeClass[$_GET['s']])){

		$class= $dbRoot . "/" . $activeClass[$_GET['s']]['class'];
	
		// evaluate the json
		// if could not found json file, return error page not found
		$checkPath = $class . "/lesson/" . $_GET['lesson'] . '.json' ;

		if (file_exists($checkPath)) {


			//include 'studyboard.html';
			include $html;

			// add js for load page
			$lessonUri = $_GET['lesson'];
			echo "<script>";
			echo "startLesson('$lessonUri');";
			echo "</script>";

		} else {
			echo "ERROR 404:01 - Page not found <br />";
		}
	
	} else {
		echo "ERROR 404:02 - Page not found";
	}

} else {
    echo "ERROR 404:02 - Page not found";
}

?>
