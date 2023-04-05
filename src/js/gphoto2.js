
function get_back(array) {
	return array[array.length - 1];
}

function set_attributes(element, attributes) {
	for (const [key, value] of attributes) {
		element.setAttribute(key, value)
	}
}

function create_element(elementTagName, attributes) {
	let element = document.createElement(elementTagName)

	for (const [key, value] of attributes) {
		element.setAttribute(key, value)
	}
}

function create_label(targetName, text) {
	let label = document.createElement("label");
	label.setAttribute("for", targetName);
	label.textContent = text
	return label;
}

function get_sub_elements(text) {
	return (text.replaceAll(/^\s+"|"$/g, '').split(/", "/g)).entries();
}

//Not yet working
function get_option_elements(parent, text) {

	for (const [index, option_text] of get_sub_elements(text)) {
		let option = document.createElement("option")
		set_attributes(option,
			[
				["value", index],
				["label", option_text[index][1]]
			])

		parent.appendChild(option)
	}
}

const container = document.createElement('div');
container.id = 'CameraConfigContainer';

class file_processor {
	constructor(text) {
		const unfiltered_lines = text.split(/\n/g);
		this.lines = unfiltered_lines.slice().filter((line) => line.trim() !== '');

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

class tab_book extends HTMLDivElement {
	constructor(human_name) {
		super()
		let header_element = document.createElement("h3")

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

		let divider = document.createElement("div");
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

function create_radio_group(html_name, text) {
	let element = document.createElement("fieldset");

	let html_group = html_name + "Group"
	for (const [index, option_text] of get_sub_elements(text)) {
		// for (let i = 0; i < options.length; i++) {
		let element_name = html_group + option_text;
		let option = new_input_element("radio")

		set_attributes(
			option,
			[
				["value", index],
				["label", option_text],
				["id", html_group + option_text],
				["name", html_group]
			]
		);
		element.gphoto_name = html_name
		element.appendChild(create_label(element_name, option_text))
		element.appendChild(option)
	}
	return element;
}

function create_input_widget(typeStr, func) {
	let element = document.createElement("input");
	element.setAttribute("type", typeStr);
	element.set_widget_value = func

	return element;
}

function create_range_widget(text) {
	let element = document.createElement("input");

	let [min, max, step] = text.match(/(\d+), (\d+), (\d+)/);
	set_attributes(
		element,
		[
			["type", "range"],
			["min", min],
			["max", max],
			["step", step]
		]
	);

	element.set_widget_value = function (element, value) {
		element.value = value
	}

	return element;
}

function create_radio_widget(html_name, text) {
	let element = document.createElement("fieldset");

	let html_group = html_name + "_option_"

	for (const [index, option_text] of get_sub_elements(text)) {
		let element_name = html_group + index;
		let radio_button = document.createElement("input");
		set_attributes(
			radio_button,
			[
				["type", "radio"],
				["value", index],
				["label", option_text],
				["id", element_name],
				["name", html_group],
				["gphoto_name", html_name]
			]
		);
		radio_button.gphoto_name = html_name
		element.appendChild(create_label(element_name, option_text))
		element.appendChild(radio_button)
	}

	element.set_widget_value = function (element, value) {
		if (value >= 0) {
			element.children[value * 2 + 1].checked = true;
		}
	}

	return element;
}

function create_menu_widget(text) {
	let element = document.createElement("select");

	for (const [index, option_text] of get_sub_elements(text)) {
		let option = document.createElement("option")
		set_attributes(option,
			[
				["value", index],
				["label", option_text]
			])
		element.appendChild(option)
	}

	element.set_widget_value = function (element, value) {
		this.children[value].setAttribute("selected", true)
	}

	return element;
}

function handleEvent(e) {
	console.log(`${e.type}: ${e.loaded} bytes transferred\n`);
}

function addListeners(xhr) {
	xhr.addEventListener('loadstart', handleEvent);
	xhr.addEventListener('load', handleEvent);
	xhr.addEventListener('loadend', handleEvent);
	xhr.addEventListener('progress', handleEvent);
	xhr.addEventListener('error', handleEvent);
	xhr.addEventListener('abort', handleEvent);
}

class camera_config {
	constructor(text) {
		if (text) {
			let config_text = new file_processor(text);

			const camera_name = config_text.get_line();
			this.elements = [];
			this.changedElements = new Map();;
			let stack = [];
			let indent = 0;
			//TODO implement readonly element alternatives
			//TODO improve formating, probably into a table
			//TODO implement tabing for tab_pages
			//TODO implement value loading

			while (config_text.next()) {
				const widget = new gphoto_widget_helper(camera_name, config_text.get_line());
				const html_name = widget.server_name;
				let element;
				let skip_finilization = false;

				if (indent > widget.indent) {
					stack.pop();
				}
				indent = widget.indent;
				let stack_top = get_back(stack)

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
						/**< \brief Slider widget. */
						case "range":
							element = create_range_widget(config_text.get_next_line())
							break;
						/**< \brief Radio button widget. */
						case "radio":
							element = create_radio_widget(html_name, config_text.get_next_line())
							break;
						/**< \brief Menu widget (same as RADIO). */
						case "menu":
							element = create_menu_widget(config_text.get_next_line())
							break;
						/**< \brief Text widget. */
						case "text":
							element =
								create_input_widget(
									"text",
									function (element, value) {
										element.setAttribute("value", value)
									}
								)
							break;
						/**< \brief Toggle widget (think check box) */
						case "toggle":
							element =
								create_input_widget(
									"checkbox",
									function (element, value) {
										element.checked = value == "1"
									}
								)
							break;
						/**< \brief Button press widget. */
						case "button":
							element =
								create_input_widget(
									"button",
									function (element, value) {

									}
								)
							break;
						/**< \brief Date entering widget. */
						case "date":
							element =
								create_input_widget(
									"date",
									function (element, value) {
										let d = new Date(0);
										d.setUTCSeconds(value);
										element.setAttribute("value", d.toString())
									}
								)
							break;
						default:
							throw Error("Unrecognized Gphoto Widget");
					}

					//TODO integrate readonly property
					set_attributes(element,
						[
							["id", html_name],
							["label", widget.tooltip],
							["name", widget.server_name]
						])
					element.gphoto_name = html_name

					if (!skip_finilization) {
						element.addEventListener("change", (event) => {
							this.changedElements.set(event.target.id, event.target);
						});

						let divider = document.createElement("div");

						divider.appendChild(create_label(html_name, widget.human_name));
						divider.appendChild(element);

						get_back(stack).appendChild(divider);
					}
					this.elements.push(element);
				}
			}

			const submitButton = document.createElement("button");
			submitButton.type = "submit";
			submitButton.textContent = "Submit";

			submitButton.addEventListener("click", (event) => {
				submitButton.disabled = true;

				let message = "";
				for (const [key, value] of this.changedElements) {
					if (value.value != value.current_camera_value) {
						message += value.gphoto_name + " " + value.value + "\n";
					}
				}
				addListeners(ajax_cmd);

				ajax_cmd.addEventListener('load', (event) => {
					if (ajax_cmd.status === 200) {
						for (const [key, value] of this.changedElements) {
							if (value.value != value.current_camera_value) {
								message += value.gphoto_name + " " + value.value + "\n";
							}
						}

						let response = ajax_cmd.responseText;

					} else {
						console.log('Error: ' + ajax_cmd.statusText);
					}
				});

				ajax_cmd.onreadystatechange = function () {
					if (ajax_cmd.readyState === 4) {
						// The request is complete, so reset the button
						submitButton.disabled = false;
					}
				}
				ajax_cmd.open("POST", "gphoto_pipe.php", true);
				ajax_cmd.setRequestHeader("Content-Type", "application/json");
				ajax_cmd.send(message);

				//Todo move this into a responce funciton
				this.changedElements.clear();
			}
			)

			submitButton.setAttribute("camera_config", this)
			document.body.appendChild(submitButton);
		}
	}

	load_values(text) {
		let value_text = new file_processor(text);

		do {
			let match = value_text.get_line().match(/(\w*)\s(.*)/)
			if (match) {
				let [whole, index, value] = match
				if (index.length != 0) {
					let element = document.getElementById(index)
					element.set_widget_value(element, value);
					element.setAttribute("current_camera_value", value);
				}
			}
		}
		while (value_text.next())
	}
};

function create_ajax_handle() {
	if (window.XMLHttpRequest) {
		return new XMLHttpRequest();
	}
	else {
		return new ActiveXObject("Microsoft.XMLHTTP");
	}
}

//
// Ajax Commands
//
let ajax_cmd = create_ajax_handle();
let ajax_capture = create_ajax_handle();

ajax_capture.onreadystatechange = function () {
	if (ajax_capture.readyState === 4) {
		// The request is complete, so reset the button
		let response_line = document.getElementById("Command_Response")
		let responseText = ajax_capture.response;
		response_line.textContent = responseText

		let capture = document.getElementById("preview_image")
		capture.src = window.location.href + 'get_image.php?image=' + responseText;
	}
}

function update_preview_delay() {
	let video_fps = parseInt(document.getElementById("video_fps").value);
	let divider = parseInt(document.getElementById("divider").value);
	preview_delay = Math.floor(divider / Math.max(video_fps, 1) * 1000000);
}

function send_command(ajax, cmd) {
	ajax.open("POST", "gphoto_command.php", true);
	ajax.setRequestHeader("Content-Type", "application/json");
	ajax.send(cmd);

}

function capture_preview() {
	send_command(ajax_capture ,"capture_preview");

}

function capture_image() {
	send_command(ajax_capture, "capture");
}

function capture_timelapse() {
	const delayInput = document.getElementById("timelapse_delay");
	send_command("capture_timelapse " + delayInput.value);
}

//
// Init
//
function init() {
	let ajax_config;
	let camera_config_gui;
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
