
function get_back(array) {
	return array[array.length - 1];
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
	get_next_line() {
		this.next();
		return this.get_line();
	}
};

class gphoto_widget_helper {
	constructor(camera_str, widget_text) {
		//inverse of the format_string widget_formatter located in GPhotoDeamon gphoto-widget.h 
		const widget_regex = /(\s*)\"(.+)\", \"(.*)\", \"(.*)\", (\d+), (\w), (\w), (\w+)/;
		const [whole, indent, human_name, internal_name, tooltip, id, readonly, changed, type] = widget_text.match(widget_regex);
		this.html_name = internal_name
		// this.whole = whole;
		this.indent = indent.length;
		this.human_name = human_name;
		this.server_name = internal_name;
		this.tooltip = tooltip;
		this.id = id;

		this.readonly = readonly == "0" ? false : true;
		this.changed = changed == "0" ? false : true;
		this.type = type;
	}
};

function get_sub_elements(text) {
	return text.replaceAll(/^\s+"|"$/g, '').split(/", "/g);
}

//Not yet working
function get_option_elements(parent, text) {
	var elements = get_sub_elements(text);
	for (i = 0; i < elements.length; i++) {
		var option = document.createElement("option")
		option.setAttribute("Value", i)
		option.setAttribute("label", elements[i][1])
		parent.appendChild(option)
	}
}

function create_radio_group(html_name, text) {
	var element = document.createElement("fieldset");
	// new_input_element("radio");
	var options = get_sub_elements(text)
	// text.replace(/^\s+/, '').split(/", "/g);
	// [...text.matchAll(/"(.+?)"/g)];
	var html_group = html_name + "Group"
	for (i = 0; i < options.length; i++) {
		var option_text = options[i];
		var element_name = html_group + option_text;
		var option = new_input_element("radio")
		option.setAttribute("Value", i)
		option.setAttribute("label", option_text)
		option.setAttribute("id", html_group + option_text)
		// option.setAttribute("name", html_name)
		option.name = html_group
		// parent.appendChild()
		var label = document.createElement("label");
		label.setAttribute("for", element_name);
		label.appendChild(document.createTextNode(option_text));

		element.appendChild(label)
		element.appendChild(option)
	}
	return element;
	// get_radio_option_elements(element, html_name, config_text.get_next_line());
}

class tab_book extends HTMLDivElement {
	constructor(human_name) {
		super()
		var header_element = document.createElement("h3")

		header_element.appendChild(document.createTextNode(human_name))

		this.className = "tab_book";
		this.header_element = header_element;

		document.body.appendChild(header_element)
		document.body.appendChild(this)
		// this.divider = human_name;
		// stack.push(this.divider);
		// this.children = [];
	}

	setActiveTab(tab_obj) {
		this.open_tab.setInactive()
		this.open_tab = tab_obj
	}

	appendChild(child) {
		if (typeof this.open_tab == 'undefined') {
			this.open_tab = child
			this.open_tab.setActive();
		}
		super.appendChild(child)
	}
}
customElements.define('tab-book', tab_book, { extends: 'div' });

class tab_page extends HTMLButtonElement {
	constructor(parent, human_text) {
		super()
		this.className = "tab_page";
		this.onclick = this.onClickFunc;
		this.appendChild(document.createTextNode(human_text));

		var divider = document.createElement("div");
		divider.className = "tab_content"
		divider.style.display = "none";
		document.body.appendChild(divider)

		this.divider = divider;
		this.parent = parent;
	}

	onClickFunc() {
		this.parent.setActiveTab(this)
		this.setActive()
	}

	setActive() {
		this.divider.style.display = "block"
		this.className = "tab_content.active"
	}

	setInactive() {
		this.divider.style.display = "none"
		this.className = "tab_content"
	}
}
customElements.define('tab-page', tab_page, { extends: 'button' });

function set_attributes(element, attributes) {
	for (const [key, value] of attributes) {
		element.setAttribute(key, value)
	}
}

function create_text_widget() {
	var element = document.createElement("input");
	element.setAttribute("type", "text");

	element.set_widget_value = function (element, value) {
		element.setAttribute("value", value)
	}

	return element;
}

function create_toggle_widget() {
	var element = document.createElement("input");
	element.setAttribute("type", "checkbox");

	element.set_widget_value = function (element, value) {
		element.checked = value == "1"
	}

	return element;
}

function create_button_widget() {
	var element = document.createElement("input");
	element.setAttribute("type", "button");

	element.set_widget_value = function (element, value) { }

	return element;
}
function create_date_widget() {
	var element = document.createElement("input");
	element.setAttribute("type", "date");

	//This isn't working
	element.set_widget_value = function (element, value) {
		var d = new Date(0);
		d.setUTCSeconds(value);
		element.setAttribute("value", d.toString())
	}

	return element;
}

function create_range_widget(text) {
	var element = document.createElement("input");
	element.setAttribute("type", "range");

	let [min, max, step] = text.match(/(\d+), (\d+), (\d+)/);
	set_attributes(
		element,
		[
			["min", min],
			["max", max],
			["step", step]
		]
	);

	element.set_widget_value = function (element, value) {
	}

	return element;
}

function create_radio_widget(html_name, text) {
	var element = document.createElement("fieldset");

	var html_group = html_name + "_option_"
	var index = 0
	for (const option_text of get_sub_elements(text)) {
		var element_name = html_group + index;
		var radio_button = document.createElement("input");
		set_attributes(
			radio_button,
			[
				["type", "radio"],
				["value", index],
				["label", option_text],
				["id", element_name],
				["name", html_group]
			]
		);

		var label = document.createElement("label");
		label.setAttribute("for", element_name);
		label.appendChild(document.createTextNode(option_text));

		element.appendChild(label)
		element.appendChild(radio_button)
		index++
	}

	element.set_widget_value = function (element, value) {
		if (value >= 0) {
			element.children[value * 2 + 1].checked = true;
		}
	}

	return element;
}

function create_menu_widget(text) {
	var element = document.createElement("select");

	var index = 0
	for (const option_text of get_sub_elements(text)) {
		var option = document.createElement("option")
		option.setAttribute("value", index)
		option.setAttribute("label", option_text)
		element.appendChild(option)
		index++
	}

	element.set_widget_value = function (element, value) {
		this.children[value].setAttribute("selected", true)
	}

	return element;
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
		//TODO implement value loading

		while (config_text.next()) {
			const widget = new gphoto_widget_helper(camera_name, config_text.get_line());
			const html_name = widget.server_name;
			var element;
			var skip_finilization = false;

			if (indent > widget.indent) {
				stack.pop();
			}
			indent = widget.indent;
			var stack_top = get_back(stack)
			if (widget.html_name != "") {

				switch (widget.type) {
					case "window":
						element = new tab_book(widget.human_name)
						stack.push(element)

						skip_finilization = true;
						break;
					/**< \brief Section widget (think Tab) */
					case "section":
						element = new tab_page(stack_top, widget.human_name)
						stack_top.appendChild(element)
						stack.push(element.divider)

						skip_finilization = true;
						break;
					/**< \brief Text widget. */
					case "text":
						element = create_text_widget()
						break;
					/**< \brief Slider widget. */
					case "range":
						element = create_range_widget(config_text.get_next_line())
						break;
					/**< \brief Toggle widget (think check box) */
					case "toggle":
						element = create_toggle_widget("checkbox");
						break;
					/**< \brief Radio button widget. */
					case "radio":
						element = create_radio_widget(html_name, config_text.get_next_line())
						break;
					/**< \brief Menu widget (same as RADIO). */
					case "menu":
						element = create_menu_widget(config_text.get_next_line())
						break;
					/**< \brief Button press widget. */
					case "button":
						element = create_button_widget()
						break;
					/**< \brief Date entering widget. */
					case "date":
						element = create_date_widget()
						break;
					default:
						throw Error("Unrecognized Gphoto Widget");
				}

				element.setAttribute("id", html_name);
				element.setAttribute("label", widget.tooltip);
				element.setAttribute("name", widget.server_name);

				if (!skip_finilization) {

					var label_text = document.createTextNode(widget.human_name);

					var label = document.createElement("label");
					label.setAttribute("for", html_name);
					label.appendChild(label_text);

					var divider = document.createElement("div");

					divider.appendChild(label);
					divider.appendChild(element);

					get_back(stack).appendChild(divider);
				}
				this.elements.push(element);
			}
		}
	}

	load_values(text) {
		var value_text = new file_processor(text);

		do {
			var match = value_text.get_line().match(/(\w*)\s(.*)/)
			if (match) {
				var [whole, index, value] = match
				if (index.length != 0) {
					var element = document.getElementById(index)
					element.set_widget_value(element, value)
				}
			}
		}
		while (value_text.next())
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

			ajax_config.onreadystatechange = function () {
				if (ajax_config.readyState === 4) {
					camera_config_gui.load_values(ajax_config.response)
				}
			}
			ajax_config.open("GET", "gphoto_values.php", true);
			ajax_config.send();
		}
	}
	ajax_config.open("GET", "gphoto_config.php", true);
	ajax_config.send();




}
