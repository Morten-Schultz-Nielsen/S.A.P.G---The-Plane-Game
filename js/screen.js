class Button {
    constructor(x, y, width, height, rawColor, text, clickEvent) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.setColor(rawColor);
        this.text = text;
        this.clickEvent = clickEvent;
        this.hovered = false;
    }

    setColor(rawColor) {
        this.rawColor = rawColor;
        this.rawHoverColor = Game.colorLight(rawColor, 1.6);
    }

    update(xOffset, canClick) {
        //Check if button is hovered over
        if (this.x + xOffset <= Game.mouseState.x && this.x + xOffset + this.width >= Game.mouseState.x && this.y <= Game.mouseState.y && this.y + this.height >= Game.mouseState.y) {
            this.hovered = true;
            //Check if left mouse button is down
            if (Game.mouseState.leftClick === 1 && canClick) {
                this.clickEvent();
            }
        } else {
            this.hovered = false;
        }
    }

    draw(xOffset) {
        //Get correct color
        let useColor = this.rawColor;
        if (this.hovered) {
            useColor = this.rawHoverColor;
        }

        //Draw base button
        Game.drawOn.beginPath();
        Game.drawOn.textAlign = "center";
        Game.drawOn.textBaseline = "middle";
        Game.drawOn.font = "50px Verdana";
        Game.drawOn.fillStyle = Game.colorStringify(useColor);
        Game.drawOn.strokeStyle = "#000";
        Game.drawOn.lineWidth = 4;
        Game.drawOn.rect(this.x + xOffset, this.y, this.width, this.height, Game.colorStringify(useColor));
        Game.drawOn.fill();
        Game.drawOn.stroke();
        Game.drawOn.fillStyle = "#000";
        Game.drawOn.fillText(this.text, this.x + xOffset + this.width / 2, this.y + this.height / 2);
    }
}

class BaseScreen {
    constructor() {
        this.buttons = [];
        this.buttonOffset = 0;
    }

    startUpdate(time) {
        //Update screen things
        let canClick = this.buttonOffset === 0;
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i] !== null) {
                this.buttons[i].update(this.buttonOffset, canClick);
            }
        }
        this.update(time);
    }

    Update(time) {
        //Extra updates
    }

    startDraw() {
        //Draw screen things
        this.draw();
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i] !== null) {
                this.buttons[i].draw(this.buttonOffset);
            }
        }
    }

    draw() {
        //Extra drawings
    }
}

class MainMenu extends BaseScreen {
    constructor() {
        super();
        this.terrain = null;
        this.buttons = [
            new Button(390, 400, 500, 120, [0, 150, 50], "Start Game", () => {  }),
            new Button(390, 540, 500, 120, [150, 150, 50], "Players", () => { Game.changeScreen(new PlayerScreen(0), true); })
        ];
    }

    setTerrain(terrain) {
        this.terrain = terrain;
        this.buttons[0].clickEvent = () => { Game.screen = new GameScreen(terrain); }
    }

    update(time) {

    }

    draw() {
        if (this.terrain !== null) {
            this.terrain.draw();
        }

        Game.drawOn.beginPath();
        Game.drawOn.fillStyle = "#888";
        Game.drawOn.lineWidth = 4;
        Game.drawOn.strokeStyle = "#333";
        Game.drawOn.rect(150 + this.buttonOffset, 20, 980, 100);
        Game.drawOn.fill();
        Game.drawOn.stroke();

        Game.drawOn.textAlign = "Center";
        Game.drawOn.textBaseline = "Middle";
        Game.drawOn.font = "50px Verdana";
        Game.drawOn.fillStyle = "#000";
        Game.drawOn.fillText("Super Awesome Plane Game", 640 + this.buttonOffset, 70);
    }
}

class PlayerScreen extends BaseScreen {
    constructor(playerNumber) {
        super();
        this.movingSlider = false;

        //get right player ID
        this.playerID = playerNumber;
        if (this.playerID < 0) {
            this.playerID = Game.players.length - 1;
        } else if (this.playerID > Game.players.length - 1) {
            this.playerID = 0;
        }

        this.terrain = null;
        this.startControlChange(-1, -1);

        //Color line
        let length = 800;
        this.colorLine = Game.drawOn.createImageData(length, 30);
        for (let i = 0; i < length; i++) {
            let color = Game.colorFromHue(i / length);
            for (let j = 0; j < 30; j++) {
                this.colorLine.data[i * 4 + j * length * 4] = color[0];
                this.colorLine.data[i * 4 + j * length * 4 + 1] = color[1];
                this.colorLine.data[i * 4 + j * length * 4 + 2] = color[2];
                this.colorLine.data[i * 4 + j * length * 4 + 3] = 255;
            }
        }

        this.removedHue = -1;
    }

    startControlChange(buttonIndex, controlIndex) {
        this.buttonIndex = buttonIndex;
        this.changingControlID = controlIndex;
        this.buttons = [
            new Button(440, 560, 400, 120, [150, 50, 50], "Back", () => { Game.changeScreen(new MainMenu(), false); }),
            new Button(25, 150, 100, 200, [150, 150, 150], "<", () => { Game.changeScreen(new PlayerScreen(this.playerID - 1), false); }),
            new Button(1155, 150, 100, 200, [150, 150, 150], ">", () => { Game.changeScreen(new PlayerScreen(this.playerID + 1), true); }),
            new Button(400, 150, 80, 80, [150, 150, 50], this.controlLetter(Game.players[this.playerID].controls[0]), () => { this.startControlChange(3, 0); }),
            new Button(300, 250, 80, 80, [150, 150, 50], this.controlLetter(Game.players[this.playerID].controls[1]), () => { this.startControlChange(4, 1); }),
            new Button(400, 250, 80, 80, [150, 150, 50], this.controlLetter(Game.players[this.playerID].controls[2]), () => { this.startControlChange(5, 2); }),
            new Button(500, 250, 80, 80, [150, 150, 50], this.controlLetter(Game.players[this.playerID].controls[3]), () => { this.startControlChange(6, 3); }),
            new Button(700, 250, 280, 80, [150, 150, 50], this.controlLetter(Game.players[this.playerID].controls[4]), () => { this.startControlChange(7, 4); }),
            new Button(910, 560, 220, 120, [50, 150, 50], "Add", () => {
                Game.players.push({ controls: ["w", "a", "s", "d", " "], colorHue: Math.random() });
                Game.changeScreen(new PlayerScreen(Game.players.length - 1), true);
            }),
            new Button(150, 560, 220, 120, [50, 150, 50], "Remove", () => {
                this.removedHue = Game.players[this.playerID].colorHue;
                Game.players.splice(this.playerID, 1);
                Game.changeScreen(new PlayerScreen(this.playerID - 1), false);
            })
        ];
        if (Game.players.length === 1) {
            this.buttons.splice(9, 1);
        }
        if (Game.players.length === 10) {
            this.buttons.splice(8, 1);
        }
        if (this.buttonIndex !== -1) {
            this.buttons[buttonIndex].setColor([230, 230, 100]);
        }
    }

    controlLetter(control) {
        switch (control) {
            case "arrowup":
                return "^";
            case "arrowdown":
                return "V";
            case "arrowleft":
                return "<";
            case "arrowright":
                return ">";
            case " ":
                return "[s]";
            case "tab":
                return "[t]";
            case "capslock":
                return "CL";
            case "shift":
                return "[^]";
            case "control":
                return "{c}";
            case "meta":
                return "[m]";
            case "alt":
                return "[a]";
            case "contextmenu":
                return "{m}";
            case "enter":
                return "[e]";
            case "backspace":
                return "[<]";
            case "escape":
                return "{e}";
            case "numlock":
                return "NL";
            case "insert":
                return "[i]";
            case "home":
                return "[h]";
            case "pageup":
                return "^^";
            case "delete":
                return "[d]";
            case "end":
                return "[e]";
            case "pagedown":
                return "VV";
            case "scrolllock":
                return "SL";
            case "pause":
                return "[p]";

            default:
                return control;
        }
    }

    update(time) {
        let hue = this.removedHue;
        if (hue === -1) {
            hue = Game.players[this.playerID].colorHue;
        }

        if (this.movingSlider) {
            Game.players[this.playerID].colorHue = Math.max(0, Math.min(1,(Game.mouseState.x - 240) / 800));
        }

        let sliderHandleXOffset = 230 + this.buttonOffset + hue * 800;
        if (Game.mouseState.leftClick) {
            if (Game.mouseState.x >= sliderHandleXOffset && Game.mouseState.y >= 390 && Game.mouseState.x <= sliderHandleXOffset + 50 && Game.mouseState.y <= 440) {
                this.movingSlider = true;
            }
        } else {
            this.movingSlider = false;
        }

        if (this.buttonIndex !== -1) {
            for (let key in Game.keys) {
                if (Game.keys[key] === true) {
                    Game.players[this.playerID].controls[this.changingControlID] = key;
                    this.startControlChange(-1, -1);
                    break;
                }
            }
        }
    }

    draw() {
        if (this.terrain !== null) {
            this.terrain.draw();
        }

        //Box
        Game.drawOn.beginPath();
        Game.drawOn.fillStyle = "#888";
        Game.drawOn.lineWidth = 4;
        Game.drawOn.strokeStyle = "#333";
        Game.drawOn.rect(150 + this.buttonOffset, 20, 980, 500);
        Game.drawOn.fill();
        Game.drawOn.stroke();

        //Color line
        Game.drawOn.beginPath();
        Game.drawOn.putImageData(this.colorLine, 240 + this.buttonOffset, 400);
        Game.drawOn.beginPath();
        Game.drawOn.rect(240 + this.buttonOffset, 400, 800, 30);
        Game.drawOn.stroke();

        let hue = this.removedHue;
        if (hue === -1) {
            hue = Game.players[this.playerID].colorHue;
        }
        Game.drawOn.beginPath();
        Game.drawOn.rect(230 + this.buttonOffset + hue * 800 - 15, 390, 50, 50);
        Game.drawOn.fillStyle = Game.colorStringify(Game.colorFromHue(hue));
        Game.drawOn.fill();
        Game.drawOn.stroke();

        //Player name
        Game.drawOn.textAlign = "Center";
        Game.drawOn.textBaseline = "Middle";
        Game.drawOn.font = "50px Verdana";
        Game.drawOn.fillStyle = "#000";
        Game.drawOn.fillText("Player " + (this.playerID + 1), 640 + this.buttonOffset, 70);
    }
}

class GameScreen extends BaseScreen {
    constructor(terrain) {
        super();
        this.terrain = terrain;
        this.players = [];
        for (let i = 0; i < Game.players.length; i++) {
            this.players.push(new Player(Game.players[i].controls, Game.colorFromHue(Game.players[i].colorHue), i));
        }
        this.particles = [];
        this.enemies = [];
        this.shots = [];
        this.enemySpawner = new EnemySpawner(this.enemies);
        this.boss = null;
        this.level = 1;
        this.timeTillNextLevel = 25000;
        this.topInfoYOffset = 70;
        this.gameover = false;
        this.moveEverything = false;
    }

    update(time) {
        //Gameover
        if (!this.gameover) {
            this.topInfoYOffset = Math.max(0, this.topInfoYOffset - time / 8);

            //Time
            let roundSpeedUp = 0;
            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i].shieldPower) {
                    roundSpeedUp += time / 4;
                }
            }
            this.timeTillNextLevel = Math.max(-1, this.timeTillNextLevel - time - roundSpeedUp);

            //Check end game
            let allDead = true;
            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i].alive) {
                    allDead = false;
                    break;
                }
            }
            if (allDead) {
                this.gameover = true;
                this.buttonOffset = 1280;
                let thisScreen = this;
                this.buttons.push(new Button(440, 400, 400, 80, [0, 255, 0], "Menu", () => { thisScreen.moveEverything = true; Game.changeScreen(new MainMenu(), true) }));
            }
        } else {
            this.buttonOffset = Math.max(0, this.buttonOffset - time);
        }

        //level up
        if (this.boss === null) {
            if (this.timeTillNextLevel < 0) {
                this.level++;
                this.terrain.levelPillar = 1280;
                this.timeTillNextLevel = 25000;
                let alivePlayers = 0;
                for (let i = 0; i < this.players.length; i++) {
                    if (this.players[i].alive) {
                        alivePlayers++;
                    }
                }
                if (this.level % 5 === 0) {
                    switch (this.level) {
                        case 5:
                            this.boss = new FirstBoss(2 - 1 / alivePlayers);
                            break;
                        case 10:
                            this.boss = new SecondBoss(2 - 1 / alivePlayers);
                            break;
                        default:
                            this.boss = new SecondBoss(this.level / 5 - 2 + (2 - 1 / alivePlayers));
                            break;
                    }
                }
            }
        }

        if (this.moveEverything) {
            //Move everything out
            this.topInfoYOffset = Math.max(0, this.topInfoYOffset + time / 8);
            for (let i = 0; i < this.shots.length; i++) {
                this.shots[i].x -= time * 4;
            }
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].x -= time * 4;
            }
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].x -= time * 4;
            }
            if (this.boss !== null) {
                this.boss.x -= time * 4;
            }
        } else {
            //Updates
            this.terrain.update(time, this.boss !== null);
            this.enemySpawner.update(time, this);
            for (let i = 0; i < this.particles.length; i++) {
                if (this.particles[i].startUpdate(time, this.terrain.movement)) {
                    this.particles.splice(i, 1);
                    i--;
                }
            }
            for (let i = 0; i < this.players.length; i++) {
                this.players[i].update(time, this);
            }
            for (let i = 0; i < this.shots.length; i++) {
                if (this.shots[i].startUpdate(time, this)) {
                    this.shots.splice(i, 1);
                    i--;
                }
            }
            for (let i = 0; i < this.enemies.length; i++) {
                if (this.enemies[i].startUpdate(time, this.terrain.movement, this)) {
                    this.enemies.splice(i, 1);
                    i--;
                }
            }
            if (this.boss !== null) {
                if (this.boss.startUpdate(time, this.terrain.movement, this)) {
                    this.boss = null;
                    this.timeTillNextLevel = 0;
                    for (let i = 0; i < this.players.length; i++) {
                        if (this.players[i].alive) {
                            this.players[i].health = 3;
                        }
                    }
                }
            }
        }
    }

    draw() {
        //Game
        this.terrain.draw();
        for (let i = 0; i < this.shots.length; i++) {
            this.shots[i].startDraw();
        }
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].startDraw();
        }
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].startDraw();
        }
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].draw();
        }
        if (this.boss !== null) {
            this.boss.startDraw();
        }

        //Top information
        Game.drawOn.fillStyle = "#888";
        Game.drawOn.fillRect(0, 0 - this.topInfoYOffset, 1280, 40);

        Game.drawOn.beginPath();
        Game.drawOn.moveTo(0, 42 - this.topInfoYOffset);
        Game.drawOn.lineTo(1280, 42 - this.topInfoYOffset);
        Game.drawOn.lineWidth = 4;
        Game.drawOn.strokeStyle = "#333";
        Game.drawOn.stroke();

        //level
        Game.drawOn.fillStyle = "#000";
        Game.drawOn.fillRect(1125, 5 - this.topInfoYOffset, 150, 30);
        if (this.boss === null) {
            Game.drawOn.fillStyle = "#444";
            Game.drawOn.fillRect(1125, 5 - this.topInfoYOffset, (1 - this.timeTillNextLevel / 25000) * 150, 30);
        } else {
            Game.drawOn.fillStyle = "#f00";
            Game.drawOn.fillRect(1125, 5 - this.topInfoYOffset, 150, 30);
        }
        Game.drawOn.textAlign = "Center";
        Game.drawOn.textBaseline = "Middle";
        Game.drawOn.font = "20px Verdana";
        Game.drawOn.fillStyle = "#fff";
        Game.drawOn.fillText("Level: " + this.level, 1200, 20 - this.topInfoYOffset);

        //Player health
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].drawHealth(5 + i * 90, 5 - this.topInfoYOffset);
        }

        //Game over
        if (this.gameover) {
            Game.drawOn.beginPath();
            Game.drawOn.fillStyle = "#888";
            Game.drawOn.lineWidth = 4;
            Game.drawOn.strokeStyle = "#333";
            Game.drawOn.rect(340 + this.buttonOffset, 160, 600, 400);
            Game.drawOn.fill();
            Game.drawOn.stroke();

            Game.drawOn.textAlign = "Center";
            Game.drawOn.textBaseline = "Middle";
            Game.drawOn.font = "50px Verdana";
            Game.drawOn.fillStyle = "#000";
            Game.drawOn.fillText("Game over!", 640 + this.buttonOffset, 300);
        }
    }
}