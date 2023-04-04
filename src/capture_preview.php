<?php
	$image_path = '/var/gphoto_deamon';
	header('Content-Type: image/jpeg');
	readfile($image_path);
?>
