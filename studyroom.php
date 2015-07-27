<?php

require "header.php";

sleep(0);

// sendback json to AJAX
if (isset($_GET['lesson'])) {

    // evaluate the json
    // if could not found json file, return error page not found
    $checkPath = $dbLesson . $_GET['lesson'] . '.json' ;

    if (file_exists($checkPath)) {


        include 'studyboard.html';

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

?>
