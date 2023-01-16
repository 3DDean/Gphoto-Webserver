A WebServer for controlling a camera with Gphoto.

It should be fairly trivial to run, but if you have issues that's what the issues are for. You will need to build Gphoto2-Daemon

Currently it can create a html element based on a widget file and can set the values from a widget value file. IDK why I did that, but the files are generated from the daemon

Unsure about licensing due to the use of docker-php-nginx. I would like my code to be LGPL-2.1, but I don't think this is far enough along to really warrant that discussion. 

Daemon dependency 
https://github.com/3DDean/Gphoto2-Daemon.git

Docker Base
https://github.com/TrafeX/docker-php-nginx