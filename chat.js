var wsUri = "ws://173.255.230.176:9000";
var output;

var youDiv = "<div class=\'youTag\'>You: </div>"
var strangerDiv = "<div class=\'strangerTag\'>Stranger: </div>"

function init() { 
	output = document.getElementById("chatContents"); 
	outputView = document.getElementById("chatWindow"); 
    testWebSocket(); 
    document.getElementById('textfield').select();
}  

function testWebSocket() {
	websocket = new WebSocket(wsUri); 
	websocket.onopen = function(evt) { onOpen(evt) }; 
	websocket.onclose = function(evt) { onClose(evt) }; 
	websocket.onmessage = function(evt) { onMessage(evt) }; 
	websocket.onerror = function(evt) { onError(evt) }; 
}  
	
function onOpen(evt) { 
	announce("Connected to the server! :D"); 
}  

function onClose(evt) { 
	announce("Disconnected from the server... :("); 
}  

function onMessage(evt) { 
	console.log("got- " + evt.data);
	var msg = evt.data.split(":");
	console.log("cmd- " + msg[0] + " data- " + msg[1]);
	
	console.log(msg.length)
	if (msg.length > 2) {
		for (var i = 2; i < msg.length; i++)
			msg[1] = msg[1] + ":" + msg[i]
	}
	
	if (msg[0] === "in" || msg[0] === "out") {
		writeToScreen(msg[0], msg[1]); 
	}
	else if (msg[0] === "ann")
		writeToScreen(msg[0], msg[1]); 
	else
		console.log("Received unknown command!");
}  

function onError(evt) { 
	writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data); 
}  

function doSend(message) { 
	writeToScreen("SENT: " + message);  
	websocket.send(message); 
}

function writeToScreen(type, message) { 
	console.log("type " + type + " message " + message);
	var tag = "";
	if (type === "ann")
		className = "announcement" ;
	else {
		className = "message";
		if (type === "in") tag = strangerDiv;
		else tag = youDiv;
	}

	//place the new messages in a div
    var newDiv = document.createElement("DIV");
    newDiv.innerHTML = tag + message;
    newDiv.style.wordWrap = "break-word";
    newDiv.className = className;

    //append the messages to the contents
    output.appendChild(newDiv);

    //scroll the chatContents area to the bottom
    console.log(outputView.scrollHeight)
    console.log(outputView.scrollTop)
    console.log(outputView.scrollHeight - outputView.scrollTop)
    //if (outputView.scrollHeight - outputView.scrollTop <= 511) //deal with scrolling while messages are incoming
    outputView.scrollTop = outputView.scrollHeight;
}  

function announce(message) { 
	writeToScreen("ann", message);
}  

function buttonPressed(evt) {
	websocket.send("msg:" + document.getElementById('textfield').value + '\n');
	document.getElementById('textfield').value = '';
}

window.addEventListener("load", init, false);  
