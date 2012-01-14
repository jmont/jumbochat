import sys
from twisted.internet import reactor
from twisted.python import log
from autobahn.websocket import WebSocketServerFactory, WebSocketServerProtocol, listenWS
import pdb

# get port
port = sys.argv[1]

# debug mode
debug = False

# setup log
#log.startLogging(open('/var/log/jumbochat/chat.log', 'w'))

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
		log.msg(str(len(self.factory.unusedClients) + len(self.factory.chatting)) + " clients connected")
		
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
			log.err("exception closing connection")
		log.msg("Connection closed. Reason: " + str(reason))
		
	def onMessage(self, data, binary):
		if debug: pdb.set_trace()
		a = data.split(':')
		
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
				log.err("Unknown command sent to server")
				msg = "Unknown command"

			if self.chatWith:
				self.chatAll(msg)
			else:
				self.message(msg)
		else:
			log.err("Error in array length")
			
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
print "Chat server started in port " + port
log.msg("Chat server started in port " + port)
reactor.run()
