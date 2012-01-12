var wsUri = "ws://0.0.0.0:9000";
var output;

function init() { 
	output = document.getElementById("chatContents"); 
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
	writeToScreen("CONNECTED"); 
}  

function onClose(evt) { 
	writeToScreen("DISCONNECTED"); 
}  

function onMessage(evt) { 
	console.log("got data: " + evt.data);
	writeToScreen(evt.data); 
}  

function onError(evt) { 
	writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data); 
}  

function doSend(message) { 
	writeToScreen("SENT: " + message);  
	websocket.send(message); 
}

function writeToScreen(message) { 
	//place the new messages in a div
    var newDiv = document.createElement("DIV");
    newDiv.innerHTML = message;
    newDiv.style.wordWrap = "break-word"; 

    //append the messages to the contents
    output.appendChild(newDiv);

    //scroll the chatContents area to the bottom
    if (output.scrollHeight - output.scrollTop <= 120*2)
    	output.scrollTop = output.scrollHeight;
}  

function buttonPressed(evt) {
	websocket.send("msg:" + document.getElementById('textfield').value + '\n');
	document.getElementById('textfield').value = '';
}

window.addEventListener("load", init, false);  