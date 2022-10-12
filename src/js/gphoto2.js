//
// Interface
//
var elem = document.documentElement;

// var ajax_config;

// if(window.XMLHttpRequest) {
//   ajax_config = new XMLHttpRequest();
// }
// else{
//   ajax_config = new ActiveXObject("Microsoft.XMLHTTP");
// }
// req.responseType = "arraybuffer";
// ajax_config.onload() = () => {
//   if(ajax_status.readyState == 4 && ajax_status.status == 200) {
//     const byteArray = ajax_status.response;

//   }
// };

// ajax_config.open("GET", "config.php", true);
// ajax_config.timeout = 1000;
// ajax_config.send();

function schedule_rows() {
   var sun, day, fixed, mode;
   mode = parseInt(document.getElementById("DayMode").value);
   switch(mode) {
      case 0: sun = 'table-row'; day = 'none'; fixed = 'none'; break;
      case 1: sun = 'none'; day = 'table-row'; fixed = 'none'; break;
      case 2: sun = 'none'; day = 'none'; fixed = 'table-row'; break;
      default: sun = 'table-row'; day = 'table-row'; fixed = 'table-row'; break;
   }
   var rows;
   rows = document.getElementsByClassName('sun');
   for(i=0; i<rows.length; i++) 
      rows[i].style.display = sun;
   rows = document.getElementsByClassName('day');
   for(i=0; i<rows.length; i++) 
      rows[i].style.display = day;
   rows = document.getElementsByClassName('fixed');
   for(i=0; i<rows.length; i++) 
      rows[i].style.display = fixed;
}

function set_preset(value) {
  var values = value.split(" ");
  document.getElementById("video_width").value = values[0];
  document.getElementById("video_height").value = values[1];
  document.getElementById("video_fps").value = values[2];
  document.getElementById("MP4Box_fps").value = values[3];
  document.getElementById("image_width").value = values[4];
  document.getElementById("image_height").value = values[5];
  document.getElementById("fps_divider").value = values[6];
  
  set_res();
}

function set_res() {
  send_cmd("px " + document.getElementById("video_width").value + " " + document.getElementById("video_height").value + " " + document.getElementById("video_fps").value + " " + document.getElementById("MP4Box_fps").value + " " + document.getElementById("image_width").value + " " + document.getElementById("image_height").value + " " + document.getElementById("fps_divider").value);
  update_preview_delay();
  updatePreview(true);
}

function set_ce() {
  send_cmd("ce " + document.getElementById("ce_en").value + " " + document.getElementById("ce_u").value + " " + document.getElementById("ce_v").value);
}

function set_preview() {
  send_cmd("pv " + document.getElementById("quality").value + " " + document.getElementById("width").value + " " + document.getElementById("divider").value);
  update_preview_delay();
}

function set_encoding() {
  send_cmd("qp " + document.getElementById("minimise_frag").value + " " + document.getElementById("initial_quant").value + " " + document.getElementById("encode_qp").value);
}

function set_roi() {
  send_cmd("ri " + document.getElementById("roi_x").value + " " + document.getElementById("roi_y").value + " " + document.getElementById("roi_w").value + " " + document.getElementById("roi_h").value);
}

function set_at() {
  send_cmd("at " + document.getElementById("at_en").value + " " + document.getElementById("at_y").value + " " + document.getElementById("at_u").value + " " + document.getElementById("at_v").value);
}

function set_ac() {
  send_cmd("ac " + document.getElementById("ac_en").value + " " + document.getElementById("ac_y").value + " " + document.getElementById("ac_u").value + " " + document.getElementById("ac_v").value);
}

function set_ag() {
  send_cmd("ag " + document.getElementById("ag_r").value + " " + document.getElementById("ag_b").value);
}

function send_macroUpdate(i, macro) {
  var macrovalue = document.getElementById(macro).value;
  if(!document.getElementById(macro + "_chk").checked) {
	  macrovalue = "-" + macrovalue;
  }
  send_cmd("um " + i + " " + macrovalue);
}

function hashHandler() {
  switch(window.location.hash){
    case '#full':
    case '#fullscreen':
      if (mjpeg_img !== null && document.getElementsByClassName("fullscreen").length == 0) {
        toggle_fullscreen(mjpeg_img);
      }
      break;
    case '#normal':
    case '#normalscreen':
      if (mjpeg_img !== null && document.getElementsByClassName("fullscreen").length != 0) {
        toggle_fullscreen(mjpeg_img);
      }
      break;
  }
}


//
// MJPEG
//
var mjpeg_img;
var halted = 0;
var previous_halted = 99;
var mjpeg_mode = 0;
var preview_delay = 0;
var btn_class_p = "btn btn-primary"
var btn_class_a = "btn btn-warning"
var btn_class_u = null;

const btn_enable = false;
const btn_disable = true;
function reload_img () {
  if(!halted) mjpeg_img.src = "cam_pic.php?time=" + new Date().getTime() + "&pDelay=" + preview_delay;
  else setTimeout("reload_img()", 500);
}

function error_img () {
  setTimeout("mjpeg_img.src = 'cam_pic.php?time=' + new Date().getTime();", 100);
}

// function updatePreview(cycle)
// {
//    if (mjpegmode)
//    {
//       if (cycle !== undefined && cycle == true)
//       {
//          mjpeg_img.src = "/updating.jpg";
//          setTimeout("mjpeg_img.src = \"cam_pic_new.php?time=\" + new Date().getTime()  + \"&pDelay=\" + preview_delay;", 1000);
//          return;
//       }
      
//       if (previous_halted != halted)
//       {
//          if(!halted)
//          {
//             mjpeg_img.src = "cam_pic_new.php?time=" + new Date().getTime() + "&pDelay=" + preview_delay;			
//          }
//          else
//          {
//             mjpeg_img.src = "/unavailable.jpg";
//          }
//       }
// 	previous_halted = halted;
//    }
// }


class ButtonObject
{
  constructor(id, cmd)
  {
    this.id = id;
    // this.cmd = cmd;
    // this.label = label;
  }
  setState( label, cmd, disabled, btn_class)
  {
   var btn = document.getElementById(this.id);
    btn.disabled = disabled;
    btn.value = label;
    btn.className = btn_class;
    if (cmd !== null) btn.onclick = function() {send_cmd(cmd);};
  }
};

var image_button = new ButtonObject("image_button", "im");
var timelapse_button = new ButtonObject("timelapse_button", "tl");
var video_button = new ButtonObject("video_button", "ca");
var md_button = new ButtonObject("md_button", "md");
var halt_button = new ButtonObject("halt_button", "ru");

//
// Ajax Status
//
var ajax_status;
if(window.XMLHttpRequest) {
  ajax_status = new XMLHttpRequest();
}
else {
  ajax_status = new ActiveXObject("Microsoft.XMLHTTP");
}

function setButtonState(btn_id, disabled, value, cmd=null) {
  btn = document.getElementById(btn_id);
  btn.disabled = disabled;
  btn.value = value;
  if (cmd !== null) btn.onclick = function() {send_cmd(cmd);};
}

ajax_status.onreadystatechange = function() {
  if(ajax_status.readyState == 4 && ajax_status.status == 200) {

    if(ajax_status.responseText == "ready") {
      video_button.setState("record video start", "ca 1", btn_enable,  btn_class_u);
      image_button.setState("capture image", "im", btn_enable,  btn_class_u);
      timelapse_button.setState("start timelapse", "tl 1", btn_enable,  btn_class_u);
      md_button.setState("motion detection start", "md 1", btn_enable,  btn_class_u);
      halt_button.setState("stop camera", "ru 0", btn_enable,  btn_class_u);
      halted = 0;
    }
    else if(ajax_status.responseText == "md_ready") {
      video_button.setState("record video start", null, btn_disable,  btn_class_u);
      image_button.setState("record image", "im", btn_enable,  btn_class_u);
      timelapse_button.setState("timelapse start", "tl 1", btn_enable,  btn_class_u);
      md_button.setState("motion detection stop", "md 0", btn_enable,  btn_class_u);
      halt_button.setState("stop camera", null, btn_disable, btn_class_u);
      halted = 0;
    }
    else if(ajax_status.responseText == "timelapse") {
      video_button.setState("record video start", "ca 1", btn_enable,  btn_class_u);
      image_button.setState("record image", null, btn_disable,  btn_class_u);
      timelapse_button.setState("timelapse stop", "tl 0", btn_enable,  btn_class_u);
      md_button.setState("motion detection start", null, btn_disable,  btn_class_u);
      halt_button.setState("stop camera", null, btn_disable,  btn_class_u);
    }
    else if(ajax_status.responseText == "tl_md_ready") {
      video_button.setState("record video start", null, btn_disable,  btn_class_u);
      image_button.setState("record image", "im", btn_enable,  btn_class_u);
      timelapse_button.setState("timelapse stop", "tl 0", btn_enable,  btn_class_u);
      md_button.setState("motion detection stop", "md 0", btn_enable,  btn_class_u);
      halt_button.setState("stop camera", null, btn_disable,  btn_class_u);
      halted = 0;
    }
    else if(ajax_status.responseText == "video") {
      video_button.setState("record video stop", "ca 0", btn_enable,  btn_class_u);
      image_button.setState("record image", "im", btn_enable,  btn_class_u);
      timelapse_button.setState("timelapse start", "tl 1", btn_enable,  btn_class_u);
      md_button.setState("motion detection start", null, btn_disable,  btn_class_u);
      halt_button.setState("stop camera", null, btn_disable,  btn_class_u);
    }
    else if(ajax_status.responseText == "md_video") {
      video_button.setState("record video stop", null, btn_disable,  btn_class_u);
      image_button.setState("record image", "im", btn_enable,  btn_class_u);
      timelapse_button.setState("timelapse start", "tl 1", btn_enable,  btn_class_u);
      md_button.setState("recording video...", null, btn_disable,  btn_class_u);
      halt_button.setState("stop camera", null, btn_disable,  btn_class_u);
    }
    else if(ajax_status.responseText == "tl_video") {
      video_button.setState("record video stop", "ca 0", btn_enable,  btn_class_u);
      image_button.setState("record image", null, btn_disable,  btn_class_u);
      timelapse_button.setState("timelapse stop", "tl 0", btn_enable,  btn_class_u);
      md_button.setState("motion detection start", null, btn_disable,  btn_class_u);
      halt_button.setState("stop camera", null, btn_disable,  btn_class_u);
    }
    else if(ajax_status.responseText == "tl_md_video") {
      video_button.setState("record video stop", "ca 0", btn_enable,  btn_class_u);
      image_button.setState("record image", null, btn_disable,  btn_class_u);
      timelapse_button.setState("timelapse stop", "tl 0", btn_enable,  btn_class_u);
      md_button.setState("recording video...", null, btn_disable,  btn_class_u);
      halt_button.setState("stop camera", null, btn_disable,  btn_class_u);
    }
    else if(ajax_status.responseText == "image") {
      video_button.setState("record video start", null, btn_disable,  btn_class_u);
      image_button.setState("recording image", null, btn_disable,  btn_class_u);
      timelapse_button.setState("timelapse start", null, btn_disable,  btn_class_u);
      md_button.setState("motion detection start", null, btn_disable,  btn_class_u);
      halt_button.setState("stop camera", null, btn_disable,  btn_class_u);
    }
    else if(ajax_status.responseText == "halted") {
      video_button.setState("record video start", null, btn_disable,  btn_class_u);
      image_button.setState("record image", null, btn_disable,  btn_class_u);
      timelapse_button.setState("timelapse start", null, btn_disable,  btn_class_u);
      md_button.setState("motion detection start", null, btn_disable,  btn_class_u);
      halt_button.setState("start camera", "ru 1", btn_enable,  btn_class_u);
      halted = 1;
    }
    else if(ajax_status.responseText.substr(0,5) == "Error") alert("Error in RaspiMJPEG: " + ajax_status.responseText.substr(7) + "\nRestart RaspiMJPEG (./RPi_Cam_Web_Interface_Installer.sh start) or the whole RPi.");

	// updatePreview();
    reload_ajax(ajax_status.responseText);

  }
}

function reload_ajax (last) {
  ajax_status.open("GET","status_gphoto.php?last=" + last,true);
  ajax_status.send();
}

//
// Ajax Commands
//
var ajax_cmd;

if(window.XMLHttpRequest) {
  ajax_cmd = new XMLHttpRequest();
}
else {
  ajax_cmd = new ActiveXObject("Microsoft.XMLHTTP");
}

function encodeCmd(s) {
   return s.replace(/&/g,"%26").replace(/#/g,"%23").replace(/\+/g,"%2B");
}

function send_cmd (cmd) {
  ajax_cmd.open("GET","gphoto_pipe.php?cmd=" + encodeCmd(cmd),true);
  ajax_cmd.send();
}

function update_preview_delay() {
   var video_fps = parseInt(document.getElementById("video_fps").value);
   var divider = parseInt(document.getElementById("divider").value);
   preview_delay = Math.floor(divider / Math.max(video_fps,1) * 1000000);
}

//
// Init
//
function init(mjpeg, video_fps, divider) {
  // mjpeg_img = document.getElementById("mjpeg_dest");
  // hashHandler();
  // window.onhashchange = hashHandler;
  // preview_delay = Math.floor(divider / Math.max(video_fps,1) * 1000000);
  // if (mjpeg) {
  //   mjpegmode = 1;
  // } else {
  //    mjpegmode = 0;
  //    mjpeg_img.onload = reload_img;
  //    mjpeg_img.onerror = error_img;
  //    reload_img();
  // }
  reload_ajax("");
}
