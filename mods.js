if(CCSE === undefined) var CCSE = {};
if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
CCSE.name = 'CCSE';
CCSE.version = '2.036';
CCSE.Steam = (typeof Steam !== 'undefined');
CCSE.GameVersion = CCSE.Steam ? '2.052' : '2.052';

CCSE.launch = function(){
	CCSE.loading = 1;
	
	CCSE.init = function(){
		CCSE.init = 0;
		CCSE.InitNote();
		CCSE.InitializeConfig();
		CCSE.AddCCSEStyles();
		
		// Define more parts of CCSE
		CCSE.Backup = {};
		CCSE.collapseMenu = {};
		if(!Game.customMinigame) Game.customMinigame = {};
		for(var key in Game.Objects) if(!Game.customMinigame[key]) Game.customMinigame[key] = {};
		
		
		// Build a list of functions to feed to requestAnimationFrame
		CCSE.playlist = [];
		CCSE.track = 0;
		
		CCSE.playlist.push(function(){
			CCSE.ReplaceMainGame();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(function(){
			CCSE.MinigameReplacer(CCSE.ReplaceGrimoire, 'Wizard tower');
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(function(){
			CCSE.MinigameReplacer(CCSE.ReplacePantheon, 'Temple');
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(function(){
			CCSE.MinigameReplacer(CCSE.ReplaceGarden, 'Farm');
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(function(){
			CCSE.MinigameReplacer(CCSE.ReplaceMarket, 'Bank');
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		
		
		CCSE.playlist.push(function(){
			CCSE.ReplaceBuildingsStart();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(CCSE.ReplaceBuildings); // We'll call the next one from here
		CCSE.playlist.push(function(){
			CCSE.ReplaceBuildingsFinish();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		
		
		CCSE.playlist.push(function(){
			CCSE.ReplaceUpgradesStart();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(CCSE.ReplaceUpgrades); // We'll call the next one from here
		CCSE.playlist.push(function(){
			CCSE.ReplaceUpgradesFinish();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		
		
		CCSE.playlist.push(function(){
			CCSE.ReplaceAchievementsStart();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(CCSE.ReplaceAchievements); // We'll call the next one from here
		
		
		CCSE.playlist.push(CCSE.finalize);
		
		requestAnimationFrame(CCSE.playlist[CCSE.track++]);
	}
	
	CCSE.finalize = function(){
		// Load any custom save data and inject save functions
		if(!Game.modSaveData[CCSE.name]) CCSE.load();
		
		
		// Inject menu functions
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(CCSE.name, CCSE.GetMenuString());
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(CCSE.name, CCSE.version);
		});
		
		Game.customInfoMenu.push(function(){
			CCSE.PrependCollapsibleInfoMenu(CCSE.name, CCSE.updateLog);
		});
		
		Game.registerHook('reset', CCSE.reset);
		
		//l('versionNumber').innerHTML = 'Game ' + l('versionNumber').innerHTML + '<br>CCSE v. ' + CCSE.version;
		var versionNumber = l('versionNumber');
		var versionDiv = document.createElement('p');
		versionDiv.id = 'CCSEversionNumber';
		versionDiv.innerHTML = 'CCSE v. ' + CCSE.version;
		var textDiv = document.createElement('span');
		textDiv.id = 'CCSEversionGame';
		textDiv.innerHTML = 'Game ';
		versionNumber.appendChild(versionDiv);
		versionNumber.insertBefore(textDiv, versionNumber.firstChild);
		
		// Announce completion, set the isLoaded flag, and run any functions that were waiting for this to load
		CCSE.Note.title = 'CCSE loaded!';
		CCSE.Note.life = Game.fps;
		CCSE.isLoaded = 1;
		CCSE.loading = 0;
		
		if(CCSE.postLoadHooks) for(var i in CCSE.postLoadHooks) CCSE.postLoadHooks[i]();
		if(CCSE.Steam){
			Game.loadModData = CCSE.GameLoadModData;
			CCSE.LaunchOtherMods();
			if(CCSE.gameHasLoadedSave) Game.loadModData();
		}
		
		CCSE.applyPref('showVersionNo');
	}
	
	
	/*=====================================================================================
	Update history
	=======================================================================================*/
	{	CCSE.updateLog = '<div class="subsection"><div class="listing">Cookie Clicker Script Extender is a modding framework intended to make modding this game easier and more accessible.</div>' +
			'<div class="listing">CCSE is written and maintained by Klattmose (<a href="https://github.com/klattmose" target="_blank">GitHub</a>, <a href="https://www.reddit.com/user/klattmose/" target="_blank">reddit</a>)</div>' +
			'<div class="listing">Further documentation can be found <a href="https://klattmose.github.io/CookieClicker/CCSE-POCs/" target="_blank">here</a>.</div>' +
			'<div class="listing">If you have a bug report or a suggestion, create an issue <a href="https://github.com/klattmose/klattmose.github.io/issues" target="_blank">here</a>.</div></div>' +
			'<div class="subsection"><div class="title">CCSE version history</div>' +
			
			'</div><div class="subsection update small"><div class="title">05/16/2023</div>' + 
			'<div class="listing">&bull; Can now give ids to Headers</div>' +
			
			'</div><div class="subsection update small"><div class="title">03/13/2023</div>' + 
			'<div class="listing">&bull; Added option to hide the CCSE version in the lower left of the screen</div>' +
			'<div class="listing">&bull; Added some hooks for the YouCustomizer functions</div>' +
			'<div class="listing">&bull; Fixed compatibility with Frozen Cookies</div>' +
			
			'</div><div class="subsection update small"><div class="title">01/07/2022</div>' + 
			'<div class="listing">&bull; Added hook for Game.resize</div>' +
			'<div class="listing">&bull; Added hook for Garden.logic (for plant aging)</div>' +
			
			'</div><div class="subsection update small"><div class="title">10/04/2021</div>' +
			'<div class="listing">&bull; Fixed bug that was preventing custom buildings, upgrades, and achievements from being saved in some circumstances</div>' +
			
			'</div><div class="subsection update small"><div class="title">09/26/2021</div>' +
			'<div class="listing">&bull; Steam version: Will now initialize before other mods</div>' +
			'<div class="listing">&bull; Fixed getting permanent upgrades on a Born Again ascension</div>' +
			'<div class="listing">&bull; Fixed breaking Game.NewUpgradeCookie</div>' +
			'<div class="listing">&bull; Reset custom upgrades, achievements, etc. managed by CCSE on game reset even if the mod generating them isn\'t loaded</div>' +
			
			'</div><div class="subsection update small"><div class="title">09/18/2021</div>' +
			'<div class="listing">&bull; Steam version: Custom links in the menu will now open in a browser rather than Steam</div>' +
			'<div class="listing">&bull; Fixed some upgrade descriptions breaking in localization</div>' +
			'<div class="listing">&bull; Added hooks for Game.crate and Game.crateTooltip</div>' +
			'<div class="listing">&bull; Changed Game.Loader.Load injection to detect \'/\' instead of \'http\'</div>' +
			
			'</div><div class="subsection update small"><div class="title">09/10/2021</div>' +
			'<div class="listing">&bull; Added PasswordBox and CheckBox to MenuHelper</div>' +
			'<div class="listing">&bull; Added function to append custom CSS styles</div>' +
			'<div class="listing">&bull; Fixed bug in custom Background selector</div>' +
			
			'</div><div class="subsection update small"><div class="title">09/09/2021</div>' +
			'<div class="listing">&bull; Steam version: Added hooks for Steam.modsPopup</div>' +
			'<div class="listing">&bull; Added support for custom images for the Pantheon and Grimoire</div>' +
			'<div class="listing">&bull; Added support for custom Golden cookie sound selector options</div>' +
			'<div class="listing">&bull; Added support for custom Milk selector options</div>' +
			'<div class="listing">&bull; Added support for custom Background selector options</div>' +
			
			'</div><div class="subsection update small"><div class="title">09/01/2021</div>' +
			'<div class="listing">&bull; Vaulting for custom upgrades no longer depends on mod load order</div>' +
			'<div class="listing">&bull; Setting custom upgrades as Permanent will no longer break the game if the Stats menu is opened without the mod loaded</div>' +
			'<div class="listing">&bull; Added some functions for commonly used menu items</div>' +
			
			'</div><div class="subsection update small"><div class="title">02/06/2021</div>' +
			'<div class="listing">&bull; Halved the loading time with this one weird trick!</div>' +
			'<div class="listing">&bull; The trick is called optimization</div>' +
			'<div class="listing">&bull; And learning about prototype functions</div>' +
			
			'</div><div class="subsection update small"><div class="title">10/31/2020</div>' +
			'<div class="listing">&bull; Updated to use the new modding API</div>' +
			'<div class="listing">&bull; The CCSE.save object (where the mod save data is stored) is now named CCSE.config. The new CCSE.save is a function that will get called by Cookie Clicker when it decides it\'s time to save.</div>' +
			
			'</div><div class="subsection update small"><div class="title">06/20/2020</div>' +
			'<div class="listing">&bull; Added hooks for the new stock market minigame</div>' +
			'<div class="listing">&bull; Added hook for the new function Game.ClickSpecialPic</div>' +
			
			'</div><div class="subsection update small"><div class="title">10/22/2019</div>' +
			'<div class="listing">&bull; Added hook for the new function Game.auraMult</div>' +
			
			'</div><div class="subsection update small"><div class="title">05/14/2019 - parallel processing</div>' +
			'<div class="listing">&bull; Won\'t freeze the game while CCSE is loading</div>' +
			'<div class="listing">&bull; Also has a progress meter for feedback</div>' +
			'<div class="listing">&bull; Bug fixes</div>' +
			
			'</div><div class="subsection update"><div class="title">05/11/2019 - take two</div>' +
			'<div class="listing">&bull; You know that moment where you do something and then immediately realize a better way to do it?</div>' +
			'<div class="listing">&bull; Changed the method for injecting code to standardized functions rather than calling "eval" willy-nilly</div>' +
			'<div class="listing">&bull; Added function for creating seasons</div>' +
			'<div class="listing">&bull; Created this update log, and put the version number in the lower left corner</div>' +
			'<div class="listing">&bull; With apologies for pretending to be a game update</div>' +
			
			'</div><div class="subsection update"><div class="title">05/05/2019 - initial release</div>' +
			'<div class="listing">&bull; Added a bunch of mod hooks to the game</div>' +
			'<div class="listing">&bull; Added functions to ease the creation of content like achievements and buildings</div>' +
			'<div class="listing">&bull; Added a save system to manage game objects created through CCSE</div>' +
			'<div class="listing">&bull; Further documentation <a href="https://klattmose.github.io/CookieClicker/CCSE-POCs/" target="_blank">here</a></div>' +
			'</div><div class="subsection"></div><div class="section">Cookie Clicker</div>';
	}
	
	
	/*=====================================================================================
	The heart of the mod. Functions to inject code into functions.
	=======================================================================================*/
	CCSE.InjectCodeIntoFunction = function(functionName, alterFunctionCode, code, preEvalScript, hasPrototype){
		// preEvalScript is to set variables that are used in the function but aren't declared in the function
		if(preEvalScript) eval(preEvalScript);
		
		var originalFunction = eval(functionName);
		if (originalFunction === null) {
			console.warn(`CCSE: ${ functionName } is not found. Could not inject ${ code }`);
			return;
		} else if (typeof originalFunction !== "function") {
			console.warn(`CCSE: ${ functionName } is not a function. Could not inject ${ code }`);
			return;
		}
		
		//console.log(functionName);
		eval(functionName + " = " + alterFunctionCode(originalFunction.toString()));
		if(hasPrototype) {
			var alteredFunction = eval(functionName);
			alteredFunction.prototype = originalFunction.prototype;
		}
		
		CCSE.functionsAltered++;
		if(!CCSE.isLoaded) CCSE.UpdateNote();
		//if(eval(functionName + ".toString()").indexOf(code) == -1) console.log("Error injecting code into function " + functionName + ". Could not inject " + code);
	}
	
	CCSE.SliceCodeIntoFunction = function(functionName, pos, code, preEvalScript, hasPrototype){
		var alterFunctionCode = function(temp){
			return temp.slice(0, pos) + code + temp.slice(pos);
		}
		CCSE.InjectCodeIntoFunction(functionName, alterFunctionCode, code, preEvalScript, hasPrototype);
	}
	
	CCSE.SpliceCodeIntoFunction = function(functionName, row, code, preEvalScript, hasPrototype){
		var alterFunctionCode = function(temp){
			temp = temp.split("\n");
			i = row < 0 ? temp.length + row : row;
			temp.splice(i, 0, code);
			return temp.join("\n");
		}
		CCSE.InjectCodeIntoFunction(functionName, alterFunctionCode, code, preEvalScript, hasPrototype);
	}
	
	CCSE.ReplaceCodeIntoFunction = function(functionName, targetString, code, mode, preEvalScript, hasPrototype){
		var alterFunctionCode = function(temp){
			switch(mode){
				case -1: // Insert before targetString
					return temp.replace(targetString, code + "\n" + targetString);
				case 0: // Replace targetString. Regex will work
					return temp.replace(targetString, code);
				case 1: // Insert after targetString
					return temp.replace(targetString, targetString + "\n" + code);
				default:
					throw new Error("mode must be either, -1, 0, or 1");
			}
		}
		CCSE.InjectCodeIntoFunction(functionName, alterFunctionCode, code, preEvalScript, hasPrototype);
	}
	
	CCSE.GetProgressHTML = function(progress){
		return `<div style="text-align: center; font-weight: bold; color: white;">${ progress }%</div>`;
	}

	CCSE.InitNote = function(){
		if(CCSE.Steam) CCSE.iconURL = CCSE.GetModPath('CCSE') + '/CCSEicon.png';
		else CCSE.iconURL = 'https://klattmose.github.io/CookieClicker/img/CCSEicon.png';
		
		CCSE.functionsTotal = (
			141
			+ (CCSE.Steam ? 7 : 0)
			+ Game.ObjectsN      * 18 - 1 + 3
			+ Game.UpgradesN     * 1  + 25
			+ Game.AchievementsN * 1
		); // Needs to be manually updated
		CCSE.functionsAltered = 0;
		CCSE.progress = 0;
		
		Game.Notify('CCSE is initializing', CCSE.GetProgressHTML(0), [0, 0, CCSE.iconURL], 6, 1);
		CCSE.Note = Game.NotesById[Game.noteId - 1];
		CCSE.Note.life = 600000; // 10 minutes, just to be sure
	}
	
	CCSE.UpdateNote = function(){
		CCSE.Note.life = 600000;
		var progress = Math.min(Math.floor(CCSE.functionsAltered / CCSE.functionsTotal * 100), 100);
		if(progress != CCSE.progress){
			CCSE.progress = progress;
			CCSE.Note.desc = CCSE.GetProgressHTML(CCSE.progress);
			Game.UpdateNotes();
		}
	}
	
	
	/*=====================================================================================
	Do all replacing in one function
	Actually don't, it locks up the browser for as long as it's running
	Also declare hook arrays in the close vicinity of the functions they get used in
	=======================================================================================*/
	CCSE.ReplaceMainGame = function(){
		// Temporary variable for storing function strings
		// Slightly more efficient than nesting functions
		// Doubt it really matters
		var temp = '';
		var pos = 0;
		var proto;
		var obj;
		
		
		// Game.UpdateMenu
		if(!Game.customMenu) Game.customMenu = [];
		if(!Game.customOptionsMenu) Game.customOptionsMenu = [];
		if(!Game.customStatsMenu) Game.customStatsMenu = [];
		if(!Game.customInfoMenu) Game.customInfoMenu = [];
		
		CCSE.ReplaceCodeIntoFunction('Game.UpdateMenu', "l('menu').innerHTML=str;", `
			if(Game.onMenu == 'prefs'){
				// Game.UpdateMenu injection point 0
				for(var i in Game.customOptionsMenu) Game.customOptionsMenu[i]();
			}
			else if(Game.onMenu == 'stats'){
				// Game.UpdateMenu injection point 1
				for(var i in Game.customStatsMenu) Game.customStatsMenu[i]();
			}
			else if(Game.onMenu == 'log'){
				// Game.UpdateMenu injection point 2
				for(var i in Game.customInfoMenu) Game.customInfoMenu[i]();
			}
			
			// Any that don't want to fit into a label
			// Game.UpdateMenu injection point 3
			for(var i in Game.customMenu) Game.customMenu[i]();
		`, 1);
		
		
		// Code specific to the Steam version
		// Might move to their own function maybe
		if(CCSE.Steam){
			// Steam.modsPopup
			// This function has several functions defined within it
			if(!Game.customModsPopup) Game.customModsPopup = [];
			if(!Game.customModsPopupCheckModDependencies) Game.customModsPopupCheckModDependencies = []; // Return okay to have no effect
			if(!Game.customModsPopupUpdateModList) Game.customModsPopupUpdateModList = [];
			if(!Game.customModsPopupUpdateModOptions) Game.customModsPopupUpdateModOptions = [];
			CCSE.SliceCodeIntoFunction('Steam.modsPopup', -1, `
				// Steam.modsPopup injection point 0
				for(var i in Game.customModsPopup) Game.customModsPopup[i](selectedMod, mods);
			`);
			CCSE.ReplaceCodeIntoFunction('Steam.modsPopup', "return okay;",
				`// Steam.modsPopup injection point 1
				for(var i in Game.customModsPopupCheckModDependencies) okay = Game.customModsPopupCheckModDependencies[i](okay, mod, loadedMods, selectedMod, mods);
				`, -1);
			CCSE.ReplaceCodeIntoFunction('Steam.modsPopup', "updateModOptions();",
				`// Steam.modsPopup injection point 2
				for(var i in Game.customModsPopupUpdateModList) Game.customModsPopupUpdateModList[i](selectedMod, mods);
				`, -1);
			CCSE.ReplaceCodeIntoFunction('Steam.modsPopup', 'else el.innerHTML=loc("Select a mod.");',
				`// Steam.modsPopup injection point 3
				for(var i in Game.customModsPopupUpdateModOptions) Game.customModsPopupUpdateModOptions[i](selectedMod, mods);
				`, 1);
			
			// Steam.workshopPopup
			if(!Game.customWorkshopPopup) Game.customWorkshopPopup = [];
			if(!Game.customWorkshopPopupUpdateModDisplay) Game.customWorkshopPopupUpdateModDisplay = [];
			if(!Game.customWorkshopPopupUpdatePublishedModsPopup) Game.customWorkshopPopupUpdatePublishedModsPopup = [];
			CCSE.SliceCodeIntoFunction('Steam.workshopPopup', -1, `
				// Steam.customWorkshopPopup injection point 0
				for(var i in Game.customWorkshopPopup) Game.customWorkshopPopup[i](selectedMod, selectedModPath);
			`);
			CCSE.ReplaceCodeIntoFunction('Steam.workshopPopup', "Game.UpdatePrompt();",
				`// Steam.customWorkshopPopup injection point 1
				for(var i in Game.customWorkshopPopupUpdateModDisplay) Game.customWorkshopPopupUpdateModDisplay[i](selectedMod, el);
				`, 1);
			CCSE.ReplaceCodeIntoFunction('Steam.workshopPopup', "else l('modDisplay').innerHTML=`<div style=\"font-size:11px;margin:8px;\">(${loc(\"none\")})</div>`;",
				`// Steam.customWorkshopPopup injection point 2
				for(var i in Game.customWorkshopPopupUpdatePublishedModsPopup) Game.customWorkshopPopupUpdatePublishedModsPopup[i](response);
				`, 1);
		}
		
		
		/*
		New modding api works
		// Game.LoadSave
		if(!Game.customLoad) Game.customLoad = [];
		if(!(Game.LoadSave.toString().indexOf('Game.customLoad') > 0)){
			CCSE.ReplaceCodeIntoFunction('Game.LoadSave', 'if (Game.prefs.showBackupWarning==1)',
					`// Game.LoadSave injection point 0
					for(var i in Game.customLoad) Game.customLoad[i](); `, -1);
		}*/
		
		
		// Game.WriteSave
		// This section only exists to support custom seasons
		CCSE.ReplaceCodeIntoFunction('Game.WriteSave', '(Game.season?', '((Game.season)?', 0);
		CCSE.ReplaceCodeIntoFunction('Game.WriteSave', '(Game.seasonT)', '((Game.season)?Game.seasonT:-1)', 0);
		
		
		// Game.Reset
		if(!Game.customReset) Game.customReset = [];
		CCSE.SliceCodeIntoFunction('Game.Reset', -1, `
			// Game.Reset injection point 0
			for(var i in Game.customReset) Game.customReset[i](hard);
		`);
		
		
		// randomFloor
		// Gonna just replace it and try to keep up with any changes (however unlikely)
		// function randomFloor(x) {if ((x%1)<Math.random()) return Math.floor(x); else return Math.ceil(x);}
		// Return ret to have no effect
		if(!Game.customRandomFloor) Game.customRandomFloor = [];
		randomFloor = function(x){
			var ret;
			if ((x%1)<Math.random()) ret = Math.floor(x);
			else ret = Math.ceil(x);
			// randomFloor injection point 0
			for(var i in Game.customRandomFloor) ret = Game.customRandomFloor[i](x, ret);
			return ret;
		}
		
		
		// Beautify
		// Return ret to have no effect
		if(!Game.customBeautify) Game.customBeautify = [];
		CCSE.ReplaceCodeIntoFunction('Beautify', "return negative?'-'+output:output+decimal;",
	`var ret = negative?'-'+output:output+decimal;
	// Beautify injection point 0
	for(var i in Game.customBeautify) ret = Game.customBeautify[i](value, floats, ret);
	return ret;`, 0);
		
		
		// Game.Loader.Load
		// To allow for images from outside the dashnet domain
		CCSE.ReplaceCodeIntoFunction('Game.Loader.Load', 'img.src=this.domain', "img.src=(assets[i].indexOf('/')>=0?'':this.domain)", 0);
		
		
		// Game.resize
		if(!Game.customResize) Game.customResize = [];
		CCSE.SliceCodeIntoFunction('Game.resize', -1, `
			// Game.resize injection point 0
			for(var i in Game.customResize) Game.customResize[i]();
		`);
		
		
		// -----     Tooltips block     ----- //
		
		// Game.tooltip.draw
		if(!Game.customTooltipDraw) Game.customTooltipDraw = [];
		CCSE.SliceCodeIntoFunction('Game.tooltip.draw', -1, `
			// Game.tooltip.draw injection point 0
			for(var i in Game.customTooltipDraw) Game.customTooltipDraw[i](from, text, origin);
		`);
		
		
		// Game.tooltip.update
		if(!Game.customTooltipUpdate) Game.customTooltipUpdate = [];
		CCSE.SliceCodeIntoFunction('Game.tooltip.update', -1, `
			// Game.tooltip.update injection point 0
			for(var i in Game.customTooltipUpdate) Game.customTooltipUpdate[i]();
		`);
		
		
		// Game.crate
		// Return ret to have no effect
		if(!Game.customCrate) Game.customCrate = [];
		CCSE.ReplaceCodeIntoFunction('Game.crate', 'return (Game', "var ret = (Game", 0);
		CCSE.SliceCodeIntoFunction('Game.crate', -1, `
			// Game.crate injection point 0
			for(var i in Game.customCrate) ret = Game.customCrate[i](me, context, forceClickStr, id, ret, style);
			return ret;
		`);
		
		
		// Game.crateTooltip
		// Return ret to have no effect
		if(!Game.customCrateTooltip) Game.customCrateTooltip = [];
		CCSE.ReplaceCodeIntoFunction('Game.crateTooltip', 'return', "var ret = ", 0);
		CCSE.SliceCodeIntoFunction('Game.crateTooltip', -1, `
			// Game.crateTooltip injection point 0
			for(var i in Game.customCrateTooltip) ret = Game.customCrateTooltip[i](me, context, ret);
			return ret;
		`);
		
		
		// -----     Ascension block     ----- //
		
		// Game.HowMuchPrestige
		// Return ret to have no effect
		if(!Game.customHowMuchPrestige) Game.customHowMuchPrestige = [];
		CCSE.ReplaceCodeIntoFunction('Game.HowMuchPrestige', 'return', "var ret = ", 0);
		CCSE.SliceCodeIntoFunction('Game.HowMuchPrestige', -1, `
			// Game.HowMuchPrestige injection point 0
			for(var i in Game.customHowMuchPrestige) ret = Game.customHowMuchPrestige[i](cookies, ret);
			return ret;
		`);
		
		
		// Game.HowManyCookiesReset
		// Return ret to have no effect
		if(!Game.customHowManyCookiesReset) Game.customHowManyCookiesReset = [];
		CCSE.ReplaceCodeIntoFunction('Game.HowManyCookiesReset', 'return', "var ret = ", 0);
		CCSE.SliceCodeIntoFunction('Game.HowManyCookiesReset', -1, `
			// Game.HowManyCookiesReset injection point 0
			for(var i in Game.customHowManyCookiesReset) ret = Game.customHowManyCookiesReset[i](chips, ret);
			return ret;
		`);
		
		
		// Game.GetHeavenlyMultiplier
		// Functions should return a value to multiply the heavenlyMult by
		if(!Game.customHeavenlyMultiplier) Game.customHeavenlyMultiplier = [];
		CCSE.ReplaceCodeIntoFunction('Game.GetHeavenlyMultiplier', 'return heavenlyMult;', `
			// Game.GetHeavenlyMultiplier injection point 0
			for(var i in Game.customHeavenlyMultiplier) heavenlyMult *= Game.customHeavenlyMultiplier[i]();`, -1);
		
		
		// Game.UpdateAscensionModePrompt
		if(!Game.customUpdateAscensionModePrompt) Game.customUpdateAscensionModePrompt = [];
		CCSE.SliceCodeIntoFunction('Game.UpdateAscensionModePrompt', -1, `
			// Game.UpdateAscensionModePrompt injection point 0
			for(var i in Game.customUpdateAscensionModePrompt) Game.customUpdateAscensionModePrompt[i]();
		`);
		
		
		// Game.Reincarnate
		// Only runs when bypass == 1 (i.e. passed the confirmation prompt)
		if(!Game.customReincarnate) Game.customReincarnate = [];
		CCSE.SliceCodeIntoFunction('Game.Reincarnate', -2, `
				// Game.Reincarnate injection point 0
				if(bypass == 1) for(var i in Game.customReincarnate) Game.customReincarnate[i]();
			`);
		
		
		// Game.Ascend
		// Only runs when bypass == 1 (i.e. passed the confirmation prompt)
		if(!Game.customAscend) Game.customAscend = [];
		CCSE.SliceCodeIntoFunction('Game.Ascend', -2, `
				// Game.Ascend injection point 0
				if(bypass == 1) for(var i in Game.customAscend) Game.customAscend[i]();
			`);
		
		
		// Game.UpdateAscend
		// Runs every frame while on the Ascension tree
		if(!Game.customUpdateAscend) Game.customUpdateAscend = [];
		CCSE.SliceCodeIntoFunction('Game.UpdateAscend', -1, `
			// Game.UpdateAscend injection point 0
			for(var i in Game.customUpdateAscend) Game.customUpdateAscend[i]();
		`);
		
		
		// Game.BuildAscendTree
		if(!Game.customBuildAscendTree) Game.customBuildAscendTree = [];
		CCSE.SliceCodeIntoFunction('Game.BuildAscendTree', -1, `
			// Game.BuildAscendTree injection point 0
			for(var i in Game.customBuildAscendTree) Game.customBuildAscendTree[i](justBought);
		`);
		
		
		// -----     Sugar Lumps block     ----- //
		
		// Game.lumpTooltip
		// Return str to have no effect
		if(!Game.customLumpTooltip) Game.customLumpTooltip = [];
		CCSE.ReplaceCodeIntoFunction('Game.lumpTooltip', 'return',
			`// Game.lumpTooltip injection point 0
			for(var i in Game.customLumpTooltip) str = Game.customLumpTooltip[i](str, phase);`, -1);
		
		
		// Game.computeLumpTimes
		if(!Game.customComputeLumpTimes) Game.customComputeLumpTimes = [];
		CCSE.SliceCodeIntoFunction('Game.computeLumpTimes', -1, `
			// Game.computeLumpTimes injection point 0
			for(var i in Game.customComputeLumpTimes) Game.customComputeLumpTimes[i]();
		`);
		
		
		// Game.gainLumps
		if(!Game.customGainLumps) Game.customGainLumps = [];
		CCSE.SliceCodeIntoFunction('Game.gainLumps', -1, `
			// Game.gainLumps injection point 0
			for(var i in Game.customGainLumps) Game.customGainLumps[i](total);
		`);
		
		
		// Game.clickLump
		if(!Game.customClickLump) Game.customClickLump = [];
		CCSE.SliceCodeIntoFunction('Game.clickLump', -1, `
			// Game.clickLump injection point 0
			for(var i in Game.customClickLump) Game.customClickLump[i]();
		`);
		
		
		// Game.harvestLumps
		if(!Game.customHarvestLumps) Game.customHarvestLumps = [];
		CCSE.ReplaceCodeIntoFunction('Game.harvestLumps', 'total=Math.floor(total);',
			`// Game.harvestLumps injection point 0`, -1);
		CCSE.ReplaceCodeIntoFunction('Game.harvestLumps', "Game.Win('Maillard reaction');",
			`// Game.harvestLumps injection point 1`, 1);
		CCSE.SliceCodeIntoFunction('Game.harvestLumps', -1, `
			// Game.harvestLumps injection point 2
			for(var i in Game.customHarvestLumps) Game.customHarvestLumps[i](amount, silent);
		`);
		
		
		// Game.computeLumpType
		// Functions should push things to types
		if(!Game.customComputeLumpType) Game.customComputeLumpType = [];
		CCSE.ReplaceCodeIntoFunction('Game.computeLumpType', '//caramelized',
				`// Game.computeLumpType injection point 0
				for(var i in Game.customComputeLumpType) Game.customComputeLumpType[i](types);`, 1);
		
		
		// Game.canLumps
		// Return ret to have no effect
		if(!Game.customCanLumps) Game.customCanLumps = [];
		CCSE.SpliceCodeIntoFunction('Game.canLumps', 2, 'var ret;');
		CCSE.ReplaceCodeIntoFunction('Game.canLumps', 'return true;', 'ret = true;', 0);
		CCSE.ReplaceCodeIntoFunction('Game.canLumps', 'return false',
			`else ret = false;
			// Game.canLumps injection point 0
			for(var i in Game.customCanLumps) ret = Game.customCanLumps[i](ret);
			return ret;`, 0);
		
		
		// Game.getLumpRefillMax
		// Return ret to have no effect
		if(!Game.customLumpRefillMax) Game.customLumpRefillMax = [];
		CCSE.ReplaceCodeIntoFunction('Game.getLumpRefillMax', 'return', 'var ret =', 0);
		CCSE.SliceCodeIntoFunction('Game.getLumpRefillMax', -1,
			`// Game.getLumpRefillMax injection point 0
			for(var i in Game.customLumpRefillMax) ret = Game.customLumpRefillMax[i](ret);
			return ret;
		`);
		
		
		// Game.refillLump
		if(!Game.customRefillLump) Game.customRefillLump = [];
		CCSE.SliceCodeIntoFunction('Game.refillLump', -1, `
			// Game.refillLump injection point 0
			for(var i in Game.customRefillLump) Game.customRefillLump[i]();
		`);
		
		
		// Game.doLumps
		// Runs every logic frame when lumps matter
		if(!Game.customDoLumps) Game.customDoLumps = [];
		CCSE.ReplaceCodeIntoFunction('Game.doLumps', 'var icon=', '// Game.doLumps injection point 0', -1);
		CCSE.SliceCodeIntoFunction('Game.doLumps', -1, `
			// Game.doLumps injection point 1
			for(var i in Game.customDoLumps) Game.customDoLumps[i]();
		`);
		
		
		// -----     Economics block     ----- //
		
		// Game.CalculateGains
		// I really think this is what he meant it to be
		// The original just has Game.customCps doing the same thing as Game.customCpsMult
		//eval('Game.CalculateGains = ' + Game.CalculateGains.toString().replace(
		//	'for (var i in Game.customCps) {mult*=Game.customCps[i]();}',
		//	'for (var i in Game.customCps) {Game.cookiesPs += Game.customCps[i]();}'));
		
		
		// Game.dropRateMult
		// Return 1 to have no effect
		if(!Game.customDropRateMult) Game.customDropRateMult = [];
		CCSE.ReplaceCodeIntoFunction('Game.dropRateMult', 'return',
			`// Game.dropRateMult injection point 0
			for(var i in Game.customDropRateMult) rate *= Game.customDropRateMult[i]();`, -1);
		
		
		// -----     Shimmers block     ----- //
		
		// Game.shimmer
		// Runs when a shimmer (Golden cookie or reindeer) gets created
		// You can push a function that pops it immediately, but it will mess up any FtHoF predictor you use
		if(!Game.customShimmer) Game.customShimmer = [];
		CCSE.SliceCodeIntoFunction('Game.shimmer', -1, `
			// Game.shimmer injection point 0
			for(var i in Game.customShimmer) Game.customShimmer[i](this);
		`, 0, 1);
		
		// Game.updateShimmers
		// Runs every logic frame when shimmers matter
		if(!Game.customUpdateShimmers) Game.customUpdateShimmers = [];
		CCSE.SliceCodeIntoFunction('Game.updateShimmers', -1, `
			// Game.updateShimmers injection point 0
			for(var i in Game.customUpdateShimmers) Game.customUpdateShimmers[i]();
		`);
		
		
		// Game.killShimmers
		// Runs when we want to remove all shimmers
		if(!Game.customKillShimmers) Game.customKillShimmers = [];
		CCSE.SliceCodeIntoFunction('Game.killShimmers', -1, `
			// Game.killShimmers injection point 0
			for(var i in Game.customKillShimmers) Game.customKillShimmers[i]();
		`);
		
		
		// Game.shimmerTypes
		if(!Game.customShimmerTypesAll) Game.customShimmerTypesAll = {};
		
		if(!Game.customShimmerTypesAll.initFunc) Game.customShimmerTypesAll.initFunc = [];
		CCSE.customShimmerTypesAllinitFunc = function(me){
			for(var i in Game.customShimmerTypesAll.initFunc) Game.customShimmerTypesAll.initFunc[i](me);
		}
		
		if(!Game.customShimmerTypesAll.durationMult) Game.customShimmerTypesAll.durationMult = [];
		CCSE.customShimmerTypesAlldurationMult = function(me){
			var dur = 1;
			for(var i in Game.customShimmerTypesAll.durationMult) dur *= Game.customShimmerTypesAll.durationMult[i](me);
			return dur;
		}
		
		if(!Game.customShimmerTypesAll.updateFunc) Game.customShimmerTypesAll.updateFunc = [];
		CCSE.customShimmerTypesAllupdateFunc = function(me){
			for(var i in Game.customShimmerTypesAll.updateFunc) Game.customShimmerTypesAll.updateFunc[i](me);
		}
		
		if(!Game.customShimmerTypesAll.popFunc) Game.customShimmerTypesAll.popFunc = [];
		CCSE.customShimmerTypesAllpopFunc = function(me){
			for(var i in Game.customShimmerTypesAll.popFunc) Game.customShimmerTypesAll.popFunc[i](me);
		}
		
		if(!Game.customShimmerTypesAll.spawnConditions) Game.customShimmerTypesAll.spawnConditions = [];
		CCSE.customShimmerTypesAllspawnConditions = function(ret){
			for(var i in Game.customShimmerTypesAll.spawnConditions) ret = Game.customShimmerTypesAll.spawnConditions[i](ret);
			return ret;
		}
		
		if(!Game.customShimmerTypesAll.getTimeMod) Game.customShimmerTypesAll.getTimeMod = [];
		CCSE.customShimmerTypesAllgetTimeMod = function(me){
			var m = 1;
			for(var i in Game.customShimmerTypesAll.getTimeMod) m *= Game.customShimmerTypesAll.getTimeMod[i](me);
			return m;
		}
		
		
		// In these, "me" refers to the shimmer itself, and "this" to the shimmer's type object
		// I put this in a separate function to call them when a new type is defined
		if(!Game.customShimmerTypes) Game.customShimmerTypes = {};
		CCSE.Backup.customShimmerTypes = {};
		for(var key in Game.shimmerTypes){
			CCSE.ReplaceShimmerType(key);
		}
		
		CCSE.SliceCodeIntoFunction("Game.playGoldenCookieChime", -1, "else CCSE.PlayShimmerSpawnSound('golden')", 0);
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['golden'].initFunc", "Game.chimeType!=0", "CCSE.config.chimeType != 'No sound'", 0);
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['reindeer'].initFunc", "Game.chimeType!=0", "CCSE.config.chimeType != 'No sound'", 0);
		
		
		// Game.shimmerTypes['golden'].popFunc
		// customListPush functions should push strings to list
		// customEffectDurMod functions should return a multiplier to the effect's duration
		// customMult functions should return a multiplier to the effect's magnitude (for Lucky, Chain Cookie, and Cookie Storm drops)
		// customBuff functions should return a a buff (result from Game.gainBuff). Return buff for no effect
		if(!Game.customShimmerTypes['golden'].customListPush) Game.customShimmerTypes['golden'].customListPush = [];
		if(!Game.customShimmerTypes['golden'].customEffectDurMod) Game.customShimmerTypes['golden'].customEffectDurMod = [];
		if(!Game.customShimmerTypes['golden'].customMult) Game.customShimmerTypes['golden'].customMult = [];
		if(!Game.customShimmerTypes['golden'].customBuff) Game.customShimmerTypes['golden'].customBuff = [];
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['golden'].popFunc", 'var list=[];',
					`// Game.shimmerTypes['golden'].popFunc injection point 1
					for(var i in Game.customShimmerTypes['golden'].customListPush) Game.customShimmerTypes['golden'].customListPush[i](me, list);`, 1);
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['golden'].popFunc", 'var buff=0;',
					`// Game.shimmerTypes['golden'].popFunc injection point 2
					for(var i in Game.customShimmerTypes['golden'].customEffectDurMod) effectDurMod *= Game.customShimmerTypes['golden'].customEffectDurMod[i](me);
					for(var i in Game.customShimmerTypes['golden'].customMult) mult *= Game.customShimmerTypes['golden'].customMult[i](me);
					for(var i in Game.customShimmerTypes['golden'].customBuff) buff = Game.customShimmerTypes['golden'].customBuff[i](me, buff, choice, effectDurMod, mult);`, 1);
		
		
		// Game.shimmerTypes['reindeer'].popFunc
		// customDropRateMult should return a multiplier to the fail rate for reindeer drops
		// Game.customDropRateMult is already taken into account. This is for reindeer specific functions
		// Return 1 to have no effect. Return 0 for a guarantee*
		if(!Game.customShimmerTypes['reindeer'].customDropRateMult) Game.customShimmerTypes['reindeer'].customDropRateMult = [];
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['reindeer'].popFunc", 'if (Math.random()>failRate)',
					`// Game.shimmerTypes['reindeer'].popFunc injection point 1
					for(var i in Game.customShimmerTypes['reindeer'].customDropRateMult) failRate *= Game.customShimmerTypes['reindeer'].customDropRateMult[i](me);`, -1);
		
		
		// -----     Particles block       ----- //
		// Game.particleAdd
		temp = Game.particleAdd.toString();
		temp = temp.replaceAll("pic='icons.png';", `if (me.picPos.length == 3) {pic=me.picPos[2];me.picId = 0;}
						else pic='icons.png';`)
		eval('Game.particleAdd=' + temp);
		
		
		// -----     Notifications block   ----- //
		// -----     Prompts block         ----- //
		// -----     Menu block            ----- //
		// These start to get into the basic appearance of the game, and stray away from the gameplay itself
		// If someone has an idea they want to try that requires hooks into these functions, I can add them then
		
		
		// -----     Buildings block     ----- //
		
		// Game.Object
		// Alter this function so creating new buildings doesn't break the minigames
		CCSE.ReplaceCodeIntoFunction('Game.Object', `str+='<div class="row" id="row'+this.id+'"><div class="separatorBottom"></div>';`,
				`{
					var div = document.createElement('div');
					div.id = 'row'+this.id;
					div.classList.add('row');
					str += '<div class="separatorBottom"></div>';
				}`, 0);
		CCSE.ReplaceCodeIntoFunction('Game.Object', `str+='<div class="rowSpecial" id="rowSpecial'+this.id+'"></div>';`,
				`div.innerHTML = str;`, 1);
		CCSE.ReplaceCodeIntoFunction('Game.Object', `l('rows').innerHTML=l('rows').innerHTML+str;`,
				`l('rows').appendChild(div);`, 0);
		
		
		// Game.DrawBuildings
		// Runs every draw frame if we're not ascending
		if(!Game.customDrawBuildings) Game.customDrawBuildings = [];
		CCSE.SliceCodeIntoFunction('Game.DrawBuildings', -1, `
			// Game.DrawBuildings injection point 0
			for(var i in Game.customDrawBuildings) Game.customDrawBuildings[i]();
		`);
		
		
		// Game.modifyBuildingPrice
		// Functions should return a value to multiply the price by
		// Return 1 to have no effect
		if(!Game.customModifyBuildingPrice) Game.customModifyBuildingPrice = [];
		CCSE.ReplaceCodeIntoFunction('Game.modifyBuildingPrice', 'return', `
			// Game.modifyBuildingPrice injection point 0
			for(var i in Game.customModifyBuildingPrice) price *= Game.customModifyBuildingPrice[i](building, price);`, -1);
		
		
		// Game.storeBulkButton
		if(!Game.customStoreBulkButton) Game.customStoreBulkButton = [];
		CCSE.SliceCodeIntoFunction('Game.storeBulkButton', -1, `
			// Game.storeBulkButton injection point 0
			for(var i in Game.customStoreBulkButton) Game.customStoreBulkButton[i]();
		`);
		
		
		// Game.BuildStore
		if(!Game.customBuildStore) Game.customBuildStore = [];
		CCSE.SliceCodeIntoFunction('Game.BuildStore', -1, `
			// Game.BuildStore injection point 0
			for(var i in Game.customBuildStore) Game.customBuildStore[i]();
		`);
		
		
		// Game.RefreshStore
		if(!Game.customRefreshStore) Game.customRefreshStore = [];
		CCSE.SliceCodeIntoFunction('Game.RefreshStore', -1, `
			// Game.RefreshStore injection point 0
			for(var i in Game.customRefreshStore) Game.customRefreshStore[i]();
		`);
		
		
		// Game.scriptLoaded
		if(!Game.customScriptLoaded) Game.customScriptLoaded = [];
		if(!Game.customMinigameOnLoad) Game.customMinigameOnLoad = {};
		for(key in Game.Objects) if(!Game.customMinigameOnLoad[key]) Game.customMinigameOnLoad[key] = [];
		
		CCSE.SliceCodeIntoFunction('Game.scriptLoaded', -1, `
			// Game.scriptLoaded injection point 0
			for(var i in Game.customScriptLoaded) Game.customScriptLoaded[i](who, script); // Who knows, maybe those arguments might be needed
			for(var i in Game.customMinigameOnLoad[who.name]) Game.customMinigameOnLoad[who.name][i](who, script);
		`);
		
		
		// -----     Upgrades block     ----- //
		
		// Game.storeBuyAll
		if(!Game.customStoreBuyAll) Game.customStoreBuyAll = [];
		CCSE.SliceCodeIntoFunction('Game.storeBuyAll', -1, `
			// Game.storeBuyAll injection point 0
			for(var i in Game.customStoreBuyAll) Game.customStoreBuyAll[i]();
		`);
		
		
		// Game.CountsAsUpgradeOwned
		// Return ret to have no effect
		if(!Game.customCountsAsUpgradeOwned) Game.customCountsAsUpgradeOwned = [];
		CCSE.SpliceCodeIntoFunction('Game.CountsAsUpgradeOwned', 2, 'var ret;');
		CCSE.ReplaceCodeIntoFunction('Game.CountsAsUpgradeOwned', /return/g, 'ret =', 0);
		CCSE.SliceCodeIntoFunction('Game.CountsAsUpgradeOwned', -1, `
			// Game.CountsAsUpgradeOwned injection point 0
			for(var i in Game.customCountsAsUpgradeOwned) ret = Game.customCountsAsUpgradeOwned[i](pool, ret);
			return ret;
		`);
		
		
		// Game.Unlock
		if(!Game.customUnlock) Game.customUnlock = [];
		CCSE.SliceCodeIntoFunction('Game.Unlock', -1, `
			// Game.Unlock injection point 0
			for(var i in Game.customUnlock) Game.customUnlock[i](what);
		`);
		
		
		// Game.Lock
		if(!Game.customLock) Game.customLock = [];
		CCSE.SliceCodeIntoFunction('Game.Lock', -1, `
			// Game.Lock injection point 0
			for(var i in Game.customLock) Game.customLock[i](what);
		`);
		
		
		// Game.RebuildUpgrades
		if(!Game.customRebuildUpgrades) Game.customRebuildUpgrades = [];
		CCSE.SliceCodeIntoFunction('Game.RebuildUpgrades', -1, `
			// Game.RebuildUpgrades injection point 0
			for(var i in Game.customRebuildUpgrades) Game.customRebuildUpgrades[i]();
		`);
		
		
		// Game.GetTieredCpsMult
		// Functions should return a value to multiply mult by (Return 1 to have no effect)
		if(!Game.customGetTieredCpsMult) Game.customGetTieredCpsMult = [];
		CCSE.ReplaceCodeIntoFunction('Game.GetTieredCpsMult', 'return', `
			// Game.GetTieredCpsMult injection point 0
			for(var i in Game.customGetTieredCpsMult) mult *= Game.customGetTieredCpsMult[i](me);`, -1);
		
		
		// Game.UnlockTiered
		if(!Game.customUnlockTiered) Game.customUnlockTiered = [];
		CCSE.SliceCodeIntoFunction('Game.UnlockTiered', -1, `
			// Game.UnlockTiered injection point 0
			for(var i in Game.customUnlockTiered) Game.customUnlockTiered[i](me);
		`);
		
		
		// Game.SetResearch
		if(!Game.customSetResearch) Game.customSetResearch = [];
		CCSE.SliceCodeIntoFunction('Game.SetResearch', -1, `
			// Game.SetResearch injection point 0
			for(var i in Game.customSetResearch) Game.customSetResearch[i](what, time);
		`);
		
		
		// Game.DropEgg
		// Functions should return a value to multiply failRate by (Return 1 to have no effect)
		if(!Game.customDropEgg) Game.customDropEgg = [];
		CCSE.SpliceCodeIntoFunction('Game.DropEgg', 2,
			`// Game.DropEgg injection point 0
			for(var i in Game.customDropEgg) failRate *= Game.customDropEgg[i]();`);
		
		
		// Game.PermanentSlotIcon
		// Functions should return an upgrade id. Return id for no effect.
		if(!Game.customPermanentUpgradeId) Game.customPermanentUpgradeId = [];
		Game.customPermanentUpgradeId.push(CCSE.GetPermanentUpgrade);
		CCSE.SpliceCodeIntoFunction('Game.PermanentSlotIcon', 2,
			`// Game.PermanentSlotIcon injection point 0
			var id = Game.permanentUpgrades[slot];
			for(var i in Game.customPermanentUpgradeId) id = Game.customPermanentUpgradeId[i](slot, id);`,
			'Game.PermanentSlotIcon=' + Game.PermanentSlotIcon.toString().replaceAll('Game.permanentUpgrades[slot]','id'));
		
		
		// Game.AssignPermanentSlot
		CCSE.ReplaceCodeIntoFunction('Game.AssignPermanentSlot', 'if (!fail)',
			'for (var ii in CCSE.config.permanentUpgrades) {if (CCSE.config.permanentUpgrades[ii]==me.name) fail=1;}', -1);
		CCSE.ReplaceCodeIntoFunction('Game.AssignPermanentSlot', 'var upgrade=Game.permanentUpgrades[slot];',
			'for(var i in Game.customPermanentUpgradeId) upgrade = Game.customPermanentUpgradeId[i](slot, upgrade);', 1);
		CCSE.ReplaceCodeIntoFunction('Game.AssignPermanentSlot', 'Game.BuildAscendTree();',
			'CCSE.RectifyPermanentUpgrades();Game.BuildAscendTree();', 0);
		
		
		// Game.PutUpgradeInPermanentSlot
		if(!Game.customPutUpgradeInPermanentSlot) Game.customPutUpgradeInPermanentSlot = [];
		CCSE.SliceCodeIntoFunction('Game.PutUpgradeInPermanentSlot', -1, `
			// Game.PutUpgradeInPermanentSlot injection point 0
			for(var i in Game.customPutUpgradeInPermanentSlot) Game.customPutUpgradeInPermanentSlot[i](upgrade, slot);
		`);
		
		
		// Game.loseShimmeringVeil
		if(!Game.customLoseShimmeringVeil) Game.customLoseShimmeringVeil = [];
		CCSE.SliceCodeIntoFunction('Game.loseShimmeringVeil', -1, `
			// Game.loseShimmeringVeil injection point 0
			for(var i in Game.customLoseShimmeringVeil) Game.customLoseShimmeringVeil[i](context);
		`);
		
		
		// Game.listTinyOwnedUpgrades
		if(!Game.customListTinyOwnedUpgrades) Game.customListTinyOwnedUpgrades = [];
		CCSE.ReplaceCodeIntoFunction('Game.listTinyOwnedUpgrades', 'return', `
			// Game.listTinyOwnedUpgrades injection point 0
			for(var i in Game.customListTinyOwnedUpgrades) str = Game.customListTinyOwnedUpgrades[i](arr, str);`, -1);
		
		
		// Game.TieredUpgrade
		CCSE.ReplaceCodeIntoFunction('Game.TieredUpgrade', 'new Game.Upgrade', 'CCSE.NewUpgrade', 0);
		
		
		// Game.SynergyUpgrade
		CCSE.ReplaceCodeIntoFunction('Game.SynergyUpgrade', 'new Game.Upgrade', 'CCSE.NewUpgrade', 0);
		
		
		// Game.GrandmaSynergy
		CCSE.ReplaceCodeIntoFunction('Game.GrandmaSynergy', 'new Game.Upgrade', 'CCSE.NewUpgrade', 0);
		
		
		// Game.NewUpgradeCookie
		CCSE.ReplaceCodeIntoFunction('Game.NewUpgradeCookie', 'new Game.Upgrade', 'CCSE.NewUpgrade', 0, CCSE.Steam ?
			`var strCookieProductionMultiplierPlus=loc("Cookie production multiplier <b>+%1%</b>.",'[x]');
			var getStrCookieProductionMultiplierPlus=function(x)
			{return strCookieProductionMultiplierPlus.replace('[x]',x);}` : 0);
		CCSE.ReplaceCodeIntoFunction('Game.NewUpgradeCookie', 'return upgrade;', 'Game.cookieUpgrades.push(upgrade);', -1, CCSE.Steam ?
			`var strCookieProductionMultiplierPlus=loc("Cookie production multiplier <b>+%1%</b>.",'[x]');
			var getStrCookieProductionMultiplierPlus=function(x)
			{return strCookieProductionMultiplierPlus.replace('[x]',x);}` : 0);
		
		
		// Game.getVeilDefense
		// Return 0 for no effect
		if(!Game.customGetVeilDefense) Game.customGetVeilDefense = [];
		CCSE.ReplaceCodeIntoFunction('Game.getVeilDefense', 'return', `
			// Game.getVeilDefense injection point 0
			for(var i in Game.customGetVeilDefense) n += Game.customGetVeilDefense[i](n);`, -1);
		
		
		// Game.getVeilBoost
		// Return 0 for no effect
		if(!Game.customGetVeilBoost) Game.customGetVeilBoost = [];
		CCSE.ReplaceCodeIntoFunction('Game.getVeilBoost', 'return', `
			// Game.getVeilBoost injection point 0
			for(var i in Game.customGetVeilBoost) n += Game.customGetVeilBoost[i](n);`, -1);
		
		
		// -----     Seasons block     ----- //
		
		// Game.computeSeasons
		CCSE.ReplaceCodeIntoFunction('Game.computeSeasons', `Game.Notify(Game.seasons[this.season].start+'<div class="line"></div>','',this.icon,4);`, `
					// Game.computeSeasons injection point 0
					for(var i in Game.customUpgrades[this.name].buyFunction) Game.customUpgrades[this.name].buyFunction[i](this);`, 1);
		
		
		// Game.getSeasonDuration
		// Just rewrote it instead of doing the eval replace thing
		// Functions should return a multiplier to the season duration
		// Return 1 to have no effect
		if(!Game.customGetSeasonDuration) Game.customGetSeasonDuration = [];
		Game.getSeasonDuration = function(){
			var ret = Game.fps*60*60*24;
			// Game.getSeasonDuration injection point 0
			for(var i in Game.customGetSeasonDuration) ret *= Game.customGetSeasonDuration[i]();
			return ret;
		}
		
		
		// -----     Achievements block     ----- //
		
		// Game.Win
		if(!Game.customWin) Game.customWin = [];
		CCSE.SliceCodeIntoFunction('Game.Win', -1, `
			// Game.Win injection point 0
			for(var i in Game.customWin) Game.customWin[i](what);
		`);
		
		
		// Game.TieredAchievement
		CCSE.ReplaceCodeIntoFunction('Game.TieredAchievement', 'new Game.Achievement', 'CCSE.NewAchievement', 0);
		
		
		// Game.ProductionAchievement
		CCSE.ReplaceCodeIntoFunction('Game.ProductionAchievement', 'new Game.Achievement', 'CCSE.NewAchievement', 0);
		
		
		// Game.BankAchievement
		CCSE.ReplaceCodeIntoFunction('Game.BankAchievement', 'new Game.Achievement', 'CCSE.NewAchievement', 0);
		
		
		// Game.CpsAchievement
		CCSE.ReplaceCodeIntoFunction('Game.CpsAchievement', 'new Game.Achievement', 'CCSE.NewAchievement', 0);
		
		
		// -----     Buffs block     ----- //
		
		// Game.gainBuff
		if(!Game.customGainBuff) Game.customGainBuff = [];
		CCSE.ReplaceCodeIntoFunction('Game.gainBuff', 'return', `
			// Game.gainBuff injection point 0
			for(var i in Game.customGainBuff) Game.customGainBuff[i](buff);`, -1);
		
		
		// Game.updateBuffs
		// executed every logic frame
		if(!Game.customUpdateBuffs) Game.customUpdateBuffs = [];
		CCSE.SliceCodeIntoFunction('Game.updateBuffs', -1, `
			// Game.updateBuffs injection point 0
			for(var i in Game.customUpdateBuffs) Game.customUpdateBuffs[i]();
		`);
		
		
		for(var i in Game.buffTypes){
			var buff = Game.buffTypes[i];
			if(buff.name == 'building buff'){
				CCSE.ReplaceCodeIntoFunction('Game.buffTypes[' + i + '].func',
					'icon:[obj.iconColumn,14],',
					'icon:[obj.iconColumn,14,(obj.art.customIconsPic ? obj.art.customIconsPic : 0)],', 0);
			}
			else if(buff.name == 'building debuff'){
				CCSE.ReplaceCodeIntoFunction('Game.buffTypes[' + i + '].func',
					'icon:[obj.iconColumn,15],',
					'icon:[obj.iconColumn,15,(obj.art.customIconsPic ? obj.art.customIconsPic : 0)],', 0);
			}
		}
		
		
		// -----     GRANDMAPOCALYPSE block     ----- //
		
		// I need this because this gets used once and if I leave it out the game breaks
		function inRect(x,y,rect)
		{
			//find out if the point x,y is in the rotated rectangle rect{w,h,r,o} (width,height,rotation in radians,y-origin) (needs to be normalized)
			//I found this somewhere online I guess
			var dx = x+Math.sin(-rect.r)*(-(rect.h/2-rect.o)),dy=y+Math.cos(-rect.r)*(-(rect.h/2-rect.o));
			var h1 = Math.sqrt(dx*dx + dy*dy);
			var currA = Math.atan2(dy,dx);
			var newA = currA - rect.r;
			var x2 = Math.cos(newA) * h1;
			var y2 = Math.sin(newA) * h1;
			if (x2 > -0.5 * rect.w && x2 < 0.5 * rect.w && y2 > -0.5 * rect.h && y2 < 0.5 * rect.h) return true;
			return false;
		}
		
		// Game.UpdateGrandmapocalypse
		// executed every logic frame
		if(!Game.customUpdateGrandmapocalypse) Game.customUpdateGrandmapocalypse = [];
		CCSE.SliceCodeIntoFunction('Game.UpdateGrandmapocalypse', -1, `
			// Game.UpdateGrandmapocalypse injection point 0
			for(var i in Game.customUpdateGrandmapocalypse) Game.customUpdateGrandmapocalypse[i]();
		`);
		
		
		// Game.getWrinklersMax
		// Functions should return a value to add to n. Return 0 to have no effect
		if(!Game.customGetWrinklersMax) Game.customGetWrinklersMax = [];
		CCSE.ReplaceCodeIntoFunction('Game.getWrinklersMax', 'return', `
			// Game.getWrinklersMax injection point 0
			for(var i in Game.customGetWrinklersMax) n += Game.customGetWrinklersMax[i](n);`, -1);
		
		
		// Game.SpawnWrinkler
		if(!Game.customSpawnWrinkler) Game.customSpawnWrinkler = [];
		CCSE.ReplaceCodeIntoFunction('Game.SpawnWrinkler', 'return me', `
			// Game.SpawnWrinkler injection point 0
			for(var i in Game.customSpawnWrinkler) Game.customSpawnWrinkler[i](me);`, -1);
		
		
		// Game.UpdateWrinklers
		// customWrinklerSpawnChance functions should return a multiplier to chance. (Return 1 to have no effect)
		if(!Game.customUpdateWrinklers) Game.customUpdateWrinklers = [];
		if(!Game.customWrinklerSpawnChance) Game.customWrinklerSpawnChance = [];
		if(!Game.customWrinklerPop) Game.customWrinklerPop = [];
		CCSE.ReplaceCodeIntoFunction('Game.UpdateWrinklers', 'if (Math.random()<chance)', `
					// Game.UpdateWrinklers injection point 0
					for(var i in Game.customWrinklerSpawnChance) chance *= Game.customWrinklerSpawnChance[i]();`, -1);
		CCSE.ReplaceCodeIntoFunction('Game.UpdateWrinklers', 'Game.Earn(me.sucked);', `
					// Game.UpdateWrinklers injection point 1
					for(var i in Game.customWrinklerPop) Game.customWrinklerPop[i](me);`, -1);
		CCSE.SliceCodeIntoFunction('Game.UpdateWrinklers', -1, `
			// Game.UpdateWrinklers injection point 2
			for(var i in Game.customUpdateWrinklers) Game.customUpdateWrinklers[i]();
		`, inRect.toString());
		
		
		// Game.DrawWrinklers
		if(!Game.customDrawWrinklers) Game.customDrawWrinklers = [];
		CCSE.SliceCodeIntoFunction('Game.DrawWrinklers', -1, `
			// Game.DrawWrinklers injection point 0
			for(var i in Game.customDrawWrinklers) Game.customDrawWrinklers[i]();
		`);
		
		
		// Game.SaveWrinklers
		// Return ret to have no effect
		if(!Game.customSaveWrinklers) Game.customSaveWrinklers = [];
		CCSE.ReplaceCodeIntoFunction('Game.SaveWrinklers', 'return', `
			// Game.SaveWrinklers injection point 0
			var ret =`, 0);
		CCSE.SliceCodeIntoFunction('Game.SaveWrinklers', -1, `
			// Game.SaveWrinklers injection point 1
			for(var i in Game.customSaveWrinklers) ret = Game.customSaveWrinklers[i](ret);
			return ret;
		`);
		
		
		// Game.LoadWrinklers
		if(!Game.customLoadWrinklers) Game.customLoadWrinklers = [];
		CCSE.SliceCodeIntoFunction('Game.LoadWrinklers', -1, `
			// Game.LoadWrinklers injection point 0
			for(var i in Game.customLoadWrinklers) Game.customLoadWrinklers[i](amount, number, shinies, amountShinies);
		`);
		
		
		// -----     Special things and stuff block     ----- //
		
		// Game.UpdateSpecial
		// customSpecialTabs functions should push a string to Game.specialTabs (or not)
		if(!Game.customSpecialTabs) Game.customSpecialTabs = [];
		CCSE.ReplaceCodeIntoFunction('Game.UpdateSpecial', 'if (Game.specialTabs.length==0)',
			`// Game.UpdateSpecial injection point 0
			for(var i in Game.customSpecialTabs) Game.customSpecialTabs[i]();`, -1);
		
		
		// Game.UpgradeSanta
		if(!Game.customUpgradeSanta) Game.customUpgradeSanta = [];
		CCSE.SliceCodeIntoFunction('Game.UpgradeSanta', -1, `
			// Game.UpgradeSanta injection point 0
			for(var i in Game.customUpgradeSanta) Game.customUpgradeSanta[i]();
		`);
		
		
		// Game.hasAura
		// Return ret to have no effect
		if(!Game.customHasAura) Game.customHasAura = [];
		CCSE.SpliceCodeIntoFunction('Game.hasAura', 2, 'var ret;');
		CCSE.ReplaceCodeIntoFunction('Game.hasAura', /return/g, 'ret =', 0);
		CCSE.SliceCodeIntoFunction('Game.hasAura', -1, `
			// Game.hasAura injection point 0
			for(var i in Game.customHasAura) ret = Game.customHasAura[i](what, ret);
			return ret;
		`);
		
		
		// Game.auraMult
		// Return 1 to have no effect
		if(!Game.customAuraMult) Game.customAuraMult = [];
		CCSE.ReplaceCodeIntoFunction('Game.auraMult', 'return', `
			// Game.auraMult injection point 0
			for(var i in Game.customAuraMult) n *= Game.customAuraMult[i](what);
			return`, 0);
		
		
		// Game.SelectDragonAura
		// Actually no. This function is not conducive to customization. Seems like 2 auras is all we get.
		// customCurrentDragonAura functions should return an array index for currentAura (Return currentAura to do nothing)
		// customDragonAuraShow functions should return 1 to show that aura in the picker, 0 to not (Return show to do nothing)
		/*if(!Game.customCurrentDragonAura) Game.customCurrentDragonAura = [];
		if(!Game.customDragonAuraShow) Game.customDragonAuraShow = [];
		temp = Game.SelectDragonAura.toString();
		eval('Game.SelectDragonAura = ' + temp.replace('if (!update)',
			`for(var i in Game.customCurrentDragonAura) currentAura = Game.customCurrentDragonAura[i](slot, update, currentAura);
			if (!update)`).replace('if (i==0 || i!=otherAura)',
					`var show = (i==0 || i!=otherAura);
					for(var i in Game.customDragonAuraShow) show = Game.customDragonAuraShow[i](slot, update, i, show);
					if (show)`));*/
		
		
		// Game.DescribeDragonAura
		if(!Game.customDescribeDragonAura) Game.customDescribeDragonAura = [];
		CCSE.SliceCodeIntoFunction('Game.DescribeDragonAura', -1, `
			// Game.DescribeDragonAura injection point 0
			for(var i in Game.customDescribeDragonAura) Game.customDescribeDragonAura[i](aura);
		`);
		
		
		// Game.UpgradeDragon
		if(!Game.customUpgradeDragon) Game.customUpgradeDragon = [];
		CCSE.SliceCodeIntoFunction('Game.UpgradeDragon', -1, `
			// Game.UpgradeDragon injection point 0
			for(var i in Game.customUpgradeDragon) Game.customUpgradeDragon[i]();
		`);
		
		
		// Game.ClickSpecialPic
		if(!Game.customClickSpecialPic) Game.customClickSpecialPic = [];
		CCSE.SliceCodeIntoFunction('Game.ClickSpecialPic', -1, `
			// Game.ClickSpecialPic injection point 0
			for(var i in Game.customClickSpecialPic) Game.customClickSpecialPic[i]();
		`);
		
		
		// Game.ToggleSpecialMenu
		// customToggleSpecialMenu functions should return a string for l('specialPopup').innerHTML (Return str for no effect)
		// str.replace('background:url(img/dragon.png?v='+Game.version+');background-position:-384px 0px;', <your pic here>)
		// Pics are 96px by 96px
		if(!Game.customToggleSpecialMenu) Game.customToggleSpecialMenu = [];
		CCSE.ReplaceCodeIntoFunction('Game.ToggleSpecialMenu', "l('specialPopup').innerHTML=str;",
			`// Game.ToggleSpecialMenu injection point 0
			for(var i in Game.customToggleSpecialMenu) str = Game.customToggleSpecialMenu[i](str);`, -1);
		
		
		// Game.DrawSpecial
		// customDrawSpecialPic functions should alter the picframe object
		// Pics are 96px by 96px
		if(!Game.customDrawSpecial) Game.customDrawSpecial = [];
		if(!Game.customDrawSpecialPic) Game.customDrawSpecialPic = [];
		CCSE.ReplaceCodeIntoFunction('Game.DrawSpecial', "if (hovered || selected)",
			`// Game.DrawSpecial injection point 0
				var picframe = {pic:pic, frame:frame};
				for(var j in Game.customDrawSpecialPic) Game.customDrawSpecialPic[j](picframe, Game.specialTabs[i]);
				pic = picframe.pic; frame = picframe.frame;`, -1);
		CCSE.SliceCodeIntoFunction('Game.DrawSpecial', -1, `
			// Game.DrawSpecial injection point 1
			for(var i in Game.customDrawSpecial) Game.customDrawSpecial[i]();
		`);
		
		
		// -----     Visual Effects block     ----- //
		
		// Game.DrawBackground
		// Game.customDrawBackground functions get called in the same block that creates the cookie rain and seasonal backgrounds
		// If you want a hook somewhere else, let me know
		if(!Game.customDrawBackground) Game.customDrawBackground = [];
		CCSE.ReplaceCodeIntoFunction('Game.DrawBackground', "Timer.track('left background');",
			`// Game.DrawBackground injection point 0
			for(var i in Game.customDrawBackground) Game.customDrawBackground[i]();`, -1);
		
		// Setup for custom Milk Selector options
		CCSE.ReplaceCodeIntoFunction('Game.DrawBackground', "if (Game.milkType!=0 && Game.ascensionMode!=1) pic=Game.AllMilks[Game.milkType].pic;",
															'if (CCSE.config.milkType!="Automatic" && Game.ascensionMode!=1) pic=CCSE.GetSelectedMilk().milk.pic;', 0);
		
		// Setup for custom Background Selector options
		temp = Game.DrawBackground.toString();
		temp = temp.replace("Game.bg+'.jpg'", 'Game.bg');
		temp = temp.replace("Game.bgFade+'.jpg'", 'Game.bgFade');
		temp = temp.replace("Game.BGsByChoice[Game.bgType]", 'choice');
		temp = temp.replace("if (Game.bgType!=0 && Game.ascensionMode!=1)",
						`Game.bg += '.jpg';
						Game.bgFade += '.jpg';
						
						if (Game.ascensionMode!=1)
						{
							let choice = CCSE.GetSelectedBackground();
							if(choice.name != loc('Automatic'))`);
		temp = temp.replace("Game.Background.fillPattern(Pic(Game.bg)",
							`}
						Game.Background.fillPattern(Pic(Game.bg)`);
		eval('Game.DrawBackground = ' + temp);
		for(var i in Game.BGsByChoice) Game.BGsByChoice[i].pic += '.jpg';
		
		
		// -----     Debug block     ----- //
		
		// Game.OpenSesame
		// Game.customOpenSesame functions should add HTML strings to the debug menu
		if(!Game.customOpenSesame) Game.customOpenSesame = [];
		CCSE.ReplaceCodeIntoFunction('Game.OpenSesame', "str+='</div>';",
			`// Game.OpenSesame injection point 0
			for(var i in Game.customOpenSesame) str += Game.customOpenSesame[i]();`, -1);
		
		
		// -----     YouCustomizer block     ----- //
		
		// Game.YouCustomizer.render
		if(!Game.customYouCustomizerRender) Game.customYouCustomizerRender = [];
		CCSE.SliceCodeIntoFunction('Game.YouCustomizer.render', -1, `
			// Game.YouCustomizer.render injection point 0
			for(var i in Game.customYouCustomizerRender) Game.customYouCustomizerRender[i]();
		`);
		
		
		// Game.YouCustomizer.getGeneValue
		// Return retVal to have no effect
		temp = Game.YouCustomizer.getGeneValue.toString();
		temp = temp.replace('var gene=', 'var retVal;\r\nvar gene=');
		temp = temp.replaceAll('return', 'retVal =');
		eval('Game.YouCustomizer.getGeneValue = ' + temp);
		if(!Game.customYouCustomizerGetGeneValue) Game.customYouCustomizerGetGeneValue = [];
		CCSE.SliceCodeIntoFunction('Game.YouCustomizer.getGeneValue', -1, `
			// Game.YouCustomizer.getGeneValue injection point 0
			for(var i in Game.customYouCustomizerGetGeneValue) retVal = Game.customYouCustomizerGetGeneValue[i](id, retVal);
			return retVal;
		`);
		
		
		// Game.YouCustomizer.offsetGene
		if(!Game.customYouCustomizerOffsetGene) Game.customYouCustomizerOffsetGene = [];
		CCSE.SliceCodeIntoFunction('Game.YouCustomizer.offsetGene', -1, `
			// Game.YouCustomizer.offsetGene injection point 0
			for(var i in Game.customYouCustomizerOffsetGene) Game.customYouCustomizerOffsetGene[i](gene,off);
		`);
		
		
		// Game.YouCustomizer.randomize
		if(!Game.customYouCustomizerRandomize) Game.customYouCustomizerRandomize = [];
		CCSE.ReplaceCodeIntoFunction('Game.YouCustomizer.randomize', "Game.YouCustomizer.render();",
			`// Game.YouCustomizer.randomize injection point 0
			for(var i in Game.customYouCustomizerRandomize) str = Game.customYouCustomizerRandomize[i]();`, -1);
		
		
		// Game.YouCustomizer.renderPortrait
		if(!Game.customYouCustomizerRenderPortrait) Game.customYouCustomizerRenderPortrait = [];
		CCSE.SliceCodeIntoFunction('Game.YouCustomizer.renderPortrait', -1, `
			// Game.YouCustomizer.renderPortrait injection point 0
			for(var i in Game.customYouCustomizerRenderPortrait) Game.customYouCustomizerRenderPortrait[i]();
		`);
		
		
		// Game.YouCustomizer.prompt
		if(!Game.customYouCustomizerPrompt) Game.customYouCustomizerPrompt = [];
		if(!Game.customYouCustomizerMakeCustomizerSelector) Game.customYouCustomizerMakeCustomizerSelector = [];
		temp = Game.YouCustomizer.prompt.toString();
		temp = temp.replace('return', 'var retVal =');
		temp = temp.replace('}', `
			// Game.YouCustomizer.prompt injection point 0
			for(var i in Game.customYouCustomizerMakeCustomizerSelector) retVal = Game.customYouCustomizerMakeCustomizerSelector[i](gene,text,retVal);
			return retVal;
		}`);
		eval('Game.YouCustomizer.prompt = ' + temp);
		CCSE.SliceCodeIntoFunction('Game.YouCustomizer.prompt', -1, `
			// Game.YouCustomizer.prompt injection point 1
			for(var i in Game.customYouCustomizerPrompt) Game.customYouCustomizerPrompt[i]();
		`);
		
		
		// -----     Gifting block     ----- //
		// Game.promptGiftRedeem
		// Game.promptGiftSend
			// Submit an issue to the GitHub page with where you want a hook
			// Until that happens, these functions won't either
		
	}
	
	if(!CCSE.customReplaceShimmerType) CCSE.customReplaceShimmerType = [];
	CCSE.ReplaceShimmerType = function(key){
		var temp = '';
		var pos = 0;
		var proto;
		var escKey = key.replace(/'/g, "\\'");
		
		if(!Game.customShimmerTypes[key]) Game.customShimmerTypes[key] = {};
		CCSE.Backup.customShimmerTypes[key] = {};
		
		
		// Game.shimmerTypes[key].initFunc
		// durationMult functions should return a value to multiply the duration by
		if(!Game.customShimmerTypes[key].initFunc) Game.customShimmerTypes[key].initFunc = [];
		if(!Game.customShimmerTypes[key].durationMult) Game.customShimmerTypes[key].durationMult = [];
		Game.customShimmerTypes[key].initFunc.push(CCSE.customShimmerTypesAllinitFunc);
		Game.customShimmerTypes[key].durationMult.push(CCSE.customShimmerTypesAlldurationMult);
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].initFunc", 'me.dur=dur;',
					`// Game.shimmerTypes['` + escKey + `'].initFunc injection point 0
					for(var i in Game.customShimmerTypes['` + escKey + `'].durationMult) dur *= Game.customShimmerTypes['` + escKey + `'].durationMult[i](me);`, -1);
		CCSE.SliceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].initFunc", -1, `
					// Game.shimmerTypes['` + escKey + `'].initFunc injection point 1
					for(var i in Game.customShimmerTypes['` + escKey + `'].initFunc) Game.customShimmerTypes['` + escKey + `'].initFunc[i](me);
				`);
		//CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].initFunc", 'Game.chimeType==1 && ', '', 0);
		
		
		// Game.shimmerTypes[key].updateFunc
		if(!Game.customShimmerTypes[key].updateFunc) Game.customShimmerTypes[key].updateFunc = [];
		Game.customShimmerTypes[key].updateFunc.push(CCSE.customShimmerTypesAllupdateFunc);
		CCSE.SliceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].updateFunc", -1, `
					// Game.shimmerTypes['` + escKey + `'].updateFunc injection point 0
					for(var i in Game.customShimmerTypes['` + escKey + `'].updateFunc) Game.customShimmerTypes['` + escKey + `'].updateFunc[i](me);
				`);
		
		
		// Game.shimmerTypes[key].popFunc
		if(!Game.customShimmerTypes[key].popFunc) Game.customShimmerTypes[key].popFunc = [];
		Game.customShimmerTypes[key].popFunc.push(CCSE.customShimmerTypesAllpopFunc);
		CCSE.SliceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].popFunc", -1, `
					// Game.shimmerTypes['` + escKey + `'].popFunc injection point 0
					for(var i in Game.customShimmerTypes['` + escKey + `'].popFunc) Game.customShimmerTypes['` + escKey + `'].popFunc[i](me);
				`);
		
		
		// Game.shimmerTypes[key].spawnConditions
		// Return ret to have no effect
		if(!Game.customShimmerTypes[key].spawnConditions) Game.customShimmerTypes[key].spawnConditions = [];
		Game.customShimmerTypes[key].spawnConditions.push(CCSE.customShimmerTypesAllspawnConditions);
		CCSE.SpliceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].spawnConditions", 2, 'var ret;');
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].spawnConditions", /return/g, 'ret =', 0);
		CCSE.SliceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].spawnConditions", -1, `
					// Game.shimmerTypes['` + escKey + `'].spawnConditions injection point 0
					for(var i in Game.customShimmerTypes['` + escKey + `'].spawnConditions) ret = Game.customShimmerTypes['` + escKey + `'].spawnConditions[i](ret);
					return ret;
				`);
		
		
		// Game.shimmerTypes[key].getTimeMod
		// Functions should return a multiplier to the shimmer's spawn time (higher takes longer to spawn)
		// Return 1 to have no effect
		if(!Game.customShimmerTypes[key].getTimeMod) Game.customShimmerTypes[key].getTimeMod = [];
		Game.customShimmerTypes[key].getTimeMod.push(CCSE.customShimmerTypesAllgetTimeMod);
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].getTimeMod", 'return', `
					// Game.shimmerTypes['` + escKey + `'].getTimeMod injection point 0
					for(var i in Game.customShimmerTypes['` + escKey + `'].getTimeMod) m *= Game.customShimmerTypes['` + escKey + `'].getTimeMod[i](me);`, -1);
		
		
		for(var i in CCSE.customReplaceShimmerType) CCSE.customReplaceShimmerType[i](key);
	}
	
	if(!CCSE.customReplaceBuilding) CCSE.customReplaceBuilding = [];
	CCSE.ReplaceBuildingsStart = function(){
		if(!Game.customBuildingsAll) Game.customBuildingsAll = {};
		
		if(!Game.customBuildingsAll.switchMinigame) Game.customBuildingsAll.switchMinigame = [];
		CCSE.customBuildingsAllswitchMinigame = function(obj, on){
			for(var i in Game.customBuildingsAll.switchMinigame) Game.customBuildingsAll.switchMinigame[i](obj, on);
		}
		
		if(!Game.customBuildingsAll.getSellMultiplier) Game.customBuildingsAll.getSellMultiplier = [];
		CCSE.customBuildingsAllgetSellMultiplier = function(obj, giveBack){
			for(var i in Game.customBuildingsAll.getSellMultiplier) giveBack = Game.customBuildingsAll.getSellMultiplier[i](obj, giveBack);
			return giveBack;
		}
		
		if(!Game.customBuildingsAll.buy) Game.customBuildingsAll.buy = [];
		CCSE.customBuildingsAllbuy = function(obj, amount){
			for(var i in Game.customBuildingsAll.buy) Game.customBuildingsAll.buy[i](obj, amount);
		}
		
		if(!Game.customBuildingsAll.sell) Game.customBuildingsAll.sell = [];
		CCSE.customBuildingsAllsell = function(obj, amount, bypass){
			for(var i in Game.customBuildingsAll.sell) Game.customBuildingsAll.sell[i](obj, amount, bypass);
		}
		
		if(!Game.customBuildingsAll.sacrifice) Game.customBuildingsAll.sacrifice = [];
		CCSE.customBuildingsAllsacrifice = function(obj, amount){
			for(var i in Game.customBuildingsAll.sacrifice) Game.customBuildingsAll.sacrifice[i](obj, amount);
		}
		
		if(!Game.customBuildingsAll.buyFree) Game.customBuildingsAll.buyFree = [];
		CCSE.customBuildingsAllbuyFree = function(obj, amount){
			for(var i in Game.customBuildingsAll.buyFree) Game.customBuildingsAll.buyFree[i](obj, amount);
		}
		
		if(!Game.customBuildingsAll.getFree) Game.customBuildingsAll.getFree = [];
		CCSE.customBuildingsAllgetFree = function(obj, amount){
			for(var i in Game.customBuildingsAll.getFree) Game.customBuildingsAll.getFree[i](obj, amount);
		}
		
		if(!Game.customBuildingsAll.getFreeRanks) Game.customBuildingsAll.getFreeRanks = [];
		CCSE.customBuildingsAllgetFreeRanks = function(obj, amount){
			for(var i in Game.customBuildingsAll.getFreeRanks) Game.customBuildingsAll.getFreeRanks[i](obj, amount);
		}
		
		if(!Game.customBuildingsAll.tooltip) Game.customBuildingsAll.tooltip = [];
		CCSE.customBuildingsAlltooltip = function(obj, ret){
			for(var i in Game.customBuildingsAll.tooltip) ret = Game.customBuildingsAll.tooltip[i](obj, ret);
			return ret;
		}
		
		if(!Game.customBuildingsAll.levelTooltip) Game.customBuildingsAll.levelTooltip = [];
		CCSE.customBuildingsAlllevelTooltip = function(obj, ret){
			for(var i in Game.customBuildingsAll.levelTooltip) ret = Game.customBuildingsAll.levelTooltip[i](obj, ret);
			return ret;
		}
		
		if(!Game.customBuildingsAll.refresh) Game.customBuildingsAll.refresh = [];
		CCSE.customBuildingsAllrefresh = function(obj){
			for(var i in Game.customBuildingsAll.refresh) Game.customBuildingsAll.refresh[i](obj);
		}
		
		if(!Game.customBuildingsAll.rebuild) Game.customBuildingsAll.rebuild = [];
		CCSE.customBuildingsAllrebuild = function(obj){
			for(var i in Game.customBuildingsAll.rebuild) Game.customBuildingsAll.rebuild[i](obj);
		}
		
		if(!Game.customBuildingsAll.mute) Game.customBuildingsAll.mute = [];
		CCSE.customBuildingsAllmute = function(obj, val){
			for(var i in Game.customBuildingsAll.mute) Game.customBuildingsAll.mute[i](obj, val);
		}
		
		if(!Game.customBuildingsAll.draw) Game.customBuildingsAll.draw = [];
		CCSE.customBuildingsAlldraw = function(obj){
			for(var i in Game.customBuildingsAll.draw) Game.customBuildingsAll.draw[i](obj);
		}
		
		if(!Game.customBuildingsAll.buyFunction) Game.customBuildingsAll.buyFunction = [];
		CCSE.customBuildingsAllbuyFunction = function(obj){
			for(var i in Game.customBuildingsAll.buyFunction) Game.customBuildingsAll.buyFunction[i](obj);
		}
		
		if(!Game.customBuildingsAll.cpsMult) Game.customBuildingsAll.cpsMult = [];
		CCSE.customBuildingsAllcpsMult = function(obj){
			var mult = 1;
			for(var i in Game.customBuildingsAll.cpsMult) mult *= Game.customBuildingsAll.cpsMult[i](obj);
			return mult;
		}
		
		
		if(!Game.customBuildings) Game.customBuildings = {};
		CCSE.Backup.customBuildings = {};
		CCSE.i = 0;
	}
	
	CCSE.ReplaceBuildings = function(){
		var time = Date.now();
		
		for(var i = CCSE.i; i < Game.ObjectsN; i++){
			CCSE.ReplaceBuilding(Game.ObjectsById[i].name);
			if(Date.now() > time + 500 / Game.fps) break;
		}
		
		CCSE.i = i + 1;
		if(CCSE.i < Game.ObjectsN){
			// Didn't do all of them. Wait for priority and go again
			requestAnimationFrame(CCSE.ReplaceBuildings);
		}else{
			// Continue on
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		}
	}
	
	CCSE.ReplaceBuildingsFinish = function(){
		
		// -----     Individual Buildings block     ----- //
		
		var obj = Game.Objects['Cursor'];
		// Cursor.cps
		// cpsAdd Functions should return a value to add per non cursor building (Return 0 to have no effect)
		if(!Game.customBuildings[obj.name].cpsAdd) Game.customBuildings[obj.name].cpsAdd = [];
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		CCSE.ReplaceCodeIntoFunction("Game.Objects['Cursor'].cps", 'var mult=1;', `
			// Cursor.cps injection point 1
			for(var i in Game.customBuildings['` + obj.name + `'].cpsAdd) add += Game.customBuildings['` + obj.name + `'].cpsAdd[i](me);`, -1);
		
		
		obj = Game.Objects['Grandma'];
		// Grandma.art.pic
		// Functions should push an image name (sans the .png part) into list
		if(!Game.customGrandmaPicture) Game.customGrandmaPicture = [];
		CCSE.ReplaceCodeIntoFunction("Game.Objects['Grandma'].art.pic", 'return', `
			// Grandma.art.pic injection point 0
			for(var j in Game.customGrandmaPicture) Game.customGrandmaPicture[j](i, list);`, -1);
		
		
		// Grandma.cps
		// cpsAdd Functions should return a value to add before multiplying (Return 0 to have no effect)
		if(!Game.customBuildings[obj.name].cpsAdd) Game.customBuildings[obj.name].cpsAdd = [];
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		CCSE.ReplaceCodeIntoFunction("Game.Objects['Grandma'].cps", 'return', `
			// Grandma.cps injection point 1
			for(var i in Game.customBuildings['` + obj.name + `'].cpsAdd) add += Game.customBuildings['` + obj.name + `'].cpsAdd[i](me);`, -1);
		
	}
	
	CCSE.ReplaceBuilding = function(key){
		// A lot of Copy/Paste happened, hence why I did so many functions.
		// Also, I may not have fully tested each one.
		var temp = '';
		var pos = 0;
		var proto;
		var escKey = key.replace(/'/g, "\\'");
		var obj = Game.Objects[key];
		
		if(!Game.customBuildings[key]) Game.customBuildings[key] = {};
		CCSE.Backup.customBuildings[key] = {};
		
		// this.switchMinigame
		if(!Game.customBuildings[key].switchMinigame) Game.customBuildings[key].switchMinigame = [];
		Game.customBuildings[key].switchMinigame.push(CCSE.customBuildingsAllswitchMinigame);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].switchMinigame", -1, `
				// Game.Objects['` + escKey + `'].switchMinigame injection point 0
				for(var i in Game.customBuildings[this.name].switchMinigame) Game.customBuildings[this.name].switchMinigame[i](this, on);
			`);
		
		
		// this.getSellMultiplier
		// Return ret to have no effect
		if(!Game.customBuildings[key].getSellMultiplier) Game.customBuildings[key].getSellMultiplier = [];
		Game.customBuildings[key].getSellMultiplier.push(CCSE.customBuildingsAllgetSellMultiplier);
		CCSE.ReplaceCodeIntoFunction("Game.Objects['" + escKey + "'].getSellMultiplier", 'return', `
				// Game.Objects['` + escKey + `'].getSellMultiplier injection point 0
				for(var i in Game.customBuildings[this.name].getSellMultiplier) giveBack = Game.customBuildings[this.name].getSellMultiplier[i](this, giveBack);`, -1);
		
		
		// this.buy
		if(!Game.customBuildings[key].buy) Game.customBuildings[key].buy = [];
		Game.customBuildings[key].buy.push(CCSE.customBuildingsAllbuy);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].buy", -1, `
				// Game.Objects['` + escKey + `'].buy injection point 0
				for(var i in Game.customBuildings[this.name].buy) Game.customBuildings[this.name].buy[i](this, amount);
			`);
		
		
		// this.sell
		if(!Game.customBuildings[key].sell) Game.customBuildings[key].sell = [];
		Game.customBuildings[key].sell.push(CCSE.customBuildingsAllsell);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].sell", -1, `
				// Game.Objects['` + escKey + `'].sell injection point 0
				for(var i in Game.customBuildings[this.name].sell) Game.customBuildings[this.name].sell[i](this, amount, bypass);
			`);
		
		
		// this.sacrifice
		if(!Game.customBuildings[key].sacrifice) Game.customBuildings[key].sacrifice = [];
		Game.customBuildings[key].sacrifice.push(CCSE.customBuildingsAllsacrifice);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].sacrifice", -1, `
				// Game.Objects['` + escKey + `'].sacrifice injection point 0
				for(var i in Game.customBuildings[this.name].sacrifice) Game.customBuildings[this.name].sacrifice[i](this, amount);
			`);
		
		
		// this.buyFree
		if(!Game.customBuildings[key].buyFree) Game.customBuildings[key].buyFree = [];
		Game.customBuildings[key].buyFree.push(CCSE.customBuildingsAllbuyFree);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].buyFree", -1, `
				// Game.Objects['` + escKey + `'].buyFree injection point 0
				// CCSE overrides the price variable to turn off the conditional check
				for(var i in Game.customBuildings[this.name].buyFree) Game.customBuildings[this.name].buyFree[i](this, amount);
			`, 'var price = 0');
		
		
		// this.getFree
		if(!Game.customBuildings[key].getFree) Game.customBuildings[key].getFree = [];
		Game.customBuildings[key].getFree.push(CCSE.customBuildingsAllgetFree);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].getFree", -1, `
				// Game.Objects['` + escKey + `'].getFree injection point 0
				for(var i in Game.customBuildings[this.name].getFree) Game.customBuildings[this.name].getFree[i](this, amount);
			`);
		
		
		// this.getFreeRanks
		if(!Game.customBuildings[key].getFreeRanks) Game.customBuildings[key].getFreeRanks = [];
		Game.customBuildings[key].getFreeRanks.push(CCSE.customBuildingsAllgetFreeRanks);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].getFreeRanks", -1, `
				// Game.Objects['` + escKey + `'].getFreeRanks injection point 0
				for(var i in Game.customBuildings[this.name].getFreeRanks) Game.customBuildings[this.name].getFreeRanks[i](this, amount);
			`);
		
		
		// this.tooltip
		// Return ret to have no effect
		if(!Game.customBuildings[key].tooltip) Game.customBuildings[key].tooltip = [];
		Game.customBuildings[key].tooltip.push(CCSE.customBuildingsAlltooltip);
		CCSE.ReplaceCodeIntoFunction("Game.Objects['" + escKey + "'].tooltip", 'return', 'var ret =', 0);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].tooltip", -1, `
				// Game.Objects['` + escKey + `'].tooltip injection point 0
				for(var i in Game.customBuildings[this.name].tooltip) ret = Game.customBuildings[this.name].tooltip[i](this, ret);
				return ret;
			`);
		
		
		// this.levelTooltip
		// Return ret to have no effect
		if(!Game.customBuildings[key].levelTooltip) Game.customBuildings[key].levelTooltip = [];
		Game.customBuildings[key].levelTooltip.push(CCSE.customBuildingsAlllevelTooltip);
		CCSE.ReplaceCodeIntoFunction("Game.Objects['" + escKey + "'].levelTooltip", 'return', 'var ret =', 0);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].levelTooltip", -1, `
				// Game.Objects['` + escKey + `'].levelTooltip injection point 0
				for(var i in Game.customBuildings[this.name].levelTooltip) ret = Game.customBuildings[this.name].levelTooltip[i](this, ret);
				return ret;
			`);
		
		
		// this.levelUp
		// Haha no. This is like four functions that return each other
		// I'm not dealing with it unless I have to.
		
		
		// this.refresh
		if(!Game.customBuildings[key].refresh) Game.customBuildings[key].refresh = [];
		Game.customBuildings[key].refresh.push(CCSE.customBuildingsAllrefresh);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].refresh", -1, `
				// Game.Objects['` + escKey + `'].refresh injection point 0
				for(var i in Game.customBuildings[this.name].refresh) Game.customBuildings[this.name].refresh[i](this);
			`);
		
		
		// this.rebuild
		if(!Game.customBuildings[key].rebuild) Game.customBuildings[key].rebuild = [];
		Game.customBuildings[key].rebuild.push(CCSE.customBuildingsAllrebuild);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].rebuild", -1, `
				// Game.Objects['` + escKey + `'].rebuild injection point 0
				for(var i in Game.customBuildings[this.name].rebuild) Game.customBuildings[this.name].rebuild[i](this);
			`);
		
		
		// this.mute
		if(!Game.customBuildings[key].mute) Game.customBuildings[key].mute = [];
		Game.customBuildings[key].mute.push(CCSE.customBuildingsAllmute);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].mute", -1, `
				// Game.Objects['` + escKey + `'].mute injection point 0
				for(var i in Game.customBuildings[this.name].mute) Game.customBuildings[this.name].mute[i](this, val);
			`);
		
		
		// this.draw
		if(!Game.customBuildings[key].draw) Game.customBuildings[key].draw = [];
		Game.customBuildings[key].draw.push(CCSE.customBuildingsAlldraw);
		if(key == 'Cursor'){ // Because cursors are special
			Game.Objects[key].draw = function(){
				// Game.Objects['Cursor'].draw injection point 0
				for(var i in Game.customBuildings[this.name].draw) Game.customBuildings[this.name].draw[i](this);
			}
		}
		else{
			CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].draw", -1, `
				// Game.Objects['` + escKey + `'].draw injection point 0
				for(var i in Game.customBuildings[this.name].draw) Game.customBuildings[this.name].draw[i](this);
			`);
		}
		
		
		
		// this.buyFunction
		if(!Game.customBuildings[key].buyFunction) Game.customBuildings[key].buyFunction = [];
		Game.customBuildings[key].buyFunction.push(CCSE.customBuildingsAllbuyFunction);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].buyFunction", -1, `
				// Game.Objects['` + escKey + `'].buyFunction injection point 0
				for(var i in Game.customBuildings[this.name].buyFunction) Game.customBuildings[this.name].buyFunction[i](this);
			`);
		
		
		// this.cps
		// cpsMult Functions should return a value to multiply the price by (Return 1 to have no effect)
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		Game.customBuildings[key].cpsMult.push(CCSE.customBuildingsAllcpsMult);
		CCSE.ReplaceCodeIntoFunction("Game.Objects['" + escKey + "'].cps", 'return', `
				// Game.Objects['` + escKey + `'].cps injection point 0
				for(var i in Game.customBuildings[this.name].cpsMult) mult *= Game.customBuildings[this.name].cpsMult[i](me);
		`, -1);
		
		
		for(var i in CCSE.customReplaceBuilding) CCSE.customReplaceBuilding[i](key, obj);
	}
	
	if(!CCSE.customReplaceUpgrade) CCSE.customReplaceUpgrade = [];
	CCSE.ReplaceUpgradesStart = function(){
		if(!Game.customUpgradesAll) Game.customUpgradesAll = {};
		
		if(!Game.customUpgradesAll.getPrice) Game.customUpgradesAll.getPrice = [];
		CCSE.customUpgradesAllgetPrice = function(me){
			var ret = 1
			for(var i in Game.customUpgradesAll.getPrice) ret *= Game.customUpgradesAll.getPrice[i](me);
			return ret;
		}
		
		if(!Game.customUpgradesAll.click) Game.customUpgradesAll.click = [];
		CCSE.customUpgradesAllclick = function(me, e){
			for(var i in Game.customUpgradesAll.click) Game.customUpgradesAll.click[i](me, e);
		}
		
		if(!Game.customUpgradesAll.buy) Game.customUpgradesAll.buy = [];
		CCSE.customUpgradesAllbuy = function(me, bypass, success){
			for(var i in Game.customUpgradesAll.buy) Game.customUpgradesAll.buy[i](me, bypass, success);
		}
		
		if(!Game.customUpgradesAll.earn) Game.customUpgradesAll.earn = [];
		CCSE.customUpgradesAllearn = function(me){
			for(var i in Game.customUpgradesAll.earn) Game.customUpgradesAll.earn[i](me);
		}
		
		if(!Game.customUpgradesAll.unearn) Game.customUpgradesAll.unearn = [];
		CCSE.customUpgradesAllunearn = function(me){
			for(var i in Game.customUpgradesAll.unearn) Game.customUpgradesAll.unearn[i](me);
		}
		
		if(!Game.customUpgradesAll.unlock) Game.customUpgradesAll.unlock = [];
		CCSE.customUpgradesAllunlock = function(me){
			for(var i in Game.customUpgradesAll.unlock) Game.customUpgradesAll.unlock[i](me);
		}
		
		if(!Game.customUpgradesAll.lose) Game.customUpgradesAll.lose = [];
		CCSE.customUpgradesAlllose = function(me){
			for(var i in Game.customUpgradesAll.lose) Game.customUpgradesAll.lose[i](me);
		}
		
		if(!Game.customUpgradesAll.toggle) Game.customUpgradesAll.toggle = [];
		CCSE.customUpgradesAlltoggle = function(me){
			for(var i in Game.customUpgradesAll.toggle) Game.customUpgradesAll.toggle[i](me);
		}
		
		if(!Game.customUpgradesAll.buyFunction) Game.customUpgradesAll.buyFunction = [];
		CCSE.customUpgradesAllbuyFunction = function(me){
			for(var i in Game.customUpgradesAll.buyFunction) Game.customUpgradesAll.buyFunction[i](me);
		}
		
		if(!Game.customUpgradesAll.descFunc) Game.customUpgradesAll.descFunc = [];
		CCSE.customUpgradesAlldescFunc = function(me, desc){
			for(var i in Game.customUpgradesAll.descFunc) desc = Game.customUpgradesAll.descFunc[i](me, desc);
			return desc;
		}
		
		
		if(!Game.customUpgrades) Game.customUpgrades = {};
		CCSE.Backup.customUpgrades = {};
		CCSE.i = 0;
	}
	
	CCSE.ReplaceUpgrades = function(){
		var time = Date.now();
		
		for(var i = CCSE.i; i < Game.UpgradesN; i++){
			CCSE.ReplaceUpgrade(Game.UpgradesById[i].name);
			if(Date.now() > time + 500 / Game.fps) break;
		}
		
		CCSE.i = i + 1;
		if(CCSE.i < Game.UpgradesN){
			// Didn't do all of them. Wait for priority and go again
			requestAnimationFrame(CCSE.ReplaceUpgrades);
		}else{
			// Continue on
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		}
	}
	
	CCSE.ReplaceUpgradesFinish = function(){
		// this.getPrice
		// Functions should return a value to multiply the price by (Return 1 to have no effect)
		CCSE.ReplaceCodeIntoFunction("Game.Upgrade.prototype.getPrice", 'return Math', `
			// Game.Upgrade.prototype.getPrice injection point 0
			if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].getPrice) price *= Game.customUpgrades[this.name].getPrice[i](this);`, -1);
		
		// this.click
		CCSE.SliceCodeIntoFunction("Game.Upgrade.prototype.click", -1, `
				// Game.Upgrade.prototype.click injection point 0
				if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].click) Game.customUpgrades[this.name].click[i](this, e);
			`);
		
		// this.buy
		CCSE.ReplaceCodeIntoFunction("Game.Upgrade.prototype.buy", 'return success', `
			// Game.Upgrade.prototype.buy injection point 0
			if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].buy) Game.customUpgrades[this.name].buy[i](this, bypass, success);`, -1);
		
		// this.earn
		CCSE.SliceCodeIntoFunction("Game.Upgrade.prototype.earn", -1, `
				// Game.Upgrade.prototype.earn injection point 0
				if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].earn) Game.customUpgrades[this.name].earn[i](this);
			`);
		
		// this.unearn
		CCSE.SliceCodeIntoFunction("Game.Upgrade.prototype.unearn", -1, `
				// Game.Upgrade.prototype.unearn injection point 0
				if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].unearn) Game.customUpgrades[this.name].unearn[i](this);
			`);
		
		// this.unlock
		CCSE.SliceCodeIntoFunction("Game.Upgrade.prototype.unlock", -1, `
				// Game.Upgrade.prototype.unlock injection point 0
				if(Game.customUpgrades[this.name]) if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].unlock) Game.customUpgrades[this.name].unlock[i](this);
			`);
		
		// this.lose
		CCSE.SliceCodeIntoFunction("Game.Upgrade.prototype.lose", -1, `
				// Game.Upgrade.prototype.lose injection point 0
				if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].lose) Game.customUpgrades[this.name].lose[i](this);
			`);
		
		// this.toggle
		CCSE.SliceCodeIntoFunction("Game.Upgrade.prototype.toggle", -1, `
				// Game.Upgrade.prototype.toggle injection point 0
				if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].toggle) Game.customUpgrades[this.name].toggle[i](this);
			`);
		
		// this.isVaulted
		CCSE.SpliceCodeIntoFunction("Game.Upgrade.prototype.isVaulted", 2, `
				// Game.Upgrade.prototype.isVaulted injection point 0
				if (CCSE.config.vault.indexOf(this.name)!=-1) return true;
			`);
		
		// this.vault
		CCSE.ReplaceCodeIntoFunction("Game.Upgrade.prototype.vault", 'Game.vault', `
				if(this.CCSE) CCSE.config.vault.push(this.name);
                else `, -1);
		
		// this.unvault
		CCSE.ReplaceCodeIntoFunction("Game.Upgrade.prototype.unvault", 'Game.vault', `
				if(this.CCSE) CCSE.config.vault.splice(CCSE.config.vault.indexOf(this.name),1);
                else `, -1);
		
		
		// Golden cookie sound selector custom options
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Golden cookie sound selector'].olddescFunc", "this.choicesFunction()[Game.chimeType]", "CCSE.GetSelectedShimmerSound()", 0);
		//CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Golden cookie sound selector'].olddescFunc", "'+icon[2]+'", "'+choice.icon[2]+'", 0);
		
		// Game.Upgrades['Golden cookie sound selector'].choicesFunction
		if(!Game.customUpgrades['Golden cookie sound selector'].choicesFunction) Game.customUpgrades['Golden cookie sound selector'].choicesFunction = [];
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Golden cookie sound selector'].choicesFunction", "return choices;",
			`// Game.customUpgrades['Golden cookie sound selector'].choicesFunction injection point 0
			for(var i in Game.customUpgrades['Golden cookie sound selector'].choicesFunction) Game.customUpgrades['Golden cookie sound selector'].choicesFunction[i](choices);
			CCSE.OverrideShimmerSoundSelector(choices);`, -1);
		
		/*Game.customUpgrades['Golden cookie sound selector'].choicesFunction.push(function(choices){
			choices[1].default = 'snd/chime.mp3';
			choices[1].shimmerTypes = {golden:'snd/chime.mp3', reindeer:'snd/jingle.mp3'};
		});*/
		
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Golden cookie sound selector'].choicesPick", "Game.chimeType=id;",
			'CCSE.SetSelectedShimmerSound(id);', 0);
		
		
		// Milk selector custom options
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Milk selector'].olddescFunc", "this.choicesFunction()[Game.milkType]", "CCSE.GetSelectedMilk()", 0);
		
		// Game.Upgrades['Milk selector'].choicesFunction
		if(!Game.customUpgrades['Milk selector'].choicesFunction) Game.customUpgrades['Milk selector'].choicesFunction = [];
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Milk selector'].choicesFunction", "return choices;",
			`// Game.customUpgrades['Milk selector'].choicesFunction injection point 0
			for(var i in Game.customUpgrades['Milk selector'].choicesFunction) Game.customUpgrades['Milk selector'].choicesFunction[i](choices);
			CCSE.OverrideMilkSelector(choices);`, -1);
		
		Game.customUpgrades['Milk selector'].choicesFunction.push(function(choices){
			if(!CCSE.Steam) for(var i in choices) choices[i].milk = Game.AllMilks[i];
			choices[0].milk = Game.Milk;
		});
		
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Milk selector'].choicesPick", "Game.milkType=id;",
			'CCSE.SetSelectedMilk(id);', 0);
		
		
		// Background selector custom options
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Background selector'].olddescFunc", "this.choicesFunction()[Game.bgType]", "CCSE.GetSelectedBackground()", 0);
		
		// Game.Upgrades['Background selector'].choicesFunction
		if(!Game.customUpgrades['Background selector'].choicesFunction) Game.customUpgrades['Background selector'].choicesFunction = [];
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Background selector'].choicesFunction", "return choices;",
			`// Game.customUpgrades['Background selector'].choicesFunction injection point 0
			for(var i in Game.customUpgrades['Background selector'].choicesFunction) Game.customUpgrades['Background selector'].choicesFunction[i](choices);
			CCSE.OverrideBackgroundSelector(choices);`, -1);
		
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Background selector'].choicesPick", "Game.bgType=id;",
			'CCSE.SetSelectedBackground(id);', 0);
		
		
		// Game.Upgrades['Jukebox'].choicesFunction
		// Return str to have no effect
		if(!Game.customUpgrades['Jukebox'].choicesFunction) Game.customUpgrades['Jukebox'].choicesFunction = [];
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['Jukebox'].choicesFunction", "return",
			`// Game.customUpgrades['Jukebox'].choicesFunction injection point 0
			for(var i in Game.customUpgrades['Jukebox'].choicesFunction) str = Game.customUpgrades['Jukebox'].choicesFunction[i](str);`, -1);
		
		
		// Permanent upgrades are tricky
		var slots=['Permanent upgrade slot I','Permanent upgrade slot II','Permanent upgrade slot III','Permanent upgrade slot IV','Permanent upgrade slot V'];
		for (var i=0;i<slots.length;i++)
		{
			CCSE.SpliceCodeIntoFunction("Game.Upgrades['" + slots[i] + "'].olddescFunc", 1,
				`// ` + slots[i] + ` olddescFunc injection point 0
				var id = Game.permanentUpgrades[` + i + `];
				for(var i in Game.customPermanentUpgradeId) id = Game.customPermanentUpgradeId[i](` + i + `, id);`,
				'Game.Upgrades["' + slots[i] + '"].olddescFunc=' + Game.Upgrades[slots[i]].olddescFunc.toString().replaceAll('Game.permanentUpgrades[i]','id'));
		}
	}
	
	CCSE.ReplaceUpgrade = function(key){
		var temp = '';
		var pos = 0;
		var proto;
		var escKey = key.replace(/'/g, "\\'");
		var upgrade = Game.Upgrades[key];
		
		if(!Game.customUpgrades[key]) Game.customUpgrades[key] = {};
		CCSE.Backup.customUpgrades[key] = {};
		
		
		// this.getPrice
		// Functions should return a value to multiply the price by (Return 1 to have no effect)
		if(!Game.customUpgrades[key].getPrice) Game.customUpgrades[key].getPrice = [];
		Game.customUpgrades[key].getPrice.push(CCSE.customUpgradesAllgetPrice);
		
		
		// this.click
		if(!Game.customUpgrades[key].click) Game.customUpgrades[key].click = [];
		Game.customUpgrades[key].click.push(CCSE.customUpgradesAllclick);
		
		
		// this.buy
		if(!Game.customUpgrades[key].buy) Game.customUpgrades[key].buy = [];
		Game.customUpgrades[key].buy.push(CCSE.customUpgradesAllbuy);
		
		
		// this.earn
		if(!Game.customUpgrades[key].earn) Game.customUpgrades[key].earn = [];
		Game.customUpgrades[key].earn.push(CCSE.customUpgradesAllearn);
		
		
		// this.unearn
		if(!Game.customUpgrades[key].unearn) Game.customUpgrades[key].unearn = [];
		Game.customUpgrades[key].unearn.push(CCSE.customUpgradesAllunearn);
		
		
		// this.unlock
		if(!Game.customUpgrades[key].unlock) Game.customUpgrades[key].unlock = [];
		Game.customUpgrades[key].unlock.push(CCSE.customUpgradesAllunlock);
		
		
		// this.lose
		if(!Game.customUpgrades[key].lose) Game.customUpgrades[key].lose = [];
		Game.customUpgrades[key].lose.push(CCSE.customUpgradesAlllose);
		
		
		// this.toggle
		if(!Game.customUpgrades[key].toggle) Game.customUpgrades[key].toggle = [];
		Game.customUpgrades[key].toggle.push(CCSE.customUpgradesAlltoggle);
		
		
		// this.buyFunction
		if(!Game.customUpgrades[key].buyFunction) Game.customUpgrades[key].buyFunction = [];
		Game.customUpgrades[key].buyFunction.push(CCSE.customUpgradesAllbuyFunction);
		if(upgrade.buyFunction){
			//upgrade.oldbuyFunction = upgrade.buyFunction;
			CCSE.SliceCodeIntoFunction("Game.Upgrades['" + escKey + "'].buyFunction", -1, `
				// Game.Upgrades['` + escKey + `'].buyFunction injection point 0
				if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].buyFunction) Game.customUpgrades[this.name].buyFunction[i](this);
			`);
			
			/* This broke Frozen Cookies
			upgrade.buyFunction = function(){
				upgrade.oldbuyFunction();
				// Game.Upgrades[this.name].buyFunction injection point 0
				if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].buyFunction) Game.customUpgrades[this.name].buyFunction[i](this);
			}*/
		}else{
			upgrade.buyFunction = function(){
				// Game.Upgrades[this.name].buyFunction injection point 0
				if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].buyFunction) Game.customUpgrades[this.name].buyFunction[i](this);
			}
			CCSE.functionsAltered++;
		}
		
		
		// this.descFunc
		// Far too disparate for my desired consistency
		if(!Game.customUpgrades[key].descFunc) Game.customUpgrades[key].descFunc = [];
		Game.customUpgrades[key].descFunc.push(CCSE.customUpgradesAlldescFunc);
		if(upgrade.descFunc){
			//eval('upgrade.olddescFunc = ' + upgrade.descFunc.toString());
			upgrade.olddescFunc = upgrade.descFunc;
			upgrade.descFunc = function(){
				var desc = this.olddescFunc();
				if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].descFunc) desc = Game.customUpgrades[this.name].descFunc[i](this, desc);
				return desc;
			}
		}else{
			upgrade.descFunc = function(){
				var desc = this.ddesc ? this.ddesc : this.desc;
				// Game.Upgrades['` + escKey + `'].descFunc injection point 0
				if(Game.customUpgrades[this.name]) for(var i in Game.customUpgrades[this.name].descFunc) desc = Game.customUpgrades[this.name].descFunc[i](this, desc);
				return desc;
			}
		}
		
		for(var i in CCSE.customReplaceUpgrade) CCSE.customReplaceUpgrade[i](key, upgrade);
	}
	
	if(!CCSE.customReplaceAchievement) CCSE.customReplaceAchievement = [];
	CCSE.ReplaceAchievementsStart = function(){
		if(!Game.customAchievementsAll) Game.customAchievementsAll = {};
		
		if(!Game.customAchievementsAll.click) Game.customAchievementsAll.click = [];
		CCSE.customAchievementsAllclick = function(me){
			for(var i in Game.customAchievementsAll.click) Game.customAchievementsAll.click[i](me);
		}
		
		if(!Game.customAchievements) Game.customAchievements = {};
		CCSE.Backup.customAchievements = {};
		CCSE.i = 0;
	}
	
	CCSE.ReplaceAchievements = function(){
		var time = Date.now();
		
		for(var i = CCSE.i; i < Game.AchievementsN; i++){
			CCSE.ReplaceAchievement(Game.AchievementsById[i].name);
			if(Date.now() > time + 500 / Game.fps) break;
		}
		
		CCSE.i = i + 1;
		if(CCSE.i < Game.AchievementsN){
			// Didn't do all of them. Wait for priority and go again
			requestAnimationFrame(CCSE.ReplaceAchievements);
		}else{
			// Continue on
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		}
	}
	
	CCSE.ReplaceAchievement = function(key){
		var escKey = key.replace(/'/g, "\\'");
		var achievement = Game.Achievements[key];
		
		if(!Game.customAchievements[key]) Game.customAchievements[key] = {};
		CCSE.Backup.customAchievements[key] = {};
		
		
		// this.click
		if(!Game.customAchievements[key].click) Game.customAchievements[key].click = [];
		Game.customAchievements[key].click.push(CCSE.customAchievementsAllclick);
		CCSE.SliceCodeIntoFunction("Game.Achievements['" + escKey + "'].click", -1, `
				// Game.Achievements['` + escKey + `'].click injection point 0
				if(Game.customAchievements[this.name]) for(var i in Game.customAchievements[this.name].click) Game.customAchievements[this.name].click[i](this);
			`);
		
		
		for(var i in CCSE.customReplaceAchievement) CCSE.customReplaceAchievement[i](key, achievement);
	}
	
	CCSE.AddCCSEStyles = function(){
		CCSE.AddStyles(`input.checkbox {
		  margin: 4px;
		  border: 3px solid transparent;
		  border-image: url(img/frameBorder.png) 3 round;
		  border-radius: 2px;
		  box-shadow: 0px 0px 1px 2px rgba(0,0,0,0.5), 0px 2px 4px rgba(0,0,0,0.25), 0px 0px 6px 1px rgba(0,0,0,0.5) inset;
		  transition: opacity 0.1s ease-out;
		  vertical-align: middle;
		  min-width: 2rem;
		  min-height: 2rem;
		  text-align: center;

		  background: #000 url(img/darkNoise.jpg);
		  background-image: url(img/shadedBordersSoft.png),url(img/darkNoise.jpg);
		  background-size: 100% 100%,auto;
		  background-color: #000;

		  text-shadow: 0px 1px 1px #000;
		  color: #ccc;
		  line-height: 100%;

		  display: inline-block;
		  font-size: 12px;
		  text-decoration: none;
		  -webkit-appearance: none;

		  position: relative;
		}

		input.checkbox:checked:after {
		  content: '\\01F36A';
		  font-size: 1.25rem;
		  margin: auto;
		  position: absolute;
		  top: 50%;
		  left: 50%;
		  transform: translate(-50%,-50%);
		  text-align: center;
		}`);
	}
	
	
	/*=====================================================================================
	Menu functions
	=======================================================================================*/
	CCSE.AppendOptionsMenu = function(inp, style = 1){
		// Accepts inputs of either string or div
		// Choose div class based on given style. A style of 0 will have no class.
		var divClass;
		switch (style) {
			case 1:
				divClass = "block";
				break;
			case 2:
				divClass = "framed";
				break;
		}

		var template = document.createElement('template');
		template.innerHTML = '<div ' + (divClass ? `class="${ divClass }" ` : '') + 'style="padding:0px;margin:8px 4px;"><div class="subsection" style="padding:0px;"></div></div>';
		var div = template.content;
		var div2 = div.children[0].children[0];
		
		if(typeof inp == 'string'){
			div2.innerHTML = inp;
		}
		else{
			div2.appendChild(inp);
		}
		
		var menu = l('menu');
		if(menu){
			var padding = menu.childNodes;
			padding = padding[padding.length - 1];
			if(padding){
				menu.insertBefore(div, padding);
			} else {
				menu.appendChild(div);
			}
		}
	}
	
	CCSE.AppendCollapsibleOptionsMenu = function(title, body){
		// Title must be a string. Body may be either string or div
		var titleDiv = document.createElement('div');
		titleDiv.className = 'title';
		titleDiv.textContent = title + ' ';
		
		if(CCSE.collapseMenu[title] === undefined) CCSE.collapseMenu[title] = 0;
		
		// Stolen wholesale from Cookie Monster
		var span = document.createElement('span');
		span.style.cursor = 'pointer';
		span.style.display = 'inline-block';
		span.style.height = '14px';
		span.style.width = '14px';
		span.style.borderRadius = '7px';
		span.style.textAlign = 'center';
		span.style.backgroundColor = '#C0C0C0';
		span.style.color = 'black';
		span.style.fontSize = '13px';
		span.style.verticalAlign = 'middle';
		span.textContent = (CCSE.collapseMenu[title] ? '+' : '-');
		span.addEventListener("click", function(){
			CCSE.ToggleCollabsibleMenu(title);
			Game.UpdateMenu();
		}) ;
		titleDiv.appendChild(span);
		
		var bodyDiv;
		if(typeof body == 'string'){
			bodyDiv = document.createElement('div');
			bodyDiv.innerHTML = body;
		}
		else{
			bodyDiv = body;
		}
		
		var div = document.createElement('div');
		div.appendChild(titleDiv);
		if(!CCSE.collapseMenu[title]) div.appendChild(bodyDiv);
		
		CCSE.AppendOptionsMenu(div);
	}
	
	CCSE.ToggleCollabsibleMenu = function(title) {
		if(CCSE.collapseMenu[title] == 0){
			CCSE.collapseMenu[title]++;
		}
		else{
			CCSE.collapseMenu[title]--;
		}
	}
	
	CCSE.AppendStatsGeneral = function(inp){
		// Accepts inputs of either string or div
		var div;
		if(typeof inp == 'string'){
			div = document.createElement('div');
			div.innerHTML = inp;
		}
		else{
			div = inp;
		}
		
		var general = l('statsGeneral');
		if(general) general.appendChild(div);
	}
	
	CCSE.AppendStatsSpecial = function(inp){
		// Accepts inputs of either string or div
		var div;
		if(typeof inp == 'string'){
			div = document.createElement('div');
			div.innerHTML = inp;
		}
		else{
			div = inp;
		}
		
		var special = l('statsSpecial');
		if(!special){
			subsections = l('menu').getElementsByClassName('subsection');
			
			special = document.createElement('div');
			special.className = 'subsection';
			special.innerHTML = '<div class="title">' + loc('Special') + '</div>';
			l('menu').insertBefore(special, subsections[1]);
		}
		
		if(special) special.appendChild(div);
	}
	
	CCSE.AppendStatsVersionNumber = function(modName, versionString){
		var general = l('statsGeneral');
		var str = '<b>' + modName + ':</b> ' + versionString;
		var div = document.createElement('div');
		div.className = 'listing';
		div.innerHTML = str;
		
		if(general) general.parentNode.appendChild(div);
	}
	
	CCSE.GetMenuString = function(){
		var str = '<div class="listing">' +
			CCSE.MenuHelper.ActionButton("CCSE.ExportSave();", 'Export custom save') +
			CCSE.MenuHelper.ActionButton("CCSE.ImportSave();", 'Import custom save') +
			'<label>Back up data added by mods and managed by CCSE</label></div>';
		
		str += '<div class="listing">' + CCSE.MenuHelper.CheckBox(CCSE.config, 'showVersionNo', 'showVersionNoButton', 'Version Number ON', 'Version Number OFF', 'CCSE.togglePref') + '<label>Show the version number of CCSE in the bottom left of the screen.</label></div>';
		
		return str;
	}
	
	CCSE.PrependCollapsibleInfoMenu = function(title, body){
		// Title must be a string. Body may be either string or div
		var titleDiv = document.createElement('div');
		titleDiv.className = 'title';
		titleDiv.textContent = title + ' ';
		
		if(CCSE.collapseMenu[title + 'info'] === undefined) CCSE.collapseMenu[title + 'info'] = 0;
		
		// Stolen wholesale from Cookie Monster
		var span = document.createElement('span');
		span.style.cursor = 'pointer';
		span.style.display = 'inline-block';
		span.style.height = '14px';
		span.style.width = '14px';
		span.style.borderRadius = '7px';
		span.style.textAlign = 'center';
		span.style.backgroundColor = '#C0C0C0';
		span.style.color = 'black';
		span.style.fontSize = '13px';
		span.style.verticalAlign = 'middle';
		span.textContent = (CCSE.collapseMenu[title + 'info'] ? '+' : '-');
		span.onclick = function(){CCSE.ToggleCollabsibleMenu(title + 'info'); Game.UpdateMenu();};
		titleDiv.appendChild(span);
		
		var bodyDiv;
		if(typeof body == 'string'){
			bodyDiv = document.createElement('div');
			bodyDiv.innerHTML = body;
		}
		else{
			bodyDiv = body;
		}
		
		var div = document.createElement('div');
		div.appendChild(titleDiv);
		div.classList.add('subsection');
		if(!CCSE.collapseMenu[title + 'info']) div.appendChild(bodyDiv);
		
		
		var menu = l('menu');
		if(menu){
			var about = menu.getElementsByClassName('subsection')[0];
			if(about){
				about.parentNode.insertBefore(div, about);
			}
		}
	}
	
	CCSE.MenuHelper = {
		
		ActionButton: (action, text) =>
			'<a class="smallFancyButton option"' +
			`${ Game.clickStr }="${ action } PlaySound('snd/tick.mp3');">${ text }</a>`,
		
		Header: (text, id) =>
			'<div class="listing optionHeader" ' + (id ? `id="${ id }" ` : '') + `style="padding: 5px 16px; opacity: 0.7; font-size: 17px; font-family: Kavoon, Georgia, serif;">${ text }</div>`,

		InputBox: (id, width, value, onChange) =>
			`<input type="text" id="${ id }" class="option" style="width:${ width }px;" value="${ value }" onChange="${ onChange }">`,
		
		PasswordBox: (id, width, value, onChange) =>
			`<input type="password" id="${ id }" class="option" style="width:${ width }px;" value="${ value }" onChange="${ onChange }">`,
		
		SearchBox: (id, width, value, onChange, placeholder = 'Search') =>
			`<input type="search" id="${ id }" class="option" style="width:${ width }px;" value="${ value }" onChange="${ onChange }" placeholder="${ placeholder }">`,
		
		TinyIcon: (icon) =>
			'<div class="icon" style="vertical-align:middle;display:inline-block;margin:-16px;transform:scale(0.5);' +
			(icon[2] ? `background-image:url(${ icon[2] });` : '') +
			`background-position:${ -icon[0] * 48 }px ${ -icon[1] * 48 }px;"></div>`,
		
		Slider: (slider, leftText, rightText, startValueFunction, callback = '', min = 0, max = 100, step = 1) => {
			var value = startValueFunction();
			rightText = rightText.replace('[$]', value);
			return `<div class="sliderBox"><div style="float:left;" class="smallFancyButton">${ leftText }</div>` +
				`<div style="float:right;" class="smallFancyButton" id="${ slider }RightText">${ rightText }</div>` +
				`<input type="range" id="${ slider }" class="slider" style="clear:both;" min="${ min }" max="${ max }" step="${ step }"` +
				` value="${ value }" onchange="${ callback }" oninput="${ callback }" onmouseup="PlaySound('snd/tick.mp3');"></div>`
		},

		ToggleButton: (config, prefName, button, on, off, callback, invert) => {
			var invert = invert ? 1 : 0;
			if(!callback) callback = '';
			else callback += `('${ prefName }', '${ button }', '${ on.replace("'","\\'") }', '${ off.replace("'","\\'") }', '${ invert }');`;
			callback += "PlaySound('snd/tick.mp3');";
			var className = `smallFancyButton prefButton option${ (config[prefName]^invert) ? '' : ' off' }`;
			return `<a id="${ button }" class="${ className }" ${ Game.clickStr }="${ callback }">${ config[prefName] ? on : off }</a>`;
		},
		
		CheckBox: (config, prefName, button, on, off, callback, invert) => {
			var invert = invert ? 1 : 0;
			if(!callback) callback = '';
			else callback += `('${ prefName }', '${ button }', '${ on.replace("'","\\'") }', '${ off.replace("'","\\'") }', '${ invert }');`;
			callback += "PlaySound('snd/tick.mp3');";
			var checked = config[prefName] ? ' checked="checked"' : '';
			var className = `checkbox checkbox${ (config[prefName]^invert) ? 'on' : ' off' }`;
			return `<input type="checkbox" id="${ button }" class="${ className }" ${ checked } ${ Game.clickStr }="${ callback }">` +
				`<label id="${ button }_label" for="${ button }">${ config[prefName] ? on : off }</label>`;
		}
		
	}
	
	CCSE.togglePref = function(prefName, button, on, off, invert){
		if (CCSE.config[prefName]){
			l(button).removeAttribute('checked');
			l(button + '_label').innerHTML = off;
			CCSE.config[prefName] = 0;
		}else{
			l(button).setAttribute('checked','checked')
			l(button + '_label').innerHTML = on;
			CCSE.config[prefName] = 1;
		}
		CCSE.applyPref(prefName);
	}
	
	
	/*=====================================================================================
	Minigames
	=======================================================================================*/
	CCSE.MinigameReplacer = function(func, objKey){
		if(!Game.customMinigameOnLoad) Game.customMinigameOnLoad = {};
		if(!Game.customMinigameOnLoad[objKey]) Game.customMinigameOnLoad[objKey] = [];
		
		var me = Game.Objects[objKey];
		if(me.minigameLoaded) func(me, 'minigameScript-' + me.id);
		Game.customMinigameOnLoad[objKey].push(func);
	}
	
	CCSE.ReplaceGrimoire = function(){
		CCSE.functionsTotal += 11;
		var objKey = "Wizard tower";
		var M = Game.Objects[objKey].minigame;
		var preEvalScript = "var M = Game.Objects['" + objKey + "'].minigame;";
		
		
		// M.computeMagicM
		if(!Game.customMinigame[objKey].computeMagicM) Game.customMinigame[objKey].computeMagicM = [];
		CCSE.SliceCodeIntoFunction('M.computeMagicM', -1, `
			// M.computeMagicM injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].computeMagicM) Game.customMinigame['` + objKey + `'].computeMagicM[i]();
		`, preEvalScript);
		
		
		// M.getFailChance
		// functions should return a value to multiply failChance by (Return 1 for no effect)
		if(!Game.customMinigame[objKey].getFailChance) Game.customMinigame[objKey].getFailChance = [];
		CCSE.ReplaceCodeIntoFunction('M.getFailChance', 'return', `
			// M.getFailChance injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getFailChance) failChance *= Game.customMinigame['` + objKey + `'].getFailChance[i](spell);`, -1,
			preEvalScript);
		
		
		// M.castSpell
		// I'm open to suggestions
		
		
		// M.getSpellCost
		// functions should return a value to multiply out by (Return 1 for no effect)
		if(!Game.customMinigame[objKey].getSpellCost) Game.customMinigame[objKey].getSpellCost = [];
		CCSE.ReplaceCodeIntoFunction('M.getSpellCost', 'return', `
			// M.getSpellCost injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getSpellCost) out *= Game.customMinigame['` + objKey + `'].getSpellCost[i](spell);`, -1,
			preEvalScript);
		
		
		// M.getSpellCostBreakdown
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].getSpellCostBreakdown) Game.customMinigame[objKey].getSpellCostBreakdown = [];
		CCSE.ReplaceCodeIntoFunction('M.getSpellCostBreakdown', 'return', `
			// M.getSpellCostBreakdown injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getSpellCostBreakdown) str = Game.customMinigame['` + objKey + `'].getSpellCostBreakdown[i](spell, str);`, -1,
			preEvalScript);
		
		
		// M.spellTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].spellTooltip) Game.customMinigame[objKey].spellTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.spellTooltip', 'background-position', `' + (me.icon[2]?'background-image:url('+me.icon[2]+');':'') + 'background-position`, 0, preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.spellTooltip', 'return str', `
			// M.spellTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].spellTooltip) str = Game.customMinigame['` + objKey + `'].spellTooltip[i](id, str);`, -1,
			preEvalScript);
		
		
		// M.refillTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].refillTooltip) Game.customMinigame[objKey].refillTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.refillTooltip', 'return', 'var str = ', 0,
			preEvalScript);
		CCSE.SliceCodeIntoFunction('M.refillTooltip', -1, `
			// M.refillTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].refillTooltip) str = Game.customMinigame['` + objKey + `'].refillTooltip[i](id, str);
			return str;
		`, preEvalScript);
		
		
		// M.spells['hand of fate'].win
		// functions should push a value to choices
		if(!Game.customMinigame[objKey].fateWin) Game.customMinigame[objKey].fateWin = [];
		CCSE.ReplaceCodeIntoFunction('M.spells["hand of fate"].win', 'newShimmer.force',
					`// M.spells["hand of fate"].win injection point 0
					for(var i in Game.customMinigame['` + objKey + `'].fateWin) Game.customMinigame['` + objKey + `'].fateWin[i](choices);`, -1,
			preEvalScript);
		
		
		// M.spells['hand of fate'].fail
		// functions should push a value to choices
		if(!Game.customMinigame[objKey].fateFail) Game.customMinigame[objKey].fateFail = [];
		CCSE.ReplaceCodeIntoFunction('M.spells["hand of fate"].fail', 'newShimmer.force',
					`// M.spells["hand of fate"].fail injection point 0
					for(var i in Game.customMinigame['` + objKey + `'].fateFail) Game.customMinigame['` + objKey + `'].fateFail[i](choices);`, -1,
			preEvalScript);
		
		
		// M.launch
		if(M.launch.toString().indexOf('// M.launch injection point 0') == -1){
			CCSE.SliceCodeIntoFunction('M.launch', -1, `
	// M.launch injection point 0
	for(var i in Game.customMinigameOnLoad['` + objKey + `']) Game.customMinigameOnLoad['` + objKey + `'][i](M.parent);
`, preEvalScript);
		}
	}
	
	CCSE.ReplaceMarket = function(){
		CCSE.functionsTotal += 24;
		var objKey = "Bank";
		var M = Game.Objects[objKey].minigame;
		var preEvalScript = "var M = Game.Objects['" + objKey + "'].minigame;";
		
		
		// M.goodTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].goodTooltip) Game.customMinigame[objKey].goodTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.goodTooltip', 'return str', `
			// M.goodTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].goodTooltip) str = Game.customMinigame['` + objKey + `'].goodTooltip[i](id, str);`, -1,
			preEvalScript);
		
		
		// M.tradeTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].tradeTooltip) Game.customMinigame[objKey].tradeTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.tradeTooltip', 'return str', `
			// M.tradeTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].tradeTooltip) str = Game.customMinigame['` + objKey + `'].tradeTooltip[i](id, n, str);`, -1,
			preEvalScript);
		
		
		// M.goodDelta
		// functions should return a value to multiply val by (Return 1 for no effect)
		if(!Game.customMinigame[objKey].goodDelta) Game.customMinigame[objKey].goodDelta = [];
		CCSE.ReplaceCodeIntoFunction('M.goodDelta', 'return', `
			// M.goodDelta injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].goodDelta) val *= Game.customMinigame['` + objKey + `'].goodDelta[i](id, back);`, -1,
			preEvalScript);
		
		
		// M.getGoodMaxStock
		// functions should return an int value (Return ret for no effect)
		if(!Game.customMinigame[objKey].getGoodMaxStock) Game.customMinigame[objKey].getGoodMaxStock = [];
		CCSE.ReplaceCodeIntoFunction('M.getGoodMaxStock', 'return', 'var ret = ', 0,
			preEvalScript);
		CCSE.SliceCodeIntoFunction('M.getGoodMaxStock', -1, `
			// M.getGoodMaxStock injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getGoodMaxStock) ret = Game.customMinigame['` + objKey + `'].getGoodMaxStock[i](good, ret);
			return ret;
		`, preEvalScript);
		
		
		// M.getGoodPrice
		// functions should return a value to multiply val by (Return 1 for no effect)
		if(!Game.customMinigame[objKey].getGoodPrice) Game.customMinigame[objKey].getGoodPrice = [];
		CCSE.ReplaceCodeIntoFunction('M.getGoodPrice', 'return good.val;',
			`var val = good.val;
			// M.getGoodPrice injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getGoodPrice) val *= Game.customMinigame['` + objKey + `'].getGoodPrice[i](good);
			return val;`, 0,
			preEvalScript);
		
		
		// M.buyGood
		// functions that run when a good is purchased
		if(!Game.customMinigame[objKey].buyGood) Game.customMinigame[objKey].buyGood = [];
		CCSE.ReplaceCodeIntoFunction('M.buyGood', 'return true', `
			// M.buyGood injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].buyGood) Game.customMinigame['` + objKey + `'].buyGood[i](id, n);`, -1,
			preEvalScript);
		
		
		// M.sellGood
		// functions that run when a good is sold
		if(!Game.customMinigame[objKey].sellGood) Game.customMinigame[objKey].sellGood = [];
		CCSE.ReplaceCodeIntoFunction('M.sellGood', 'return true', `
			// M.sellGood injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].sellGood) Game.customMinigame['` + objKey + `'].sellGood[i](id, n);`, -1,
			preEvalScript);
		
		
		// M.getRestingVal
		// functions should return a number value (Return ret for no effect)
		if(!Game.customMinigame[objKey].getRestingVal) Game.customMinigame[objKey].getRestingVal = [];
		CCSE.ReplaceCodeIntoFunction('M.getRestingVal', 'return', 'var ret = ', 0,
			preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.getRestingVal', '}', `
			// M.getRestingVal injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getRestingVal) ret = Game.customMinigame['` + objKey + `'].getRestingVal[i](id, ret);
			return ret;
		`, -1, preEvalScript);
		
		
		// M.updateGoodStyle
		if(!Game.customMinigame[objKey].updateGoodStyle) Game.customMinigame[objKey].updateGoodStyle = [];
		CCSE.SliceCodeIntoFunction('M.updateGoodStyle', -1, `
			// M.updateGoodStyle injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].updateGoodStyle) Game.customMinigame['` + objKey + `'].updateGoodStyle[i](id, me);
		`, preEvalScript);
		
		
		// M.officeTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].officeTooltip) Game.customMinigame[objKey].officeTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.officeTooltip', 'return str', `
			// M.officeTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].officeTooltip) str = Game.customMinigame['` + objKey + `'].officeTooltip[i](me, str);`, -1,
			preEvalScript);
		
		
		// M.getMaxBrokers
		// functions should return an int value (Return ret for no effect)
		if(!Game.customMinigame[objKey].getMaxBrokers) Game.customMinigame[objKey].getMaxBrokers = [];
		CCSE.ReplaceCodeIntoFunction('M.getMaxBrokers', 'return', 'var ret = ', 0,
			preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.getMaxBrokers', '}', `
			// M.getMaxBrokers injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getMaxBrokers) ret = Game.customMinigame['` + objKey + `'].getMaxBrokers[i](ret);
			return ret;
		`, -1, preEvalScript);
		
		
		// M.getBrokerPrice
		// functions should return an int value (Return ret for no effect)
		if(!Game.customMinigame[objKey].getBrokerPrice) Game.customMinigame[objKey].getBrokerPrice = [];
		CCSE.ReplaceCodeIntoFunction('M.getBrokerPrice', 'return', 'var ret = ', 0,
			preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.getBrokerPrice', '}', `
			// M.getBrokerPrice injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getBrokerPrice) ret = Game.customMinigame['` + objKey + `'].getBrokerPrice[i](ret);
			return ret;
		`, -1, preEvalScript);
		
		
		// M.brokersTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].brokersTooltip) Game.customMinigame[objKey].brokersTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.brokersTooltip', 'return str', `
			// M.brokersTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].brokersTooltip) str = Game.customMinigame['` + objKey + `'].brokersTooltip[i](str);`, -1,
			preEvalScript);
		
		
		// M.loanTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].loanTooltip) Game.customMinigame[objKey].loanTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.loanTooltip', 'return str', `
			// M.loanTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].loanTooltip) str = Game.customMinigame['` + objKey + `'].loanTooltip[i](id, loan, str);`, -1,
			preEvalScript);
		
		
		// M.takeLoan
		// Will be added if given a specific request
		
		
		// M.getOppSlots
		// functions should return a value to add to slots (Return 0 for no effect)
		if(!Game.customMinigame[objKey].getOppSlots) Game.customMinigame[objKey].getOppSlots = [];
		CCSE.ReplaceCodeIntoFunction('M.getOppSlots', 'return', `
			// M.getOppSlots injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getOppSlots) slots += Game.customMinigame['` + objKey + `'].getOppSlots[i]();`, -1,
			preEvalScript);
		
		
		// M.oppTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].oppTooltip) Game.customMinigame[objKey].oppTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.oppTooltip', 'return str', `
			// M.oppTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].oppTooltip) str = Game.customMinigame['` + objKey + `'].oppTooltip[i](str);`, -1,
			preEvalScript);
		
		
		// M.refillTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].refillTooltip) Game.customMinigame[objKey].refillTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.refillTooltip', 'return', 'var str = ', 0,
			preEvalScript);
		CCSE.SliceCodeIntoFunction('M.refillTooltip', -1, `
			// M.refillTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].refillTooltip) str = Game.customMinigame['` + objKey + `'].refillTooltip[i](id, str);
			return str;
		`, preEvalScript);
		
		
		// M.tick
		if(!Game.customMinigame[objKey].tick) Game.customMinigame[objKey].tick = [];
		CCSE.SliceCodeIntoFunction('M.tick', -1, `
		// M.tick injection point 0
		for(var i in Game.customMinigame['` + objKey + `'].tick) Game.customMinigame['` + objKey + `'].tick[i]();
	`, preEvalScript);
		
		
		// M.launch
		if(M.launch.toString().indexOf('// M.launch injection point 0') == -1){
			CCSE.SliceCodeIntoFunction('M.launch', -1, `
	// M.launch injection point 0
	for(var i in Game.customMinigameOnLoad['` + objKey + `']) Game.customMinigameOnLoad['` + objKey + `'][i](M.parent);
`, preEvalScript);
		}
	}
	
	CCSE.ReplacePantheon = function(){
		CCSE.functionsTotal += 12;
		var objKey = "Temple";
		var M = Game.Objects[objKey].minigame;
		var preEvalScript = "var M = Game.Objects['" + objKey + "'].minigame;";
		
		
		// M.godTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].godTooltip) Game.customMinigame[objKey].godTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.godTooltip', 'background-position', `' + (me.icon[2]?'background-image:url('+me.icon[2]+');':'') + 'background-position`, 0, preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.godTooltip', 'return str', `
			// M.godTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].godTooltip) str = Game.customMinigame['` + objKey + `'].godTooltip[i](id, str);`, -1,
			preEvalScript);
		
		
		// M.slotTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].slotTooltip) Game.customMinigame[objKey].slotTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.slotTooltip', 'background-position', `' + (me.icon[2]?'background-image:url('+me.icon[2]+');':'') + 'background-position`, 0, preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.slotTooltip', 'return str', `
			// M.slotTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].slotTooltip) str = Game.customMinigame['` + objKey + `'].slotTooltip[i](id, str);`, -1,
			preEvalScript);
		
		
		// M.useSwap
		if(!Game.customMinigame[objKey].useSwap) Game.customMinigame[objKey].useSwap = [];
		CCSE.SliceCodeIntoFunction('M.useSwap', -1, `
			// M.useSwap injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].useSwap) Game.customMinigame['` + objKey + `'].useSwap[i](n);
		`, preEvalScript);
		
		
		// M.slotGod
		if(!Game.customMinigame[objKey].slotGod) Game.customMinigame[objKey].slotGod = [];
		CCSE.SliceCodeIntoFunction('M.slotGod', -1, `
			// M.slotGod injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].slotGod) Game.customMinigame['` + objKey + `'].slotGod[i](god, slot);
		`, preEvalScript);
		
		
		// M.dragGod
		if(!Game.customMinigame[objKey].dragGod) Game.customMinigame[objKey].dragGod = [];
		CCSE.SliceCodeIntoFunction('M.dragGod', -1, `
			// M.dragGod injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].dragGod) Game.customMinigame['` + objKey + `'].dragGod[i](what);
		`, preEvalScript);
		
		
		// M.dropGod
		if(!Game.customMinigame[objKey].dropGod) Game.customMinigame[objKey].dropGod = [];
		CCSE.SliceCodeIntoFunction('M.dropGod', -1, `
			// M.dropGod injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].dropGod) Game.customMinigame['` + objKey + `'].dropGod[i]();
		`, preEvalScript);
		
		
		// M.hoverSlot
		if(!Game.customMinigame[objKey].hoverSlot) Game.customMinigame[objKey].hoverSlot = [];
		CCSE.SliceCodeIntoFunction('M.hoverSlot', -1, `
			// M.hoverSlot injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].hoverSlot) Game.customMinigame['` + objKey + `'].hoverSlot[i](what);
		`, preEvalScript);
		
		
		// Game.hasGod
		// Game.forceUnslotGod
		
		
		// M.refillTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].refillTooltip) Game.customMinigame[objKey].refillTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.refillTooltip', 'return', 'var str = ', 0,
			preEvalScript);
		CCSE.SliceCodeIntoFunction('M.refillTooltip', -1, `
			// M.refillTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].refillTooltip) str = Game.customMinigame['` + objKey + `'].refillTooltip[i](id, str);
			return str;
		`, preEvalScript);
		
		
		// M.launch
		if(M.launch.toString().indexOf('// M.launch injection point 0') == -1){
			CCSE.SliceCodeIntoFunction('M.launch', -1, `
	// M.launch injection point 0
	for(var i in Game.customMinigameOnLoad['` + objKey + `']) Game.customMinigameOnLoad['` + objKey + `'][i](M.parent);
`, preEvalScript);
		}
	}
	
	CCSE.ReplaceGarden = function(){
		CCSE.functionsTotal += 33;
		var objKey = "Farm";
		var M = Game.Objects[objKey].minigame;
		var preEvalScript = "var M = Game.Objects['" + objKey + "'].minigame;";
		var temp = '';
		
		
		// M.logic (plantAging)
		// return age to have no effect
		if(!Game.customMinigame[objKey].plantAging) Game.customMinigame[objKey].plantAging = [];
		temp = M.logic.toString();
		temp = temp.replace('tile[1]+=', 'var age = ');
		temp = temp.replace('tile[1]=Math.max(tile[1],0);', 
								`// M.logic injection point 0
								for(var i in Game.customMinigame['` + objKey + `'].plantAging) age = Game.customMinigame['` + objKey + `'].plantAging[i](age, tile, x, y);
								tile[1] += age;
								tile[1]=Math.max(tile[1],0);`);
		eval('M.logic=' + temp);
		
		
		// M.getUnlockedN
		if(!Game.customMinigame[objKey].getUnlockedN) Game.customMinigame[objKey].getUnlockedN = [];
		CCSE.ReplaceCodeIntoFunction('M.getUnlockedN', 'return',
			`// M.getUnlockedN injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getUnlockedN) Game.customMinigame['` + objKey + `'].getUnlockedN[i]();`, -1,
			preEvalScript);
		
		
		// M.dropUpgrade
		if(!Game.customMinigame[objKey].dropUpgrade) Game.customMinigame[objKey].dropUpgrade = [];
		CCSE.SliceCodeIntoFunction('M.dropUpgrade', -1,
			`// M.dropUpgrade injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].dropUpgrade) Game.customMinigame['` + objKey + `'].dropUpgrade[i](upgrade, rate);
		`, preEvalScript);
		
		
		// M.computeMatures
		if(!Game.customMinigame[objKey].computeMatures) Game.customMinigame[objKey].computeMatures = [];
		CCSE.SliceCodeIntoFunction('M.computeMatures', -1,
			`// M.computeMatures injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].computeMatures) Game.customMinigame['` + objKey + `'].computeMatures[i](mult);
		`, preEvalScript);
		
		
		// M.getMuts
		// functions should push mutations to muts
		if(!Game.customMinigame[objKey].getMuts) Game.customMinigame[objKey].getMuts = [];
		CCSE.ReplaceCodeIntoFunction('M.getMuts', 'return',
			`// M.getMuts injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getMuts) Game.customMinigame['` + objKey + `'].getMuts[i](neighs, neighsM, muts);`, -1,
			preEvalScript);
		
		
		// M.computeBoostPlot
		// You're going to have to use MAXIMUM EFFORT
		if(!Game.customMinigame[objKey].computeBoostPlot) Game.customMinigame[objKey].computeBoostPlot = [];
		CCSE.SliceCodeIntoFunction('M.computeBoostPlot', -1,
			`// M.computeBoostPlot injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].computeBoostPlot) Game.customMinigame['` + objKey + `'].computeBoostPlot[i]();
		`, preEvalScript);
		
		
		// M.computeEffs
		// functions should change effs (or not, I'm a comment, not a cop)
		if(!Game.customMinigame[objKey].computeEffs) Game.customMinigame[objKey].computeEffs = [];
		CCSE.ReplaceCodeIntoFunction('M.computeEffs', 'M.effs=effs;',
			`// M.computeEffs injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].computeEffs) Game.customMinigame['` + objKey + `'].computeEffs[i](effs);`, -1,
			preEvalScript);
		
		
		// M.tools TODO
		
		
		// M.getCost TODO
		
		
		// M.getPlantDesc
		// Return ret for no effect
		if(!Game.customMinigame[objKey].getPlantDesc) Game.customMinigame[objKey].getPlantDesc = [];
		CCSE.ReplaceCodeIntoFunction('M.getPlantDesc', 'return', 'var ret = ', 0,
			preEvalScript);
		CCSE.SliceCodeIntoFunction('M.getPlantDesc', -1,
				`// M.getPlantDesc injection point 0
				for(var i in Game.customMinigame['` + objKey + `'].getPlantDesc) ret = Game.customMinigame['` + objKey + `'].getPlantDesc[i](me, ret);
				return ret;
			`, preEvalScript);
		
		
		// M.soilTooltip
		// Return str for no effect
		if(!Game.customMinigame[objKey].soilTooltip) Game.customMinigame[objKey].soilTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.soilTooltip', 'return str;',
				`// M.soilTooltip injection point 0
				for(var i in Game.customMinigame['` + objKey + `'].soilTooltip) str = Game.customMinigame['` + objKey + `'].soilTooltip[i](id, str);`, -1,
			preEvalScript);
		
		
		// M.seedTooltip
		// Return str for no effect
		if(!Game.customMinigame[objKey].seedTooltip) Game.customMinigame[objKey].seedTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.seedTooltip', 'return str;',
				`// M.seedTooltip injection point 0
				for(var i in Game.customMinigame['` + objKey + `'].seedTooltip) str = Game.customMinigame['` + objKey + `'].seedTooltip[i](id, str);`, -1,
			preEvalScript);
		
		
		// M.toolTooltip
		// Return str for no effect
		if(!Game.customMinigame[objKey].toolTooltip) Game.customMinigame[objKey].toolTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.toolTooltip', 'return str;',
				`// M.toolTooltip injection point 0
				for(var i in Game.customMinigame['` + objKey + `'].toolTooltip) str = Game.customMinigame['` + objKey + `'].toolTooltip[i](id, str);`, -1,
			preEvalScript);
		
		
		// M.tileTooltip
		// Return ret for no effect
		if(!Game.customMinigame[objKey].tileTooltip) Game.customMinigame[objKey].tileTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.tileTooltip', 'return function(){', `return function(){
				var ret = '';`, 0,
			preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.tileTooltip', /return str;/g, 'ret = str;', 0,
			preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.tileTooltip', '};',
				`// M.tileTooltip injection point 0
				for(var i in Game.customMinigame['` + objKey + `'].tileTooltip) ret = Game.customMinigame['` + objKey + `'].tileTooltip[i](x, y, ret);
				return ret;`, -1,
			preEvalScript);
		
		
		// M.refillTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].refillTooltip) Game.customMinigame[objKey].refillTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.refillTooltip', 'return', 'var str = ', 0,
			preEvalScript);
		CCSE.SliceCodeIntoFunction('M.refillTooltip', -1, `
			// M.refillTooltip injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].refillTooltip) str = Game.customMinigame['` + objKey + `'].refillTooltip[i](id, str);
			return str;
		`, preEvalScript);
		
		
		// M.buildPanel
		if(!Game.customMinigame[objKey].buildPanel) Game.customMinigame[objKey].buildPanel = [];
		CCSE.SliceCodeIntoFunction('M.buildPanel', -1,
			`// M.buildPanel injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].buildPanel) Game.customMinigame['` + objKey + `'].buildPanel[i]();
		`, preEvalScript);
		
		
		// M.buildPlot
		if(!Game.customMinigame[objKey].buildPlot) Game.customMinigame[objKey].buildPlot = [];
		CCSE.SliceCodeIntoFunction('M.buildPlot', -1,
			`// M.buildPlot injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].buildPlot) Game.customMinigame['` + objKey + `'].buildPlot[i]();
		`, preEvalScript);
		
		
		// M.clickTile
		if(!Game.customMinigame[objKey].clickTile) Game.customMinigame[objKey].clickTile = [];
		CCSE.SliceCodeIntoFunction('M.clickTile', -1,
			`// M.clickTile injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].clickTile) Game.customMinigame['` + objKey + `'].clickTile[i](x, y);
		`, preEvalScript);
		
		
		// M.useTool
		
		
		// M.getTile
		// Return ret to have no effect
		if(!Game.customMinigame[objKey].getTile) Game.customMinigame[objKey].getTile = [];
		CCSE.ReplaceCodeIntoFunction('M.getTile', '{', 'var ret;', 1,
			preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.getTile', 'return', 'ret =', 0,
			preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.getTile', 'return', 'else ret =', 0,
			preEvalScript);
		CCSE.SliceCodeIntoFunction('M.getTile', -1,
			`// M.getTile injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].getTile) ret = Game.customMinigame['` + objKey + `'].getTile[i](x, y, ret);
			return ret;
		`, preEvalScript);
		
		
		// M.getTile
		// Return ret to have no effect
		if(!Game.customMinigame[objKey].isTileUnlocked) Game.customMinigame[objKey].isTileUnlocked = [];
		CCSE.ReplaceCodeIntoFunction('M.isTileUnlocked', '{', 'var ret;', 1,
			preEvalScript);
		CCSE.ReplaceCodeIntoFunction('M.isTileUnlocked', /return/g, 'ret =', 0,
			preEvalScript);
		CCSE.SliceCodeIntoFunction('M.isTileUnlocked', -1,
			`// M.isTileUnlocked injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].isTileUnlocked) ret = Game.customMinigame['` + objKey + `'].isTileUnlocked[i](x, y, ret);
			return ret;
		`, preEvalScript);
		
		
		// M.computeStepT
		if(!Game.customMinigame[objKey].computeStepT) Game.customMinigame[objKey].computeStepT = [];
		CCSE.SliceCodeIntoFunction('M.computeStepT', -1,
			`// M.computeStepT injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].computeStepT) Game.customMinigame['` + objKey + `'].computeStepT[i]();
		`, preEvalScript);
		
		
		// M.convert
		if(!Game.customMinigame[objKey].convert) Game.customMinigame[objKey].convert = [];
		CCSE.SliceCodeIntoFunction('M.convert', -1,
			`// M.convert injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].convert) Game.customMinigame['` + objKey + `'].convert[i]();
		`, preEvalScript);
		
		
		// M.harvestAll
		if(!Game.customMinigame[objKey].harvestAll) Game.customMinigame[objKey].harvestAll = [];
		CCSE.SliceCodeIntoFunction('M.harvestAll', -1,
			`// M.harvestAll injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].harvestAll) Game.customMinigame['` + objKey + `'].harvestAll[i](type, mature, mortal);
		`, preEvalScript);
		
		
		// M.harvest
		if(!Game.customMinigame[objKey].harvest) Game.customMinigame[objKey].harvest = [];
		CCSE.ReplaceCodeIntoFunction('M.harvest', 'return true;',
				`// M.harvest injection point 0
				for(var i in Game.customMinigame['` + objKey + `'].harvest) Game.customMinigame['` + objKey + `'].harvest[i](x, y, manual);`, -1,
			preEvalScript);
		
		
		// M.unlockSeed
		if(!Game.customMinigame[objKey].unlockSeed) Game.customMinigame[objKey].unlockSeed = [];
		CCSE.ReplaceCodeIntoFunction('M.unlockSeed', 'return true;',
			`// M.unlockSeed injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].unlockSeed) Game.customMinigame['` + objKey + `'].unlockSeed[i](me);`, -1,
			preEvalScript);
		
		
		// M.lockSeed
		if(!Game.customMinigame[objKey].lockSeed) Game.customMinigame[objKey].lockSeed = [];
		CCSE.ReplaceCodeIntoFunction('M.lockSeed', 'return true;',
			`// M.lockSeed injection point 0
			for(var i in Game.customMinigame['` + objKey + `'].lockSeed) Game.customMinigame['` + objKey + `'].lockSeed[i](me);`, -1,
			preEvalScript);
		
		
		// M.launch
		if(M.launch.toString().indexOf('// M.launch injection point 0') == -1){
			CCSE.SliceCodeIntoFunction('M.launch', -1, `
	// M.launch injection point 0
	for(var i in Game.customMinigameOnLoad['` + objKey + `']) Game.customMinigameOnLoad['` + objKey + `'][i](M.parent);
`, preEvalScript);
		}
	}
	
	
	/*=====================================================================================
	Grimoire
	=======================================================================================*/
	if(!CCSE.customRedrawSpells) CCSE.customRedrawSpells = [];
	CCSE.RedrawSpells = function(){
		var str = '';
		var M = Game.Objects['Wizard tower'].minigame;
		
		for(var i in M.spells){
			var me = M.spells[i];
			var icon = me.icon || [28,12];
			str += '<div class="grimoireSpell titleFont" id="grimoireSpell' + me.id + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.spellTooltip(' + me.id + ')','this') + '><div class="usesIcon shadowFilter grimoireIcon" style="' + (icon[2]?'background-image:url('+icon[2]+');':'') + 'background-position:' + (-icon[0] * 48) + 'px ' + (-icon[1] * 48) + 'px;"></div><div class="grimoirePrice" id="grimoirePrice' + me.id + '">-</div></div>';
		}
		
		l('grimoireSpells').innerHTML = str;
		
		for(var i in M.spells){
			var me = M.spells[i];
			AddEvent(l('grimoireSpell' + me.id), 'click', function(spell){return function(){PlaySound('snd/tick.mp3'); M.castSpell(spell);}}(me));
		}
		
		for(var i in CCSE.customRedrawSpells) CCSE.customRedrawSpells[i]();
	}
	// Cookie Monster compatibility because it was here first
	CCSE.customRedrawSpells.push(function(){if(typeof CM != 'undefined') CM.Disp.AddTooltipGrimoire();});
	
	if(!CCSE.customNewSpell) CCSE.customNewSpell = [];
	CCSE.NewSpell = function(key, spell){
		var M = Game.Objects['Wizard tower'].minigame;
		
		M.spells[key] = spell;
		
		M.spellsById = [];
		var n = 0;
		for(var i in M.spells){
			M.spells[i].id = n;
			M.spellsById[n] = M.spells[i];
			n++;
		}
		
		for(var i in CCSE.customNewSpell) CCSE.customNewSpell[i](key, spell);
		CCSE.RedrawSpells();
	}
	
	
	/*=====================================================================================
	Pantheon
	=======================================================================================*/
	if(!CCSE.customRedrawGods) CCSE.customRedrawGods = [];
	CCSE.RedrawGods = function(){
		var str = '';
		var M = Game.Objects['Temple'].minigame;
		
		for(var i in M.slot){
			var me = M.slot[i];
			str += '<div class="ready templeGod templeGod' + (i % 4) + ' templeSlot titleFont" id="templeSlot' + i + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.slotTooltip(' + i + ')', 'this') + '><div class="usesIcon shadowFilter templeGem templeGem' + (parseInt(i) + 1) + '"></div></div>';
		}
		l('templeSlots').innerHTML = str;
		
		str = '';
		for(var i in M.gods){
			var me = M.gods[i];
			var icon = me.icon || [0,0];
			str += '<div class="ready templeGod templeGod' + (me.id % 4) + ' titleFont" id="templeGod' + me.id + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.godTooltip(' + me.id + ')', 'this') + '><div class="usesIcon shadowFilter templeIcon" style="' + (icon[2]?'background-image:url('+icon[2]+');':'') + 'background-position:' + (-icon[0] * 48) + 'px ' + (-icon[1] * 48) + 'px;"></div><div class="templeSlotDrag" id="templeGodDrag' + me.id + '"></div></div>';
			str += '<div class="templeGodPlaceholder" id="templeGodPlaceholder' + me.id + '"></div>';
		}
		l('templeGods').innerHTML = str;
		
		for(var i in M.slot){
			var me=M.slot[i];
			AddEvent(l('templeSlot' + i), 'mouseover', function(what){return function(){M.hoverSlot(what);}}(i));
			AddEvent(l('templeSlot' + i), 'mouseout', function(what){return function(){M.hoverSlot(-1);}}(i));
		}
		
		for(var i in M.gods){
			var me = M.gods[i];
			AddEvent(l('templeGodDrag' + me.id), 'mousedown', function(what){return function(){M.dragGod(what);}}(me));
			AddEvent(l('templeGodDrag' + me.id), 'mouseup', function(what){return function(){M.dropGod(what);}}(me));
		}
		
		M.load(M.save());
		for(var i in CCSE.customRedrawGods) CCSE.customRedrawGods[i]();
	}
	
	if(!CCSE.customNewGod) CCSE.customNewGod = [];
	CCSE.NewGod = function(key, god){
		var M = Game.Objects['Temple'].minigame;
		
		M.gods[key] = god;
		
		M.godsById = [];
		var n = 0;
		for(var i in M.gods){
			M.gods[i].id = n;
			M.godsById[n] = M.gods[i];
			n++;
		}
		
		for(var i in CCSE.customNewGod) CCSE.customNewGod[i](key, god);
		CCSE.RedrawGods();
	}
	
	
	/*=====================================================================================
	Garden
	=======================================================================================*/
	if(!CCSE.customNewPlant) CCSE.customNewPlant = [];
	CCSE.NewPlant = function(key, plant){
		var M = Game.Objects['Farm'].minigame;
		
		M.plants[key] = plant;
		
		M.plantsById = [];
		var n = 0;
		for(var i in M.plants){
			M.plants[i].id = n;
			M.plantsById[n] = M.plants[i];
			n++;
		}
		
		for(var i in CCSE.customNewPlant) CCSE.customNewPlant[i](key, plant);
		M.buildPanel();
	}
	
	
	/*=====================================================================================
	Save custom things
	If you use CCSE to create custom upgrades or achievements,
	it will also save their state to local storage whenever the game is saved.
		Each custom upgrade or achievement needs a unique name, or they could get overwritten.
		Yes, this means across mods as well.
		If two mods have things with the same name, the mods cannot be used at the same time.
		This is because of how the game itself keeps track of these things
	
	You can also use CCSE to save your mod data.
		Add your save data as a child of CCSE.config.OtherMods. Make sure not to step on anyone else's toes!
		Push your save function into CCSE.customSave, and push your load function into CCSE.customLoad
	=======================================================================================*/
	
	// The following code copied from https://github.com/pieroxy/lz-string
	CCSE.LZString = function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);
	
	if(!CCSE.customSave) CCSE.customSave = [];
	CCSE.save = function(type){
		CCSE.config.version = CCSE.version;
		
		for(var name in CCSE.config.Buildings){
			if(Game.Objects[name]){
				var saved = CCSE.config.Buildings[name];
				var me = Game.Objects[name];
				
				saved.amount = me.amount;
				saved.bought = me.bought;
				saved.totalCookies = me.totalCookies;
				saved.level = me.level;
				saved.muted = me.muted;
				saved.highest = me.highest;
				saved.free = me.free;
				
				if(Game.isMinigameReady(me)) saved.minigameSave = me.minigame.save(); else saved.minigameSave = '';
			}
		}
		
		for(var name in CCSE.config.Achievements){
			if(Game.Achievements[name]){
				CCSE.config.Achievements[name].won = Game.Achievements[name].won;
			}
		}
		
		for(var name in CCSE.config.Upgrades){
			if(Game.Upgrades[name]){
				CCSE.config.Upgrades[name].unlocked = Game.Upgrades[name].unlocked;
				CCSE.config.Upgrades[name].bought = Game.Upgrades[name].bought;
			}
		}
		
		for(var name in CCSE.config.Buffs){
			var buff = CCSE.config.Buffs[name];
			buff.time = 0;
			if(Game.buffs[buff.name]){
				if(Game.buffs[buff.name].time){
					buff.time = Game.buffs[buff.name].time;
					buff.maxTime = Game.buffs[buff.name].maxTime;
					buff.arg1 = Game.buffs[buff.name].arg1;
					buff.arg2 = Game.buffs[buff.name].arg2;
					buff.arg3 = Game.buffs[buff.name].arg3;
				}
			}
		}
		
		for(var name in CCSE.config.Seasons){
			var season = CCSE.config.Seasons[name];
			season.lastTime = Date.now();
			if(Game.season == name){
				season.T = Game.seasonT;
			}
			else{
				season.T = -1;
			}
		}
		
		for(var i in CCSE.customSave) CCSE.customSave[i]();
		
		var str = JSON.stringify(CCSE.config);
		//str = CCSE.LZString.compressToUTF16(str);
		
		if(type == 2){
			return str;
		}
		else if(type == 3){
			return JSON.stringify(CCSE.config, null, 2);
		}
		else if (type==1){
			str = escape(utf8_to_b64(str) + '!END!');
			return str;
		}
		else{
			return str;
			/*str = utf8_to_b64(str) + '!END!';
			str = escape(str);
			Game.localStorageSet(CCSE.name, str);*/
		}
	}
	
	if(!CCSE.customLoad) CCSE.customLoad = [];
	CCSE.load = function(data, isBase64){
		var config;
		var str = '';
		
		var cautiousDecompress = function(data){
			var ret = null;
			try{
				ret = JSON.parse(data);
			}catch{
				ret = CCSE.LZString.decompressFromUTF16(data);
				ret = JSON.parse(ret);
			}
			
			return ret;
		}
		
		if(isBase64){ // Getting here from import CCSE in menu
			if(data){
				str = unescape(data);
			}
			
			if(str != ''){
				str = str.split('!END!')[0];
				str = b64_to_utf8(str);
				config = cautiousDecompress(str);
			}
		}
		else{ // Getting here from game function call
			if(data){ // Has data in game save
				config = cautiousDecompress(data);
			}
		}
		
		
		CCSE.InitializeConfig(config);
		
		
		if(CCSE.config.version != CCSE.version){
			//l('logButton').classList.add('hasUpdate');
			CCSE.collapseMenu['CCSEinfo'] = 0;
		}else{
			CCSE.collapseMenu['CCSEinfo'] = 1;
		}
		
		for(var name in CCSE.config.Buildings){
			if(Game.Objects[name]){
				var saved = CCSE.config.Buildings[name];
				var me = Game.Objects[name];
				
				me.switchMinigame(false);
				me.pics = [];
				
				me.amount = saved.amount;
				me.bought = saved.bought;
				me.totalCookies = saved.totalCookies;
				me.level = saved.level;
				me.muted = saved.muted;
				me.highest = saved.highest ? saved.highest : 0; // Left this out earlier, can't expect it to be there
				me.free = saved.free ? saved.free : 0; // Left this out earlier, can't expect it to be there
				
				me.minigameSave = saved.minigameSave;
				if(me.minigame && me.minigameLoaded && me.minigame.reset){me.minigame.reset(true); me.minigame.load(me.minigameSave);}
				
				Game.BuildingsOwned += me.amount;
			}
		}
		
		for(var name in CCSE.config.Achievements){
			if(Game.Achievements[name]){
				Game.Achievements[name].won = CCSE.config.Achievements[name].won;
			}
		}
		
		for(var name in CCSE.config.Upgrades){
			if(Game.Upgrades[name]){
				Game.Upgrades[name].unlocked = CCSE.config.Upgrades[name].unlocked;
				Game.Upgrades[name].bought = CCSE.config.Upgrades[name].bought;
			}
		}
		
		for(var name in CCSE.config.Buffs){
			var found = false;
			for(var i in Game.buffTypes) if(Game.buffTypes[i].name == name) found = true;
			if(found){
				if(CCSE.config.Buffs[name].time){
					var buff = CCSE.config.Buffs[name];
					Game.gainBuff(name, buff.maxTime / Game.fps, buff.arg1, buff.arg2, buff.arg3).time = buff.time;
				}
			}
		}
		
		for(var name in CCSE.config.Seasons){
			if(Game.seasons[name]){
				if(CCSE.config.Seasons[name].T > 0){
					Game.season = name;
					Game.seasonT = CCSE.config.Seasons[name].T;
					var framesElapsed = Math.ceil(((Date.now() - CCSE.config.Seasons[name].lastTime) / 1000) * Game.fps);
					if(Game.seasonT > 0) Game.seasonT = Math.max(Game.seasonT - framesElapsed, 1);
				}
				
				if(Game.Has('Season switcher')) Game.Unlock(Game.seasons[name].trigger);
			}
		}
		
		Game.upgradesToRebuild = 1;
		for(var i in CCSE.customLoad) CCSE.customLoad[i]();
		
		Game.Win('Third-party');
	}
	
	CCSE.InitializeConfig = function(config){
		if(!CCSE.config)					 CCSE.config = {};
		if(!CCSE.config.version)			 CCSE.config.version = 1;
		if(!CCSE.config.Achievements)		 CCSE.config.Achievements = {};
		if(!CCSE.config.Upgrades)			 CCSE.config.Upgrades = {};
		if(!CCSE.config.Buildings)			 CCSE.config.Buildings = {};
		if(!CCSE.config.Buffs)				 CCSE.config.Buffs = {};
		if(!CCSE.config.Seasons)			 CCSE.config.Seasons = {};
		if(!CCSE.config.OtherMods)			 CCSE.config.OtherMods = {};
		if(!CCSE.config.vault)				 CCSE.config.vault = [];
		if(!CCSE.config.permanentUpgrades)	 CCSE.config.permanentUpgrades = [-1,-1,-1,-1,-1];
		if(!CCSE.config.chimeType)			 CCSE.config.chimeType = 'No sound';
		if(!CCSE.config.milkType)			 CCSE.config.milkType = 'Automatic';
		if(!CCSE.config.bgType)				 CCSE.config.bgType = 'Automatic';
		if(CCSE.config.showVersionNo === undefined) CCSE.config.showVersionNo = 1;
		
		if(config){
			if(config.version) CCSE.config.version = config.version;
			if(config.Achievements)		 for(var i in config.Achievements)		CCSE.config.Achievements[i] = config.Achievements[i];
			if(config.Upgrades)			 for(var i in config.Upgrades)			CCSE.config.Upgrades[i] = config.Upgrades[i];
			if(config.Buildings)		 for(var i in config.Buildings)			CCSE.config.Buildings[i] = config.Buildings[i];
			if(config.Buffs)			 for(var i in config.Buffs)				CCSE.config.Buffs[i] = config.Buffs[i];
			if(config.Seasons)			 for(var i in config.Seasons)			CCSE.config.Seasons[i] = config.Seasons[i];
			if(config.OtherMods)		 for(var i in config.OtherMods)			CCSE.config.OtherMods[i] = config.OtherMods[i];
			if(config.vault)			 for(var i in config.vault)				CCSE.config.vault[i] = config.vault[i];
			if(config.permanentUpgrades) for(var i in config.permanentUpgrades) CCSE.config.permanentUpgrades[i] = config.permanentUpgrades[i];
			if(config.chimeType) CCSE.config.chimeType = config.chimeType;
			if(config.milkType)  CCSE.config.milkType = config.milkType;
			if(config.bgType)    CCSE.config.bgType = config.bgType;
			if(config.showVersionNo !== undefined) CCSE.config.showVersionNo = config.showVersionNo;
		}
	}
	
	CCSE.applyPref = function(prefName){
		switch(prefName){
			case 'showVersionNo':
				if(CCSE.config[prefName]){
					l('CCSEversionNumber').style.display = '';
					l('CCSEversionGame').style.display = '';
				}else{
					l('CCSEversionNumber').style.display = 'none';
					l('CCSEversionGame').style.display = 'none';
				}
				break;
		}
	}
	
	// These two kept for people who might be blindsided by the save format change
	CCSE.ExportSave = function(){
		Game.Prompt(
			'<h3>Export configuration</h3>' +
			'<div class="block">This is your CCSE save.<br>It contains data that other mods authors decided to allow CCSE to manage, as well as data for custom things added through CCSE (i.e. achivements, upgrades, etc)</div>' +
			'<div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;" readonly>' + CCSE.save(1) + '</textarea></div>',
			['All done!']);
		l('textareaPrompt').focus();
		l('textareaPrompt').select();
	}
	
	CCSE.ImportSave = function(){
		var load = 'if(l("textareaPrompt").value.length > 0){CCSE.load(l("textareaPrompt").value, 1); Game.ClosePrompt(); Game.UpdateMenu();}';
		Game.Prompt(
			'<h3>Import config</h3>'+
			'<div class="block">Paste your CCSE save here.</div>'+
			'<div class="block"><textarea id="textareaPrompt" style="width: 100%; height: 128px;"></textarea></div>',
			[['Load', load], 'Nevermind']);
		l('textareaPrompt').focus();
	}
	
	CCSE.reset = function(hard){
		for(var name in CCSE.config.Buildings){
			var me = CCSE.config.Buildings[name];
			me.amount=0;me.bought=0;me.highest=0;me.free=0;me.totalCookies=0;
			me.onMinigame = false;
			if(hard) me.muted=0;
			me.pics=[];
		}
		
		for(var name in CCSE.config.Achievements){
			if(hard) CCSE.config.Achievements[name].won = 0;
		}
		
		for(var name in CCSE.config.Upgrades){
			var me = CCSE.config.Upgrades[name];
			me.bought = 0;
			me.unlocked = 0;
		}
		
		for(var name in CCSE.config.Buffs){
			var buff = CCSE.config.Buffs[name];
			buff.time = 0;
			buff.maxTime = 0;
			buff.arg1 = 0;
			buff.arg2 = 0;
			buff.arg3 = 0;
		}
		
		for(var name in CCSE.config.Seasons){
			var season = CCSE.config.Seasons[name];
			season.lastTime = Date.now();
			season.T = 0;
		}
		
		
		if(hard){
			CCSE.config.vault = [];
			CCSE.config.permanentUpgrades = [-1,-1,-1,-1,-1];
			CCSE.config.chimeType = 'No sound';
			CCSE.config.milkType = 'Automatic';
			CCSE.config.bgType = 'Automatic';
		} else {
			if(Game.ascensionMode != 1){
				for(var i in CCSE.config.permanentUpgrades){
					if(CCSE.config.permanentUpgrades[i] != -1)
						if(Game.Upgrades[CCSE.config.permanentUpgrades[i]])
							Game.Upgrades[CCSE.config.permanentUpgrades[i]].earn();
				}
			}
		}
	}
	
	
	/*=====================================================================================
	Standard creation helpers
	=======================================================================================*/
	CCSE.NewUpgrade = function(name, desc, price, icon, buyFunction){
		var me = new Game.Upgrade(name, desc, price, icon, buyFunction);
		CCSE.ReplaceUpgrade(name);
		
		if(CCSE.config.Upgrades[name]){
			me.unlocked = CCSE.config.Upgrades[name].unlocked;
			me.bought = CCSE.config.Upgrades[name].bought;
		}else{
			CCSE.config.Upgrades[name] = {
				unlocked: 0,
				bought: 0
			}
		}
		
		me.CCSE = 1;
		
		if(typeof LocalizeUpgradesAndAchievs !== 'undefined') LocalizeUpgradesAndAchievs();
		return me;
	}
	
	CCSE.NewHeavenlyUpgrade = function(name, desc, price, icon, posX, posY, parents, buyFunction){
		var me = CCSE.NewUpgrade(name, desc, price, icon, buyFunction);
		Game.PrestigeUpgrades.push(me);
		
		me.pool = 'prestige';
		me.posX = posX;
		me.posY = posY;
		me.order = me.id;
		
		me.parents = parents;
		if(me.parents.length == 0) me.parents = ['Legacy'];
		me.parents = me.parents || [-1];
		for(var ii in me.parents){
			if(me.parents[ii] != -1) me.parents[ii] = Game.Upgrades[me.parents[ii]];
		}
		
		return me;
	}
	
	CCSE.NewAchievement = function(name, desc, icon){
		var me = new Game.Achievement(name, desc, icon);
		CCSE.ReplaceAchievement(name);
		
		if(CCSE.config.Achievements[name]){
			me.won = CCSE.config.Achievements[name].won;
		}else{
			CCSE.config.Achievements[name] = {
				won: 0
			}
		}
		
		if(typeof LocalizeUpgradesAndAchievs !== 'undefined') LocalizeUpgradesAndAchievs();
		return me;
	}
	
	CCSE.NewBuilding = function(name, commonName, desc, icon, iconColumn, art, price, cps, buyFunction, foolObject, buildingSpecial){
		var me = new Game.Object(name, commonName, desc, icon, iconColumn, art, price, cps, buyFunction);
		
		// This is the name, description, and icon used during Business Season
		if(foolObject) Game.foolObjects[name] = foolObject;
		// The name of this building's golden cookie buff and debuff
		if(buildingSpecial) Game.goldenCookieBuildingBuffs[name] = buildingSpecial;
		
		CCSE.ReplaceBuilding(name);
		
		if(art.customBuildingPic){
			Game.customBuildStore.push(function(){
				l('productIcon' + me.id).style.backgroundImage = 'url(' + art.customBuildingPic + ')';
				l('productIconOff' + me.id).style.backgroundImage = 'url(' + art.customBuildingPic + ')';
			});
		}
		if(art.customIconsPic){
			Game.customBuildings[name].tooltip.push(function(obj, ret){
				if(me.locked) return ret;
				else return ret.replace('background-position', 'background-image:url(' + obj.art.customIconsPic + ');background-position');
			});
		}
		
		
		
		if(CCSE.config.Buildings[name]){
			var saved = CCSE.config.Buildings[name];
			me.amount = saved.amount;
			me.bought = saved.bought;
			me.totalCookies = saved.totalCookies;
			me.level = saved.level;
			me.muted = saved.muted;
			me.highest = saved.highest ? saved.highest : 0; // Left this out earlier, can't expect it to be there
			me.free = saved.free ? saved.free : 0; // Left this out earlier, can't expect it to be there
			me.minigameSave = saved.minigameSave;
			
			Game.BuildingsOwned += me.amount;
			
		}else{
			var saved = {};
			saved.amount = 0;
			saved.bought = 0;
			saved.totalCookies = 0;
			saved.level = 0;
			saved.muted = 0;
			saved.free = 0;
			saved.highest = 0;
			saved.minigameSave = '';
			
			CCSE.config.Buildings[name] = saved;
		}
		
		
		Game.BuildStore();
		
		
		me.canvas=l('rowCanvas'+me.id);
		me.ctx=me.canvas.getContext('2d',{alpha:false});
		me.pics=[];
		var icon=[0*64,me.icon*64];
		var muteStr = '<div class="tinyProductIcon" id="mutedProduct'+me.id+'" style="display:none;' + (me.art.customBuildingPic ? 'background-image:url(' + me.art.customBuildingPic + ');' : '') + 'background-position:-'+icon[0]+'px -'+icon[1]+'px;" '+Game.clickStr+'="Game.ObjectsById['+me.id+'].mute(0);PlaySound(Game.ObjectsById['+me.id+'].muted?\'snd/clickOff.mp3\':\'snd/clickOn.mp3\');" '+Game.getDynamicTooltip('Game.mutedBuildingTooltip('+me.id+')','this')+'></div>';
		
		AddEvent(me.canvas,'mouseover',function(me){return function(){me.mouseOn=true;}}(me));
		AddEvent(me.canvas,'mouseout',function(me){return function(){me.mouseOn=false;}}(me));
		AddEvent(me.canvas,'mousemove',function(me){return function(e){var box=this.getBoundingClientRect();me.mousePos[0]=e.pageX-box.left;me.mousePos[1]=e.pageY-box.top;}}(me));
		
		l('buildingsMute').innerHTML+=muteStr;
		
		
		
		Game.recalculateGains = 1;
		return me;
	}
	
	CCSE.NewBuff = function(name, func){
		var me = new Game.buffType(name, func);
		
		if(CCSE.config.Buffs[name]){
			if(CCSE.config.Buffs[name].time){
				CCSE.config.Buffs[name].name = func().name;
				var buff = CCSE.config.Buffs[name];
				Game.gainBuff(name, buff.maxTime / Game.fps, buff.arg1, buff.arg2, buff.arg3).time = buff.time;
			}
		}else{
			CCSE.config.Buffs[name] = {
				name: func().name,
				maxTime: 0,
				time: 0,
				arg1: 0,
				arg2: 0,
				arg3: 0
			}
		}
		
		return me;
	}
	
	CCSE.NewSeason = function(name, firstDay, lastDay, season, announcement){
		Game.seasons[name] = season;
		
		lastDay.setDate(lastDay.getDate() + 1); // lastDay is inclusive
		if(Date.now() >= firstDay && Date.now() <= lastDay) Game.baseSeason = name;
		
		CCSE.customLoad.push(function(){
			if(Game.season == name && Game.season == Game.baseSeason){
				Game.Notify(announcement[0], announcement[1], announcement[2], 60 * 3);
			}
		});
		
		CCSE.ReplaceCodeIntoFunction('Game.WriteSave', /\(\(Game.season/g, "((Game.season && Game.season != '" + name + "'", 0);
		
		Game.computeSeasons();
		Game.computeSeasonPrices();
		
		if(CCSE.config.Seasons[name]){
			if(CCSE.config.Seasons[name].T > 0){
				Game.seasonT = CCSE.config.Seasons[name].T;
				Game.season = name;
				var framesElapsed = Math.ceil(((Date.now() - CCSE.config.Seasons[name].lastTime) / 1000) * Game.fps);
				if(Game.seasonT > 0) Game.seasonT = Math.max(Game.seasonT - framesElapsed, 1);
			}
		}else{
			CCSE.config.Seasons[name] = {
				T: 0,
				lastTime: Date.now()
			}
		}
		
		if(Game.Has('Season switcher')) Game.Unlock(Game.seasons[name].trigger);
		Game.upgradesToRebuild = 1;
	}
	
	CCSE.NewShimmerSoundSelection = function(name, icon, defaultSound, shimmerTypes){
		// name				What the game will display in the selector
		// icon				An array [x, y, (optional)url] See how upgrades handle icons to get an idea
		// defaultSound		The default sound to play for a shimmer spawn
		// shimmerTypes		For different sounds for each shimmer type {golden:'soundUrl',reindeer:'differentSoundUrl'}
		let sound = {name:name, icon:icon};
		if(defaultSound) sound.default = defaultSound;
		if(shimmerTypes) sound.shimmerTypes = shimmerTypes;
		
		Game.customUpgrades['Golden cookie sound selector'].choicesFunction.push(function(choices){
			choices.push(sound);
		});
	}
	
	CCSE.NewMilkSelection = function(name, icon, pic){
		// name		What the game will display in the selector
		// icon		An array [x, y, (optional)url] See how upgrades handle icons to get an idea
		// pic		Url to your picture
		
		let milk = {name:name, icon:icon, milk:{pic:pic}, order:Game.AllMilks.length};
		Game.customUpgrades['Milk selector'].choicesFunction.push(function(choices){
			choices.push(milk);
		});
	}
	
	CCSE.NewBackgroundSelection = function(name, icon, pic){
		// name		What the game will display in the selector
		// icon		An array [x, y, (optional)url] See how upgrades handle icons to get an idea
		// pic		Url to your picture
		
		let bg = {name:name, icon:icon, pic:pic};
		Game.customUpgrades['Background selector'].choicesFunction.push(function(choices){
			choices.push(bg);
		});
	}
	
	
	/*=====================================================================================
	Custom Selector helper functions
	=======================================================================================*/
	CCSE.OverrideShimmerSoundSelector = function(choices){
		let found = false;
		for(var i in choices){
			let choice = choices[i];
			if(choice.name == CCSE.config.chimeType){choice.selected = 1; found = true}
			else choice.selected = false;
		}
		
		// If the selected sound is from an unloaded mod, default to Chime
		if(!found) choices[1].selected = 1;
	}
	
	CCSE.GetSelectedShimmerSound = function(){
		let choices = Game.Upgrades['Golden cookie sound selector'].choicesFunction();
		let choice = choices[1];
		for(var i in choices) if(choices[i].selected) choice = choices[i];
		return choice;
	}
	
	CCSE.SetSelectedShimmerSound = function(id){
		let choices = Game.Upgrades['Golden cookie sound selector'].choicesFunction();
		Game.chimeType = (id > 4 ? 0 : id);    // Manually update when vanilla choices change
		CCSE.config.chimeType = choices[id].name;
	}
	
	CCSE.PlayShimmerSpawnSound = function(shimmerType){
		//if(Game.chimeType){ // Game.chimeType is 0 for No sound
			let choice = CCSE.GetSelectedShimmerSound();
			let sfx = '';
			if(choice.shimmerTypes && choice.shimmerTypes[shimmerType] !== undefined) sfx = choice.shimmerTypes[shimmerType];
			else if(choice.default) sfx = choice.default;
			
			PlaySound(sfx);
		//}
	}
	
	CCSE.OverrideMilkSelector = function(choices){
		let found = false;
		for(var i in choices){
			let choice = choices[i];
			if(choice.name == CCSE.config.milkType){choice.selected = 1; found = true}
			else choice.selected = false;
		}
		
		// If the selected milk is from an unloaded mod, default to Automatic
		if(!found) choices[0].selected = 1;
	}
	
	CCSE.GetSelectedMilk = function(){
		let choices = Game.Upgrades['Milk selector'].choicesFunction();
		let choice = {milk:Game.Milk};
		for(var i in choices) if(choices[i].selected) choice = choices[i];
		return choice;
	}
	
	CCSE.SetSelectedMilk = function(id){
		Game.milkType = (id<Game.AllMilks.length ? id : 0); // Vanilla value defaults to 0 (Automatic)
		CCSE.config.milkType = Game.Upgrades['Milk selector'].choicesFunction()[id].name;
	}
	
	CCSE.OverrideBackgroundSelector = function(choices){
		let found = false;
		for(var i in choices){
			let choice = choices[i];
			if(choice.name == CCSE.config.bgType){choice.selected = 1; found = true}
			else choice.selected = false;
		}
		
		// If the selected bg is from an unloaded mod, default to Automatic
		if(!found) choices[0].selected = 1;
	}
	
	CCSE.GetSelectedBackground = function(){
		let choices = Game.Upgrades['Background selector'].choicesFunction();
		let choice = choices[0];
		for(var i in choices) if(choices[i].selected){
			choice = choices[i];
			if(Game.BGsByChoice[i]) choice.pic = Game.BGsByChoice[i].pic;
		}
		return choice;
	}
	
	CCSE.SetSelectedBackground = function(id){
		Game.bgType = (Game.BGsByChoice[id] ? id : 0); // Vanilla value defaults to 0 (Automatic)
		CCSE.config.bgType = Game.Upgrades['Background selector'].choicesFunction()[id].name;
	}
	
	
	/*=====================================================================================
	Other
	=======================================================================================*/
	CCSE.AddMoreWrinklers = function(n){
		var j = Game.wrinklers.length;
		for (var i = j; i < j + n; i++){
			Game.wrinklers.push({id:parseInt(i),close:0,sucked:0,phase:0,x:0,y:0,r:0,hurt:0,hp:Game.wrinklerHP,selected:0,type:0});
		}
	}
	
	CCSE.CreateSpecialObject = function(name, conditionFunc, pictureFunc, drawFunc){
		// name            the key to identify this particular special object. Must be unique
		// conditionFunc   a function that returns true if the object should be shown, false if not
		// pictureFunc     a function that recieves and alters an object picframe{pic:<url>, frame:<integer>}
		// drawFunc        a function that recieves and returns an HTML string.
		
		Game.customSpecialTabs.push(function(){
			if(conditionFunc()) Game.specialTabs.push(name);
		});
		
		Game.customDrawSpecialPic.push(function(picframe, tab){
			if(tab == name) pictureFunc(picframe);
		});
		
		
		Game.customToggleSpecialMenu.push(function(str){
			if(Game.specialTab == name) str = drawFunc(str);
			return str;
		});
	}
	
	CCSE.SetSpecialMenuImage = function(str, pic, frame){
		// We assume that Game.specialTab is not santa or dragon
		return str.replace(
			'background:url('+Game.resPath+'img/dragon.png?v='+Game.version+');background-position:'+(-4*96)+'px 0px;',
			'background:url(' + pic + ');background-position:' + (frame * (-96)) + 'px 0px;');
	}
	
	CCSE.GetPermanentUpgrade = function(slot, id){
		if(CCSE.config.permanentUpgrades[slot] == -1) return id;
		return (Game.Upgrades[CCSE.config.permanentUpgrades[slot]] ? Game.Upgrades[CCSE.config.permanentUpgrades[slot]].id : -1);
	}
	
	CCSE.RectifyPermanentUpgrades = function(){
		for(var i in Game.permanentUpgrades){
			if(Game.permanentUpgrades[i] != -1){
				var upgrade = Game.UpgradesById[Game.permanentUpgrades[i]];
				if(upgrade.CCSE){
					Game.permanentUpgrades[i] = -1;
					CCSE.config.permanentUpgrades[i] = upgrade.name;
				}else{
					CCSE.config.permanentUpgrades[i] = -1;
				}
			}
		}
	}
	
	CCSE.AddStyles = function(content){
		var style = document.createElement('style');
		style.setAttribute('type', 'text/css');
		style.innerHTML = content;
		document.getElementsByTagName('head')[0].appendChild(style);
	}
	
	
	/*=====================================================================================
	Confirmation Prompts
	=======================================================================================*/
	CCSE.ConfirmLoad = function(modName, modVersion, versionText){
		return confirm(
			`${ modName } version ${ modVersion } is meant for ${ versionText }.  `+
			"Loading a different version may cause errors.  " +
			`Do you still want to load ${ modName }?`);
	}
	CCSE.ConfirmGameVersion = function(modName, modVersion, version){
		var proceed = true;
		if(Game.version != version){
			proceed = CCSE.ConfirmLoad(modName, modVersion, `Game version ${ version }`);
		}
		return proceed;
	}
	
	CCSE.ConfirmCCSEVersion = function(modName, modVersion, version){
		var proceed = true;
		if(CCSE.version != version){
			proceed = CCSE.ConfirmLoad(modName, modVersion, `CCSE version ${ version }`);
		}
		return proceed;
	}
	
	CCSE.ConfirmGameCCSEVersion = function(modName, modVersion, gameVersion, ccseVersion){
		var proceed = true;
		if(Game.version != gameVersion && CCSE.version != ccseVersion){
			proceed = CCSE.ConfirmLoad(modName, modVersion, `Game version ${ gameVersion } and CCSE version ${ ccseVersion }`);
		}
		else if(Game.version != gameVersion){
			proceed = CCSE.ConfirmLoad(modName, modVersion, `Game version ${ gameVersion }`);
		}
		else if(CCSE.version != ccseVersion){
			proceed = CCSE.ConfirmLoad(modName, modVersion, `CCSE version ${ ccseVersion }`);
		}
		return proceed;
	}
	
	/*  Doesn't work until the mods actually get loaded in order
	CCSE.LaunchCCSEMod = function(func){
		if(CCSE.isLoaded) func();
		else CCSE.postLoadHooks.push(func);
	}*/
	
	if(CCSE.Steam){
		CCSE.GetModPath = (modName) => {
			let mod = App.mods[modName];
			let pos = mod.dir.lastIndexOf('\\');
			if(pos == -1) return '../mods/' + (mod.local ? 'local' : 'workshop') + '/' + mod.path;
			else return '../mods/' + mod.dir.substring(pos + 1);
		}
		
		CCSE.GetModFolder = (modName) => App.mods[modName].path;
		
		CCSE.MenuHelper.AutoVersion = (mod) => {
			let func = function(){
				let modInfo = Steam.mods[mod.id].info;
				Game.customStatsMenu.push(function(){
					CCSE.AppendStatsVersionNumber(modInfo.Name, modInfo.ModVersion);
				});
			}
			
			if(CCSE.isLoaded) func();
			else CCSE.postLoadHooks.push(func);
		}
	}
	
	
	/*=====================================================================================
	Start your engines
	=======================================================================================*/
	//if(CCSE.ConfirmGameVersion(CCSE.name, CCSE.version, CCSE.GameVersion)){
		Game.registerMod(CCSE.name, CCSE);
		
		if(CCSE.Steam){
			CCSE.LaunchOtherMods = Game.launchMods;
			Game.launchMods = CCSE.init;
			
			CCSE.GameLoadModData = Game.loadModData;
			Game.loadModData = function(){CCSE.gameHasLoadedSave=1;}
		}
	//}
}

if(!CCSE.isLoaded && !CCSE.loading) CCSE.launch();
(function() {
	//#region package.json
	var version = "1.4.0";
	//#endregion
	//#region src/modInfo.ts
	var name = "Choose Your Own Lump";
	//#endregion
	//#region src/discrepancyInfo.ts
	var discrepancyInfo = {
		available: false,
		previous: {
			lumpT: 1599999999998,
			lumpOverripeAge: 86400002
		},
		current: {
			lumpT: 1599999999999,
			lumpOverripeAge: 86400001
		},
		expectedDiscrepancy: 42
	};
	function clearDiscrepancyInfo() {
		discrepancyInfo.available = false;
	}
	function getDiscrepancyInfoForStorage() {
		return {
			lumpT: Math.floor(Game.lumpT),
			lumpOverripeAge: Game.lumpOverripeAge
		};
	}
	function loadDiscrepancyInfo(storedDiscrepancyInfo, newPrefs, isInitialLoad) {
		discrepancyInfo.available = false;
		discrepancyInfo.previous = storedDiscrepancyInfo;
		discrepancyInfo.expectedDiscrepancy = newPrefs.discrepancy;
		function retriever() {
			discrepancyInfo.current.lumpT = Game.lumpT;
			discrepancyInfo.current.lumpOverripeAge = Game.lumpOverripeAge;
			discrepancyInfo.available = true;
		}
		if (isInitialLoad) retriever();
		else setTimeout(retriever, 0);
	}
	function discrepancyInfoRetrievalFallback(newPrefs, isInitialLoad) {
		discrepancyInfo.expectedDiscrepancy = newPrefs.discrepancy;
		if (isInitialLoad) discrepancyInfo.available = false;
		else {
			discrepancyInfo.available = false;
			discrepancyInfo.previous.lumpT = Game.lumpT;
			setTimeout(() => {
				discrepancyInfo.current.lumpT = Game.lumpT;
				discrepancyInfo.current.lumpOverripeAge = Game.lumpOverripeAge;
				discrepancyInfo.previous.lumpOverripeAge = Game.lumpOverripeAge;
				discrepancyInfo.available = true;
			}, 0);
		}
	}
	//#endregion
	//#region src/preferences.ts
	function getDefaultPreferences() {
		return {
			discrepancy: 1,
			display: {
				compactGrandmapocalypseRepresentation: false,
				rows: 10,
				reportType: "fullList",
				showCheckmark: true,
				useMatureGoldenLumpSprite: false
			},
			filtering: {
				threeColumnDragonAuras: false,
				conditions: {
					preserveDragon: "observe",
					preservePantheon: "observe",
					preserveGrandmapocalypseStage: "observe",
					respectBudget: "observe"
				},
				includeType: {
					normal: false,
					bifurcated: false,
					golden: true,
					meaty: false,
					caramelized: true
				}
			}
		};
	}
	var preferences = getDefaultPreferences();
	function setPreferences(newPreferences) {
		Object.assign(preferences, newPreferences);
	}
	//#endregion
	//#region src/planner/util.ts
	function getCurrentFilteringPreferences() {
		return structuredClone(preferences.filtering);
	}
	function getCurrentGameState() {
		let currentRigidelSlot = "none";
		let slots = Game?.Objects["Temple"]?.minigame?.slot ?? null;
		if (slots) {
			let rigidelId = Game.Objects["Temple"].minigame.gods["order"].id;
			if (slots[0] == rigidelId) currentRigidelSlot = "diamond";
			if (slots[1] == rigidelId) currentRigidelSlot = "ruby";
			if (slots[2] == rigidelId) currentRigidelSlot = "jade";
		}
		if (Game.BuildingsOwned % 10 != 0) currentRigidelSlot = "none";
		return {
			discrepancy: preferences.discrepancy,
			hasSteviaCaelestis: Boolean(Game.Has("Stevia Caelestis")),
			hasSucralosiaInutilis: Boolean(Game.Has("Sucralosia Inutilis")),
			hasSugarAgingProcess: Boolean(Game.Has("Sugar aging process")),
			seed: Game.seed,
			currentLumpT: Math.floor(Game.lumpT),
			currentRigidelSlot,
			currentGrandmaCount: Game.Objects["Grandma"].amount,
			currentGrandmapocalypseStage: Game.elderWrath,
			currentHasDragonsCurve: Game.hasAura("Dragon's Curve"),
			currentHasRealityBending: Game.hasAura("Reality Bending"),
			currentHasSupremeIntellect: Game.hasAura("Supreme Intellect")
		};
	}
	var bankFactor = .01;
	function getCurrentBudget() {
		function maximumPurchases(building, cap) {
			let budget = Game.cookies * bankFactor;
			for (let count = building.amount; count <= cap; count++) if (building.getSumPrice(count - building.amount) > budget) return count - 1;
			return cap;
		}
		return {
			maxGrandmas: maximumPurchases(Game.Objects["Grandma"], 600),
			unlockedPantheon: Game.Objects["Temple"].level > 0,
			unlockedDragonsCurve: maximumPurchases(Game.Objects["Fractal engine"], 100) >= 100,
			unlockedRealityBending: maximumPurchases(Game.Objects["Javascript console"], 100) >= 100,
			unlockedSupremeIntellect: maximumPurchases(Game.Objects["Idleverse"], 100) >= 100,
			unlockedSecondAura: maximumPurchases(Game.Objects["You"], 200) >= 200
		};
	}
	function getCurrentFullGameState() {
		return {
			gameState: getCurrentGameState(),
			preferences: getCurrentFilteringPreferences(),
			budget: getCurrentBudget()
		};
	}
	//#endregion
	//#region src/planner/worker.ts?worker&inline
	var jsContent = "(function() {\n	//#region \\0rolldown/runtime.js\n	var __create = Object.create;\n	var __defProp = Object.defineProperty;\n	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n	var __getOwnPropNames = Object.getOwnPropertyNames;\n	var __getProtoOf = Object.getPrototypeOf;\n	var __hasOwnProp = Object.prototype.hasOwnProperty;\n	var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);\n	var __copyProps = (to, from, except, desc) => {\n		if (from && typeof from === \"object\" || typeof from === \"function\") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {\n			key = keys[i];\n			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {\n				get: ((k) => from[k]).bind(null, key),\n				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable\n			});\n		}\n		return to;\n	};\n	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, \"default\", {\n		value: mod,\n		enumerable: true\n	}) : target, mod));\n	//#endregion\n	//#region node_modules/seedrandom/lib/alea.js\n	var require_alea = /* @__PURE__ */ __commonJSMin(((exports, module) => {\n		(function(global, module$6, define) {\n			function Alea(seed) {\n				var me = this, mash = Mash();\n				me.next = function() {\n					var t = 2091639 * me.s0 + me.c * 23283064365386963e-26;\n					me.s0 = me.s1;\n					me.s1 = me.s2;\n					return me.s2 = t - (me.c = t | 0);\n				};\n				me.c = 1;\n				me.s0 = mash(\" \");\n				me.s1 = mash(\" \");\n				me.s2 = mash(\" \");\n				me.s0 -= mash(seed);\n				if (me.s0 < 0) me.s0 += 1;\n				me.s1 -= mash(seed);\n				if (me.s1 < 0) me.s1 += 1;\n				me.s2 -= mash(seed);\n				if (me.s2 < 0) me.s2 += 1;\n				mash = null;\n			}\n			function copy(f, t) {\n				t.c = f.c;\n				t.s0 = f.s0;\n				t.s1 = f.s1;\n				t.s2 = f.s2;\n				return t;\n			}\n			function impl(seed, opts) {\n				var xg = new Alea(seed), state = opts && opts.state, prng = xg.next;\n				prng.int32 = function() {\n					return xg.next() * 4294967296 | 0;\n				};\n				prng.double = function() {\n					return prng() + (prng() * 2097152 | 0) * 11102230246251565e-32;\n				};\n				prng.quick = prng;\n				if (state) {\n					if (typeof state == \"object\") copy(state, xg);\n					prng.state = function() {\n						return copy(xg, {});\n					};\n				}\n				return prng;\n			}\n			function Mash() {\n				var n = 4022871197;\n				var mash = function(data) {\n					data = String(data);\n					for (var i = 0; i < data.length; i++) {\n						n += data.charCodeAt(i);\n						var h = .02519603282416938 * n;\n						n = h >>> 0;\n						h -= n;\n						h *= n;\n						n = h >>> 0;\n						h -= n;\n						n += h * 4294967296;\n					}\n					return (n >>> 0) * 23283064365386963e-26;\n				};\n				return mash;\n			}\n			if (module$6 && module$6.exports) module$6.exports = impl;\n			else if (define && define.amd) define(function() {\n				return impl;\n			});\n			else this.alea = impl;\n		})(exports, typeof module == \"object\" && module, typeof define == \"function\" && define);\n	}));\n	//#endregion\n	//#region node_modules/seedrandom/lib/xor128.js\n	var require_xor128 = /* @__PURE__ */ __commonJSMin(((exports, module) => {\n		(function(global, module$5, define) {\n			function XorGen(seed) {\n				var me = this, strseed = \"\";\n				me.x = 0;\n				me.y = 0;\n				me.z = 0;\n				me.w = 0;\n				me.next = function() {\n					var t = me.x ^ me.x << 11;\n					me.x = me.y;\n					me.y = me.z;\n					me.z = me.w;\n					return me.w ^= me.w >>> 19 ^ t ^ t >>> 8;\n				};\n				if (seed === (seed | 0)) me.x = seed;\n				else strseed += seed;\n				for (var k = 0; k < strseed.length + 64; k++) {\n					me.x ^= strseed.charCodeAt(k) | 0;\n					me.next();\n				}\n			}\n			function copy(f, t) {\n				t.x = f.x;\n				t.y = f.y;\n				t.z = f.z;\n				t.w = f.w;\n				return t;\n			}\n			function impl(seed, opts) {\n				var xg = new XorGen(seed), state = opts && opts.state, prng = function() {\n					return (xg.next() >>> 0) / 4294967296;\n				};\n				prng.double = function() {\n					do\n						var result = ((xg.next() >>> 11) + (xg.next() >>> 0) / 4294967296) / (1 << 21);\n					while (result === 0);\n					return result;\n				};\n				prng.int32 = xg.next;\n				prng.quick = prng;\n				if (state) {\n					if (typeof state == \"object\") copy(state, xg);\n					prng.state = function() {\n						return copy(xg, {});\n					};\n				}\n				return prng;\n			}\n			if (module$5 && module$5.exports) module$5.exports = impl;\n			else if (define && define.amd) define(function() {\n				return impl;\n			});\n			else this.xor128 = impl;\n		})(exports, typeof module == \"object\" && module, typeof define == \"function\" && define);\n	}));\n	//#endregion\n	//#region node_modules/seedrandom/lib/xorwow.js\n	var require_xorwow = /* @__PURE__ */ __commonJSMin(((exports, module) => {\n		(function(global, module$4, define) {\n			function XorGen(seed) {\n				var me = this, strseed = \"\";\n				me.next = function() {\n					var t = me.x ^ me.x >>> 2;\n					me.x = me.y;\n					me.y = me.z;\n					me.z = me.w;\n					me.w = me.v;\n					return (me.d = me.d + 362437 | 0) + (me.v = me.v ^ me.v << 4 ^ (t ^ t << 1)) | 0;\n				};\n				me.x = 0;\n				me.y = 0;\n				me.z = 0;\n				me.w = 0;\n				me.v = 0;\n				if (seed === (seed | 0)) me.x = seed;\n				else strseed += seed;\n				for (var k = 0; k < strseed.length + 64; k++) {\n					me.x ^= strseed.charCodeAt(k) | 0;\n					if (k == strseed.length) me.d = me.x << 10 ^ me.x >>> 4;\n					me.next();\n				}\n			}\n			function copy(f, t) {\n				t.x = f.x;\n				t.y = f.y;\n				t.z = f.z;\n				t.w = f.w;\n				t.v = f.v;\n				t.d = f.d;\n				return t;\n			}\n			function impl(seed, opts) {\n				var xg = new XorGen(seed), state = opts && opts.state, prng = function() {\n					return (xg.next() >>> 0) / 4294967296;\n				};\n				prng.double = function() {\n					do\n						var result = ((xg.next() >>> 11) + (xg.next() >>> 0) / 4294967296) / (1 << 21);\n					while (result === 0);\n					return result;\n				};\n				prng.int32 = xg.next;\n				prng.quick = prng;\n				if (state) {\n					if (typeof state == \"object\") copy(state, xg);\n					prng.state = function() {\n						return copy(xg, {});\n					};\n				}\n				return prng;\n			}\n			if (module$4 && module$4.exports) module$4.exports = impl;\n			else if (define && define.amd) define(function() {\n				return impl;\n			});\n			else this.xorwow = impl;\n		})(exports, typeof module == \"object\" && module, typeof define == \"function\" && define);\n	}));\n	//#endregion\n	//#region node_modules/seedrandom/lib/xorshift7.js\n	var require_xorshift7 = /* @__PURE__ */ __commonJSMin(((exports, module) => {\n		(function(global, module$3, define) {\n			function XorGen(seed) {\n				var me = this;\n				me.next = function() {\n					var X = me.x, i = me.i, t = X[i], v;\n					t ^= t >>> 7;\n					v = t ^ t << 24;\n					t = X[i + 1 & 7];\n					v ^= t ^ t >>> 10;\n					t = X[i + 3 & 7];\n					v ^= t ^ t >>> 3;\n					t = X[i + 4 & 7];\n					v ^= t ^ t << 7;\n					t = X[i + 7 & 7];\n					t = t ^ t << 13;\n					v ^= t ^ t << 9;\n					X[i] = v;\n					me.i = i + 1 & 7;\n					return v;\n				};\n				function init(me, seed) {\n					var j, X = [];\n					if (seed === (seed | 0)) X[0] = seed;\n					else {\n						seed = \"\" + seed;\n						for (j = 0; j < seed.length; ++j) X[j & 7] = X[j & 7] << 15 ^ seed.charCodeAt(j) + X[j + 1 & 7] << 13;\n					}\n					while (X.length < 8) X.push(0);\n					for (j = 0; j < 8 && X[j] === 0; ++j);\n					if (j == 8) X[7] = -1;\n					else X[j];\n					me.x = X;\n					me.i = 0;\n					for (j = 256; j > 0; --j) me.next();\n				}\n				init(me, seed);\n			}\n			function copy(f, t) {\n				t.x = f.x.slice();\n				t.i = f.i;\n				return t;\n			}\n			function impl(seed, opts) {\n				if (seed == null) seed = +/* @__PURE__ */ new Date();\n				var xg = new XorGen(seed), state = opts && opts.state, prng = function() {\n					return (xg.next() >>> 0) / 4294967296;\n				};\n				prng.double = function() {\n					do\n						var result = ((xg.next() >>> 11) + (xg.next() >>> 0) / 4294967296) / (1 << 21);\n					while (result === 0);\n					return result;\n				};\n				prng.int32 = xg.next;\n				prng.quick = prng;\n				if (state) {\n					if (state.x) copy(state, xg);\n					prng.state = function() {\n						return copy(xg, {});\n					};\n				}\n				return prng;\n			}\n			if (module$3 && module$3.exports) module$3.exports = impl;\n			else if (define && define.amd) define(function() {\n				return impl;\n			});\n			else this.xorshift7 = impl;\n		})(exports, typeof module == \"object\" && module, typeof define == \"function\" && define);\n	}));\n	//#endregion\n	//#region node_modules/seedrandom/lib/xor4096.js\n	var require_xor4096 = /* @__PURE__ */ __commonJSMin(((exports, module) => {\n		(function(global, module$2, define) {\n			function XorGen(seed) {\n				var me = this;\n				me.next = function() {\n					var w = me.w, X = me.X, i = me.i, t, v;\n					me.w = w = w + 1640531527 | 0;\n					v = X[i + 34 & 127];\n					t = X[i = i + 1 & 127];\n					v ^= v << 13;\n					t ^= t << 17;\n					v ^= v >>> 15;\n					t ^= t >>> 12;\n					v = X[i] = v ^ t;\n					me.i = i;\n					return v + (w ^ w >>> 16) | 0;\n				};\n				function init(me, seed) {\n					var t, v, i, j, w, X = [], limit = 128;\n					if (seed === (seed | 0)) {\n						v = seed;\n						seed = null;\n					} else {\n						seed = seed + \"\\0\";\n						v = 0;\n						limit = Math.max(limit, seed.length);\n					}\n					for (i = 0, j = -32; j < limit; ++j) {\n						if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);\n						if (j === 0) w = v;\n						v ^= v << 10;\n						v ^= v >>> 15;\n						v ^= v << 4;\n						v ^= v >>> 13;\n						if (j >= 0) {\n							w = w + 1640531527 | 0;\n							t = X[j & 127] ^= v + w;\n							i = 0 == t ? i + 1 : 0;\n						}\n					}\n					if (i >= 128) X[(seed && seed.length || 0) & 127] = -1;\n					i = 127;\n					for (j = 512; j > 0; --j) {\n						v = X[i + 34 & 127];\n						t = X[i = i + 1 & 127];\n						v ^= v << 13;\n						t ^= t << 17;\n						v ^= v >>> 15;\n						t ^= t >>> 12;\n						X[i] = v ^ t;\n					}\n					me.w = w;\n					me.X = X;\n					me.i = i;\n				}\n				init(me, seed);\n			}\n			function copy(f, t) {\n				t.i = f.i;\n				t.w = f.w;\n				t.X = f.X.slice();\n				return t;\n			}\n			function impl(seed, opts) {\n				if (seed == null) seed = +/* @__PURE__ */ new Date();\n				var xg = new XorGen(seed), state = opts && opts.state, prng = function() {\n					return (xg.next() >>> 0) / 4294967296;\n				};\n				prng.double = function() {\n					do\n						var result = ((xg.next() >>> 11) + (xg.next() >>> 0) / 4294967296) / (1 << 21);\n					while (result === 0);\n					return result;\n				};\n				prng.int32 = xg.next;\n				prng.quick = prng;\n				if (state) {\n					if (state.X) copy(state, xg);\n					prng.state = function() {\n						return copy(xg, {});\n					};\n				}\n				return prng;\n			}\n			if (module$2 && module$2.exports) module$2.exports = impl;\n			else if (define && define.amd) define(function() {\n				return impl;\n			});\n			else this.xor4096 = impl;\n		})(exports, typeof module == \"object\" && module, typeof define == \"function\" && define);\n	}));\n	//#endregion\n	//#region node_modules/seedrandom/lib/tychei.js\n	var require_tychei = /* @__PURE__ */ __commonJSMin(((exports, module) => {\n		(function(global, module$1, define) {\n			function XorGen(seed) {\n				var me = this, strseed = \"\";\n				me.next = function() {\n					var b = me.b, c = me.c, d = me.d, a = me.a;\n					b = b << 25 ^ b >>> 7 ^ c;\n					c = c - d | 0;\n					d = d << 24 ^ d >>> 8 ^ a;\n					a = a - b | 0;\n					me.b = b = b << 20 ^ b >>> 12 ^ c;\n					me.c = c = c - d | 0;\n					me.d = d << 16 ^ c >>> 16 ^ a;\n					return me.a = a - b | 0;\n				};\n				me.a = 0;\n				me.b = 0;\n				me.c = -1640531527;\n				me.d = 1367130551;\n				if (seed === Math.floor(seed)) {\n					me.a = seed / 4294967296 | 0;\n					me.b = seed | 0;\n				} else strseed += seed;\n				for (var k = 0; k < strseed.length + 20; k++) {\n					me.b ^= strseed.charCodeAt(k) | 0;\n					me.next();\n				}\n			}\n			function copy(f, t) {\n				t.a = f.a;\n				t.b = f.b;\n				t.c = f.c;\n				t.d = f.d;\n				return t;\n			}\n			function impl(seed, opts) {\n				var xg = new XorGen(seed), state = opts && opts.state, prng = function() {\n					return (xg.next() >>> 0) / 4294967296;\n				};\n				prng.double = function() {\n					do\n						var result = ((xg.next() >>> 11) + (xg.next() >>> 0) / 4294967296) / (1 << 21);\n					while (result === 0);\n					return result;\n				};\n				prng.int32 = xg.next;\n				prng.quick = prng;\n				if (state) {\n					if (typeof state == \"object\") copy(state, xg);\n					prng.state = function() {\n						return copy(xg, {});\n					};\n				}\n				return prng;\n			}\n			if (module$1 && module$1.exports) module$1.exports = impl;\n			else if (define && define.amd) define(function() {\n				return impl;\n			});\n			else this.tychei = impl;\n		})(exports, typeof module == \"object\" && module, typeof define == \"function\" && define);\n	}));\n	//#endregion\n	//#region __vite-browser-external\n	var require___vite_browser_external = /* @__PURE__ */ __commonJSMin(((exports, module) => {\n		module.exports = {};\n	}));\n	//#endregion\n	//#region node_modules/seedrandom/seedrandom.js\n	var require_seedrandom$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {\n		(function(global, pool, math) {\n			var width = 256, chunks = 6, digits = 52, rngname = \"random\", startdenom = math.pow(width, chunks), significance = math.pow(2, digits), overflow = significance * 2, mask = width - 1, nodecrypto;\n			function seedrandom(seed, options, callback) {\n				var key = [];\n				options = options == true ? { entropy: true } : options || {};\n				var shortseed = mixkey(flatten(options.entropy ? [seed, tostring(pool)] : seed == null ? autoseed() : seed, 3), key);\n				var arc4 = new ARC4(key);\n				var prng = function() {\n					var n = arc4.g(chunks), d = startdenom, x = 0;\n					while (n < significance) {\n						n = (n + x) * width;\n						d *= width;\n						x = arc4.g(1);\n					}\n					while (n >= overflow) {\n						n /= 2;\n						d /= 2;\n						x >>>= 1;\n					}\n					return (n + x) / d;\n				};\n				prng.int32 = function() {\n					return arc4.g(4) | 0;\n				};\n				prng.quick = function() {\n					return arc4.g(4) / 4294967296;\n				};\n				prng.double = prng;\n				mixkey(tostring(arc4.S), pool);\n				return (options.pass || callback || function(prng, seed, is_math_call, state) {\n					if (state) {\n						if (state.S) copy(state, arc4);\n						prng.state = function() {\n							return copy(arc4, {});\n						};\n					}\n					if (is_math_call) {\n						math[rngname] = prng;\n						return seed;\n					} else return prng;\n				})(prng, shortseed, \"global\" in options ? options.global : this == math, options.state);\n			}\n			function ARC4(key) {\n				var t, keylen = key.length, me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];\n				if (!keylen) key = [keylen++];\n				while (i < width) s[i] = i++;\n				for (i = 0; i < width; i++) {\n					s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];\n					s[j] = t;\n				}\n				(me.g = function(count) {\n					var t, r = 0, i = me.i, j = me.j, s = me.S;\n					while (count--) {\n						t = s[i = mask & i + 1];\n						r = r * width + s[mask & (s[i] = s[j = mask & j + t]) + (s[j] = t)];\n					}\n					me.i = i;\n					me.j = j;\n					return r;\n				})(width);\n			}\n			function copy(f, t) {\n				t.i = f.i;\n				t.j = f.j;\n				t.S = f.S.slice();\n				return t;\n			}\n			function flatten(obj, depth) {\n				var result = [], typ = typeof obj, prop;\n				if (depth && typ == \"object\") for (prop in obj) try {\n					result.push(flatten(obj[prop], depth - 1));\n				} catch (e) {}\n				return result.length ? result : typ == \"string\" ? obj : obj + \"\\0\";\n			}\n			function mixkey(seed, key) {\n				var stringseed = seed + \"\", smear, j = 0;\n				while (j < stringseed.length) key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);\n				return tostring(key);\n			}\n			function autoseed() {\n				try {\n					var out;\n					if (nodecrypto && (out = nodecrypto.randomBytes)) out = out(width);\n					else {\n						out = new Uint8Array(width);\n						(global.crypto || global.msCrypto).getRandomValues(out);\n					}\n					return tostring(out);\n				} catch (e) {\n					var browser = global.navigator, plugins = browser && browser.plugins;\n					return [\n						+/* @__PURE__ */ new Date(),\n						global,\n						plugins,\n						global.screen,\n						tostring(pool)\n					];\n				}\n			}\n			function tostring(a) {\n				return String.fromCharCode.apply(0, a);\n			}\n			mixkey(math.random(), pool);\n			if (typeof module == \"object\" && module.exports) {\n				module.exports = seedrandom;\n				try {\n					nodecrypto = require___vite_browser_external();\n				} catch (ex) {}\n			} else if (typeof define == \"function\" && define.amd) define(function() {\n				return seedrandom;\n			});\n			else math[\"seed\" + rngname] = seedrandom;\n		})(typeof self !== \"undefined\" ? self : exports, [], Math);\n	}));\n	//#endregion\n	//#region src/planner/core.ts\n	var import_seedrandom = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {\n		var alea = require_alea();\n		var xor128 = require_xor128();\n		var xorwow = require_xorwow();\n		var xorshift7 = require_xorshift7();\n		var xor4096 = require_xor4096();\n		var tychei = require_tychei();\n		var sr = require_seedrandom$1();\n		sr.alea = alea;\n		sr.xor128 = xor128;\n		sr.xorwow = xorwow;\n		sr.xorshift7 = xorshift7;\n		sr.xor4096 = xor4096;\n		sr.tychei = tychei;\n		module.exports = sr;\n	})))());\n	function rigidelPower(rigidelSlot, hasSupremeIntellect) {\n		switch (rigidelSlot) {\n			case \"diamond\": return 600;\n			case \"ruby\": if (hasSupremeIntellect) return 600;\n			else return 400;\n			case \"jade\": if (hasSupremeIntellect) return 400;\n			else return 200;\n			default: return 0;\n		}\n	}\n	var PlannerCore = class {\n		discrepancy = 0;\n		hasSteviaCaelestis = false;\n		hasSucralosiaInutilis = false;\n		hasSugarAgingProcess = false;\n		seed = \"aaaaa\";\n		currentLumpT = 16e11;\n		currentRigidelSlot = \"none\";\n		currentGrandmaCount = 0;\n		currentGrandmapocalypseStage = 0;\n		currentHasDragonsCurve = false;\n		currentHasRealityBending = false;\n		currentHasSupremeIntellect = false;\n		constructor(data) {\n			Object.assign(this, data);\n		}\n		overripeAge(configuration) {\n			let dragonBoost = (configuration.hasDragonsCurve ? 1 : 0) + (configuration.hasRealityBending ? .1 : 0);\n			let ripeAge = 1380 * 60 * 1e3;\n			if (this.hasSteviaCaelestis) ripeAge -= 3600 * 1e3;\n			ripeAge -= 6 * 1e3 * configuration.effectiveGrandmaCount;\n			ripeAge /= 1 + .05 * dragonBoost;\n			return ripeAge + 3600 * 1e3;\n		}\n		autoharvestTimestamp(configuration) {\n			return this.currentLumpT + this.overripeAge(configuration) + this.discrepancy;\n		}\n		lumpTypePredictionSet(configuration) {\n			let autoharvestTime = this.autoharvestTimestamp(configuration);\n			let prng = (0, import_seedrandom.default)(this.seed + \"/\" + autoharvestTime);\n			let lumpPools = [\n				[\"normal\"],\n				[\"normal\"],\n				[\"normal\"],\n				[\"normal\"]\n			];\n			let randomFloorPrngCall = prng();\n			let loops = 1;\n			if (configuration.hasDragonsCurve) loops += 1;\n			if (configuration.hasRealityBending && randomFloorPrngCall < .1) loops += 1;\n			for (let i = 0; i < loops; i++) {\n				if (prng() < (this.hasSucralosiaInutilis ? .15 : .1)) for (let pool of lumpPools) pool.push(\"bifurcated\");\n				if (prng() < 3 / 1e3) for (let pool of lumpPools) pool.push(\"golden\");\n				let grandmapocalypsePrngCall = prng();\n				if (grandmapocalypsePrngCall < .1) lumpPools[1].push(\"meaty\");\n				if (grandmapocalypsePrngCall < .2) lumpPools[2].push(\"meaty\");\n				if (grandmapocalypsePrngCall < .3) lumpPools[3].push(\"meaty\");\n				if (prng() < 1 / 50) for (let pool of lumpPools) pool.push(\"caramelized\");\n			}\n			let poolChoicePrngCall = prng();\n			let predictionSet = [];\n			for (let i in lumpPools) predictionSet[i] = lumpPools[i][Math.floor(poolChoicePrngCall * lumpPools[i].length)];\n			return predictionSet;\n		}\n		currentDistilledConfiguration() {\n			return {\n				effectiveGrandmaCount: rigidelPower(this.currentRigidelSlot, this.currentHasSupremeIntellect) + (this.hasSugarAgingProcess ? Math.min(600, this.currentGrandmaCount) : 0),\n				hasDragonsCurve: this.currentHasDragonsCurve,\n				hasRealityBending: this.currentHasRealityBending\n			};\n		}\n		currentPrediction() {\n			return this.lumpTypePredictionSet(this.currentDistilledConfiguration())[this.currentGrandmapocalypseStage];\n		}\n	};\n	//#endregion\n	//#region src/planner/processing.ts\n	function* mergeIterators(iterators, compare) {\n		let values = [];\n		let validIterators = [];\n		for (let i = 0; i < iterators.length; i++) {\n			let { value, done } = iterators[i].next();\n			if (!done) {\n				values.push(value);\n				validIterators.push(iterators[i]);\n			}\n		}\n		while (validIterators.length != 0) {\n			let earliest = 0;\n			for (let i = 1; i < validIterators.length; i++) if (compare(values[i], values[earliest]) < 0) earliest = i;\n			yield values[earliest];\n			let { value, done } = validIterators[earliest].next();\n			if (done) {\n				values.splice(earliest, 1);\n				validIterators.splice(earliest, 1);\n			} else values[earliest] = value;\n		}\n	}\n	function makeConfigurationsIterator(core) {\n		let startGrandmaCount = core.hasSugarAgingProcess ? 1200 : 600;\n		let step = core.hasSugarAgingProcess ? 1 : 200;\n		function* makeIterator(hasDragonsCurve, hasRealityBending) {\n			for (let i = startGrandmaCount; i >= 0; i -= step) yield {\n				effectiveGrandmaCount: i,\n				hasDragonsCurve,\n				hasRealityBending\n			};\n		}\n		let compare = (x, y) => {\n			return core.overripeAge(x) - core.overripeAge(y);\n		};\n		return mergeIterators([\n			makeIterator(false, false),\n			makeIterator(false, true),\n			makeIterator(true, false),\n			makeIterator(true, true)\n		], compare);\n	}\n	const canonicalIndicesCount = 4 * 1201;\n	function canonicalIndex(configuration) {\n		return 1201 * ((configuration.hasDragonsCurve ? 2 : 0) + (configuration.hasRealityBending ? 1 : 0)) + configuration.effectiveGrandmaCount;\n	}\n	const precomputedPartialConfigurations = (() => {\n		function distill(configuration) {\n			return {\n				effectiveGrandmaCount: rigidelPower(configuration.rigidelSlot, configuration.hasSupremeIntellect) + Math.min(600, configuration.grandmaCount ?? 0),\n				hasDragonsCurve: configuration.hasDragonsCurve,\n				hasRealityBending: configuration.hasRealityBending\n			};\n		}\n		let partialConfigurations = Array(canonicalIndicesCount).fill([]).map(() => []);\n		let validGrandmaCounts = [null].concat(Array(601).fill(0).map((_, i) => i));\n		for (let grandmaCount of validGrandmaCounts) for (let rigidelSlot of [\n			\"none\",\n			\"jade\",\n			\"ruby\",\n			\"diamond\"\n		]) for (let hasDragonsCurve of [false, true]) for (let hasRealityBending of [false, true]) for (let hasSupremeIntellect of [false, true]) {\n			if (hasDragonsCurve && hasRealityBending && hasSupremeIntellect) continue;\n			let configuration = {\n				grandmaCount,\n				rigidelSlot,\n				hasDragonsCurve,\n				hasRealityBending,\n				hasSupremeIntellect\n			};\n			partialConfigurations[canonicalIndex(distill(configuration))].push(configuration);\n		}\n		return partialConfigurations;\n	})();\n	function makeReportEntry(options) {\n		let { configuration, plannerCore, threeColumnDragonAuras } = options;\n		function check(condition) {\n			return condition ? \"checkmark\" : \"\";\n		}\n		let plannerCoreEquivalentGrandmaCount = plannerCore.hasSugarAgingProcess ? plannerCore.currentGrandmaCount : null;\n		let selectedEntry = configuration.grandmaCount == plannerCoreEquivalentGrandmaCount && configuration.hasDragonsCurve == plannerCore.currentHasDragonsCurve && configuration.hasRealityBending == plannerCore.currentHasRealityBending && configuration.hasSupremeIntellect == plannerCore.currentHasSupremeIntellect && configuration.rigidelSlot == plannerCore.currentRigidelSlot && configuration.grandmapocalypseStages[plannerCore.currentGrandmapocalypseStage];\n		let lumpType = configuration.lumpType;\n		let autoharvestTimestamp = configuration.autoharvestTimestamp;\n		let grandmapocalypseStages = configuration.grandmapocalypseStages;\n		let grandmapocalypseNote = check(configuration.grandmapocalypseStages[plannerCore.currentGrandmapocalypseStage]);\n		let rigidelSlot = configuration.rigidelSlot;\n		let rigidelNote = check(configuration.rigidelSlot == plannerCore.currentRigidelSlot);\n		let grandmaCount = configuration.grandmaCount;\n		let grandmaCountNote;\n		if (grandmaCount == null && plannerCore.hasSugarAgingProcess) grandmaCountNote = \"warn\";\n		else if (grandmaCount != null && !plannerCore.hasSugarAgingProcess) grandmaCountNote = \"warn\";\n		else if (grandmaCount == null && !plannerCore.hasSugarAgingProcess) grandmaCountNote = \"checkmark\";\n		else grandmaCountNote = grandmaCount == plannerCore.currentGrandmaCount ? \"checkmark\" : \"\";\n		let dragonAuras = [];\n		if (threeColumnDragonAuras) {\n			dragonAuras.push({\n				aura: \"Dragon's Curve\",\n				style: configuration.hasDragonsCurve ? \"normal\" : \"faded\",\n				note: check(configuration.hasDragonsCurve == plannerCore.currentHasDragonsCurve)\n			});\n			dragonAuras.push({\n				aura: \"Reality Bending\",\n				style: configuration.hasRealityBending ? \"normal\" : \"faded\",\n				note: check(configuration.hasRealityBending == plannerCore.currentHasRealityBending)\n			});\n			dragonAuras.push({\n				aura: \"Supreme Intellect\",\n				style: configuration.hasSupremeIntellect ? \"normal\" : \"faded\",\n				note: check(configuration.hasSupremeIntellect == plannerCore.currentHasSupremeIntellect)\n			});\n		} else {\n			if (configuration.hasDragonsCurve) dragonAuras.push({\n				aura: \"Dragon's Curve\",\n				style: \"normal\",\n				note: check(configuration.hasDragonsCurve == plannerCore.currentHasDragonsCurve)\n			});\n			if (configuration.hasRealityBending) dragonAuras.push({\n				aura: \"Reality Bending\",\n				style: \"normal\",\n				note: check(configuration.hasRealityBending == plannerCore.currentHasRealityBending)\n			});\n			if (configuration.hasSupremeIntellect) dragonAuras.push({\n				aura: \"Supreme Intellect\",\n				style: \"normal\",\n				note: check(configuration.hasSupremeIntellect == plannerCore.currentHasSupremeIntellect)\n			});\n			if (dragonAuras.length <= 1) {\n				if (!configuration.hasDragonsCurve && plannerCore.currentHasDragonsCurve) dragonAuras.push({\n					aura: \"Dragon's Curve\",\n					style: \"faded\",\n					note: \"warn\"\n				});\n				if (!configuration.hasRealityBending && plannerCore.currentHasRealityBending) dragonAuras.push({\n					aura: \"Reality Bending\",\n					style: \"faded\",\n					note: \"warn\"\n				});\n				if (!configuration.hasSupremeIntellect && plannerCore.currentHasSupremeIntellect && configuration.rigidelSlot != \"none\" && configuration.rigidelSlot != \"diamond\") dragonAuras.push({\n					aura: \"Supreme Intellect\",\n					style: \"faded\",\n					note: \"warn\"\n				});\n				dragonAuras = dragonAuras.slice(0, 2);\n			}\n			if (dragonAuras.length <= 1) {\n				if (dragonAuras.length == 0 || dragonAuras[0].aura != \"Dragon's Curve\") dragonAuras.push({\n					aura: \"Dragon's Curve\",\n					style: \"faded\",\n					note: \"checkmark\"\n				});\n				if (dragonAuras[0].aura == \"Dragon's Curve\") dragonAuras.push({\n					aura: \"Reality Bending\",\n					style: \"faded\",\n					note: \"checkmark\"\n				});\n			}\n		}\n		return {\n			selectedEntry,\n			lumpType,\n			autoharvestTimestamp,\n			grandmaCount,\n			grandmaCountNote,\n			grandmapocalypseStages,\n			grandmapocalypseNote,\n			dragonAuras,\n			rigidelSlot,\n			rigidelNote\n		};\n	}\n	function makeTrivialConfigurationFilter() {\n		return (_) => true;\n	}\n	function makeDragonPreservingConfigurationFilter(gameState) {\n		return (configuration) => {\n			return configuration.hasDragonsCurve == gameState.currentHasDragonsCurve && configuration.hasRealityBending == gameState.currentHasRealityBending && configuration.hasSupremeIntellect == gameState.currentHasSupremeIntellect;\n		};\n	}\n	function makePantheonPreservingConfigurationFilter(gameState) {\n		return (configuration) => {\n			if (configuration.rigidelSlot == gameState.currentRigidelSlot) return true;\n			if (configuration.rigidelSlot == \"none\") return true;\n			return false;\n		};\n	}\n	function makeGrandmapocalypseStagePreservingFilter(gameState) {\n		return (configuration) => {\n			return configuration.grandmapocalypseStages[gameState.currentGrandmapocalypseStage];\n		};\n	}\n	function makeBudgetConsciousFilter(budget) {\n		return (configuration) => {\n			if (configuration.grandmaCount != null && configuration.grandmaCount > budget.maxGrandmas) return false;\n			if (!budget.unlockedPantheon && configuration.rigidelSlot != \"none\") return false;\n			if (!budget.unlockedDragonsCurve && configuration.hasDragonsCurve) return false;\n			if (!budget.unlockedRealityBending && configuration.hasRealityBending) return false;\n			if (!budget.unlockedSupremeIntellect && configuration.hasSupremeIntellect) return false;\n			let auraCount = Number(configuration.hasDragonsCurve) + Number(configuration.hasRealityBending) + Number(configuration.hasSupremeIntellect);\n			if (!budget.unlockedSecondAura && auraCount > 1) return false;\n			return true;\n		};\n	}\n	function makeIntersectionFilter(...filters) {\n		return (configuration) => {\n			for (let filter of filters) if (!filter(configuration)) return false;\n			return true;\n		};\n	}\n	function makeFilterCollection(fullState) {\n		let requirements = [];\n		let goals = [];\n		goals.push(makeTrivialConfigurationFilter());\n		let conditions = fullState.preferences.conditions;\n		let dragonPreserver = makeDragonPreservingConfigurationFilter(fullState.gameState);\n		let pantheonPreserver = makePantheonPreservingConfigurationFilter(fullState.gameState);\n		let grandmapocalypsePreserver = makeGrandmapocalypseStagePreservingFilter(fullState.gameState);\n		let budgetRespecter = makeBudgetConsciousFilter(fullState.budget);\n		if (conditions.preserveDragon == \"require\") requirements.push(dragonPreserver);\n		if (conditions.preservePantheon == \"require\") requirements.push(pantheonPreserver);\n		if (conditions.preserveGrandmapocalypseStage == \"require\") requirements.push(grandmapocalypsePreserver);\n		if (conditions.respectBudget == \"require\") requirements.push(budgetRespecter);\n		if (conditions.preserveDragon == \"observe\") goals.push(dragonPreserver);\n		if (conditions.preservePantheon == \"observe\") goals.push(pantheonPreserver);\n		if (conditions.preserveGrandmapocalypseStage == \"observe\") goals.push(grandmapocalypsePreserver);\n		if (conditions.respectBudget == \"observe\") goals.push(budgetRespecter);\n		if (conditions.preserveDragon == \"observe\" && conditions.preservePantheon == \"observe\") goals.push(makeIntersectionFilter(dragonPreserver, pantheonPreserver));\n		return {\n			requirements,\n			goals\n		};\n	}\n	function matchConfigurationsToGoals(configurations, goals) {\n		let satisfyingConfigurations = [];\n		let needsFurtherProcessing = true;\n		while (needsFurtherProcessing) {\n			let countOfGoalsAccepting = configurations.map((configuration) => {\n				return goals.map((goal) => Number(goal(configuration))).reduce((x, y) => x + y, 0);\n			});\n			if (Math.max(...countOfGoalsAccepting) == 0) needsFurtherProcessing = false;\n			else {\n				let index = countOfGoalsAccepting.indexOf(Math.max(...countOfGoalsAccepting));\n				satisfyingConfigurations.push(configurations[index]);\n				goals = goals.filter((goal) => !goal(configurations[index]));\n			}\n		}\n		return {\n			satisfyingConfigurations,\n			unsatisfiedGoals: goals\n		};\n	}\n	var CachedConfigurationsProcessor = class {\n		constructor(plannerCore) {\n			this.plannerCore = plannerCore;\n			this.iterator = makeConfigurationsIterator(plannerCore);\n		}\n		isCacheCompatible(gameState) {\n			return gameState.discrepancy == this.plannerCore.discrepancy && gameState.hasSteviaCaelestis == this.plannerCore.hasSteviaCaelestis && gameState.hasSucralosiaInutilis == this.plannerCore.hasSucralosiaInutilis && gameState.hasSugarAgingProcess == this.plannerCore.hasSugarAgingProcess && gameState.currentLumpT == this.plannerCore.currentLumpT && gameState.seed == this.plannerCore.seed;\n		}\n		updateCoreIfCompatible(newPlannerCore) {\n			if (this.isCacheCompatible(newPlannerCore)) {\n				this.plannerCore = newPlannerCore;\n				return true;\n			} else return false;\n		}\n		plannerCore;\n		iterator;\n		cache = {\n			\"normal\": [],\n			\"bifurcated\": [],\n			\"golden\": [],\n			\"meaty\": [],\n			\"caramelized\": []\n		};\n		cacheNextPredictionSet() {\n			if (!this.iterator) return false;\n			let next = this.iterator.next();\n			if (next.done) {\n				this.iterator = null;\n				return false;\n			}\n			let autoharvestTimestamp = this.plannerCore.autoharvestTimestamp(next.value);\n			let predictionSet = this.plannerCore.lumpTypePredictionSet(next.value);\n			let hasSugarAgingProcess = this.plannerCore.hasSugarAgingProcess;\n			for (let lumpType of new Set(predictionSet)) {\n				let matchingGrandmapocalypseStages = predictionSet.map((type) => type == lumpType);\n				let configurations = precomputedPartialConfigurations[canonicalIndex(next.value)].map((partialConfiguration) => {\n					if (!hasSugarAgingProcess && partialConfiguration.grandmaCount != null) return null;\n					if (hasSugarAgingProcess && partialConfiguration.grandmaCount == null) return null;\n					let grandmapocalypseStages = matchingGrandmapocalypseStages;\n					if (hasSugarAgingProcess && partialConfiguration.grandmaCount == 0) if (!grandmapocalypseStages[0]) return null;\n					else grandmapocalypseStages = [\n						grandmapocalypseStages[0],\n						false,\n						false,\n						false\n					];\n					return {\n						...partialConfiguration,\n						lumpType,\n						autoharvestTimestamp,\n						grandmapocalypseStages\n					};\n				}).filter((c) => c != null);\n				this.cache[lumpType].push(configurations);\n			}\n			return true;\n		}\n		*makePlannerConfigurationIterator(lumpType) {\n			let i = 0;\n			let cacheMightHaveBeenLengthened = true;\n			while (cacheMightHaveBeenLengthened) {\n				while (i < this.cache[lumpType].length) {\n					yield this.cache[lumpType][i];\n					i++;\n				}\n				cacheMightHaveBeenLengthened = this.cacheNextPredictionSet();\n			}\n		}\n		getConfigurations(options) {\n			let acceptable = makeIntersectionFilter(...options.requirements);\n			let successes = [];\n			let goals = [...options.goals];\n			for (let configurationSet of this.makePlannerConfigurationIterator(options.targetLump)) {\n				let acceptableConfigurations = configurationSet.filter(acceptable);\n				if (acceptableConfigurations.length == 0) continue;\n				let { satisfyingConfigurations, unsatisfiedGoals } = matchConfigurationsToGoals(acceptableConfigurations, goals);\n				goals = unsatisfiedGoals;\n				successes = successes.concat(satisfyingConfigurations);\n				if (goals.length == 0) break;\n			}\n			return {\n				successes,\n				failures: goals\n			};\n		}\n		getSummaryPlannerReport(fullGameState) {\n			if (!this.isCacheCompatible(fullGameState.gameState)) throw new Error(\"fullGameState.gameState is not compatible with this.plannerCore\");\n			let report = {};\n			let { requirements, goals } = makeFilterCollection(fullGameState);\n			let lumpType;\n			for (lumpType in fullGameState.preferences.includeType) if (fullGameState.preferences.includeType[lumpType]) report[lumpType] = this.getConfigurations({\n				targetLump: lumpType,\n				requirements,\n				goals\n			}).successes.map((configuration) => makeReportEntry({\n				configuration,\n				plannerCore: this.plannerCore,\n				threeColumnDragonAuras: fullGameState.preferences.threeColumnDragonAuras\n			}));\n			return report;\n		}\n		getFullListPlannerReport(fullGameState) {\n			if (!this.isCacheCompatible(fullGameState.gameState)) throw new Error(\"fullGameState.gameState is not compatible with this.plannerCore\");\n			while (this.cacheNextPredictionSet());\n			let self = this;\n			let { requirements, goals } = makeFilterCollection(fullGameState);\n			let acceptable = makeIntersectionFilter(...requirements);\n			function* makeIterator(lumpType) {\n				for (let configurationSet of self.makePlannerConfigurationIterator(lumpType)) {\n					let configurations = configurationSet.filter(acceptable);\n					if (configurations.length == 0) continue;\n					let { satisfyingConfigurations } = matchConfigurationsToGoals(configurations, goals);\n					if (satisfyingConfigurations.length == 0) satisfyingConfigurations.push(configurations[0]);\n					yield satisfyingConfigurations;\n				}\n			}\n			let iterators = [];\n			let lumpType;\n			for (lumpType in fullGameState.preferences.includeType) if (fullGameState.preferences.includeType[lumpType]) iterators.push(makeIterator(lumpType));\n			let report = [];\n			for (let configurationSet of mergeIterators(iterators, (x, y) => x[0].autoharvestTimestamp - y[0].autoharvestTimestamp)) report.push(configurationSet.map((configuration) => makeReportEntry({\n				configuration,\n				plannerCore: this.plannerCore,\n				threeColumnDragonAuras: fullGameState.preferences.threeColumnDragonAuras\n			})));\n			return report;\n		}\n	};\n	//#endregion\n	//#region src/planner/worker.ts\n	let cache = [];\n	self.onmessage = (ev) => {\n		let { request, computationId, fullGameState } = ev.data;\n		let plannerCore = new PlannerCore(fullGameState.gameState);\n		let processor = (() => {\n			for (let processor of cache) if (processor.updateCoreIfCompatible(plannerCore)) return processor;\n			let processor = new CachedConfigurationsProcessor(plannerCore);\n			cache.unshift(processor);\n			return processor;\n		})();\n		let lumpType = plannerCore.currentPrediction();\n		let response;\n		switch (request) {\n			case \"lumpType\":\n				response = {\n					request,\n					computationId,\n					lumpType\n				};\n				break;\n			case \"summaryReport\":\n				response = {\n					request,\n					computationId,\n					lumpType,\n					report: processor.getSummaryPlannerReport(fullGameState)\n				};\n				break;\n			case \"fullListReport\": response = {\n				request,\n				computationId,\n				lumpType,\n				report: processor.getFullListPlannerReport(fullGameState)\n			};\n		}\n		self.postMessage(response);\n	};\n	//#endregion\n})();\n";
	var blob = typeof self !== "undefined" && self.Blob && new Blob(["(self.URL || self.webkitURL).revokeObjectURL(self.location.href);", jsContent], { type: "text/javascript;charset=utf-8" });
	function WorkerWrapper(options) {
		let objURL;
		try {
			objURL = blob && (self.URL || self.webkitURL).createObjectURL(blob);
			if (!objURL) throw "";
			const worker = new Worker(objURL, { name: options?.name });
			worker.addEventListener("error", () => {
				(self.URL || self.webkitURL).revokeObjectURL(objURL);
			});
			return worker;
		} catch (e) {
			return new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent(jsContent), { name: options?.name });
		}
	}
	//#endregion
	//#region src/planner/planner.ts
	var CoalescingLumpsPlanner = class {
		worker;
		currentComputationId = 0;
		lumpTypePrediction = {
			value: "normal",
			computationId: 0,
			gameState: null,
			ongoingComputation: false
		};
		summaryReport = {
			value: {},
			computationId: 0,
			gameState: null,
			ongoingComputation: false
		};
		fullListReport = {
			value: [],
			computationId: 0,
			gameState: null,
			ongoingComputation: false
		};
		constructor() {
			this.worker = new WorkerWrapper();
			this.worker.onmessage = (ev) => {
				this.processWorkerResponse(ev.data);
			};
		}
		processWorkerResponse(response) {
			let lumpTypePrediction = this.lumpTypePrediction;
			let updateLumpType = () => {
				if (response.computationId == lumpTypePrediction.computationId) lumpTypePrediction.ongoingComputation = false;
				lumpTypePrediction.value = response.lumpType;
			};
			switch (response.request) {
				case "lumpType":
					updateLumpType();
					break;
				case "summaryReport":
					if (this.summaryReport.computationId == response.computationId) this.summaryReport.ongoingComputation = false;
					this.summaryReport.value = response.report;
					updateLumpType();
					break;
				case "fullListReport":
					if (this.fullListReport.computationId == response.computationId) this.fullListReport.ongoingComputation = false;
					this.fullListReport.value = response.report;
					updateLumpType();
					break;
			}
		}
		getAndUpdateLumpTypePrediction() {
			let isCurrent = this.getStatusAndUpdateCache("lumpType", [this.lumpTypePrediction]);
			return {
				prediction: this.lumpTypePrediction.value,
				isCurrent
			};
		}
		getAndUpdateSummaryReport() {
			let isCurrent = this.getStatusAndUpdateCache("summaryReport", [this.lumpTypePrediction, this.summaryReport]);
			return {
				report: this.summaryReport.value,
				isCurrent
			};
		}
		getAndUpdateFullListReport() {
			let isCurrent = this.getStatusAndUpdateCache("fullListReport", [this.lumpTypePrediction, this.fullListReport]);
			return {
				report: this.fullListReport.value,
				isCurrent
			};
		}
		getStatusAndUpdateCache(request, cachedItems) {
			let currentGameState = getCurrentFullGameState();
			this.currentComputationId++;
			let isCurrent = true;
			let needsUpdate = false;
			for (let item of cachedItems) if (JSON.stringify(currentGameState) != JSON.stringify(item.gameState)) {
				needsUpdate = true;
				isCurrent = false;
				item.gameState = currentGameState;
				item.computationId = this.currentComputationId;
				item.ongoingComputation = true;
			} else if (item.ongoingComputation) isCurrent = false;
			if (needsUpdate) {
				let message = {
					request,
					computationId: this.currentComputationId,
					fullGameState: currentGameState
				};
				this.worker.postMessage(message);
			}
			return isCurrent;
		}
	};
	var planner = new CoalescingLumpsPlanner();
	//#endregion
	//#region src/saveDataManagement.ts
	function loadSettingsFromLegacySave(legacyString) {
		let newPrefs = getDefaultPreferences();
		let legacySave = JSON.parse(legacyString);
		if (!legacySave || typeof legacySave != "object") {
			console.log("CYOL: Error retrieving legacy save format, using default settings...");
			setPreferences(newPrefs);
			return;
		}
		if (!("settings" in legacySave) || !legacySave.settings || typeof legacySave.settings != "object") {
			console.log("CYOL: legacy save format is corrupted, using default settings...");
			setPreferences(newPrefs);
			return;
		}
		let settings = legacySave.settings;
		if ("discrepancy" in settings) newPrefs.discrepancy = Number(settings.discrepancy);
		if ("includeNormal" in settings) newPrefs.filtering.includeType.normal = Boolean(settings.includeNormal);
		if ("includeBifurcated" in settings) newPrefs.filtering.includeType.bifurcated = Boolean(settings.includeBifurcated);
		if ("includeGolden" in settings) newPrefs.filtering.includeType.golden = Boolean(settings.includeGolden);
		if ("includeMeaty" in settings) newPrefs.filtering.includeType.meaty = Boolean(settings.includeMeaty);
		if ("includeCaramelized" in settings) newPrefs.filtering.includeType.caramelized = Boolean(settings.includeCaramelized);
		if ("preserveGrandmapocalypseStage" in settings) newPrefs.filtering.conditions.preserveGrandmapocalypseStage = settings.preserveGrandmapocalypseStage ? "require" : "observe";
		if ("preserveDragon" in settings) newPrefs.filtering.conditions.preserveDragon = settings.preserveDragon ? "require" : "observe";
		if ("preservePantheon" in settings) newPrefs.filtering.conditions.preservePantheon = settings.preservePantheon ? "require" : "observe";
		if ("rowsToDisplay" in settings) newPrefs.display.rows = Number(settings.rowsToDisplay);
		setPreferences(newPrefs);
	}
	function retrieveDataFromLegacySave() {
		let legacyId = "Choose your own lump";
		if (legacyId in Game.modSaveData) {
			loadSettingsFromLegacySave(Game.modSaveData[legacyId]);
			Game.deleteModData(legacyId);
		}
	}
	function getPreferencesFromObject(source, version) {
		function onError(msg) {
			if (version === void 0) throw new Error(msg);
			else console.warn(msg);
		}
		function assign(target, source, prefix) {
			for (let key of Object.keys(source)) if (key in target) if (source[key] == null) onError(`CYOL.load: ${prefix}${key} is null`);
			else if (typeof target[key] != typeof source[key]) onError(`CYOL.load: Mistyped property: ${prefix}${key}`);
			else if (typeof target[key] == "object") target[key] = assign(target[key], source[key], prefix + key + ".");
			else target[key] = source[key];
			else onError(`CYOL.load: ${prefix}${key} does not exist`);
			return target;
		}
		return assign(getDefaultPreferences(), source, "CYOLPreferences.");
	}
	function clearModState() {
		clearDiscrepancyInfo();
	}
	function clearModData() {
		setPreferences(getDefaultPreferences());
		clearDiscrepancyInfo();
	}
	function loadSaveData(saveData, isInitialLoad) {
		clearModState();
		let saveDataAsObject = JSON.parse(saveData);
		if (!saveDataAsObject || typeof saveDataAsObject != "object") {
			console.warn("CYOL: Unknown save format, using defaults...");
			setPreferences(getDefaultPreferences());
			return;
		}
		let version = void 0;
		if ("version" in saveDataAsObject) if (typeof saveDataAsObject.version != "string") console.warn("CYOL: Unknown save format version, assuming most recent");
		else version = saveDataAsObject.version;
		if (!("preferences" in saveDataAsObject)) {
			console.warn("CYOL: missing preferences, using defaults...");
			setPreferences(getDefaultPreferences());
		} else if (!saveDataAsObject.preferences || typeof saveDataAsObject.preferences != "object") {
			console.warn("CYOL: corrupted preferences, using defaults...");
			setPreferences(getDefaultPreferences());
		} else setPreferences(getPreferencesFromObject(saveDataAsObject.preferences, version));
		if (!("storedDiscrepancyInfo" in saveDataAsObject)) {
			console.log("CYOL: no stored discrepancy information, attempting to reconstruct from save data");
			discrepancyInfoRetrievalFallback(preferences, isInitialLoad);
		} else if (!saveDataAsObject.storedDiscrepancyInfo || typeof saveDataAsObject.storedDiscrepancyInfo != "object") {
			console.warn("CYOL: corrupted stored discrepancy information");
			discrepancyInfoRetrievalFallback(preferences, isInitialLoad);
		} else loadDiscrepancyInfo(saveDataAsObject.storedDiscrepancyInfo, preferences, isInitialLoad);
	}
	function serializeSaveData() {
		let saveData = {
			version,
			preferences,
			storedDiscrepancyInfo: getDiscrepancyInfoForStorage()
		};
		return JSON.stringify(saveData);
	}
	//#endregion
	//#region src/UI/lumpIconScrolling.ts
	var scrolledRows = 0;
	function capScrolledRows(cap) {
		if (scrolledRows > cap) scrolledRows = cap;
		if (scrolledRows < 0) scrolledRows = 0;
	}
	var percentageOfCurrentRowScrolled = 0;
	function registerLumpIconWheelEventListener() {
		document.getElementById("lumps").addEventListener("wheel", (ev) => {
			const pixelsPerRow = 120;
			const linesPerRow = 6;
			const rowsPerPage = preferences.display.rows;
			let newScroll = 0;
			switch (ev.deltaMode) {
				case WheelEvent.DOM_DELTA_PIXEL:
					newScroll = ev.deltaY / pixelsPerRow;
					break;
				case WheelEvent.DOM_DELTA_LINE:
					newScroll = ev.deltaY / linesPerRow;
					break;
				case WheelEvent.DOM_DELTA_PAGE:
					newScroll = ev.deltaY * rowsPerPage;
					break;
			}
			let totalScroll = scrolledRows + percentageOfCurrentRowScrolled + newScroll;
			percentageOfCurrentRowScrolled = totalScroll % 1;
			scrolledRows = totalScroll - percentageOfCurrentRowScrolled;
			scrolledRows = Math.round(scrolledRows);
		});
	}
	//#endregion
	//#region src/UI/lumpTooltip.ts
	function currentLumpType() {
		switch (Game.lumpCurrentType) {
			case 0: return "normal";
			case 1: return "bifurcated";
			case 2: return "golden";
			case 3: return "meaty";
			case 4: return "caramelized";
			default: return "unknown";
		}
	}
	function makeLumpIcon(lumpType, scale) {
		let background = "";
		let scaling = scale !== void 0 ? `scale:${scale}; transform-origin:top left;` : "";
		switch (lumpType) {
			case "normal":
				background = "background-position: -1392px -672px;";
				break;
			case "bifurcated":
				background = "background-position: -1392px -720px;";
				break;
			case "golden":
				if (preferences.display.useMatureGoldenLumpSprite) background = "background-position: -1392px -768px;";
				else background = "background-position: -1344px -768px;";
				break;
			case "meaty":
				background = "background-position: -1392px -816px;";
				break;
			case "caramelized":
				background = "background-position: -1392px -1296px;";
				break;
		}
		let str = `<div class="icon" style="vertical-align: middle; margin:0; ${background} ${scaling}"></div>`;
		if (scale === void 0) return str;
		else return `<div style="width:${Math.round(48 * scale)}px; height:${Math.round(48 * scale)}px">
            ${str}
        </div>`;
	}
	function discrepancyTooltip() {
		let str = "";
		let lumpType = currentLumpType();
		if (lumpType == "unknown") str += `<div>The mod Choose Your Own Lump does not know about this lump type.
            You might be in a future version of Cookie Clicker that adds lump types,
            or using a mod which adds lump types,
            or something is wrong with your save file.
        </div>`;
		else str += `<div style="display:flex; justify-content:center; align-items:center;">
            <div>The sugar lump that is growing now is</div>
            ${makeLumpIcon(lumpType, .5)}
            <div>${lumpType}.</div>
        </div>`;
		let genericInstructions = `
        Adjust your game state according to one of the predictions below,
        export your save file,
        <mark style="all:unset; color:white">wait for the lump to fall offline</mark>
        (i.e. be harvested automatically while the game is closed),
        and then load the save file.
    `;
		if (!discrepancyInfo.available) {
			str += `<div style="color:gray">
            No discrepancy information to show. ${genericInstructions}
        </div>`;
			return str;
		}
		if (discrepancyInfo.current.lumpT == discrepancyInfo.previous.lumpT) {
			str += `<div style="color:gray">
            No lump was harvested offline since this save file was created. ${genericInstructions}
        </div>`;
			return str;
		}
		let theoreticalLumpT = discrepancyInfo.previous.lumpT + discrepancyInfo.previous.lumpOverripeAge;
		let discrepancy = discrepancyInfo.current.lumpT - theoreticalLumpT;
		if (discrepancy == discrepancyInfo.expectedDiscrepancy) {
			str += `<div style="display:flex; justify-content:center">
            <div>
                The discrepancy was <mark style="all:unset; color:green">${discrepancy}ms</mark>,
                exactly what we expected!
            </div>
        </div>`;
			return str;
		}
		let errorMessage = `
        The actual discrepancy was <mark style="all:unset; color:red">${discrepancy}ms</mark>,
        which differs from the expected discrepancy of ${discrepancyInfo.expectedDiscrepancy}ms.
    `;
		if (discrepancy >= 0 && discrepancy <= 1e3) {
			str += `<div>${errorMessage}
            Try loading the save again if the lump does not have the desired type.
        </div>
        <div style="font-size:smaller">
            (If the actual discrepancy is frequently ${discrepancy}ms,
            you can try changing the "expected discrepancy" setting in the options menu to ${discrepancy}ms.
            In future predictions,
            Choose Your Own Lump will assume that this is the discrepancy that will take place.)
        </div>`;
			return str;
		}
		let discrepancyMinutes = discrepancy / (60 * 1e3);
		if (discrepancyMinutes > 10 && discrepancyMinutes < 70) {
			str += `<div>${errorMessage}</div>
            <div>This most likely happened because the pantheon
                (the Temples minigame)
                has had not finished loading when the lump times were computed,
                so Rigidel did not have an effect on lump maturation times. `;
			if (Game.hasGod) str += `Try importing your save file again, now that the pantheon has loaded.`;
			else str += `
                Unlock the pantheon by spending a sugar lump in the temples,
                and import your save file again.
            `;
			str += "</div>";
			return str;
		}
		if (discrepancy > .99 * discrepancyInfo.previous.lumpOverripeAge) {
			str += `<div>${errorMessage}</div>
            <div>
                More than one lump was autoharvested since this save file was created.
                Other than the first,
                all lumps autoharvested offline are normal,
                so there is nothing we can do.
            </div>
            <div>${genericInstructions}</div>
        `;
			return str;
		}
		str += `<div>${errorMessage}
        <mark style="all:unset; color:red">Something went wrong.</mark>
        Try loading your save again and without other mods.
        If the problem persists,
        please contact the developers of Choose Your Own Lump.
    </div>`;
		return str;
	}
	function makeNote(note) {
		let noteCharacter = "", noteColor = "";
		if (preferences.display.showCheckmark) {
			if (note == "checkmark") {
				noteCharacter = "✔";
				noteColor = "color:darkgreen;";
			}
			if (note == "warn") noteCharacter = "⚠️";
		}
		return `<div style="position:absolute; top:0px; right:0px; ${noteColor}">${noteCharacter}</div>`;
	}
	function makeDragonAuraIcon(dragonAura) {
		let transparency = "";
		if (dragonAura.style == "faded") transparency += "opacity: 0.2;";
		let background = "";
		switch (dragonAura.aura) {
			case "Dragon's Curve":
				background = "background-position: -960px -1200px;";
				break;
			case "Reality Bending":
				background = "background-position: -1536px -1200px;";
				break;
			case "Supreme Intellect":
				background = "background-position: -1632px -1200px;";
				break;
			case "none":
				background = "background-position:48px 48px;";
				break;
		}
		return "<div style=\"height: 48px; position:relative; display:inline-block; vertical-align:middle;\">" + ("<div class=\"icon\" style=\"vertical-align: middle; margin:0 -2px;" + background + transparency + "\"></div>") + makeNote(dragonAura.note) + "</div>";
	}
	function makeGrandmaIcon(stage, transparent) {
		let transparency = transparent ? "opacity: 0.2;" : "";
		let position = "position:absolute;";
		let background = `background-image:url(${Game.resPath}img/buildings.png); `;
		if (stage == 0) {
			background += "background-position: 0px -64px;";
			position += "top: 0px; left: 0px;";
		}
		if (stage == 1) {
			background += "background-position: 0px -128px;";
			position += "top: 0px; right: 0px;";
		}
		if (stage == 2) {
			background += "background-position: -64px -128px;";
			position += "bottom: 0px; left: 0px;";
		}
		if (stage == 3) {
			background += "background-position: -128px -128px;";
			position += "bottom: 0px; right: 0px;";
		}
		return `<div style="width:58px; height:64px; display:inline-block; ${background} ${transparency} ${position}"></div>`;
	}
	function makeGrandmapocalypseIcons(grandmapocalypseStages, note) {
		function noteForStage(stage) {
			return makeNote(Game.elderWrath == stage && grandmapocalypseStages[stage] ? "checkmark" : "").replace("darkgreen", "green");
		}
		if (preferences.display.compactGrandmapocalypseRepresentation) return `<div style="position:relative; width:66px; height:64px">
            <div style="width: 116px; height: 128px; transform:scale(0.5); transform-origin:top left;">
                ${makeGrandmaIcon(0, !grandmapocalypseStages[0])}
                ${makeGrandmaIcon(1, !grandmapocalypseStages[1])}
                ${makeGrandmaIcon(2, !grandmapocalypseStages[2])}
                ${makeGrandmaIcon(3, !grandmapocalypseStages[3])}
            </div>
            ${makeNote(note)}
        </div>`;
		else return `<div style="display:flex; width:232px; height:64px">
            <div style = "width:58px; height:64px; position:relative;">${makeGrandmaIcon(0, !grandmapocalypseStages[0])} ${noteForStage(0)}</div>
            <div style = "width:58px; height:64px; position:relative;">${makeGrandmaIcon(1, !grandmapocalypseStages[1])} ${noteForStage(1)}</div>
            <div style = "width:58px; height:64px; position:relative;">${makeGrandmaIcon(2, !grandmapocalypseStages[2])} ${noteForStage(2)}</div>
            <div style = "width:58px; height:64px; position:relative;">${makeGrandmaIcon(3, !grandmapocalypseStages[3])} ${noteForStage(3)}</div>
        </div>`;
	}
	function makeRigidelIcon(slot, note) {
		let rigidel = "<div class=\"icon\" style=\"background-position:-1056px -912px; margin:0\"></div>";
		let gem_background = "";
		switch (slot) {
			case "diamond":
				gem_background = "background-position: -1104px -720px;";
				break;
			case "ruby":
				gem_background = "background-position: -1128px -720px;";
				break;
			case "jade":
				gem_background = "background-position: -1104px -744px;";
				break;
		}
		let gem = "<div class=\"icon\" style=\"width:24px; height:24px; position:absolute; top:36px; left:12px; margin:0;" + gem_background + "\"></div>";
		if (slot == "none") gem = "";
		return `<div style="${slot == "none" ? "height:48px;" : "height:60px"} width:48px; position:relative">
        <div style="${slot == "none" ? "opacity:0.2" : ""}">${rigidel}${gem}</div>
        ${makeNote(note)}
    </div>`;
	}
	function makeConfigurationDiv(entry) {
		let str = "<div style=\"display:flex; align-items:center\">";
		if (entry.grandmaCount !== null) str += `<div style="display:flex; flex-direction:column; align-items:center; width:40px; height:64px; position:relative">
            <div style="background-image:url(${Game.resPath}img/grandma.png); background-position:bottom; width:40px; height:52px;"></div>
            ${entry.grandmaCount == 600 ? "600+" : entry.grandmaCount}
            ${makeNote(entry.grandmaCountNote)}
        </div>`;
		str += makeGrandmapocalypseIcons(entry.grandmapocalypseStages, entry.grandmapocalypseNote);
		for (let dragonAura of entry.dragonAuras) str += makeDragonAuraIcon(dragonAura);
		str += makeRigidelIcon(entry.rigidelSlot, entry.rigidelNote);
		return str + "</div>";
	}
	function makeSummaryReport(report) {
		let str = "";
		let hasShownLumpType = false;
		for (let lumpType of [
			"normal",
			"bifurcated",
			"golden",
			"meaty",
			"caramelized"
		]) {
			if (report[lumpType] === void 0) continue;
			hasShownLumpType = true;
			let anySelected = report[lumpType].some((x) => x.selectedEntry);
			str += `<div style="display:flex; align-items:center; margin:2px; padding:2px; border: solid 2px; border-color:${anySelected ? "darkblue" : "dimgray"}; border-radius: 5px;">`;
			str += `<div style="display:flex; align-items:center; margin:1ex">
            ${makeLumpIcon(lumpType, .5)}
            <div style="width:12ex; margin:0.5ex;">${lumpType[0].toUpperCase() + lumpType.substring(1)}</div>
        </div>`;
			str += `<div style="display:flex; flex-direction:column;">`;
			for (let configuration of report[lumpType]) str += `<div style="padding:2px; ${configuration.selectedEntry ? "background-color:midnightblue" : ""}">
                ${makeConfigurationDiv(configuration)}
            </div>`;
			if (report[lumpType].length == 0) if (Game.Has("Sugar aging process")) str += `<div>
                    This seems to be an unlucky seed.
                    Try making your requirements less strict in the options menu!
                </div>`;
			else str += `<div>
                    No matching predictions found.
                    This report type is better suited
                    for after you have purchased the heavenly upgrade "Sugar aging process".
                </div>`;
			str += "</div>";
			str += "</div>";
		}
		if (!hasShownLumpType) str += "No lump types were chosen, please select at least one lump type in the options menu.";
		return str;
	}
	function makeFullListReport(report) {
		let configurationCount = report.flat().length;
		capScrolledRows(configurationCount - preferences.display.rows + 1);
		let displayedRows = 0;
		let iteratedRows = 0;
		let str = "";
		str += "<div style=\"display:flex; flex-direction:column;\">";
		outerLoop: for (let i = 0; i < report.length; i++) for (let j = 0; j < report[i].length; j++) {
			iteratedRows++;
			if (iteratedRows <= scrolledRows) continue;
			let background = i % 2 ? "" : "background-color: black;";
			if (report[i][j].selectedEntry) background = "background-color: midnightblue;";
			str += `<div style="display:flex; align-items:center; justify-content:center; padding:2px; ${background}">`;
			str += makeLumpIcon(report[i][j].lumpType);
			str += "<div style=\"margin-right:1.5ex\">:</div>";
			str += makeConfigurationDiv(report[i][j]);
			str += "</div>";
			displayedRows++;
			if (displayedRows >= preferences.display.rows) break outerLoop;
		}
		if (displayedRows < preferences.display.rows) {
			str += "<div padding=2px; margin=5px; align-text: right;\">No other matching predictions found.";
			if (displayedRows == 0) if (Game.Has("Sugar aging process")) str += `<br />
                    This seems to be an unlucky seed.
                    Try making your requirements less strict in the options menu!
                `;
			else str += `<br />
                    Try showing more lump types and making your requirements less strict in the options menu.
                    Also, get the heavenly upgrade "Sugar aging process".
                `;
			str += "</div>";
		}
		str += "</div>";
		return str;
	}
	function customLumpTooltip(str, _phase) {
		let calculatedWidth = 0;
		calculatedWidth += 40;
		if (preferences.display.compactGrandmapocalypseRepresentation) calculatedWidth += 58;
		else calculatedWidth += 232;
		if (preferences.filtering.threeColumnDragonAuras) calculatedWidth += 132;
		else calculatedWidth += 88;
		calculatedWidth += 48;
		if (preferences.display.reportType == "summary") calculatedWidth += 120;
		else calculatedWidth += 54;
		calculatedWidth += 20;
		if (calculatedWidth > 400) str = str.replace("width:400px", `width:${calculatedWidth}px`);
		str += "<div class=\"line\"></div>";
		str += discrepancyTooltip();
		str += "<div class=\"line\"></div>";
		let prediction, isCurrent;
		({prediction, isCurrent} = planner.getAndUpdateLumpTypePrediction());
		str += `<div style="display:flex; justify-content:center; align-items:center;">
        <div>The next lump type is predicted to be</div>
        ${makeLumpIcon(prediction, .5)}
        <div style="padding-right:0.5ex">${prediction}.</div>
        ${isCurrent ? "" : "<div style=\"width: 0px;\">(recalculating...)</div>"}
    </div>`;
		let reportStr = "";
		if (preferences.display.reportType == "summary") {
			let report;
			({report, isCurrent} = planner.getAndUpdateSummaryReport());
			reportStr = makeSummaryReport(report);
		} else {
			let report;
			({report, isCurrent} = planner.getAndUpdateFullListReport());
			reportStr = makeFullListReport(report);
		}
		str += `<div style="display:flex; justify-content:center; margin-bottom:4px;">
        <div style="padding-right:0.5ex">Other configurations:</div>
        ${isCurrent ? "" : "<div style=\"width: 0px;\">(recalculating...)</div>"}
    </div>`;
		str += reportStr;
		return str;
	}
	//#endregion
	//#region src/UI/optionsMenu.ts
	var sliderUpdaters = {};
	function onSliderUpdate(id) {
		let sliderElement = document.getElementById(`CYOL-slider-${id}`);
		let rightTextElement = document.getElementById(`CYOL-sliderText-${id}`);
		let value = Number(sliderElement.value);
		sliderUpdaters[id].updateValue(value);
		rightTextElement.innerText = sliderUpdaters[id].getDisplayText(value);
	}
	function makeSlider(options) {
		sliderUpdaters[options.id] = {
			updateValue: options.updateValue,
			getDisplayText: options.getDisplayText
		};
		return `
    <div class="sliderBox">
        <div style="float:left;" class="smallFancyButton">${options.sliderTitle}</div>
        <div style="float:right;" class="smallFancyButton" id="CYOL-sliderText-${options.id}">
            ${options.getDisplayText(options.currentValue)}
        </div>
        <input class="slider" id="CYOL-slider-${options.id}"
               style="clear:both;"
               type="range" min="${options.minValue}" max="${options.maxValue}" step="1"
               value="${options.currentValue}"
               onchange="CYOL.UI.onSliderUpdate('${options.id}')"
               oninput="CYOL.UI.onSliderUpdate('${options.id}')"
               onmouseup="PlaySound('snd/tick.mp3');">
    </div>`;
	}
	function makeConditionsSlider(options) {
		function updateValue(newValue) {
			if (newValue == 0) options.updateValue("require");
			if (newValue == 1) options.updateValue("observe");
			if (newValue == 2) options.updateValue("ignore");
		}
		function getDisplayText(newValue) {
			if (newValue == 0) return "Require";
			if (newValue == 1) return "Observe";
			return "Ignore";
		}
		let currentValue = 0;
		if (options.currentValue == "observe") currentValue = 1;
		if (options.currentValue == "ignore") currentValue = 2;
		return makeSlider({
			id: options.id,
			updateValue,
			getDisplayText,
			currentValue,
			sliderTitle: options.sliderTitle,
			minValue: 0,
			maxValue: 2
		});
	}
	var buttonUpdaters = {};
	function onButtonClick(id) {
		let button = document.getElementById(`CYOL-button-${id}`);
		let newValue = !buttonUpdaters[id].getCurrentValue();
		buttonUpdaters[id].updateValue(newValue);
		if (newValue) button.classList.remove("off");
		else button.classList.add("off");
		button.innerText = buttonUpdaters[id].getDisplayText(newValue);
		PlaySound("snd/tick.mp3");
	}
	function makeButton(options) {
		function getDisplayText(newValue) {
			return options.buttonText + (newValue ? " ON" : " OFF");
		}
		buttonUpdaters[options.id] = {
			getCurrentValue: options.getCurrentValue,
			updateValue: options.updateValue,
			getDisplayText
		};
		return `
        <a id="CYOL-button-${options.id}"
           class="smallFancyButton prefButton option${options.getCurrentValue() ? "" : " off"}"
           onclick="CYOL.UI.onButtonClick('${options.id}')"
        >
            ${getDisplayText(options.getCurrentValue())}
        </a>`;
	}
	function makeIncludeLumpButton(lumpType) {
		let capitalizedName = lumpType[0].toUpperCase() + lumpType.slice(1);
		return makeButton({
			id: "include" + capitalizedName,
			getCurrentValue: () => preferences.filtering.includeType[lumpType],
			updateValue: (newValue) => {
				preferences.filtering.includeType[lumpType] = newValue;
			},
			buttonText: capitalizedName
		});
	}
	function customOptionsMenu() {
		let menuStr = "";
		menuStr += "<div class=\"listing\">" + makeSlider({
			id: "discrepancy",
			updateValue: (newValue) => {
				preferences.discrepancy = newValue;
			},
			getDisplayText: (newValue) => String(newValue) + "ms",
			currentValue: preferences.discrepancy,
			sliderTitle: "Expected discrepancy",
			minValue: 0,
			maxValue: 20
		}) + "</div>";
		menuStr += "<div class=\"listing\">" + makeButton({
			id: "threeColumnDragonAuras",
			getCurrentValue: () => {
				return preferences.filtering.threeColumnDragonAuras;
			},
			updateValue: (newValue) => {
				preferences.filtering.threeColumnDragonAuras = newValue;
			},
			buttonText: "Display dragon auras in three columns"
		}) + `<label>Whether to show the dragon auras in three columns,
                or to compress the display in only two columns.
        </label>
    </div>`;
		menuStr += "<div class=\"listing\">" + makeButton({
			id: "summaryReport",
			getCurrentValue: () => {
				return preferences.display.reportType == "summary";
			},
			updateValue: (newValue) => {
				if (newValue) preferences.display.reportType = "summary";
				else preferences.display.reportType = "fullList";
			},
			buttonText: "Summary display"
		}) + `<label>If on, shows only the "best configuration",
                otherwise show the full list of predictions.
        </label>
    </div>`;
		menuStr += "<div class=\"listing\">" + makeButton({
			id: "compactGrandmapocalypseRepresentation",
			getCurrentValue: () => {
				return preferences.display.compactGrandmapocalypseRepresentation;
			},
			updateValue: (newValue) => {
				preferences.display.compactGrandmapocalypseRepresentation = newValue;
			},
			buttonText: "Compact grandmapocalypse stages"
		}) + `<label>Whether to display the valid grandmapocalypse stages
                as a large 1x4 row or as a compact 2x2 grid
        </label>
    </div>`;
		menuStr += "<div class=\"listing\">" + makeSlider({
			id: "rowsToDisplay",
			updateValue: (newValue) => {
				preferences.display.rows = newValue;
			},
			getDisplayText: (newValue) => String(newValue),
			currentValue: preferences.display.rows,
			sliderTitle: "Rows of predictions to display",
			minValue: 1,
			maxValue: 30
		}) + "<label>Number of rows to be displayed, if showing the full list of predictions</label></div>";
		menuStr += "<div class=\"listing\">" + makeButton({
			id: "showCheckmark",
			getCurrentValue: () => {
				return preferences.display.showCheckmark;
			},
			updateValue: (newValue) => {
				preferences.display.showCheckmark = newValue;
			},
			buttonText: "Show checkmark"
		}) + `<label>Whether to show a checkmark (or sometimes a warning sign)
                in the top right corner of the icons in the tooltip
        </label>
    </div>`;
		menuStr += "<div class=\"listing\">" + makeButton({
			id: "useMatureGoldenLumpSprite",
			getCurrentValue: () => {
				return preferences.display.useMatureGoldenLumpSprite;
			},
			updateValue: (newValue) => {
				preferences.display.useMatureGoldenLumpSprite = newValue;
			},
			buttonText: "Use mature golden lump sprite"
		}) + `<label>Whether to use the fully mature golden lump sprite,
                or the almost-mature one.
        </label>
    </div>`;
		menuStr += "<div class=\"update small\"><div class=\"title\">Lump Types</div></div>";
		for (let lumpType of [
			"normal",
			"bifurcated",
			"golden",
			"meaty",
			"caramelized"
		]) menuStr += "<div class=\"listing\">" + makeIncludeLumpButton(lumpType) + `<label>Whether to list predictions that yield ${lumpType} lumps</label></div>`;
		menuStr += "<div class=\"update small\"><div class=\"title\">Filtering conditions</div></div>";
		menuStr += "<div class=\"listing\">" + makeConditionsSlider({
			id: "preserveGrandmapocalypseStage",
			sliderTitle: "Match current grandmapocalypse stage",
			currentValue: preferences.filtering.conditions.preserveGrandmapocalypseStage,
			updateValue: (newValue) => {
				preferences.filtering.conditions.preserveGrandmapocalypseStage = newValue;
			}
		}) + "<label>Whether to list only predictions that match the current grandmapocalypse stage (\"require\"),\n                to include those predictions in the summary report but not require this condition (\"observe\"),\n                or to not worry about this requirement at all (\"ignore\").\n        </label></div>";
		menuStr += "<div class=\"listing\">" + makeConditionsSlider({
			id: "preservePantheon",
			sliderTitle: "Match current pantheon configuration",
			currentValue: preferences.filtering.conditions.preservePantheon,
			updateValue: (newValue) => {
				preferences.filtering.conditions.preservePantheon = newValue;
			}
		}) + "<label>Similar, but for pantheon configuration.\n                Note that Rigidel can be disabled without changing the pantheon\n                by manipulating the number of buildings.\n        </label></div>";
		menuStr += "<div class=\"listing\">" + makeConditionsSlider({
			id: "preserveDragon",
			sliderTitle: "Match current dragon auras",
			currentValue: preferences.filtering.conditions.preserveDragon,
			updateValue: (newValue) => {
				preferences.filtering.conditions.preserveDragon = newValue;
			}
		}) + "<label>Similar, but for the dragon auras.\n                Additionally, if both \"preserve pantheon\" and \"preserve dragon\" are set to \"observe\",\n                the summary report also includes a row observing both conditions at the same time.\n        </label></div>";
		menuStr += "<div class=\"listing\">" + makeConditionsSlider({
			id: "respectBudget",
			sliderTitle: "Budget conscious",
			currentValue: preferences.filtering.conditions.respectBudget,
			updateValue: (newValue) => {
				preferences.filtering.conditions.respectBudget = newValue;
			}
		}) + "<label>Similar, but for configurations whose individual components\n                (grandmas and each dragon aura)\n                can be purchased using at most 1% of the current bank.\n        </label></div>";
		CCSE.AppendCollapsibleOptionsMenu("Choose Your Own Lump", menuStr);
	}
	//#endregion
	//#region src/rewriteCode.ts
	function rewriteCode(functionName, pattern, replacement) {
		let newCode = Game[functionName].toString().replace(pattern, replacement);
		let indirectEval = eval;
		Game[functionName] = indirectEval(`(${newCode})`);
	}
	//#endregion
	//#region src/main.ts
	var CYOL = {
		name,
		version,
		isLoaded: false,
		isInitialLoad: true,
		preferences,
		planner,
		discrepancyInfo,
		UI: {
			onSliderUpdate,
			onButtonClick
		},
		preload: function() {
			delete Game.modSaveData[name];
		},
		id: name,
		init: function() {
			Game.modHooks["reset"].push((hard) => {
				if (hard) clearModState();
			});
			Game.customLumpTooltip.push(customLumpTooltip);
			Game.customOptionsMenu.push(customOptionsMenu);
			Game.customStatsMenu.push(function() {
				CCSE.AppendStatsVersionNumber(name, version);
			});
			registerLumpIconWheelEventListener();
			rewriteCode("LoadSave", "{", "{\nCYOL.preload(); // Injected by Choose Your Own Lump\n");
			rewriteCode("loadModData", "{", `{\nif(!("${name}" in Game.modSaveData)) CYOL.load(); // Injected by Choose Your Own Lump\n`);
			clearModData();
			retrieveDataFromLegacySave();
			CYOL.isInitialLoad = name in Game.modSaveData;
			CYOL.isLoaded = true;
			Game.Notify("Choose Your Own Lump loaded!", "", void 0, 1, true);
		},
		save: function() {
			return serializeSaveData();
		},
		load: function(str) {
			if (str === void 0) {
				clearModData();
				retrieveDataFromLegacySave();
				discrepancyInfoRetrievalFallback(CYOL.preferences, CYOL.isInitialLoad);
			} else loadSaveData(str, CYOL.isInitialLoad);
			CYOL.isInitialLoad = false;
		}
	};
	window.CYOL = CYOL;
	if (typeof CCSE == "undefined") Game.LoadMod("https://klattmose.github.io/CookieClicker/CCSE.js");
	if (!CYOL.isLoaded) if (window.CCSE && window.CCSE.isLoaded) Game.registerMod(CYOL.id, CYOL);
	else {
		if (!window.CCSE) window.CCSE = {};
		if (!window.CCSE.postLoadHooks) window.CCSE.postLoadHooks = [];
		window.CCSE.postLoadHooks.push(function() {
			if (window.CCSE.ConfirmGameVersion("Choose Your Own Lump", "1.4.0", "2.058")) Game.registerMod(CYOL.id, CYOL);
		});
	}
	//#endregion
})();if(FortuneCookie === undefined) var FortuneCookie = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
FortuneCookie.name = 'Fortune Cookie';
FortuneCookie.version = '2.11';
FortuneCookie.GameVersion = '2.052';

FortuneCookie.launch = function(){
	FortuneCookie.init = function(){
		FortuneCookie.isLoaded = 1;
		FortuneCookie.Backup = {};
		FortuneCookie.config = {};
		
		FortuneCookie.config = FortuneCookie.defaultConfig();
		if(CCSE.config.OtherMods.FortuneCookie && !Game.modSaveData[FortuneCookie.name]) Game.modSaveData[FortuneCookie.name] = JSON.stringify(CCSE.config.OtherMods.FortuneCookie);
		
		FortuneCookie.ReplaceNativeGrimoire();
		FortuneCookie.initMembraneForecast();
		FortuneCookie.initDragonDropForecast();
		
		
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(FortuneCookie.name, FortuneCookie.getMenuString());
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(FortuneCookie.name, FortuneCookie.version);
		});
		
		//***********************************
		//    Post-Load Hooks 
		//    To support other mods interfacing with this one
		//***********************************
		if(FortuneCookie.postloadHooks) {
			for(var i = 0; i < FortuneCookie.postloadHooks.length; ++i) {
				(FortuneCookie.postloadHooks[i])();
			}
		}
		
		if (Game.prefs.popups) Game.Popup('Fortune Cookie loaded!');
		else Game.Notify('Fortune Cookie loaded!', '', '', 1, 1);
	}


	//***********************************
	//    Configuration
	//***********************************
	FortuneCookie.save = function(){
		return JSON.stringify(FortuneCookie.config);
	}

	FortuneCookie.load = function(str){
		var config = JSON.parse(str);
		for(var pref in config){
			FortuneCookie.config[pref] = config[pref];
		}
	}
	
	FortuneCookie.defaultConfig = function(){
		return {
			spellForecastLength : 10,
			simGCs : 0,
			colorOverride: {
				'Building Special'	: "#FF00FF",
				'Click Frenzy'		: "#4BB8F0",
				'Elder Frenzy'		: "#E1C699",
				'Free Sugar Lump'	: "#DAA560"
			},
			forecastDragonDrop : true
		}
	}
	
	FortuneCookie.UpdatePref = function(prefName, value){
		FortuneCookie.config[prefName] = value;
	}
	
	FortuneCookie.SetOverrideColor = function(effect, color){
		FortuneCookie.config.colorOverride[effect] = color;
		Game.UpdateMenu();
	}

	FortuneCookie.getSimGCs = function(){
		// default to 0 if some BS causes this to be undefined
		return (FortuneCookie.config.simGCs ? FortuneCookie.config.simGCs : 0);
	}
	
	FortuneCookie.AddColorOverride = function(){
		var str = '<h3>New color override</h3><div class="block">';
		str += '<table style="width:80%;">';
		str += '<tr><td style="text-align:right; width:45%;">Effect:</td><td style="width:5%;"></td><td style="text-align:left; width:50%;"><input id="effectEditor" class="option" type="text" value="" style="width: 65px;" /></td></tr>';
		str += '<tr><td style="text-align:right;">Color:</td><td></td><td style="text-align:left;"><input id="colorEditor" class="option" type="text" value="#FFFFFF" style="width: 65px;" /></td></tr>';
		str += '</table></div>';
		
		Game.Prompt(str, [['Save', 'FortuneCookie.config.colorOverride[l("effectEditor").value] = l("colorEditor").value; Game.ClosePrompt(); Game.UpdateMenu();'], 
						  ['Nevermind', 'Game.ClosePrompt();']], 0);
	}
	

	//***********************************
	//    Replacement
	//***********************************
	FortuneCookie.getMenuString = function(){
		let m = CCSE.MenuHelper;
		
		var str = '<div class="listing">' +
					m.Slider('spellForecastSlider', 'Forecast Length', '[$]', function(){return FortuneCookie.config.spellForecastLength;}, "FortuneCookie.UpdatePref('spellForecastLength', Math.round(l('spellForecastSlider').value)); l('spellForecastSliderRightText').innerHTML = FortuneCookie.config.spellForecastLength;", 0, 100, 1) + '<br>' +
				'</div>';
		
		str += m.Header('Force the Hand of Fate') + 
				'<div class="listing">This spell\'s outcome changes based on the season, how many Golden Cookies are already on screen, and if a Dragonflight buff is currently active.</div>' + 
				'<div class="listing">Column 1 : The season is <b>not</b> Easter, Valentine\'s, Halloween, nor Business day.</div>' + 
				'<div class="listing">Column 2 : The season is <b>either</b> Easter, Valentine\'s, Halloween, or Business day.</div>' + 
				'<div class="listing">You can use this slider to forecast the outcome with more Golden Cookies on screen.</div>' +
				'<div class="listing">' +
					m.Slider('simGCsSlider', 'Simulate GCs', '[$]', FortuneCookie.getSimGCs, "FortuneCookie.UpdatePref('simGCs', Math.round(l('simGCsSlider').value)); l('simGCsSliderRightText').innerHTML = FortuneCookie.config.simGCs;", 0, 10, 1) + '<br>'+
				'</div>';
		
		str += m.Header('Color Override') +
				'<div class="listing">Set the color coding of the Force the Hand of Fate outcomes.</div>' +
				'<div class="listing">Default is <span class="green">green for success</span>, and <span class="red">red for backfire</span>.</div>';
		str += '<div class="listing">' + m.ActionButton("FortuneCookie.AddColorOverride();",'Add') + '</div>';
		
		for(var color in FortuneCookie.config.colorOverride){
			var style = 'width:65px;' +
						'background-color:'  + FortuneCookie.config.colorOverride[color] + ';';
			
			str += '<div class="listing">' +
				m.ActionButton("delete FortuneCookie.config.colorOverride['" + color + "']; Game.UpdateMenu();",'Remove') +
				'<input id="FortuneCookieColorOverride' + color + '" class="option" style="' + style + '" value="' + FortuneCookie.config.colorOverride[color] + '" onChange="FortuneCookie.SetOverrideColor(\'' + color + '\', l(\'FortuneCookieColorOverride' + color + '\').value)">' +
				'<label>' + color + '</label>' +
				'</div>';
		}
		
		str += m.Header('Dragon Drop forecast') + 
				'<div class="listing">' + m.ToggleButton(FortuneCookie.config, 'forecastDragonDrop', 'forecastDragonDropButton', 'Tooltip ON', 'Tooltip OFF', "FortuneCookie.Toggle") + '<label>Show/Hide the tooltip that displays the available drops for petting the dragon.</label></div>';
		
		return str;
	}
	
	FortuneCookie.Toggle = function(prefName, button, on, off, invert){
		if(FortuneCookie.config[prefName]){
			l(button).innerHTML = off;
			FortuneCookie.config[prefName] = 0;
		}
		else{
			l(button).innerHTML = on;
			FortuneCookie.config[prefName] = 1;
		}
		l(button).className = 'smallFancyButton prefButton option' + ((FortuneCookie.config[prefName] ^ invert) ? '' : ' off');
		
		if(Game.specialTab=='dragon') Game.ToggleSpecialMenu(1);
	}

	FortuneCookie.ReplaceNativeGrimoire = function() {
		if(!Game.customMinigame['Wizard tower'].spellTooltip) Game.customMinigame['Wizard tower'].spellTooltip = [];
		Game.customMinigame['Wizard tower'].spellTooltip.push(function(id, str){
			return str.replace( '</div></div>', 
								'<div style="height:8px;"></div>' + 
								FortuneCookie.spellForecast(Game.Objects['Wizard tower'].minigame.spellsById[id]) + 
								'</div></div>');
		});
	}


	//***********************************
	//    Membrane Forecast
	//***********************************
	FortuneCookie.initMembraneForecast = function(){
		var descFunc = function(me, desc){
			var str = desc;
			
			if (Game.Has('Reinforced membrane') && FortuneCookie.config.spellForecastLength){
				var durable = FortuneCookie.forecastMembrane('click', 0);
				var golddurable = FortuneCookie.forecastMembrane('shimmer', 0);
				
				str += '<br/><br/>';
				var durCount = FortuneCookie.countMembraneDurability('click');
				var golddurCount = FortuneCookie.countMembraneDurability('shimmer');
				
				if(durable)
					str += '<span class="green">Reinforced against cookie clicks (for ' + (durCount==-1?('>'+FortuneCookie.config.spellForecastLength):durCount) + ' click' + (durCount==1?'':'s') + ')</span><br/>';
				else
					str += '<span class="red">Unreinforced against cookie clicks (for ' + (durCount==-1?('>'+FortuneCookie.config.spellForecastLength):durCount) + ' click' + (durCount==1?'':'s') + ')</span><br/>';
				
				if(golddurable)
					str += '<span class="green">Reinforced against golden cookie clicks (for ' + (golddurCount==-1?('>'+FortuneCookie.config.spellForecastLength):golddurCount) + ' click' + (golddurCount==1?'':'s') + ')</span><br/>';
				else
					str += '<span class="red">Unreinforced against golden cookie clicks (for ' + (golddurCount==-1?('>'+FortuneCookie.config.spellForecastLength):golddurCount) + ' click' + (golddurCount==1?'':'s') + ')</span><br/>';
			}
			return str;
		}
		
		Game.customUpgrades['Shimmering veil [off]'].descFunc.push(descFunc);
		Game.customUpgrades['Shimmering veil [on]'].descFunc.push(descFunc);
		
	}

	FortuneCookie.forecastMembrane = function(context, offset){
		if (context=='shimmer') Math.seedrandom(Game.seed + '/' + (Game.goldenClicks + Game.reindeerClicked + offset));
		else if (context=='click') Math.seedrandom(Game.seed + '/' + (Game.cookieClicks + offset));
		
		if (Math.random() < Game.getVeilDefense()){
			return true;
		} else {
			return false;
		}
	}

	FortuneCookie.countMembraneDurability = function(context){
		var i;
		var initialSuccess = FortuneCookie.forecastMembrane(context, 0);
		
		for(i = 1; i <= FortuneCookie.config.spellForecastLength; i++){
			if(FortuneCookie.forecastMembrane(context, i) != initialSuccess) return i;
		}
		return -1;
	}


	//***********************************
	//    Dragon drop forecast
	//***********************************
	
	FortuneCookie.initDragonDropForecast = function(){
		var descFunc = function(str){
			var temp = str;
			
			if(temp.search("cursor:pointer") > -1 && FortuneCookie.config.forecastDragonDrop){
				temp = temp.replace('></div>', ' ' + Game.getTooltip(
					'<div style="min-width:200px;text-align:center;"><h4>Dragon Drops</h4>' +
					'<div class="line"></div>' +
					FortuneCookie.forecastDragonDrop() +
					'</div>', 'bottom-right') + 
				' ></div>');
			}
			
			return temp;
		}
		
		Game.customToggleSpecialMenu.push(descFunc);
	}
	
	FortuneCookie.forecastDragonDrop = function(){
		var str = '<table>';
		
		Math.seedrandom(Game.seed + '/dragonTime');
		var drops = ['Dragon scale', 'Dragon claw', 'Dragon fang', 'Dragon teddy bear'];
		drops = shuffle(drops);
		Math.seedrandom();
		
		var j = Math.floor((new Date().getMinutes() / 60) * drops.length);
		for(var i = 0; i < drops.length; i++){
			str += '<tr><td>' + (j == i ? 'Current --&gt; ' : '') + '</td><td>' + drops[i] + '</td><td>' + (Game.Has(drops[i]) || Game.HasUnlocked(drops[i]) ? '✔' : '') + '</td></tr>'
		}
		
		str += '</table>';
		
		return str;
	}
	
	
	//***********************************
	//    Grimoire forecast
	//***********************************
	
	// customFateChecker functions are for people who add their own outcome to FtHoF
	if(!FortuneCookie.customFateCheckerWin) FortuneCookie.customFateCheckerWin = [];
	if(!FortuneCookie.customFateCheckerFail) FortuneCookie.customFateCheckerFail = [];
	FortuneCookie.FateChecker = function(spellCount, idx, backfire, active){
		var res = '';
		var FTHOFcookie = '';
		Math.seedrandom(Game.seed + '/' + spellCount);
		roll = Math.random();
		
		if(roll < (1 - backfire)){
			/* Random is called a few times in setting up the golden cookie */
			if (idx > 0) Math.random();
			if (idx > 1) Math.random();
			Math.random();
			Math.random();
			
			var choices = [];
			choices.push('Frenzy','Lucky');
			if (!Game.hasBuff('Dragonflight')) choices.push('Click Frenzy');
			if (Math.random() < 0.1) choices.push('Cookie Storm','Cookie Storm','Blab');
			if (Game.BuildingsOwned >= 10 && Math.random() < 0.25) choices.push('Building Special');
			if (Math.random() < 0.15) choices = ['Cookie Storm Drop'];
			if (Math.random() < 0.0001) choices.push('Free Sugar Lump');
			
			for(var i in FortuneCookie.customFateCheckerWin) FortuneCookie.customFateCheckerWin[i](spellCount, idx, choices);
			
			FTHOFcookie = choose(choices);
			res = '<span class="green">' + FTHOFcookie + '</span><br/>';
			
		} else {
			/* Random is called a few times in setting up the golden cookie */
			if (idx > 0) Math.random();
			if (idx > 1) Math.random();
			Math.random();
			Math.random();
			
			var choices = [];
			choices.push('Clot','Ruin');
			if (Math.random() < 0.1) choices.push('Cursed Finger','Elder Frenzy');
			if (Math.random() < 0.003) choices.push('Free Sugar Lump');
			if (Math.random() < 0.1) choices=['Blab'];
			
			for(var i in FortuneCookie.customFateCheckerFail) FortuneCookie.customFateCheckerFail[i](spellCount, idx, choices);
			
			FTHOFcookie = choose(choices);
			res = '<span class="red">' + FTHOFcookie + '</span><br/>';
			
		}
		
		if(FortuneCookie.config.colorOverride[FTHOFcookie] !== undefined) res = '<span style="color:' + FortuneCookie.config.colorOverride[FTHOFcookie] + ';">' + FTHOFcookie + '</span><br/>';
		return '<td' + (active ? ' style="border-left: 2px solid grey;"' : '') + '>' + res + '</td>';
	}
	
	FortuneCookie.gamblerFateChecker = function(spellCount, idx, forceTrue){
		var res = '';
		Math.seedrandom(Game.seed + '/' + spellCount);
		roll = Math.random();
		
		if(forceTrue){
			/* Random is called a few times in setting up the golden cookie */
			if (idx > 0) Math.random();
			if (idx > 1) Math.random();
			Math.random();
			Math.random();
			
			var choices = [];
			choices.push('Frenzy','Lucky');
			if (!Game.hasBuff('Dragonflight')) choices.push('Click Frenzy');
			if (Math.random() < 0.1) choices.push('Cookie Storm','Cookie Storm','Blab');
			if (Game.BuildingsOwned >= 10 && Math.random() < 0.25) choices.push('Building Special');
			if (Math.random() < 0.15) choices = ['Cookie Storm Drop'];
			if (Math.random() < 0.0001) choices.push('Free Sugar Lump');
			
			for(var i in FortuneCookie.customFateCheckerWin) FortuneCookie.customFateCheckerWin[i](spellCount, idx, choices);
			
			return choose(choices);
			
		} else {
			/* Random is called a few times in setting up the golden cookie */
			if (idx > 0) Math.random();
			if (idx > 1) Math.random();
			Math.random();
			Math.random();
			
			var choices = [];
			choices.push('Clot','Ruin');
			if (Math.random() < 0.1) choices.push('Cursed Finger','Elder Frenzy');
			if (Math.random() < 0.003) choices.push('Free Sugar Lump');
			if (Math.random() < 0.1) choices = ['Blab'];
			
			for(var i in FortuneCookie.customFateCheckerFail) FortuneCookie.customFateCheckerFail[i](spellCount, idx, choices);
			
			return choose(choices);
			
		}
	}

	FortuneCookie.gamblerEdificeChecker = function(spellCount, forceTrue){
		Math.seedrandom(Game.seed + '/' + spellCount);
		Math.random();
		if(forceTrue){
			var buildings = [];
			var max = 0;
			var n = 0;
			for (var i in Game.Objects)
			{
				if (Game.Objects[i].amount > max) max = Game.Objects[i].amount;
				if (Game.Objects[i].amount > 0) n++;
			}
			for (var i in Game.Objects){
				if ((Game.Objects[i].amount<max || n == 1) && Game.Objects[i].getPrice() <= Game.cookies * 2 && Game.Objects[i].amount < 400) 
					buildings.push(Game.Objects[i]);
			}
			
			if (buildings.length == 0){
				return "Nothing";
			}else{
				var building = choose(buildings);
				return building.name;
			}
		} else {
			if (Game.BuildingsOwned == 0){
				return "Nothing";
			} else {
				var buildings = [];
				for (var i in Game.Objects){
					if (Game.Objects[i].amount > 0) 
						buildings.push(Game.Objects[i]);
				}
				var building=choose(buildings);
				return building.name;
			}
		}
	}
	
	// customSpellForecast functions should return HTML to append to the spell tooltip.
	// Return spellForecast to have no effect
	if(!FortuneCookie.customSpellForecast) FortuneCookie.customSpellForecast = [];
	FortuneCookie.spellForecast=function(spell){
		if(FortuneCookie.config.spellForecastLength == 0) return '';
		var spellOutcome = '<div width="100%"><b>Forecast:</b><br/>';
		var M = Game.Objects["Wizard tower"].minigame;
		var backfire = M.getFailChance(spell);
		var spellsCast = M.spellsCastTotal;
		var target = spellsCast + FortuneCookie.config.spellForecastLength;
		var idx = ((Game.season == "valentines" || Game.season == "easter" || Game.season == "fools" || Game.season == "halloween") ? 1 : 0); // + ((Game.chimeType == 1 && Game.ascensionMode != 1) ? 1 : 0);
		
		switch(spell.name){
			case loc("Force the Hand of Fate"):
				backfire += 0.15 * FortuneCookie.getSimGCs();
			
				spellOutcome = spellOutcome.replace('<br/>', '<span style="color:yellow;">This spell is a bit complicated. See the Options menu for an explanation.</span><br/>') + 
					'<table width="100%"><tr>';
				for(var i = 0; i < 2; i++)
					spellOutcome += '<td width="33%">' + ((i == idx) ? 'Active' : '') + '</td>';
				spellOutcome += '</tr><br/>';
				
				while(spellsCast < target){
					spellOutcome += '<tr>';
					for(var i = 0; i < 2; i++)
						spellOutcome += FortuneCookie.FateChecker(spellsCast, i, backfire, false); // Change false to idx == i for an identifier
					spellOutcome += '</tr>';
					
					spellsCast += 1;
					Math.seedrandom();
				}
				spellOutcome += '</table></div>';
				break;
			
			case loc("Spontaneous Edifice"):
				while(spellsCast < target){
					Math.seedrandom(Game.seed + '/' + spellsCast);
					if(Math.random() < (1 - backfire)){
						var buildings = [];
						var max = 0;
						var n = 0;
						for (var i in Game.Objects)
						{
							if (Game.Objects[i].amount > max) max = Game.Objects[i].amount;
							if (Game.Objects[i].amount > 0) n++;
						}
						for (var i in Game.Objects){
							if ((Game.Objects[i].amount < max || n == 1) && Game.Objects[i].getPrice() <= Game.cookies * 2 && Game.Objects[i].amount < 400) 
								buildings.push(Game.Objects[i]);
						}
						
						if (buildings.length == 0){
							spellOutcome += '<span class="white">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;No buildings to improve!</span><br/>';
						}else{
							var building = choose(buildings);
							spellOutcome += '<span class="green">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + loc(building.name) + '</span><br/>';
						}
					}else{
						if (Game.BuildingsOwned == 0){
							spellOutcome += '<span class="white">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Backfired, but no buildings to destroy!</span><br/>';
						}else{
							var buildings = [];
							for (var i in Game.Objects){
								if (Game.Objects[i].amount > 0) 
									buildings.push(Game.Objects[i]);
							}
							var building=choose(buildings);
							spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + loc(building.name) + '</span><br/>';
						}
					}
					spellsCast += 1;
					Math.seedrandom();
				}
				break;
				
			case loc("Gambler's Fever Dream"):
				while(spellsCast < target){
					Math.seedrandom(Game.seed + '/' + spellsCast);
					
					var spells = [];
					var selfCost = M.getSpellCost(M.spells["gambler's fever dream"]);
					for (var i in M.spells){
						if (i != "gambler's fever dream" && (M.magic-selfCost) >= M.getSpellCost(M.spells[i]) * 0.5) 
							spells.push(M.spells[i]);
					}
					if (spells.length == 0){
						spellOutcome += '<span class="white">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;No eligible spells!</span><br/>';
					}else{
						var gfdSpell = choose(spells);
						var gfdBackfire = M.getFailChance(gfdSpell);
						
						if(FortuneCookie.detectKUGamblerPatch()) gfdBackfire *= 2;
						else gfdBackfire = Math.max(gfdBackfire, 0.5);
						
						Math.seedrandom(Game.seed + '/' + (spellsCast + 1));
						if(Math.random() < (1 - gfdBackfire)){
							spellOutcome += '<span class="green">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + gfdSpell.name;
							if(gfdSpell.name == loc("Force the Hand of Fate")) spellOutcome += ' (' + FortuneCookie.gamblerFateChecker(spellsCast + 1, idx, true) + ')';
							if(gfdSpell.name == loc("Spontaneous Edifice")) spellOutcome += ' (' + loc(FortuneCookie.gamblerEdificeChecker(spellsCast + 1, true)) + ')';
							spellOutcome += '</span><br/>';
						}else{
							spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + gfdSpell.name;
							if(gfdSpell.name == loc("Force the Hand of Fate")) spellOutcome += ' (' + FortuneCookie.gamblerFateChecker(spellsCast + 1, idx, false) + ')';
							if(gfdSpell.name == loc("Spontaneous Edifice")) spellOutcome += ' (' + loc(FortuneCookie.gamblerEdificeChecker(spellsCast + 1, false)) + ')';
							spellOutcome += '</span><br/>';
						}
					}
					
					spellsCast+=1;
					Math.seedrandom();
				}
				break;
				
			case loc("Conjure Baked Goods"):
				while(spellsCast < target){
					Math.seedrandom(Game.seed + '/' + spellsCast);
					if(Math.random() < (1 - backfire)){
						var val = Math.max(7, Math.min(Game.cookies * 0.15, Game.cookiesPs * 60 * 30));
						spellOutcome += '<span class="green">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + Beautify(val) + ' cookie' + (val == 1 ? '' : 's') + '</span><br/>';
					}else{
						var val = Math.min(Game.cookies * 0.15, Game.cookiesPs * 60 * 15) + 13;
						val = Math.min(Game.cookies, val);
						spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + Beautify(val) + ' cookie' + (val == 1 ? '' : 's') + '</span><br/>';
					}
					
					spellsCast += 1;
					Math.seedrandom();
				}
				break;
				
			default:
				while(spellsCast < target){
					Math.seedrandom(Game.seed + '/' + spellsCast);
					if(Math.random() < (1 - backfire))
						spellOutcome += '<span class="green">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Success</span><br/>';
					else
						spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Backfire</span><br/>';
					
					spellsCast += 1;
					Math.seedrandom();
				}
		}
		
		for(var i in CCSE.customSpellForecast) spellOutcome = CCSE.customSpellForecast[i](spellOutcome, spell);
		return spellOutcome;
	}

	FortuneCookie.detectKUGamblerPatch = function(){
		if(typeof KlattmoseUtilities == 'undefined') return false;
		if(typeof KlattmoseUtilities.config == 'undefined') return false;
		if(typeof KlattmoseUtilities.config.patches == 'undefined') return false;
		
		return KlattmoseUtilities.config.patches.gamblersFeverDreamFix == 1;
	}
	
	//if(CCSE.ConfirmGameVersion(FortuneCookie.name, FortuneCookie.version, FortuneCookie.GameVersion)) 
		Game.registerMod(FortuneCookie.name, FortuneCookie); // FortuneCookie.init();
}


if(!FortuneCookie.isLoaded){
	if(CCSE && CCSE.isLoaded){
		FortuneCookie.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(FortuneCookie.launch);
	}
}(() => {
  "use strict";
  !(function (e, t, r, a) {
    function n(e) {
      var t,
        r = e.length,
        n = this,
        o = 0,
        i = (n.i = n.j = 0),
        s = (n.S = []);
      for (r || (e = [r++]); a > o;) s[o] = o++;
      for (o = 0; a > o; o++)
        ((s[o] = s[(i = u & (i + e[o % r] + (t = s[o])))]), (s[i] = t));
      (n.g = function (e) {
        for (var t, r = 0, o = n.i, i = n.j, s = n.S; e--;)
          ((t = s[(o = u & (o + 1))]),
            (r = r * a + s[u & ((s[o] = s[(i = u & (i + t))]) + (s[i] = t))]));
        return ((n.i = o), (n.j = i), r);
      })(a);
    }
    function o(e, t) {
      var r,
        a = [],
        n = (typeof e)[0];
      if (t && "o" == n)
        for (r in e)
          try {
            a.push(o(e[r], t - 1));
          } catch (e) {}
      return a.length ? a : "s" == n ? e : e + "\0";
    }
    function i(e, t) {
      for (var r, a = e + "", n = 0; a.length > n;)
        t[u & n] = u & ((r ^= 19 * t[u & n]) + a.charCodeAt(n++));
      return d(t);
    }
    function s(r) {
      try {
        return (e.crypto.getRandomValues((r = new Uint8Array(a))), d(r));
      } catch (r) {
        return [+new Date(), e, e.navigator.plugins, e.screen, d(t)];
      }
    }
    function d(e) {
      return String.fromCharCode.apply(0, e);
    }
    var c = r.pow(a, 6),
      m = r.pow(2, 52),
      l = 2 * m,
      u = 255;
    ((r.seedrandom = function (e, u) {
      var f = [],
        h = i(o(u ? [e, d(t)] : 0 in arguments ? e : s(), 3), f),
        w = new n(f);
      return (
        i(d(w.S), t),
        (r.random = function () {
          for (var e = w.g(6), t = c, r = 0; m > e;)
            ((e = (e + r) * a), (t *= a), (r = w.g(1)));
          for (; e >= l;) ((e /= 2), (t /= 2), (r >>>= 1));
          return (e + r) / t;
        }),
        h
      );
    }),
      i(r.random(), t));
  })(window, [], Math, 256);
  const e = [
      [25, 825, 45, 325],
      [19, 819, 39, 219],
      [11, 811, 31, 221],
      [7, 807, 27, 217],
      [2, 812, 22, 302],
      [1, 801, 18, 201],
      [1, 801, 13, 201],
      [1, 801, 7, 301],
      [1, 801, 3, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],
      [1, 801, 1, 301],


    ],
    t = [7, 2],
    r = [0, 1, 4, 5],
    a = {
      init: () => {
        const a = l("grimoireContent"),
          n = document.createElement("div");
        ((n.id = "GFDSSBlock"),
          (n.style.marginTop = "10px"),
          (n.style.display = "flex"),
          (n.style.justifyContent = "center"),
          (n.style.gap = "5px"),
          (n.style.color = "rgba(255,255,255,0.75)"),
          (n.style.fontSize = "11px"),
          a?.appendChild(n),
          Game.registerHook("draw", () => {
            Game.drawT % 15 == 0 &&
              (() => {
                const a = l("GFDSSBlock");
                if (!a) return;
                const n = Game.Objects["Wizard tower"].minigame.spellsCastTotal;
                Math.seedrandom(Game.seed + "/" + n);
                const o = Math.random(),
                  i = ((e) => {
                    const t = Game.Objects["Wizard tower"].minigame.spells,
                      r = [];
                    for (var a in t)
                      "gambler's fever dream" != a && r.push(t[a]);
                    Math.seedrandom(Game.seed + "/" + e);
                    var n = choose(r);
                    return (
                      Math.seedrandom(Game.seed + "/" + (e + 1)),
                      { id: n.id, name: n.name, backfire: Math.random() >= 0.5 }
                    );
                  })(n),
                  s = ((a, n) => {
                    const o = Game.Objects["Wizard tower"].level,
                      i = e[o - 1];
                    if (t.includes(a.id)) return `cast with ${i[0]} towers`;
                    if (r.includes(a.id)) return `cast with ${i[1]} towers`;
                    if (8 === a.id)
                      return "cast GFD, immediatly ctrl+s and then reload the game";
                    if (3 === a.id) {
                      if (!a.backfire)
                        return `cast with ${i[0]} towers and fast rebuy towers to 400+`;
                      Math.seedrandom(Game.seed + "/" + n);
                      const e = Math.random();
                      if (e >= 0.375 && e < 0.42857)
                        return `cast with ${i[2]} towers`;
                      Math.seedrandom(Game.seed + "/" + (n + 1));
                      const t = Math.random();
                      return t >= 0.6 && t < 0.71428
                        ? `cast with ${i[0]} towers, fast buy to ${i[3]} towers, then cast again`
                        : t >= 0.71428 && t < 0.85714
                          ? `cast with ${i[0]} towers twice`
                          : "cast GFD, immediatly ctrl+s and then reload the game";
                    }
                    return "cast GFD, immediatly ctrl+s and then reload the game";
                  })(i, n);
                a.innerHTML = `| RS: ${o.toFixed(5)} | Next: <div class="${i.backfire ? "red" : "green"}">${i.name}</div>`;
              })();
          }));
      },
    };
  "undefined" != typeof Steam
    ? setTimeout(function () {
        Game.registerMod("GFDSSHelper", a);
      }, 2e3)
    : Game.registerMod("GFDSSHelper", a);
})();
