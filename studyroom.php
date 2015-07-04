<?php

sleep(0);

// sendback json to AJAX
if (isset($_GET['lesson'])) {

    // evaluate the json
    // if could not found json file, return error page not found
    $checkPath = 'db/' . $_GET['lesson'] . '.json' ;

    if (file_exists($checkPath)) {


        include 'studyboard.html';

        // add js for load page
        $lessonUri = '../db/' . $_GET['lesson'] . '.json' ;
        echo "<script>";
        echo "startLesson('$lessonUri');";
        echo "</script>";

    } else {
        echo "ERROR 404:01 - Page not found";
    }

} else {
    echo "ERROR 404:02 - Page not found";
}

?>
