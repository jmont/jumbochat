var wsUri = "ws://173.255.230.176:9000";
var output;

var youDiv = "<div class=\'youTag\'>You: </div>"
var strangerDiv = "<div class=\'strangerTag\'>Jumbo: </div>"

var isConnected = false;
var isConnecting = true;

var isViewing = true;
var unreadMessagesCount = 0;

var titleInterval = null;

function init() { 
	output = document.getElementById("chatContents"); 
	outputView = document.getElementById("chatWindow"); 
	
	$(window).blur(function() {
    	isViewing = false;
	});
	
	$(window).focus(function() {
    	isViewing = true;
    	readMessages();
	});
	
	output.innerHTML = ""; 
	
    testWebSocket(); 
    document.getElementById('textfield').select();
} 

function toggleMute(button) {
	$.sound.enabled = !($.sound.enabled);
	if($.sound.enabled) {
		button.value = "mute";
	} else {
		button.value = "unmute";
	}
}

function testWebSocket() {
	isConnecting = true;
	websocket = new WebSocket(wsUri); 
	websocket.onopen = function(evt) { onOpen(evt) }; 
	websocket.onclose = function(evt) { onClose(evt) }; 
	websocket.onmessage = function(evt) { onMessage(evt) }; 
	websocket.onerror = function(evt) { onError(evt) }; 
}  
	
function onOpen(evt) {
	announce("Now connected to JumboChat :)"); 
	announce("Press the esc key on your keyboard to end or start a conversation."); 
}  

function onClose(evt) { 
	announce("Disconnected from the server... :("); 
	isConnected = false;
	if($("#typingIndicator"))
		$("#typingIndicator").attr("id","typingIndicatorHidden");
}  

function disconnect() {
	websocket.close();
	isConnected = false;
}

function reconnect() {
	init();
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
		announce(msg[1]);
	else if (msg[0] === "con") {
		allowMessages();
		announce(msg[1]);
	}
	else if (msg[0] === "typ") { //stranger is typing
		$("#typingIndicatorHidden").attr("id","typingIndicator");
	}
	else if (msg[0] === "pyt") { //stranger is not typing
		$("#typingIndicator").attr("id","typingIndicatorHidden");
	}
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

function allowMessages() { 
	isConnected = true;
	isConnecting = false;
}

function writeToScreen(type, message) { 
	console.log("type " + type + " message " + message);
	var tag = "";
	if (type === "ann" || type === "con")
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
    
    //Play notif
    if(tag == strangerDiv) {
    	if (!isViewing) {
    		unreadMessages();
    		unreadMessagesCount++;
    	}
    	$.sound.play('notif.mp3');
    	
    }

    //scroll the chatContents area to the bottom
    console.log(outputView.scrollHeight)
    console.log(outputView.scrollTop)
    console.log(outputView.scrollHeight - outputView.scrollTop)
    //if (outputView.scrollHeight - outputView.scrollTop <= 511) //deal with scrolling while messages are incoming
    outputView.scrollTop = outputView.scrollHeight;
}  

function announce(message) { 
	writeToScreen("ann", "-- " + message);
}  

function buttonPressed(evt) {
	if (isConnected) {
		if (document.getElementById('textfield').value.length != 0)
			websocket.send("msg:" + document.getElementById('textfield').value + '\n');
		else
			console.log("Can't send an empty message.");
	}
	else
		console.log("Message could not be sent since messages are not allowed at this time.");
	document.getElementById('textfield').value = '';

}

function textfieldChanged(len) {
	if (isConnected) {
		if (len > 0)  //is typing
			websocket.send("typ:\n");
		else //not typing
			websocket.send("pyt:\n");
	}
}

function unreadMessages() {
		var flag = true;
		titleInterval = setInterval(function(){
			if (flag) {
				document.title = "New Message!";
			} else{
				document.title = "JumboChat";
			}
				flag = !flag;
			}, 1000);
}

function readMessages() {
	if (titleInterval) {
		clearInterval(titleInterval);
		titleInterval = null;
		document.title = "JumboChat";
	}
	
}

window.addEventListener("load", init, false);  
