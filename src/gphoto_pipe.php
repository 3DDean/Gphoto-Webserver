<?php
   define('BASE_DIR', dirname(__FILE__));

   function send_command($contents)
   {
		$pipe = fopen("/var/gphoto_daemon/gphoto2.pipe","w");
		if (!$pipe) {
			echo posix_get_last_error();
			die(errno);
		}

		fwrite($pipe, $contents);
		fclose($pipe);
   }
//    require_once(BASE_DIR.'/config.php');
 
//    $next = posix_kill($pid3, 10);
?>
