
function get_back(array)
{
	return array[array.length];
}

function new_input_element(type) {
	var element = document.createElement("input");
	element.setAttribute("type", type);
	return element;
}

class file_processor {
	constructor(text) {
		const unfiltered_lines = text.split(/\n/g);
		this.lines = unfiltered_lines.filter(word => word != '');		

		this.index = 0;
	}
	get_line() {
		if (this.index < this.lines.length) {
			return this.lines[this.index];
		}
		else {
			throw Error('Array Overflow');
		}
	}
	next() {
		this.index += 1;
		return this.lines.length > this.index;
	}
	get_next_line()
	{
		this.next();
		return this.get_line();
	}
};

class gphoto_widget {
	constructor(widget_text) {
		//inverse of the format_string widget_formatter located in GPhotoDeamon gphoto-widget.h 
		const widget_regex = /(\s*)\"(.+)\", \"(.*)\", \"(.*)\", (\d+), (\w), (\w), (\w+)/;
		const [whole, indent, human_name, internal_name, tooltip, id, readonly, changed, type] = widget_text.match(widget_regex);

		// this.whole = whole;
		this.indent = indent.length;
		this.human_name = human_name;
		this.name = internal_name;
		this.tooltip = tooltip;
		this.id = id;

		this.readonly = readonly == "0" ? false : true;
		this.changed = changed  == "0" ? false : true;
		this.type = type;
	}
};

function get_option_elements(paranet, text)
{
	var elements = text.matchAll(/"(.+)(, )?"/g);
	for (i = 0; i < elements.length; i++)
	{
		option = document.createElement("option")
		option.setAttribute("Value", i)
		option.setAttribute("label", elements[i][1])
	}
}

function get_range_elements(paranet, text)
{
	var [min, max, step] = text.match(/(\d+), (\d+), (\d+)/);
	element.setAttribute("min", min);
	element.setAttribute("max", max);
	element.setAttribute("step", step);
}

class camera_config {
	constructor(text) {
		var config_text = new file_processor(text);

		const camera_name = config_text.get_line();
		this.elements = [];
		var stack = [];
		var indent = 0;
		//TODO implement readonly element alternatives
		//TODO improve formating, probably into a table
		//TODO implement tabing for tab_pages
		while (config_text.next()) {
			const widget = new gphoto_widget(config_text.get_line());
			const html_name = camera_name + widget.id;
			var element;

			// if(indent > widget.indent){
			// 	stack.pop();
			// }
			// indent = widget.indent;

			switch (widget.type) {
				case "window":
					element = document.createElement("div");
					element.className = "tab_book";
					element.data_name = widget.human_name;
					stack.push(element);
					// document.body.appendChild(element)

					break;
				/**< \brief Section widget (think Tab) */
				case "section":
					element = document.createElement("button");
					element.className = "tab_page";
					
					element.appendChild(document.createTextNode(widget.human_name));
					// stack.push(element);
					break;
				/**< \brief Text widget. */
				case "text":
					element = new_input_element("text");
					break;
				/**< \brief Slider widget. */
				case "range":
					element = new_input_element("range");
					get_range_elements(config_text.get_next_line());
					break;
				/**< \brief Toggle widget (think check box) */
				case "toggle":
					element = new_input_element("checkbox");
					break;
				/**< \brief Radio button widget. */
				case "radio":
					element = new_input_element("radio");
					get_option_elements(element, config_text.get_next_line());
					break;
				/**< \brief Menu widget (same as RADIO). */
				case "menu":
					element = document.createElement("select");
					get_option_elements(element, config_text.get_next_line());
					break;
				/**< \brief Button press widget. */
				case "button":
					element = new_input_element("button");
					break;
				/**< \brief Date entering widget. */
				case "date":
					element = new_input_element("date");
					break;
				default:
					throw Error("Unrecognized Gphoto Widget");
			}

			element.setAttribute("id", html_name);
			element.setAttribute("label", widget.tooltip);
			element.setAttribute("name", widget.name);
			element.setAttribute("readonly", widget.readonly);

			// this.indent = indent;

			// this.readonly = readonly;
			// this.changed = changed;

			var label_text = document.createTextNode(widget.human_name);

			var label = document.createElement("label");
			label.setAttribute("for", html_name);
			label.appendChild(label_text);

			var divider = document.createElement("div");

			divider.appendChild(label);
			divider.appendChild(element);
			
			// get_back(stack).appendChild(divider);

			document.body.appendChild(divider)

			this.elements.push(element);
		}
	}
};

//
// Ajax Commands
//
var ajax_cmd;

if (window.XMLHttpRequest) {
	ajax_cmd = new XMLHttpRequest();
}
else {
	ajax_cmd = new ActiveXObject("Microsoft.XMLHTTP");
}

// function encodeCmd(s) {
//    return s.replace(/&/g,"%26").replace(/#/g,"%23").replace(/\+/g,"%2B");
// }

function send_cmd(cmd) {
	ajax_cmd.open("GET", "gphoto_pipe.php", true);
	ajax_cmd.send(encodeCmd(cmd));
}// Get the JSON contents

function update_preview_delay() {
	var video_fps = parseInt(document.getElementById("video_fps").value);
	var divider = parseInt(document.getElementById("divider").value);
	preview_delay = Math.floor(divider / Math.max(video_fps, 1) * 1000000);
}

//
// Init
//
function init() {
	var ajax_config;
	var camera_config_gui;
	if (window.XMLHttpRequest) {
		ajax_config = new XMLHttpRequest();
	}
	else {
		ajax_config = new ActiveXObject("Microsoft.XMLHTTP");
	}

	ajax_config.onreadystatechange = function () {
		if (ajax_config.readyState === 4) {
			camera_config_gui = new camera_config(ajax_config.response);
			//init_camera_config();
		}
	}

	ajax_config.open("GET", "gphoto_config.php", true);
	ajax_config.send();
}
