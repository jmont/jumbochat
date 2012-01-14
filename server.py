import sys
from twisted.internet import reactor
from autobahn.websocket import WebSocketServerFactory, WebSocketServerProtocol, listenWS
import pdb

# get port
if !sys.argv[1]:
	port = "9000"
else:
	port = sys.argv[1]

# debug mode
debug = False

# self.transport.loseConnection() closes the connection...
class Chat(WebSocketServerProtocol):
	chatWith = None
      
	def onOpen(self):
		if debug: pdb.set_trace()
		# try: pair new client to one that is waiting in unusedClients
		if len(self.factory.unusedClients):
			self.chatWith = self.factory.unusedClients.pop()
			self.chatWith.chatWith = self
			self.factory.chatting.append(self)
			self.factory.chatting.append(self.chatWith)
			self.messageAll("Now connected to someone!")
		# else add to unused client list
		else:
			self.factory.unusedClients.append(self)
			self.message("Waiting for someone to connect...")
		print (len(self.factory.unusedClients) + len(self.factory.chatting)), " clients connected"
		
	def connectionLost(self, reason):
		try: # remove tuple from chat list
			if self.chatWith:
				self.factory.chatting.remove(self)
				self.chatWith.chatWith = None
				self.factory.chatting.remove(self.chatWith)
				self.factory.unusedClients.append(self.chatWith)
				self.chatWith.transport.loseConnection()
			else:
				self.factory.unusedClients.remove(self)
		except:
			print "exception closing connection"
		print "Connection closed. Reason: ", reason
		
	def onMessage(self, data, binary):
		if debug: pdb.set_trace()
		if binary:
			print "is binary"
		a = data.split(':')
		print "Recieved: ", a
		
		if len(a) > 2:
			for i in range(2,len(a)):
				a[1] = a[1] + ":" + a[i]
		if len(a) > 1:
			command = a[0]
			content = a[1]
			
			msg = ""
			if command == "iam":
				self.name = content
				msg = " has joined"
			elif command == "msg":
				msg = content
			elif command == "ter":
				msg = " has left the chat"
				self.transport.loseConnection()
			else:
				raise Exception("Command unknown!")
				msg = "Unknown command"
				
			print "msg: ", msg

			if self.chatWith:
				self.chatAll(msg)
			else:
				self.message(msg)
		else:
			print "Error in array length"
	def message(self, message):
		self.sendMessage("ann:" + message + '\n')
		
	def chatAll(self, message):
		self.sendMessage("out:" + message + '\n')
		self.chatWith.sendMessage("in:" + message + '\n')
		
	def messageAll(self, message):
		self.sendMessage("ann:" + message + '\n')
		self.chatWith.sendMessage("ann:" + message + '\n')

urlString = "ws://localhost:" + port
factory = WebSocketServerFactory(urlString)
factory.protocol = Chat
factory.unusedClients = []
factory.chatting = []
listenWS(factory)
print "Chat server started"
reactor.run()
