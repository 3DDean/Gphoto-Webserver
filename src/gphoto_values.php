<?php
  // send widget config
  //TODO scan file and send any loaded camera configs
  $file_content = file_get_contents("/var/gphoto_daemon/cameras/Canon EOS 1100D.values");
  echo $file_content;
?>