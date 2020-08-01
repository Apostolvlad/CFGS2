class GameObject{
    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.show = true;
        this.move = false;
        this.func = undefined;
        this.render = this.modeShow(this.render)
    }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// МОДИФИКАТОРЫ!!!!
// RENDER
    modeShow(f){return function(){if(this.show)return f.apply(this, arguments);}}
// UPDATE
// Данный модификатор позволяет задавать поведение при наведении на объект. self.update = this.modeUpdate(this.update)
    modeUpdate(f, moveShow){return function(){this.show = this.move == moveShow;return f.apply(this, arguments);}}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
    checkMove(x, y){this.move = (this.x < x & x < this.x + this.w & this.y < y & y < this.y + this.h);}

    click(mode){if(this.move&this.func != undefined)return this.func(mode);return false;}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
    update(){}

    render(ctx){}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
}
// Panel
// Этот объект представляет из себя панель одного цвета.
// Параметры:
// x, y, w, h - точки расположения панели;
// rgba - параметр цвета. 4 цифра это параметр прозрачности, в среднем 5 единиц ставиться. пример: 'rgb(0, 0, 0, 0)' 
// moveShow - этот параметр определяет поведение элемента, при наведении его на панель. Если FALSE, то выводит панель пока на неё не навели курсор. и наоборот.

class Panel extends GameObject{
    constructor(x, y, w, h, rgba, moveShow = false){ // задаем рендеринг от this.ifMove чтобы он либо рендерил при наведении либо нет
        super(x, y, w, h);
        this.rgba = rgba;
        this.update = this.modeUpdate(this.update, moveShow);
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    render(ctx){ctx.fillStyle = this.rgba;ctx.fillRect(this.x, this.y, this.w, this.h);}
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

// Picture
// Этот объект позволяет демонстрировать картинку.
// Параметры:
// imagePath - путь до картинки
// x, y, w, h - точки расположения панели;
// rgba - параметр цвета. 4 цифра это параметр прозрачности, в среднем 5 единиц ставиться. пример: 'rgb(0, 0, 0, 0)' 
// moveShow - этот параметр определяет поведение элемента, при наведении его на панель. Если FALSE, то выводит панель пока на неё не навели курсор. и наоборот.

class Picture extends GameObject{
    constructor(imagePath, x, y, w, h){ // задаем рендеринг от this.ifMove чтобы он либо рендерил при наведении либо нет
        super(x, y, w, h);
        this.image = new Image();
        this.image.src = imagePath;
    }

    render(ctx){ctx.drawImage(this.image, this.x, this.y);}
}

class GameText extends GameObject{
    constructor(text, x, y, w, fillStyle = 'rgb(0, 0, 0)', textAlign = "center", textBaseline = "hanging", font = "25px serif"){
        super(x, y, w, 0);
        this.text = text;
        this.fillStyle = fillStyle; 
        this.font = font; 
        this.textAlign = textAlign; 
        this.textBaseline = textBaseline;
        if(textAlign = "center"){
            this.xC = this.x + this.w / 2;
        }else{
            this.xC = this.x;
        }
        
    }

    render(ctx){
        ctx.fillStyle =  this.fillStyle;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        ctx.fillText(this.text, this.xC, this.y, this.w);
    }
}

// PanelPicture
// Этот объект позволяет демонстрировать картинку, и задавать поведение при наведении на неё.
// Параметры:
// imagePath - путь до картинки
// x, y, w, h - точки расположения панели;
// rgba - параметр цвета. 4 цифра это параметр прозрачности, в среднем 5 единиц ставиться. пример: 'rgb(0, 0, 0, 0)' 
// moveShow - этот параметр определяет поведение элемента, при наведении его на панель. Если FALSE, то выводит панель пока на неё не навели курсор. и наоборот.

class PanelPicture extends Picture{
    constructor(imagePath, x, y, w, h, moveShow = false){
        super(imagePath, x, y, w, h);
        this.update = this.modeUpdate(this.update, moveShow);
    }
}

class ProgressBar extends GameObject{
    constructor(x, y, w, h, rgba = 'rgb(0, 0, 0, 0)', font = "45px serif", fillStyle = 'rgb(0, 0, 0)', textAlign = "center", textBaseline = "hanging"){
        super(x, y, w, h);
        this.rgba = rgba;
        this.fillStyle = fillStyle;
        this.textAlign = textAlign;
        this.font = font;
        this.textBaseline = textBaseline;
        this.procent = 0;
        this.wP = this.w;
        this.xC = this.x + this.w / 2;
        this.step1 = w / 100;
        //this.render = this.modeRenderPanel(this.render)
    }

    modeRenderPanel(f){
        return function(){
            this.render2(arguments[0]);
            const result = f.apply(this, arguments);
            //console.log(arguments[0]);
            
            //console.log(arguments);
            //this.render2(arguments);
            return result;
        }
    }

    render2(ctx){
        console.log('render');
        ctx.fillStyle = this.rgba;//'rgb(0, 0, 0, 0)';//
        ctx.fillRect(this.x, this.y, this.wP, this.h);
    }

    render(ctx){
        ctx.fillStyle = this.rgba;
        ctx.fillRect(this.x, this.y, this.wP, this.h);
        ctx.fillStyle = this.fillStyle;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        ctx.fillText(this.text, this.xC, this.y + 5, this.w);
    }

    setProcent(min, max){
        this.procent = min / max * 100;
        if(this.procent < 0)this.procent = 0;
        if(min < 0)min = 0;
        this.wP = this.step1 * this.procent;
        this.text = min + "/" + max;
        this.xC = this.x + this.w / 2;
    }
}






class Connect{
    // https://blog.miguelgrinberg.com/post/writing-a-javascript-rest-client
    // https://good-code.ru/ajax-zapros/
    constructor(host = 'http://127.0.0.1:5000'){
        this.host = host; 
    }
    
    api(url, callback, method = "GET") {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                //console.log('responseText:' + xmlhttp.responseText);
                try {
                    var data = JSON.parse(xmlhttp.responseText);
                } catch(err) {
                    console.log(err.message + " in " + xmlhttp.responseText);
                    return;
                }
                callback(data);
            }
        };
        
        xmlhttp.open(method, url, true);
        switch(method){
            case "GET":

            break;
            case "POST":
                request.setRequestHeader("content-type", "application/json");
                request.setRequestHeader("accepts", "application/json");
            break;

            default:
                alert( "Нет таких значений" );
        }
        xmlhttp.send();
    }

}

class Scene{
    constructor(parent){
        this.then = parent;
        this.connect = parent.connect;
        this.objectRender = []; // объекты которые надо рисовать.
        this.objectMove = []; // объекты изменяющиеся при наведении мыши, кликах...
    }

    addRender(obj, move = false){
        this.objectRender.push(obj);
        if(move){
            this.objectMove.push(obj);
        }
        return obj;
    }

    update(){
        this.objectRender.forEach(element=>{element.update()});
    }

    render(ctx){
        this.objectRender.forEach(element=>{element.render(ctx)});
    }

    checkMove(x, y){
        this.objectMove.forEach(element=>{element.checkMove(x, y)});
    }

    click(mode){
        this.objectMove.forEach(element=>{if(element.click(mode));return;});
    }

}
class RoomHouse extends Scene{
    constructor(parent){
        super(parent);
        this.addRender(new Panel(0, 0, this.then.w, this.then.h, 'rgba(150, 150, 150, 0.4)'), false);
        this.addRender(new Picture('static/picture/roomHouse/roomHouse.png', 0, 85), false);

        this.addRender(new PanelPicture('static/picture/objects/close_33.png', 954, 95, 33, 33, true), true).func = (mode) => {this.then.setScena(1);return true;};
    }
}

class RoomEnemies extends Scene{
    constructor(parent){
        super(parent);
        this.addRender(new Panel(0, 0, this.then.w, this.then.h, 'rgba(150, 150, 150, 0.4)'), false);
        this.addRender(new Picture('static/picture/roomArena/roomEnemies.png', 50, 150), false);
        this.addRender(new PanelPicture('static/picture/objects/close_33.png', 894, 170, 33, 33, true), true).func = (mode) => {this.then.setScena(1);return true;};
        this.initPanelEnemies();
    }

    // 'rgba(238, 147, 116, 0.4)'; то шо нужно красное
    // 'rgba(200, 200, 200, 0.4)'; серый
    // 'rgba(0, 154, 99, 0.5)'; зелёный 
    initPanelEnemies(){
        let color = 'rgba(238, 147, 116, 0.5)'; 
        this.addRender(new Panel(93, 478, 193, 34, color, true), true).func = (mode) => {this.startBattle(0);return true;};//.func = (mode) => {this.then.setScena(1, this.then.roomEnemies);return true;};
        this.addRender(new Panel(300, 478, 193, 34, color, true), true).func = (mode) => {this.startBattle(1);return true;};
        this.addRender(new Panel(507, 478, 193, 34, color, true), true).func = (mode) => {this.startBattle(2);return true;};
        this.addRender(new Panel(714, 478, 193, 34, color, true), true).func = (mode) => {this.startBattle(3);return true;};
    }

    startBattle(modeEnemies){
        let z = '/api/battle/create?mode=' + modeEnemies;
        this.then.setScena(0, this.then.roomBattle);
        this.then.setScena(1);
        this.connect.api(z, (response)=>{
            this.then.roomBattle.init(response)
        });
    }

}

class RoomBattle extends Scene{
    constructor(parent){
        super(parent);

        this.hero = {
            progressBarHealth:undefined,
            progressBarEnergy:undefined,
        }

        this.enemeis = {
            progressBarHealth:undefined,
            progressBarEnergy:undefined,
        }

        this.addRender(new Picture('static/picture/roomArena/roomBattle.png', 0, 0), false);

        this.initPanelBars();

        this.initPanelSkills();

    }

    init(response = undefined){
        if(response !=undefined){
            this.hero.progressBarHealth.setProcent(response.info.hero.health, response.info.hero.maxHealth);
            this.hero.progressBarEnergy.setProcent(100, 100);
            this.enemeis.progressBarHealth.setProcent(response.info.enemies.health, response.info.enemies.maxHealth);
            this.enemeis.progressBarEnergy.setProcent(100, 100);
        }else{

        }
        if(response.status){
            this.then.roomMenu.Init();
            this.then.setScena(0, this.then.roomMenu);
            return false;
        }
        return true;
    }

    initPanelSkills(){
        let color = 'rgba(200, 200, 200, 0.5)'; 
        for(let i = 0; i < 10; i++){
            let q = i;
            this.addRender(new Picture('static/picture/objects/frameBox_100.png', 23 + i * 95, 440, 100, 100), false);
            this.addRender(new Panel(28 + i * 95, 445, 90, 90, color, true), true).func = (mode, id = q) => {this.userSkills(id);return true;};//.func = (mode) => {this.startBattle(3);return true;};
        }

        for(let i = 0; i < 10; i++){
            this.addRender(new Picture('static/picture/objects/frameBox_50.png', 263 + i * 47, 555, 50, 50), false);
            this.addRender(new Panel(265 + i * 47, 558, 45, 45, color, true), true);//.func = (mode) => {this.startBattle(3);return true;};
        }
        this.addRender(new PanelPicture('static/picture/objects/nextLeft_50.png', 245, 555, 17, 50), true).func = (mode) => {return true;}; 
        this.addRender(new PanelPicture('static/picture/objects/nextRight_50.png', 738, 555, 17, 50), true).func = (mode) => {return true;}; 
        
        this.addRender(new Panel(14, 559, 225, 40, 'rgba(255, 36, 0, 0.4)', true), true).func = (mode) => {this.connect.api('/api/battle/quit', (response)=>{});this.then.setScena(0, this.then.roomMenu);return true;};
        this.addRender(new Panel(762, 559, 225, 40, 'rgba(0, 154, 99, 0.5)', true), true).func = (mode) => {this.connect.api('/api/battle/quit', (response)=>{});this.then.setScena(0, this.then.roomMenu);return true;};
    }

    initPanelBars(){
        let colorProgressBar2 = 'rgba(255, 207, 64, 0.4)';
        let colorProgressBar1 = 'rgba(255, 36, 0, 0.4)'; 
        this.hero.progressBarHealth = this.addRender(new ProgressBar(8, 6, 337, 46, colorProgressBar1, "40px serif"), false);
        this.hero.progressBarEnergy = this.addRender(new ProgressBar(8, 52, 337, 32, colorProgressBar2, "25px serif"), false);

        this.enemeis.progressBarHealth = this.addRender(new ProgressBar(656, 6, 338, 46, colorProgressBar1, "40px serif"), false);
        this.enemeis.progressBarEnergy = this.addRender(new ProgressBar(656, 52, 338, 32, colorProgressBar2, "25px serif"), false);
        
        //this.enemeis.progressBarHealth = this.addRender(new ProgressBar(630, 45, 365, 37, colorProgressBar), false);
        //this.enemeis.progressBarEnergy = this.addRender(new ProgressBar(8, 45, 365, 37, colorProgressBar), false);
    }

    userSkills(id){
        this.connect.api('/api/battle/get?skills=' + id, (response)=>{
            if(this.init(response[0])){ // первый ход
                if (this.init(response[1])){// второй ход
                    
                }else{
                    console.log('Поражение');
                }
            }else{
                console.log('Победа');
            }
            
        });// + mode
    }
}

class RoomSkills extends Scene{
    constructor(parent){
        super(parent);
        //perPointsFree,intPoints,strPoints,staPoints,agiPoints,lucPoints
        this.listParamsHero = {
            'perPointsFree':['Свободные очки', undefined],
            'intPoints':['Интеллект', undefined],
            'strPoints':['Сила', undefined],
            'staPoints':['Выносливость', undefined],
            'agiPoints':['Ловкость', undefined],
            'lucPoints':['Удача', undefined],
            'energyPoints':['Энергия', undefined],
        };

        this.addRender(new Panel(0, 0, this.then.w, this.then.h, 'rgba(150, 150, 150, 0.4)'), false);
        this.addRender(new Picture('static/picture/roomSkills/roomSkills.png', 0, 85), false);

        this.addRender(new PanelPicture('static/picture/objects/close_33.png', 954, 95, 33, 33, true), true).func = (mode) => {this.then.setScena(1);return true;};

        this.initPanelSkills();
        this.getInfoSkills();
    }

    initPanelSkills(){
        let x = 490;
        let y = 191;
        let mode = 1;
        let obj1 = undefined;
        for(var element in this.listParamsHero){
            if(mode){
                mode = 0;
                this.addRender(new PanelPicture('static/picture/objects/reset_33.png', 525, y, 33, 33, true), true).func = (mode) => {this.getInfoSkills(true);return true;};
            }else{
                let q = element;
                this.addRender(new PanelPicture('static/picture/objects/plus_33.png', 526, y, 33, 33, true), true).func = (mode, t = q) => {this.setSkills(t, 1);return true;};
            };
            obj1 = this.addRender(new GameText('', x, y + 8, 150, 'rgb(0, 0, 0)', "left"), true); // 
            obj1.text = element + ' = 1';
            this.listParamsHero[element][1] = obj1;
            y += 43;
        };
    }
    
    setSkills(param, count){
        this.connect.api('/api/skillpoint?name='+ param + '&count=' + count, (response)=>{
            this.listParamsHero[param][1].text = this.listParamsHero[param][0] + '=' + response[param];
            this.listParamsHero['perPointsFree'][1].text = this.listParamsHero['perPointsFree'][0] + '=' + response['perPointsFree'];
        });
    }

    getInfoSkills(button = false){
        let z = '/api/hero?params=perPointsFree,intPoints,strPoints,staPoints,agiPoints,lucPoints,energyPoints'
        if(button){z +='&command=resetPoints';};
        this.connect.api(z, (response)=>{
            for(var element in this.listParamsHero){
                this.listParamsHero[element][1].text = this.listParamsHero[element][0] + '=' + response[element];
            };
        });
    }
}
class RoomMenu extends Scene{ 
    constructor(parent){
        super(parent);

        this.offsetFriends = 0;

        this.addRender(new Picture('static/picture/roomMenu/roomMenu.png', 0, 0), false);

        this.initPanelTop();
        this.initPanelCentry();
        this.initPanelBottom();

        this.initPanelScrollFriends();
        
    }
    
    Init(){
        this.getInfoHero();
    }

    initPanelTop(){
        let colorProgressBar = 'rgba(0, 0, 0, 0.4)';
        this.progressBarEnergy = this.addRender(new ProgressBar(8, 45, 365, 37, colorProgressBar), false);
        this.progressBarExp = this.addRender(new ProgressBar(630, 45, 365, 37, colorProgressBar), false);

        this.textUsername = this.addRender(new GameText('', 370, 40, 250), false);

        this.textLevel = this.addRender(new GameText('', 630, 15, 365), false);
        this.textBalanc = this.addRender(new GameText('', 8, 15, 365), false);
        
        this.getInfoHero();

    }

    initPanelCentry(){
        //панель квест кнопок
        for(let y = 0; y < 3; y++){
            this.addRender(new PanelPicture('static/picture/objects/frameCircle_80.png', 20, 110 + y * 90, 80, 80), true);
        }
        for(let y = 0; y < 3; y++){
            this.addRender(new PanelPicture('static/picture/objects/frameCircleBox_80.png', 900, 110 + y * 90, 80, 80), true);
        }
    }

    initPanelBottom(){
        // отвечает за панель вкладок Арена, Герой и тд...
        this.addRender(new PanelPicture('static/picture/roomMenu/panel_button1.png', 8, 495, 300, 185), true);
        this.addRender(new PanelPicture('static/picture/roomMenu/panel_button2.png', 315, 495, 360, 180), true);
        this.addRender(new PanelPicture('static/picture/roomMenu/panel_button3.png', 678, 495, 320, 180), true);

        let color = 'rgba(200, 200, 200, 0.4)';
        this.addRender(new Panel(8, 495, 302, 51, color, true), true).func = (mode) => {this.then.setScena(1, this.then.roomEnemies);return true;};
        this.addRender(new Panel(8, 554, 302, 51, color, true), true);
        this.addRender(new Panel(8, 614, 302, 51, color, true), true);

        this.addRender(new Panel(315, 495, 357, 51, color, true), true).func = (mode) => {this.then.setScena(1, this.then.roomSkills);return true;};
        this.addRender(new Panel(315, 554, 357, 51, color, true), true).func = (mode) => {this.then.setScena(1, this.then.roomHouse);return true;};
        this.addRender(new Panel(315, 614, 357, 51, color, true), true);
        
        this.addRender(new Panel(678, 495, 315, 51, color, true), true);
        this.addRender(new Panel(678, 554, 315, 51, color, true), true);
        this.addRender(new Panel(678, 614, 315, 51, color, true), true);
    }

    initPanelScrollFriends(){
        let maxFriends = 9;
        let x = 30;
        let w = 105;
        let obj1 = undefined;
        let obj2 = undefined;
        this.listFriendObjects = []; // список объектов для отображения друзей
        for(let i = 0; i < maxFriends; i++){
            this.addRender(new Picture('static/picture/objects/frameCircleBox_100.png', x, 685), true);
            obj1 = this.addRender(new GameText('', x, 710, 100), true); // 
            obj2 = this.addRender(new GameText('', x, 750, 100), true); //this.listFriends.friendLevel
            this.listFriendObjects.push({name:obj1, level:obj2});
            x += w;
        }
        this.getListFriends();
        this.addRender(new PanelPicture('static/picture/objects/nextLeft_70.png', 10, 700, 17, 103), true).func = (mode) => {this.getListFriends(-1);return true;}; 
        this.addRender(new PanelPicture('static/picture/objects/nextRight_70.png', 975, 700, 17, 103), true).func = (mode) => {this.getListFriends(1);return true;}; 
    }

    getInfoHero(){
        this.connect.api('/api/hero?params=username,level,exp,expNextLevel,energy,energyMax,currencyGold,currencySilver', (response)=>{
            this.progressBarEnergy.setProcent(response.energy, response.energyMax);
            this.progressBarExp.setProcent(response.exp, response.expNextLevel);
            this.textUsername.text = response.username; 
            this.textLevel.text    = response.level;
            this.textBalanc.text   = response.currencyGold + ' Gold  ' + response.currencySilver + ' Silver';
        });
    }

    getListFriends(mode = 0){
        //if(this.offsetFriends < 0);this.offsetFriends = 0;
        this.offsetFriends += 10 * mode
        this.connect.api('/api/friends?offset=' + this.offsetFriends, (response)=>{
            // получаем список друзей
            this.offsetFriends = response.offsetFriends;
            let listFriends    = response.listFriends;    // /api/friends
            for(let i = 0; i < this.listFriendObjects.length; i++){
                if(listFriends.length > i){
                    this.listFriendObjects[i].name.text = listFriends[i].name;
                    this.listFriendObjects[i].level.text = listFriends[i].level;
                }else{
                    this.listFriendObjects[i].name.text = '';
                    this.listFriendObjects[i].level.text = '';
                }
            };
        });
    }


}


function start(){

    const canvas      = document.getElementById('Game'); //document.createElement('canvas');//document.querySelector('body').appendChild(canvas);
    const ctx         = canvas.getContext('2d');
    this.w             = canvas.width  //= innerWidth;
    this.h             = canvas.height //= innerHeight;
    this.roomMenu = undefined;
    this.connect = undefined;
    this.modeClick = 0;
    this.mx, this.my = 0;

    this.objectI = 1;
    this.objects = [undefined, undefined, undefined, undefined, undefined];
    
    this.setScena = function(index, obj = undefined){
        this.objects[index] = obj;
    }

    function checkObjects(){
        this.objectI = 0;
        this.objects.forEach(element=>{if(element != undefined){this.objectI += 1;}});
    }

    function Init(){
        connect = new Connect();
        
        
        roomMenu = new RoomMenu(this);

        roomEnemies = new RoomEnemies(this);
        roomBattle = new RoomBattle(this);

        roomSkills = new RoomSkills(this);

        roomHouse = new RoomHouse(this);
        
        




        this.objects[0] = roomMenu;//roomMenu; roomBattle
        //this.setShow(this.roomMenu);
        
        //window.onmousemove
        window.onmousemove = e => {
            this.mx = e.x - canvas.getBoundingClientRect().x;
            this.my = e.y - canvas.getBoundingClientRect().y;
            
        }

        window.onmousedown = e => {
            mx = e.x - canvas.getBoundingClientRect().x;
            my = e.y - canvas.getBoundingClientRect().y;
            modeClick = 1;
        }
    }

    //let previous = Date.now();
    //let lag = 0.0;
    //let MS_PER_UPDATE = 60;
    function Loop(){
        //let current = Date.now();
        //let elapsed = current - previous;
        //previous = current;
        //lag += elapsed;
        ProcessInput();
        checkObjects();
        Update();
        //while (lag >= MS_PER_UPDATE) {
        //    Update();
            //console.log('update');
        //    lag -= MS_PER_UPDATE;
        //}
        Render(ctx);
        //console.log('render', i);
        requestAnimationFrame(Loop);
    }

    function Update(){
        for(let i = 0; i < this.objectI; i++){this.objects[i].update();}
    }

    function Render(ctx){
        ctx.clearRect(0, 0, this.w, this.h);
        for(let i = 0; i < this.objectI; i++){this.objects[i].render(ctx);}
    }

    function ProcessInput(){
        this.objects[this.objectI - 1].checkMove(this.mx, this.my);
        if(modeClick != 0){
            //for(let i = this.objectI - 1;-1 < i; i--){console.log(i);this.objects[i].click(modeClick)}
            this.objects[this.objectI - 1].click(modeClick);
            modeClick = 0;
        }
    }

    Init();
    Loop();
}
start();