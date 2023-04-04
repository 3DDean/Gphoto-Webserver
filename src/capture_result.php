<?php
	$last_capture_file_path = '/var/gphoto_daemon/last_capture';
	$last_capture_file = fopen($last_capture_file_path,  "r") or die("Failed to open file");

	$image = fread($last_capture_file, filesize($last_capture_file_path));
	fclose($last_capture_file);

	$trimmed_image = trim($image);

	$image_file_path = '/var/gphoto_daemon/cameras/images/' . $trimmed_image;

	$img = imagecreatefromjpeg($image_file_path) or die("failed to load image " . $image_file_path);
	header('Content-Type: image/jpeg');

	imagejpeg($img);
	imagedestroy($img);
?>
