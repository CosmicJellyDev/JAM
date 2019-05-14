var system = server.registerSystem(0,0);
var eventName = "jam:magnetUse"
var primaryClient = false
var players = []

system.initialize = function() {	
	this.listenForEvent("jam:playerJoin", (event) => this.playerJoin(event));
	this.listenForEvent("jam:requestTool", (event) => this.broadcastTool(event));
	this.listenForEvent(eventName, (event) => this.itemUse(event));

	this.registerEventData("jam:molangQuery",{player:false,query:false})
};

system.update = function()
{
	if(players.length>0)
	{
		for(p=0;p<players.length;p++)
		{	
			this.magnetCommand(players[p])
		}
	}

}

system.magnetCommand = function(playerName)
{
	commandData = this.createEventData("minecraft:execute_command")
	commandData.data.command = "execute @e[type=item] ~ ~ ~ tp @s ~ ~ ~ facing @p[r=8,name="+playerName+"]"
	this.broadcastEvent("minecraft:execute_command",commandData)
	commandData.data.command = "execute @e[type=item] ~ ~ ~ detect ^ ^ ^.0.25 air 0 tp @s ^ ^ ^.0.50 facing @p[r=8,name="+playerName+"]"
	this.broadcastEvent("minecraft:execute_command",commandData)
}

system.broadcastTool = function(event) {
	event = this.createEventData("jam:registerTool")
	event.data = {}
	event.data.player = primaryClient
	event.data.type = "hold"
	event.data.item = "jam:magnet"
	event.data.eventName = eventName
	event.data.returns = ["playerName"]

	this.broadcastEvent("jam:registerTool",event)
}

system.playerJoin = function(event) {
	player = event.data.player

	if(!primaryClient)
	{
		primaryClient = player
	}
}

system.itemUse = function(event) {
	playerName = event.data.playerName
	isHolding = event.data.isHolding

	if(isHolding)
	{
		for(i=0;i<players.length;i++)
		{
			if(players[i][1] == playerName)
			{
				return
			}
		}
		players.push(playerName)
	}

	else
	{
		index = players.indexOf(playerName)
		if(index>-1)
		{
			players.splice(index, 1);
		}
	}
}
