<?php
  // send content

  $file_content = "";
  for($i=0; $i<30; $i++) {
    $file_content = file_get_contents("/run/status_gphoto2.txt");
    if($file_content != $_GET["last"]) break;
    usleep(100000); //0.1 sec
  }

  touch("status_gphoto.txt");
  echo $file_content;

?>
