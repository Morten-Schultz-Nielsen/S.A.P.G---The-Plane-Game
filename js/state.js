class State {
    constructor() {
        this.canvas = null;
        this.drawOn = null;
        this.keys = {};
        this.mouseState = { x: 0, y: 0, rightClick: 0, leftClick: 0 };

        this.lastUpdate = 0;

        this.screen = new BaseScreen();
        this.changeToScreen = null;
        this.changeScreenTime = 0;
        this.changeScreenForward = false;
        this.players = [
            { controls: ["w", "a", "s", "d", " "], colorHue: Math.random() }
        ];
    }

    setup() {
        this.screen = new MainMenu(null);
        this.screen.setTerrain(new Terrain());
    }

    changeScreen(screen, forward) {
        this.changeScreenForward = forward;
        this.changeToScreen = screen;
        this.changeScreenTime = 1500;
        this.changeToScreen.buttonOffset = 1500;
    }

    update() {
        if (this.keys["f4"]) {
            if (1 >= outerHeight - innerHeight) {
                document.exitFullscreen();
            } else {
                this.canvas.requestFullscreen();
            }
            this.keys["f4"] = undefined;
        }

        let time = performance.now() - this.lastUpdate
        this.lastUpdate = performance.now();
        this.screen.startUpdate(time);

        //Move to new screen
        if (this.changeToScreen !== null) {
            this.changeToScreen.startUpdate(time);
            if (this.changeScreenTime > 0) {
                this.changeScreenTime = Math.max(0, this.changeScreenTime - time * 4);
                if (this.changeScreenForward) {
                    this.screen.terrain.terrainXOffset -= time - 1;
                    this.screen.terrain.levelPillar -= time - 1;
                    this.screen.buttonOffset = this.changeScreenTime - 1500;
                    this.changeToScreen.buttonOffset = this.changeScreenTime;
                } else {
                    this.screen.terrain.terrainXOffset += time - 1;
                    this.screen.buttonOffset = 1500 - this.changeScreenTime;
                    this.changeToScreen.buttonOffset = this.changeScreenTime * -1;
                }
                this.screen.terrain.timeTillNextMove = 0;
                this.screen.terrain.update(0);
            } else {
                let theTerrain = this.screen.terrain;
                this.screen = this.changeToScreen;
                if (this.screen instanceof MainMenu) {
                    this.screen.setTerrain(theTerrain);
                } else {
                    this.screen.terrain = theTerrain;
                }
                this.changeToScreen = null;
            }
        }

        //Update mouse button states
        if (this.mouseState.rightClick === 1) { this.mouseState.rightClick = 2; }
        if (this.mouseState.rightClick === 3) { this.mouseState.rightClick = 0; }
        if (this.mouseState.leftClick === 1) { this.mouseState.leftClick = 2; }
        if (this.mouseState.leftClick === 3) { this.mouseState.leftClick = 0; }
    }

    draw() {
        this.drawOn.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.screen.startDraw();
        if (this.changeToScreen !== null) {
            this.changeToScreen.startDraw();
        }
    }

    //Functions needed multiple times:
    colorLight(rawColor, light) {
        if (light === 1) {
            return rawColor;
        }

        //Makes a color lighter or darker
        let newColor = rawColor.slice();
        if (light > 1) {
            //Make color lighter
            for (let i = 0; i < 3; i++) {
                newColor[i] = Math.floor(newColor[i] + (255 - newColor[i]) * (light - 1));
            }
        } else {
            //Make color darker
            for (let i = 0; i < 3; i++) {
                newColor[i] = Math.floor(newColor[i] * light);
            }
        }
        return newColor;
    }

    colorStringify(rawColor) {
        //Converts a color array into a color string
        return "rgb(" + rawColor[0] + "," + rawColor[1] + "," + rawColor[2] + ")";
    }

    hitboxesInBox(thisX, thisY, hitboxes, boxX, boxY, boxWidth, boxHeight) {
        for (let i = 0; i < hitboxes.length; i++) {
            if (hitboxes[i][0] + thisX >= boxX && hitboxes[i][0] + thisX <= boxWidth + boxX && hitboxes[i][1] + thisY >= boxY && hitboxes[i][1] + thisY <= boxHeight + boxY) {
                return true;
            }
        }
        return false;
    }

    rotatePoint(pointX, pointY, aroundX, aroundY, radians) {
        let cos = Math.cos(radians);
        let sin = Math.sin(radians);
        let newX = (cos * (pointX - aroundX)) + (sin * (pointY - aroundY)) + aroundX;
        let newY = (cos * (pointY - aroundY)) - (sin * (pointX - aroundX)) + aroundY;
        return { x: newX, y: newY };
    }

    rotateHitboxes(hitboxes, radians) {
        let rotatedHitboxes = [];
        hitboxes.forEach(function (hitbox) {
            let rotated = Game.rotatePoint(hitbox[0], hitbox[1], 0, 0, radians);
            rotatedHitboxes.push([rotated.x, rotated.y]);
        });

        return rotatedHitboxes;
    }

    colorFromHue(hue) {
        let oneSixth = 1 / 6;
        if (hue < oneSixth) {
            return [255, Math.floor(hue / oneSixth * 255), 0];
        } else if (hue < oneSixth * 2) {
            return [255 - Math.floor((hue - oneSixth) / oneSixth * 255), 255, 0];
        } else if (hue < oneSixth * 3) {
            return [0, 255, Math.floor((hue - oneSixth * 2) / oneSixth * 255)];
        } else if (hue < oneSixth * 4) {
            return [0, 255 - Math.floor((hue - oneSixth * 3) / oneSixth * 255), 255];
        } else if (hue < oneSixth * 5) {
            return [Math.floor((hue - oneSixth * 4) / oneSixth * 255), 0, 255];
        } else {
            return [255, 0, 255 - Math.floor((hue - oneSixth * 5) / oneSixth * 255)];
        }
    }
}