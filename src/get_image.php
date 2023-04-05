<?php
	$json = file_get_contents('php://input');
	
	$image_file_path = '/var/gphoto_daemon/cameras/images/' . $_GET["image"];;

	$img = imagecreatefromjpeg($image_file_path) or die("failed to load image " . $image_file_path);
	header('Content-Type: image/jpeg');

	imagejpeg($img);
	imagedestroy($img);
?>
