class Scene{
    constructor(){
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
        this.objectMove.forEach(element=>{if(element.click(mode));break;});
    }

}
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

class ListFriends{
    constructor(index_max){
        this.min = 0; // начало отсчета
        this.index_list = this.min; // текущий отсчет
        this.index_max = index_max;
        this.get_list_friends = [
            {name:'Vlad', level:'999'},
            {name:'Patrik', level:'555'},
            {name:'Nagibator666', level:'442'},
            {name:'Slava_Ukraine', level:'234'},
            {name:'Ryblu_BABLO', level:'222'},
            {name:'LOOOL', level:'123'},
            {name:'Stepan', level:'89'},
            {name:'Student', level:'55'},
            {name:'EASY_WINNER', level:'45'},
            {name:'TOP666', level:'33'},
            {name:'Vlad123', level:'999'},
            {name:'324', level:'555'},
            {name:'534', level:'442'},
            {name:'wer', level:'234'},
            {name:'tyt', level:'222'},
            {name:'qqwe', level:'123'},
            {name:'tttrr', level:'89'},
            {name:'werdd', level:'55'},
            {name:'tyu', level:'45'},
            {name:'reww', level:'33'}];    
    }

    name(){
        if(this.index_list > this.get_list_friends.length - 1){return '';}
        return this.get_list_friends[this.index_list].name;
    }

    level(){
        let old = this.index_list;
        this.index_list += 1;
        if(this.index_list > this.min + this.index_max){this.index_list = this.min;}
        if(this.index_list > this.get_list_friends.length){return '';}
        return this.get_list_friends[old].level;
    }

    left(){
        this.min -= this.index_max;
        if(this.min < 0){
            let n = this.get_list_friends.length % this.index_max;
            if(n == 0){n = this.index_max;}
            this.min = this.get_list_friends.length - n;
        }
        this.index_list = this.min;
    } 

    right(){
        this.min += this.index_max;
        if(this.min > this.get_list_friends.length - 1){this.min = 0;}
        this.index_list = this.min;
    }
}

class Menu extends Scene{ 
    constructor(){
        super();
        this.listFriends = new ListFriends(9);
        this.listFriendObjects = [];
        this.addRender(new ButtonImg('static/picture/menu/menu.png', 0, 0), false);

        this.getQuestButton();
        this.getPanelButton();
        this.getScrollPanelFriends();
        
    }

    getQuestButton(){
        //панель квест кнопок
        for(let y = 0; y < 3; y++){
            this.addRender(new ButtonPanel('static/picture/objects/frameCircle_80.png', 20, 110 + y * 90, 80, 80), true);
        }
        for(let y = 0; y < 3; y++){
            this.addRender(new ButtonPanel('static/picture/objects/frameCircleBox_80.png', 900, 110 + y * 90, 80, 80), true);
        }
        

    }

    getPanelButton(){
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

    getScrollPanelFriends(){
        let obj1 = undefined;
        let obj2 = undefined;
        let x = 30;
        let w = 105;
        for(let i = 0; i < 9; i++){
            this.addRender(new ButtonImg('static/picture/objects/frameCircleBox_100.png', x, 685), true);
            obj1 = this.addRender(new Text('', x + 50, 730, 90), true); // 
            obj2 = this.addRender(new Text('', x + 50, 770, 90), true); //this.listFriends.friendLevel
            this.listFriendObjects.push({name:obj1, level:obj2});
            x += w;
        }
        this.reListFriends();
        this.addRender(new ButtonPanel('static/picture/objects/nextLeft_70.png', 10, 700, 17, 103), true).func = (mode) => {this.left(); return true;}; 
        this.addRender(new ButtonPanel('static/picture/objects/nextRight_70.png', 974, 700, 17, 103), true).func = (mode) => {this.right(); return true;}; 
    }

    reListFriends(){
        this.listFriendObjects.forEach(element=>{
            element.name.text = this.listFriends.name();
            element.level.text = this.listFriends.level();
        });
    }

    left(mode){
        this.listFriends.left()
        this.reListFriends();
        return true;
    }

    right(mode){
        this.listFriends.right()
        this.reListFriends();
        return true;
    }
}


function start(){

    const canvas      = document.getElementById('Game'); //document.createElement('canvas');//document.querySelector('body').appendChild(canvas);
    const ctx         = canvas.getContext('2d');
    let w             = canvas.width  //= innerWidth;
    let h             = canvas.height //= innerHeight;
    let menu = undefined;
    let modeClick = 0;
    
    function Init(){
        menu = new Menu();
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