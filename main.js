//ф-я для генерации цельных чисел в диапазоне [min, max]
function randomInt(min, max) { 
	var rand = min - 0.5 + Math.random() * (max - min + 1)
	rand = Math.round(rand);
	return rand;
}

//Массив монстров
var arrEnemies = []; 
arrEnemies[0] = {
	name : "Койот",
	hp : 25,
	dmg : 1,
	exp : 3,
	loot : [
    {item: 'wolfleather', rare: 1},
    {item: 'meat', rare: 5}
    ]
}
arrEnemies[1] = {
	name : "Скорпион",
	hp : 35,
	dmg : 2,
	exp : 5,
	loot : [
    {item: 'radtail', rare: 1},
    {item: 'meat', rare: 5}
    ]
}
arrEnemies[2] = {
	name : "Геккон",
	hp : 30,
	dmg : 2,
	exp : 4,
	loot : [
    {item: 'gecleather', rare: 1},
    {item: 'meat', rare: 5}
    ]
}
arrEnemies[3] = {
	name : "Рейдер",
	hp : 50,
	dmg : 4,
	exp : 10,
	loot : [
    {item: 'gun10mm', rare: 8},
    {item: 'stimpack', rare: 20}
    ]
}
arrEnemies[4] = {
	name : "Лидер рейдеров",
	hp : 70,
	dmg : 6,
	exp : 30,
	loot : [
    {item: 'letherarmor', rare: 1},
    {item: 'gun10mm', rare: 8},
    {item: 'stimpack', rare: 20}
    ]
}


//Массив предметов
var arrItems = {};
arrItems.cap = {
	name: "Крышка",
	price: 1
}
arrItems.gun10mm = {
	name: "10мм пистолет",
	price: 100
}
arrItems.stimpack = {
	name: "Стимулятор",
	price: 50
}
arrItems.letherarmor = {
	name: "Кожаная Броня",
	price: 150
}
arrItems.meat = {
	name: "Мясо монстра",
	price: 10
}
arrItems.radtail = {
	name: "Хвост радскорпиона",
	price: 100
}
arrItems.gecleather = {
	name: "Шкура геккона",
	price: 100
}
arrItems.wolfleather = {
	name: "Шкура койота",
	price: 100
}




//Массив локаций
var arrLocations = []; 
arrLocations[0] = {
    name : "Руины",
    radiation: 0,
    items_ids : [0, 2],
    mob_ids: [3, 4]
}
arrLocations[1] = {
    name : "Одинокая скала",
    radiation: 0,
    items_ids : [0, 2],
    mob_ids: [0, 1, 2]
}

//Пустой объект для заполнение его активным монстром 
var enemyObject = new Object(); 

enemyObject["name"] = "Врагов нет";
enemyObject["hp"] = 0;
enemyObject["dmg"] = 0;
enemyObject["exp"] = 0;


function Player(name){ //Описание класса игрока
	this.name = name;
	this.lvl = 0;
	this.exp = 0;
	this.skill_points = 0;
	this.base_damage = 1;
	this.location = 0;
	inv.add("gun10mm", 1)

	//Ф-я начисления опыта и повышения уровня если достигнута нужная отметка
	this.give_exp = function(x){ 
		this.exp = this.exp + x;
		while (this.exp >= this.get_next_lvl_exp()) {
			this.lvlup();
		}
	}
	
	//Ф-я повышения уровня героя
	this.lvlup = function(){  
		this.base_damage++;
		this.skill_points++;
		this.exp = this.exp - this.get_next_lvl_exp();
		this.lvl = this.lvl + 1;
		status_update("<p>Теперь вы "+this.lvl+" уровня</p>");
	}
	
	//Подсчет необходимиого кол-ва опыта для поднятия уровня 
	this.get_next_lvl_exp = function(){ 
		return 10 * (this.lvl + 1);
	}
	this.travel = function(id){
		this.location = id;
		show_box('text_box', 'text_button');
		status_update('<p>Вы добрались до ['+arrLocations[id].name+']</p>');
	}

}

function Inv() {
	this.stuff = {};
	
	this.remove = function(item, count){
		if (this.stuff[item] >= count){
			this.stuff[item] -= count;
		} else {
		// you can't do this	
		}
	}
	
	this.add = function(item, count){
		if (item in this.stuff) {
			this.stuff[item] += count
		} else {
			this.stuff[item] = count
		}
	}

	this.show = function(){
		document.getElementById('status_box').innerHTML = '';
		for (var item in this.stuff) {
			document.getElementById('status_box').innerHTML += '<p>'+arrItems[item].name+" ("+this.stuff[item]+")</p>";
		}
	}
}

//Создание игрока
var inv = new Inv();
var player = new Player('whoever'); 


//флаг кулдауна на действие 
var hunt_cd=0; 
//Охота на зверей
function hunt() { 
	if (hunt_cd==0){
		player.give_exp(1);
		status_update("<p>Вы поймали "+randomInt(2, 4)+" ящерицы и получили 1XP</p>");
		hunt_cd = 1;
		//Активация кулдауна способности 
		setTimeout(function(){hunt_cd=0;}, 10000); 
	} else status_update("<p>Враговы устали!</p>");
}

//Пуьешествие в постоши, генерация событий 
function adventure(){	
	var id = arrLocations[player.location].mob_ids[randomInt(0, arrLocations[player.location].mob_ids.length-1)];
	change_enemy(id);
	status_update("</p>Вы встретили ["+enemyObject.name+"]</p>");
}

//Бой с монстром
function fight(){ 
	if(enemyObject.hp > 0){
		var damage = player.base_damage + randomInt(1, 6);
		enemyObject.hp -= damage;
		if (enemyObject.hp<=0) {
			enemyObject.hp=0;
			kill_current_enemy();
		} else {
			status_update("<p>Вы нанесли ["+enemyObject.name+"] "+damage+" урона</p>");
		}
	}
}

//Заполнения объекта монстра 
function change_enemy(id){ 
	if (id == -1) {
		enemyObject["name"] = "Врагов нет";
		enemyObject["hp"] = 0;
		enemyObject["dmg"] = 0;
		enemyObject["exp"] = 0;
		enemyObject["loot"] = 0;
	} else {
		enemyObject["name"] = arrEnemies[id].name;
		enemyObject["hp"] = arrEnemies[id].hp;
		enemyObject["dmg"] = arrEnemies[id].dmg;
		enemyObject["exp"] = arrEnemies[id].exp;
		enemyObject["loot"] = arrEnemies[id].loot;
	}
}

//Смерть монстра, выдача опыта и сброс объкта
function kill_current_enemy(){ 
	player.give_exp(enemyObject.exp);
	var rand_caps_amount = randomInt(1, 10);
	var rand_loot = loot(enemyObject.loot);
	inv.add("cap", rand_caps_amount);
	inv.add(rand_loot, 1);
	status_update("<p>Вы убили ["+enemyObject.name+"] и получили "+enemyObject.exp+" опыта, нашли "+rand_caps_amount+" [Крышка] и ["+arrItems[rand_loot].name+"]</p>");
	change_enemy(-1);      
	status_update();  
}

//Вывод text в лог сообщений, обновление всех показателей на панелях
function status_update(text) { 
	if (text!=undefined) {document.getElementById('text_box').innerHTML += text;}	
	document.getElementById('exp_bar').innerHTML = "Опыт: " + player.exp + " | " + player.get_next_lvl_exp();
	document.getElementById('health_bar_enemy').innerHTML = "Здоровье: "+enemyObject.hp;
	document.getElementById('enemy_name').innerHTML = "Имя: "+enemyObject.name;
	document.getElementById('text_box').scrollTop = 9999;
}


//Отображение элементов интерфейса 
function show_box(box, button) {
document.getElementById('text_button').src = "img/buttons/button_unactive.png";
document.getElementById('map_button').src = "img/buttons/button_unactive.png";
document.getElementById('status_button').src = "img/buttons/button_unactive.png";
document.getElementById('text_box').style = "visibility: hidden;"
document.getElementById('map_box').style = "visibility: hidden;"
document.getElementById('status_box').style = "visibility: hidden;"
document.getElementById('action_buttons').style = "visibility: hidden;"
document.getElementById(box).style = "visibility: visible;"
document.getElementById(button).src = "img/buttons/button_active.png";

	if (box == 'text_box') {document.getElementById('action_buttons').style = "visibility: visible;"}
}

//Очень страшная ф-я для обработки колесика мышки
var elem = document.getElementById('text_box');
if (elem.addEventListener) {
	if ('onwheel' in document) {
		// IE9+, FF17+, Ch31+
		elem.addEventListener("wheel", onWheel);
	} else if ('onmousewheel' in document) {
		// устаревший вариант события
		elem.addEventListener("mousewheel", onWheel);
	} else {
		// Firefox < 17
		elem.addEventListener("MozMousePixelScroll", onWheel);
	}
	} else { // IE8-
		elem.attachEvent("onmousewheel", onWheel);
	}

function onWheel(e) {
	e = e || window.event;
	var delta = e.deltaY || e.detail || e.wheelDelta;
	var info = document.getElementById('text_box');
	document.getElementById('text_box').scrollTop += delta*3;
	e.preventDefault ? e.preventDefault() : (e.returnValue = false);
}


function loot(lootlist){
	var weightsum = 0;
	for(var i = 0; i < lootlist.length; i++){
		weightsum += lootlist[i].rare;
	}
	rand = randomInt(1, weightsum);
	var i = 0;
	var tmp = 0;
	while(tmp < rand){
		tmp += lootlist[i].rare;
		i++;
		//console.log(tmp,' ', i);
	}
	console.log('dice=',rand,'loot=',lootlist[i-1]);
	return lootlist[i-1].item;

	/*var sums = [];
	for(var i = 0; i < list.length; i++){
		sums[i]=0;
		for (var j = 0; j <= i; j++) {
			sums[i]+=list[j].rare;
		}
	}
	for(var i = 0; i < sums.length; i++){
		if(sums[i]>=rand){
			console.log(list[i]);
			break;
		}
	}
	console.log(sums, rand);*/

}

