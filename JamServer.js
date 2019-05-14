var system = server.registerSystem(0,0);
var blacklist = ["minecraft:acacia_button","minecraft:acacia_door","minecraft:acacia_fence_gate","minecraft:acacia_pressure_plate","minecraft:acacia_wall_sign","minecraft:acacia_standing_sign","minecraft:spruce_button","minecraft:spruce_door","minecraft:spruce_fence_gate","minecraft:spruce_pressure_plate","minecraft:spruce_wall_sign","minecraft:spruce_standing_sign","minecraft:dark_oak_button","minecraft:dark_oak_door","minecraft:dark_oak_fence_gate","minecraft:dark_oak_pressure_plate","minecraft:darkoak_wall_sign","minecraft:darkoak_standing_sign","minecraft:oak_button","minecraft:oak_door","minecraft:fence_gate","minecraft:oak_pressure_plate","minecraft:wall_sign","minecraft:standing_sign","minecraft:birch_button","minecraft:birch_door","minecraft:birch_fence_gate","minecraft:birch_pressure_plate","minecraft:birch_wall_sign","minecraft:birch_standing_sign","minecraft:jungle_button","minecraft:jungle_door","minecraft:jungle_fence_gate","minecraft:jungle_pressure_plate","minecraft:jungle_wall_sign","minecraft:jungle_standing_sign","minecraft:activator_rail","minecraft:bamboo","minecraft:bamboo_sapling","minecraft:bed","minecraft:beetroot","minecraft:bubble_column","minecraft:cake","minecraft:cactus","minecraft:carrot","minecraft:campfire","minecraft:deadbush","minecraft:detector_rail","minecraft:double_plant","minecraft:dragon_egg","minecraft:end_rod","minecraft:end_portal","minecraft:end_portal_frame","minecraft:fire","minecraft:flower_pot","minecraft:flowing_lava","minecraft:flowing_water","minecraft:frame","minecraft:golden_rail","minecraft:grindstone","minecraft:heavy_weighted_pressure_plate","minecraft:iron_door","minecraft:kelp","minecraft:ladder","minecraft:lantern","minecraft:lava","minecraft:lectern","minecraft:lever","minecraft:light_weighted_pressure_plate","minecraft:melon_stem","minecraft:mob_spawner","minecraft:nether_wart","minecraft:pistonarmcollision","minecraft:portal","minecraft:powered_comparator","minecraft:powered_repeater","minecraft:potatoes","minecraft:pumpkin_stem","minecraft:rail","minecraft:redstone_torch","minecraft:redstone_wire","minecraft:red_flower","minecraft:red_mushroom","minecraft:redstone_wire","minecraft:reeds","minecraft:sapling","minecraft:sea_pickle","minecraft:seagrass","minecraft:snow_layer","minecraft:standing_banner","minecraft:sweet_berry_bush","minecraft:tallgrass","minecraft:torch","minecraft:tripwire","minecraft:tripwire_hook","minecraft:turtle_egg","minecraft:unlit_redstone_torch","minecraft:unpowered_comparator","minecraft:unpowered_repeater","minecraft:vine","minecraft:wall_banner","minecraft:water","minecraft:waterlily","minecraft:wheat","minecraft:yellow_flower","minecraft:bedrock"]
var tools = {"interact":[],"destroy":[],"hold":[],"place":[]}
var primaryClient = false;

system.initialize = function() {		
	this.registerEventData("jam:registerTool",{})
	this.registerEventData("jam:requestTool",{})
	this.registerEventData("jam:useTool",{})
	
	this.listenForEvent("jam:playerJoin", (event) => this.playerJoin(event));
	this.listenForEvent("minecraft:entity_carried_item_changed", (event) => this.holdChange(event));

	this.listenForEvent("jam:registerTool", (event) => this.registerTool(event));
};

system.playerJoin = function(event) {
	if(!primaryClient)
	{
		primaryClient = event.data.player
		requestEvent = this.createEventData("jam:registerTool")
		requestEvent.data = {player:primaryClient}
		this.broadcastEvent("jam:requestTool",requestEvent);
	}
}

system.registerTool = function(event) {
	
	tool = {item:true,block:false}
	tool.item = event.data.item
	tool.eventName = event.data.eventName
	tool.returns = event.data.returns
	tools[event.data.type].push(tool)
	
	if(!this.createEventData(tool.eventName))
	{
		this.registerEventData(tool.eventName,{})
	}
}

system.getTickingArea = function(player) {
	tickWorldComponent = this.getComponent(player,"minecraft:tick_world")
	return tickWorldComponent.data.ticking_area
}

system.getHoldingItem = function(player,isPrimary=true) {
	handContainer = this.getComponent(player,"minecraft:hand_container")
	if(isPrimary)
	{
		return handContainer.data[0].item
	}
	else
	{
		return handContainer.data[1].item
	}	
}

system.getPlayerName = function(player) {
	nameable = this.getComponent(player,"minecraft:nameable")
	return nameable.data.name
}


	
	tickingArea = this.getTickingArea(player)
	holdingItem = this.getHoldingItem(player)

	for(t=0;t<tools[interactType].length;t++)
	{
		tool = tools[interactType][t]
		if((tool.item==holdingItem.__identifier__))
		{
			
			toolEvent = this.createEventData(tool.eventName)
			toolEvent.data = {}
			toolEvent.data.player = player
			toolEvent.data.position = position
			toolEvent.data.eventName = tool.eventName
			toolEvent.data.item = tool.item
			
			for(r=0;r<tool.returns.length;r++)
			{
				switch(tool.returns[r])
				{
					case "tickingArea":
						toolEvent.data.tickingArea = tickingArea
						break
					case "playerName":
						toolEvent.data.playerName = this.getPlayerName(player)
						break
				    }
				}
			}

			this.broadcastEvent("jam:useTool",toolEvent)
		}
	}
}

system.holdChange = function(event)
{
	player = event.data.entity
	currentItem = event.data.carried_item.item
	previousItem = event.data.previous_carried_item.item

	for(t=0;t<tools["hold"].length;t++)
	{
		tool = tools["hold"][t]
		if(currentItem==tool.item || previousItem==tool.item)
		{
			toolEvent = this.createEventData(tool.eventName)
			toolEvent.data = {}
			toolEvent.data.eventName = tool.eventName
			toolEvent.data.currentItem = currentItem
			toolEvent.data.previousItem = currentItem
			toolEvent.data.player = player

			for(r=0;r<tool.returns.length;r++)
			{
				switch(tool.returns[r])
				{
					case "tickingArea":
						toolEvent.data.tickingArea = tickingArea
						break
					case "playerName":
						toolEvent.data.playerName = this.getPlayerName(player)
						break
				}
			}

			toolEvent.data.isHolding = true
			if(currentItem==tool.item)
			{
				toolEvent.data.isHolding = true
			}

			this.broadcastEvent("jam:useTool",toolEvent)
		}
	}
}