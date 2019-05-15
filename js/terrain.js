class Terrain {
    constructor() {
        this.topPoints = [];
        this.bottomPoints = [];
        this.stones = [];
        for (let i = 0; i < 13; i++) {
            this.generateTopBottomPair(true);
        }
        this.terrainXOffset = 0;
        this.speed = 10;
        this.timeTillNextMove = this.speed;
        this.movement = 0;
        this.flashColor = null;
        this.flashCounter = 0;
        this.levelPillar = -100;
    }

    generateTopBottomPair(addToTop, bigHoles) {
        //let stone = new Stone(this, 1310 + Math.random() * 120, Math.random() * 720);
        //if (!stone.isGone()) {
        //    this.stones.push(stone);
        //}
        let difference = Math.floor(Math.random() * (720 / 5 * 2) + (720 / 5 * 2));
        if (bigHoles) {
            difference = Math.floor(Math.min(600, difference * 2.5));
        }
        let openLocation = Math.floor(Math.random() * (640 - difference)) + 40;
        if (addToTop) {
            this.topPoints.push(openLocation);
            this.bottomPoints.push(openLocation + difference);
        } else {
            this.topPoints.splice(0,0,openLocation);
            this.bottomPoints.splice(0,0,openLocation + difference);
        }
    }

    update(time, bigHoles) {
        this.timeTillNextMove -= time;
        this.movement = 0;
        while (this.timeTillNextMove <= 0) {
            this.movement++;
            this.terrainXOffset--;
            for (let i = 0; i < this.stones.length; i++) {
                this.stones[i].x--;
                if (this.stones[i].isGone()) {
                    this.stones.splice(i, 1);
                    i--;
                }
            }
            this.levelPillar--;
            this.timeTillNextMove += this.speed;
            if (this.terrainXOffset < -160) {
                this.terrainXOffset += 160;
                this.generateTopBottomPair(true, bigHoles);
                this.bottomPoints.splice(0, 1);
                this.topPoints.splice(0, 1);
            } else if (this.terrainXOffset > 160) {
                this.terrainXOffset -= 160;
                this.generateTopBottomPair(false, bigHoles);
                this.bottomPoints.splice(13, 1);
                this.topPoints.splice(13, 1);
            }
        }
        if (this.flashColor !== null) {
            if (this.flashCounter >= 100) {
                this.flashCounter = 0;
                this.flashColor = null;
            }
            this.flashCounter += time;
        }
    }

    draw() {
        if (this.flashColor === null) {
            Game.drawOn.fillStyle = "#683311";
        } else {
            Game.drawOn.fillStyle = Game.colorStringify(this.flashColor);
        }
        Game.drawOn.fillRect(0, 0, 1280, 720);

        if (this.flashColor === null) {
            Game.drawOn.fillStyle = "#444";
        } else {
            Game.drawOn.fillStyle = "#666";
        }
        Game.drawOn.fillRect(this.levelPillar, 0, 100, 720);

        Game.drawOn.fillStyle = "#BA5D1F";
        Game.drawOn.strokeStyle = "#89DA00";
        Game.drawOn.lineWidth = 30;

        //Draw bottom terrain
        Game.drawOn.beginPath();
        Game.drawOn.moveTo(this.terrainXOffset, 1380);
        for (let i = 0; i < 13; i++) {
            Game.drawOn.lineTo(this.terrainXOffset + (i - 2) * 160 - 50, this.bottomPoints[i]);
        }
        Game.drawOn.lineTo(this.terrainXOffset + 9 * 160, 1380);
        Game.drawOn.closePath();
        Game.drawOn.fill();
        Game.drawOn.stroke();

        //Draw top terrain
        Game.drawOn.strokeStyle = Game.drawOn.fillStyle;
        Game.drawOn.beginPath();
        Game.drawOn.moveTo(this.terrainXOffset, -100);
        for (let i = 0; i < 13; i++) {
            Game.drawOn.lineTo(this.terrainXOffset + (i - 2) * 160 - 50, this.topPoints[i]);
        }
        Game.drawOn.lineTo(this.terrainXOffset + 9 * 160, -100);
        Game.drawOn.closePath();
        Game.drawOn.fill();
        Game.drawOn.stroke();

        //Draw stones
        for (let i = 0; i < this.stones.length; i++) {
            this.stones[i].draw();
        }
    }

    getHoleSegment(x) {
        let lineStart = Math.floor((x + 50 - this.terrainXOffset) / 160) + 2;
        let lineEnd = Math.floor((x + 50 - this.terrainXOffset) / 160) + 3;
        let xInside = (x + 50 - this.terrainXOffset) % 160;
        return { start: lineStart, end: lineEnd, xInside: xInside };
    }

    yFromBottom(x, y) {
        let holeSegment = this.getHoleSegment(x);
        return this.bottomPoints[holeSegment.start] - 15 + Math.round((this.bottomPoints[holeSegment.end] - this.bottomPoints[holeSegment.start]) * (holeSegment.xInside / 160)) - y;
    }

    yFromTop(x, y) {
        let holeSegment = this.getHoleSegment(x);
        return -1 * (this.topPoints[holeSegment.start] + 15 + Math.round((this.topPoints[holeSegment.end] - this.topPoints[holeSegment.start]) * (holeSegment.xInside / 160)) - y);
    }

    hitboxesIsInTerrain(x,y,hitboxes) {
        for (let i = 0; i < hitboxes.length; i++) {
            if (this.yFromBottom(x + hitboxes[i][0], y + hitboxes[i][1]) <= 0) {
                return true;
            }
            if (this.yFromTop(x + hitboxes[i][0], y + hitboxes[i][1]) <= 0) {
                return true;
            }
        }

        return false;
    }

    toOutsideTerrain(x, y, hitboxes) {
        let biggest = 0;
        for (let i = 0; i < hitboxes.length; i++) {
            let away = this.yFromBottom(x + hitboxes[i][0], y + hitboxes[i][1])
            if (away <= 0 && Math.abs(away) > Math.abs(biggest)) {
                biggest = away;
            }
            away = this.yFromTop(x + hitboxes[i][0], y + hitboxes[i][1])
            if (away <= 0 && Math.abs(away) > Math.abs(biggest)) {
                biggest = away * -1;
            }
        }

        return biggest;
    }
}

class Stone {
    constructor(terrain,x,y) {
        this.x = x;
        this.y = y;
        this.path = [];
        this.lastRotation = Math.random() * Math.PI * 2;
        this.parts = Math.floor(Math.random() * 3 + 3);
        this.size = Math.random() * 30 + 20;
        for (let i = 0; i < this.parts; i++) {
            this.addLine(terrain);
        }
    }

    addLine(terrain) {
        let randomLocation;
        this.lastRotation += Math.PI * 2 / this.parts;
        randomLocation = Game.rotatePoint(this.size, 0, 0, 0, this.lastRotation);
        let toTop = terrain.yFromTop(this.x + randomLocation.x, this.y + randomLocation.y);
        let toBottom = terrain.yFromBottom(this.x + randomLocation.x, this.y + randomLocation.y);
        if (toTop < -10 || toBottom < -10) {
            this.path.push(randomLocation);
        }
    }

    isGone() {
        return (this.x < -100 || this.path.length < 3);
    }

    draw() {
        Game.drawOn.fillStyle = "#999";
        Game.drawOn.beginPath();
        Game.drawOn.moveTo(this.path[0].x + this.x, this.path[0].y + this.y);
        for (let i = 1; i < this.path.length; i++) {
            Game.drawOn.lineTo(this.path[i].x + this.x, this.path[i].y + this.y);
        }
        Game.drawOn.fill();
    }
}