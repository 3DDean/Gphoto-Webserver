<?php
	include 'gphoto_pipe.php';

	$json = file_get_contents('php://input');

	send_command($json);
?>