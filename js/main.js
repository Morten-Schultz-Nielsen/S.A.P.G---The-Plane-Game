//Setup game state
const Game = new State();
Game.canvas = document.getElementById("plane-canvas");
Game.drawOn = Game.canvas.getContext("2d");
Game.setup();
setInterval(() => { Game.update(); Game.draw(); }, 20);

//Event handlers
function KeyDown(event) {
    if (Game.keys[event.key.toString().toLowerCase()] !== true) {
        Game.keys[event.key.toString().toLowerCase()] = true;
        Game.update(0);
    }
}

function KeyUp(event) {
    if (Game.keys[event.key.toString().toLowerCase()] !== false) {
        Game.keys[event.key.toString().toLowerCase()] = false;
        Game.update(0);
    }
}

function MouseUp(event) {
    StoreMouseCoords(event.x, event.y);
    if (event.button === 0 && (Game.mouseState.leftClick === 1 || Game.mouseState.leftClick === 2)) {
        Game.mouseState.leftClick = 3;
        Game.update(0);
    } else if (event.button === 2 && (Game.mouseState.rightClick === 1 || Game.mouseState.rightClick === 2)) {
        Game.mouseState.rightClick = 3;
        Game.update(0);
    }
}

function MouseDown(event) {
    StoreMouseCoords(event.x, event.y);
    if (event.button === 0 && Game.mouseState.leftClick === 0) {
        Game.mouseState.leftClick = 1;
        Game.update(0);
    } else if (event.button === 2 && Game.mouseState.rightClick === 0) {
        Game.mouseState.rightClick = 1;
        Game.update(0);
    }
}

function MouseMove(event) {
    StoreMouseCoords(event.x, event.y);
}

function StoreMouseCoords(x, y) {
    //Converts mouse coords relative to the screen into mouse coords relative to the canvas
    let canvasRealSize = Game.canvas.getBoundingClientRect();
    Game.mouseState.x = Math.max(0, Math.min(Game.canvas.width - 1, Math.round((x - canvasRealSize.x) / canvasRealSize.width * Game.canvas.width)));
    Game.mouseState.y = Math.max(0, Math.min(Game.canvas.height - 1, Math.round((y - canvasRealSize.y) / canvasRealSize.height * Game.canvas.height)));
}