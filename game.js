var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 800;
document.body.appendChild(canvas);
 
//window.addEventListener("resize", Resize); //При изменении размеров окна будут меняться размеры холста
window.addEventListener("loud", main);
window.addEventListener("keydown", function (e) { KeyDown(e); }); //Получение нажатий с клавиатуры

var objects = []; //Массив игровых объектов
var roads = []; //Массив с фонами
 
var lastTime; //для контроля обновления кадров со скоростью 60 кадров в секунду.

function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0; // секунда Это достигается путём расчет времени с последнего обновления и выражения всех перемещений в пикселях в секунду. И движение становится следующим x += 50*dt, или 50 пикселей в секунду.
    //update(dt);
    render();

    lastTime = now;
    window.requestAnimationFrame(main);
};

function update() //Обновление игры
{
    draw();
}
 
function render() //Работа с графикой
{
    console.log('render...');
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Очистка холста от предыдущего кадра
    ctx.fillStyle = "rgb(100,100,100)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);  

}
 
function KeyDown(e)
{
    switch(e.keyCode)
    {
        case 37: //Влево
            break;
 
        case 39: //Вправо
            break;
 
        case 38: //Вверх
            break;
 
        case 40: //Вниз
            break;
 
        case 27: //Esc
            break;
    }
}
 
function Resize()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("load",function() {
	main();
});
