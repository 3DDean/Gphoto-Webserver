<?php
	include 'gphoto_pipe.php';
	include 'gphoto_status.php';

	$json = file_get_contents('php://input');

	send_command($json);
	$wait_result = wait_for_result();
	echo $wait_result;
?>
