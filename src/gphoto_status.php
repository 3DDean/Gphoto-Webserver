<?php

	function wait_for_result()
	{
		$statusFilePath = "/var/gphoto_daemon/status_gphoto2.txt";

		for ($x = 0; $x <= 10; $x++)
		{
			sleep(1);
			$status_contents = file_get_contents($statusFilePath);
			
			$content = array();
			preg_match('/(\w+)\s(.+)?/im', $status_contents, $content);
			if($content[1] == "finished")
			{
				return $content[2];
			}
			else if($content[1] == "error"){
				return $content[2];
			}
			
		}
		return "timeout";
	}
?>
