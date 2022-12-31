<?php
   define('BASE_DIR', dirname(__FILE__));
   require_once(BASE_DIR.'/config.php');
   $json = file_get_contents('php://input');
   
   $pipe = fopen("/run/gphoto2.pipe","w");

   // error_log($json);
   // error_log("Decoded Responce" . json_decode($json));

   fwrite($pipe, $json);
   fclose($pipe);
?>
