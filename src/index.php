<?php
define('LBASE_DIR', dirname(__FILE__));

define('USERLEVEL_FILE', 'userLevel');
define('USERLEVEL_MIN', '0');
define('USERLEVEL_MINP', '2'); //minimum+preview
define('USERLEVEL_MEDIUM', '3');
define('USERLEVEL_MAX', '6');

function getUser()
{
    $serverSoftware = $_SERVER['SERVER_SOFTWARE'];
    if (stripos($serverSoftware, 'apache') !== false) {
        $user = apache_getenv("REMOTE_USER");
    } else if (stripos($serverSoftware, 'nginx') !== false) {
        try {
            $user = $_SERVER['REMOTE_USER'];
        } catch (Exception $e) {
            $user = '';
        }
    } else {
        $user = '';
    }
    return $user;
}

function getUserLevel($user)
{
    global $userLevels, $userInit;
    if (strlen($user) == 0) {
        return USERLEVEL_MAX;
    } else if (file_exists(LBASE_DIR . '/' . USERLEVEL_FILE)) {
        //Initialise userLevels array if possible
        if ($userInit == 0) {
            $userInit = 1;
            $lines = array();
            $data = file_get_contents(LBASE_DIR . '/' . USERLEVEL_FILE);
            $lines = explode("\n", $data);
            foreach ($lines as $line) {
                if (strlen($line)) {
                    $index = strpos($line, ':');
                    if ($index !== false) {
                        $userLevels[substr($line, 0, $index)] = substr($line, $index + 1);
                    }
                }
            }
        }
        if (array_key_exists($user, $userLevels))
            return $userLevels[$user];
        else
            return USERLEVEL_MIN;
    } else
        return USERLEVEL_MAX;
}

function getDisplayStyle($context, $userLevel)
{
    global $Simple;
    if ($Simple == 1) {
        echo 'style="display:none;"';
    } else {
        switch ($context) {
            case 'navbar':
                if ((int)$userLevel < (int)USERLEVEL_MEDIUM)
                    echo 'style="display:none;"';
                break;
            case 'preview':
                if ((int)$userLevel < (int)USERLEVEL_MINP)
                    echo 'style="display:none;"';
                break;
            case 'actions':
                if ((int)$userLevel < (int)USERLEVEL_MEDIUM)
                    echo 'style="display:none;"';
                break;
            case 'settings':
                if ((int)$userLevel != (int)USERLEVEL_MAX)
                    echo 'style="display:none;"';
                break;
        }
    }
}

// function user_buttons()
// {
//     $buttonString = "";
//     $buttonCount = 0;
//     if (file_exists("userbuttons")) {
//         $lines = array();
//         $data = file_get_contents("userbuttons");
//         $lines = explode("\n", $data);
//         foreach ($lines as $line) {
//             if (strlen($line) && (substr($line, 0, 1) != '#') && $buttonCount < 12) {
//                 $index = explode(",", $line);
//                 if ($index !== false) {
//                     $buttonName = $index[0];
//                     $macroName = $index[1];
//                     $className = $index[2];
//                     if ($className == false) {
//                         $className = "btn btn-primary";
//                     }
//                     if (count($index) > 3) {
//                         $otherAtt  = $index[3];
//                     } else {
//                         $otherAtt  = "";
//                     }
//                     $buttonString .= '<input id="' . $buttonName . '" type="button" value="' . $buttonName . '" onclick="send_cmd(' . "'sy " . $macroName . "'" . ')" class="' . $className . '" ' . $otherAtt . '>' . "\r\n";
//                     $buttonCount += 1;
//                 }
//             }
//         }
//     }
//     if (strlen($buttonString)) {
//         echo '<div class="container-fluid text-center">' . $buttonString . "</div>\r\n";
//     }
// }

$user = getUser();
$userLevel =  getUserLevel($user);


?>
<html>
<head>
    <title>PHP Test</title>
    <script src="js/gphoto2.js"></script>
</head>

<body onload="setTimeout('init();', 0);"> 
      <div class="navbar navbar-inverse navbar-fixed-top" role="navigation" <?php getdisplayStyle('navbar', $userLevel); ?>>
      </div>
	<img id="preview_image" src="capture_result.php" alt="Last Capture" height="400">
    <div id="main-buttons">
		
		<input id="capture_preview" type="button" value="capture_preview" onclick="capture_preview()">
		<input id="single_capture" type="button" value="capture_image" onclick="capture_image()">
		<input id="timelapse_capture" type="button" value="capture timelapse" onclick="capture_timelapse()">

		<label for="timelapse_delay">Timelapse Delay (in seconds):</label>
		<input type="number" id="timelapse_delay" name="timelapse_delay" min="0.1" step="1" value="1">
	
	</div>
</body>

</html>