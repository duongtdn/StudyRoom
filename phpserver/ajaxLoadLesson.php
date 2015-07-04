<?php

// sendback json to AJAX
if (isset($_POST['jsonUri'])) {
    echo file_get_contents($_POST['jsonUri']);
} else {
    echo 'ERROR Loading file';
}

?>
