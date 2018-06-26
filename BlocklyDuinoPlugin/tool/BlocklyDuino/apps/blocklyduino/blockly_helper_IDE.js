/**
 * Execute the user's code.
 * Just a quick and dirty eval.  No checks for infinite loops, etc.
 */
function runJS() {
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  try {
    eval(code);
  } catch (e) {
    alert('Program error:\n' + e);
  }
}

/**
 * Backup code blocks to localStorage.
 */
function backup_blocks() {
  if ('localStorage' in window) {
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    window.localStorage.setItem('arduino', Blockly.Xml.domToText(xml));
  }
}

/**
 * Restore code blocks from localStorage.
 */
function restore_blocks() {
  if ('localStorage' in window && window.localStorage.arduino) {
    var xml = Blockly.Xml.textToDom(window.localStorage.arduino);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  }
}

/**
* Save Arduino generated code to local file.
*/
function saveCode() {
	var data = Blockly.Arduino.workspaceToCode();
	var datenow = Date.now();
//NBR	  var uri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data);  
	var uri = 'data:text/ino;charset=utf-8,' + encodeURIComponent(data); // NBR: set INO as data type to force the browser to propose to load directly the code into the arduino IDE
	if (BlocklyDuinoServer){
        BlocklyDuinoServer.saveCode(data);
		} else {
            console.log("Server problem");
	}
}

/**
 * Save blocks to local file.
 * better include Blob and FileSaver for browser compatibility
 */
function save() {
	var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
	
	var data = Blockly.Xml.domToPrettyText(xml);
    BlocklyDuinoServer.IDEsaveXML(data);	
}

/**
 * Load blocks from local file.
 */
function load(event) {
	var xml = "";
	try {
		if (BlocklyDuinoServer) {
			xml = Blockly.Xml.textToDom(BlocklyDuinoServer ? BlocklyDuinoServer.IDEloadXML() : localStorage.workspaceXml);
			Blockly.mainWorkspace.clear();
			}
		} catch (e) {
        alert('Error parsing XML:\n' + e);
        return;
		}
	var count = Blockly.mainWorkspace.getAllBlocks().length;
	Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
	BlocklyDuino.renderContent();
}

/**
 * Discard all blocks from the workspace.
 */
function discard() {
  var count = Blockly.mainWorkspace.getAllBlocks().length;
  if (count < 2 || window.confirm('Delete all ' + count + ' blocks?')) {
    Blockly.mainWorkspace.clear();
    renderContent();
  }
}

/**
 * Bind an event to a function call.
 * @param {!Element} element Element upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {!Function} func Function to call when event is triggered.
 *     W3 browsers will call the function with the event object as a parameter,
 *     MSIE will not.
 */
function bindEvent(element, name, func) {
  if (element.addEventListener) {  // W3C
    element.addEventListener(name, func, false);
  } else if (element.attachEvent) {  // IE
    element.attachEvent('on' + name, func);
  }
}

//loading examples via ajax
var ajax;
function createAJAX() {
  if (window.ActiveXObject) { //IE
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        return new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e2) {
        return null;
      }
    }
  } else if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    return null;
  }
}

function onSuccess() {
  if (ajax.readyState == 4) {
    if (ajax.status == 200) {
      try {
      var xml = Blockly.Xml.textToDom(ajax.responseText);
      } catch (e) {
        alert('Error parsing XML:\n' + e);
        return;
      }
      var count = Blockly.mainWorkspace.getAllBlocks().length;
      if (count && confirm('Replace existing blocks?\n"Cancel" will merge.')) {
        Blockly.mainWorkspace.clear();
      }
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
    } else {
      alert("Server error");
    }
  }
}

function load_by_url(uri) {
  ajax = createAJAX();
  if (!ajax) {
　　   alert ('Not compatible with XMLHttpRequest');
　　   return 0;
　  }
  if (ajax.overrideMimeType) {
    ajax.overrideMimeType('text/xml');
  }

　　ajax.onreadystatechange = onSuccess;
　　ajax.open ("GET", uri, true);
　　ajax.send ("");
}

function uploadCode(code, callback) {
	if (!window.BlocklyDuinoServer) {
		BlocklyDuinoServer = false;
		}
	if ((typeof BlocklyDuinoServer) != 'undefined' && BlocklyDuinoServer){
        BlocklyDuinoServer.uploadCode(code);
    }	
}

function uploadClick() {
    var code = Blockly.Arduino.workspaceToCode();

    alert("Ready to upload to Arduino.");
    
    uploadCode(code);
}

function resetClick() {
    var code = "void setup() {}\n\n void loop() {}";

    uploadCode(code, function(status, errorInfo) {
        if (status != 200) {
            alert("Error resetting program: " + errorInfo);
        }
    });
}
