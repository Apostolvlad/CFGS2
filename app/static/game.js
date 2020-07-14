class GameObject{
    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.move = false;
        this.func = undefined;
    }

    checkMove(x, y){ 
        this.move = (this.x < x & x < this.x + this.w & this.y < y & y < this.y + this.h);
    }

    click(mode){
        if(this.move){
            if(this.func != undefined){
                return this.func(mode); // это позволит при необходимости задавать функцию объекту так, чтобы после можно было продолжить поиск объектов по которым тоже был произведён клик.
            }
            return true;
        }else{
            return false
        }
    }

    update(){
        
    }

    render(ctx){
        
    }
}

class Panel extends GameObject{
    constructor(x, y, w, h, rgba){
        super(x, y, w, h);
        this.rgba = rgba;
         //'rgba(200, 200, 200, 0.5)';
    }
    update(){
        
    }

    render(ctx){
        if(this.move){
            ctx.fillStyle = this.rgba;
            ctx.fillRect(this.x, this.y, this.w, this.h);
        }
    }
}

class Text extends GameObject{
    constructor(text, x, y, w){
        super(x, y, w, 0);
        this.text = text;
    }

    render(ctx){
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.font = "25px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(this.text, this.x, this.y, this.w);
    }
}

class ButtonImg extends GameObject{
    constructor(imagePath, x, y, w, h){
        super(x, y, w, h);
        this.image = new Image();
        this.image.src = imagePath;
    }

    render(ctx){
        ctx.drawImage(this.image, this.x, this.y);//, this.w, this.h);
    }
}

class ButtonPanel extends ButtonImg{
    constructor(imagePath, x, y, w, h){
        super(imagePath, x, y, w, h);
        this.render = this.checkRender(this.render);
    }

    checkRender(f){
        return function(){
            if(this.move == false){
                return f.apply(this, arguments);
            }
        }
       
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
    constructor(connect){
        this.connect = connect
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

class Menu extends Scene{ 
    constructor(connect){
        super(connect);

        this.offsetFriends = 0;

        this.addRender(new ButtonImg('static/picture/menu/menu.png', 0, 0), false);

        this.initPanelTop();
        this.initPanelCentry();
        this.initPanelBottom();

        this.initPanelScrollFriends();
        
    }

    initPanelTop(){
        
    }

    initPanelCentry(){
        //панель квест кнопок
        for(let y = 0; y < 3; y++){
            this.addRender(new ButtonPanel('static/picture/objects/frameCircle_80.png', 20, 110 + y * 90, 80, 80), true);
        }
        for(let y = 0; y < 3; y++){
            this.addRender(new ButtonPanel('static/picture/objects/frameCircleBox_80.png', 900, 110 + y * 90, 80, 80), true);
        }
    }

    initPanelBottom(){
        // отвечает за панель вкладок Арена, Герой и тд...
        this.addRender(new ButtonPanel('static/picture/menu/panel_button1.png', 8, 495, 300, 185), true);
        this.addRender(new ButtonPanel('static/picture/menu/panel_button2.png', 315, 495, 360, 180), true);
        this.addRender(new ButtonPanel('static/picture/menu/panel_button3.png', 678, 495, 320, 180), true);

        let color = 'rgba(200, 200, 200, 0.4)';
        this.addRender(new Panel(8, 495, 302, 51, color), true);
        this.addRender(new Panel(8, 554, 302, 51, color), true);
        this.addRender(new Panel(8, 614, 302, 51, color), true);

        this.addRender(new Panel(315, 495, 357, 51, color), true);
        this.addRender(new Panel(315, 554, 357, 51, color), true);
        this.addRender(new Panel(315, 614, 357, 51, color), true);

        this.addRender(new Panel(678, 495, 315, 51, color), true);
        this.addRender(new Panel(678, 554, 315, 51, color), true);
        this.addRender(new Panel(678, 614, 315, 51, color), true);
    }

    initPanelScrollFriends(){
        let maxFriends = 9;
        let x = 30;
        let w = 105;
        let obj1 = undefined;
        let obj2 = undefined;
        this.listFriendObjects = []; // список объектов для отображения друзей
        for(let i = 0; i < maxFriends; i++){
            this.addRender(new ButtonImg('static/picture/objects/frameCircleBox_100.png', x, 685), true);
            obj1 = this.addRender(new Text('', x + 50, 730, 90), true); // 
            obj2 = this.addRender(new Text('', x + 50, 770, 90), true); //this.listFriends.friendLevel
            this.listFriendObjects.push({name:obj1, level:obj2});
            x += w;
        }
        this.getListFriends();
        this.addRender(new ButtonPanel('static/picture/objects/nextLeft_70.png', 10, 700, 17, 103), true).func = (mode) => {this.getListFriends(-1);return true;}; 
        this.addRender(new ButtonPanel('static/picture/objects/nextRight_70.png', 975, 700, 17, 103), true).func = (mode) => {this.getListFriends(1);return true;}; 
    }

    getListFriends(mode = 0){
        //if(this.offsetFriends < 0);this.offsetFriends = 0;
        this.offsetFriends += 10 * mode
        this.connect.api('/api/friends?offset=' + this.offsetFriends, (response)=>{
            // получаем список друзей
            this.offsetFriends = response.offsetFriends; 
            let listFriends = response.listFriends; // /api/friends
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
    let w             = canvas.width  //= innerWidth;
    let h             = canvas.height //= innerHeight;
    let menu = undefined;
    let connect = undefined;
    let modeClick = 0;
    
    function Init(){
        connect = new Connect();
        menu = new Menu(connect);
        
        //window.onmousemove
        window.onmousemove = e => {
            mx = e.x - canvas.getBoundingClientRect().x;
            my = e.y - canvas.getBoundingClientRect().y;
            menu.checkMove(mx, my);
        }

        window.onmousedown = e => {
            mx = e.x - canvas.getBoundingClientRect().x;
            my = e.y - canvas.getBoundingClientRect().y;
            menu.checkMove(mx, my);
            modeClick = 1;
        }
    }

    function Loop(){
        
        ctx.clearRect(0, 0, w, h);
        Click();
        Update();
        Render(ctx);
        requestAnimationFrame(Loop);
    }

    function Update(){
        menu.update();
    }

    function Render(ctx){
        menu.render(ctx);
    }

    function Click(){
        if(modeClick != 0){
            menu.click(modeClick);
            modeClick = 0;
        }
    }

    Init();
    Loop();
}
start();