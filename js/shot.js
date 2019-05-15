class BasicShot {
    constructor(enemy,x,y,motionX,motionY,hitboxes,rotation) {
        this.enemy = enemy;
        this.rotation = rotation;
        let rotatedMotion = Game.rotatePoint(motionX, motionY, 0, 0, rotation);
        this.motionX = rotatedMotion.x;
        this.motionY = rotatedMotion.y * -1;
        this.hitboxes = Game.rotateHitboxes(hitboxes, rotation);
        this.x = x;
        this.y = y;
    }

    startUpdate(time, gameInfo) {
        let movementStepsX = this.motionX * time;
        let movementStepsY = this.motionY * time;
        do {
            //Movement
            if (this.x > 0) {
                this.x += Math.min(3, movementStepsX);
                movementStepsX -= Math.min(3, movementStepsX);
            } else {
                this.x += Math.max(-3, movementStepsX);
                movementStepsX -= Math.max(-3, movementStepsX);
            }
            if (this.y > 0) {
                this.y += Math.min(3, movementStepsY);
                movementStepsY -= Math.min(3, movementStepsY);
            } else {
                this.y += Math.max(-3, movementStepsX);
                movementStepsY -= Math.max(-3, movementStepsY);
            }
            //Check Hitboxes;
            for (let j = 0; j < this.hitboxes.length; j++) {
                if (this.enemy) {
                    for (let i = 0; i < gameInfo.players.length; i++) {
                        if (this.x + this.hitboxes[j][0] >= gameInfo.players[i].x - 30 && this.x + this.hitboxes[j][0] <= gameInfo.players[i].x && this.y + this.hitboxes[j][1] >= gameInfo.players[i].y - 15 && this.y + this.hitboxes[j][1] <= gameInfo.players[i].y + 15) {
                            if (this.hit(gameInfo.players[i], gameInfo)) {
                                return true;
                            }
                        }
                    }
                } else {
                    if (gameInfo.boss !== null) {
                        if (this.x + this.hitboxes[j][0] >= gameInfo.boss.x + gameInfo.boss.squareBox[0] && this.x + this.hitboxes[j][0] <= gameInfo.boss.x + gameInfo.boss.squareBox[2] && this.y + this.hitboxes[j][1] >= gameInfo.boss.y + gameInfo.boss.squareBox[1] && this.y + this.hitboxes[j][1] <= gameInfo.boss.y + + gameInfo.boss.squareBox[3]) {
                            if (this.hit(gameInfo.boss, gameInfo)) {
                                return true;
                            }
                        }
                    }
                    for (let i = 0; i < gameInfo.enemies.length; i++) {
                        if (this.x + this.hitboxes[j][0] >= gameInfo.enemies[i].x + gameInfo.enemies[i].squareBox[0] && this.x + this.hitboxes[j][0] <= gameInfo.enemies[i].x + gameInfo.enemies[i].squareBox[2] && this.y + this.hitboxes[j][1] >= gameInfo.enemies[i].y + gameInfo.enemies[i].squareBox[1] && this.y + this.hitboxes[j][1] <= gameInfo.enemies[i].y + + gameInfo.enemies[i].squareBox[3]) {
                            if (this.hit(gameInfo.enemies[i], gameInfo)) {
                                return true;
                            }
                        }
                    }
                }
            }
        } while ((movementStepsX !== 0 || movementStepsY !== 0)) {

        }
        if (this.x < -100 || this.x > 1380 || this.y < -100 || this.y > 820) {
            return true;
        }
        if (gameInfo.terrain.hitboxesIsInTerrain(this.x, this.y, this.hitboxes)) {
            if (this.hitWall()) {
                return true;
            }
        }

        return this.update(time, gameInfo);
    }

    update() {
        return false;
    }

    hit(thing, gameInfo) {
        thing.hit();
        return true;
    }

    hitWall() {
        return true;
    }

    startDraw() {
        Game.drawOn.translate(this.x, this.y);
        Game.drawOn.rotate(this.rotation);
        this.draw();
        Game.drawOn.setTransform(1, 0, 0, 1, 0, 0);

        //Game.drawOn.fillStyle = "#0f0";
        //for (let i = 0; i < this.hitboxes.length; i++) {
        //    Game.drawOn.fillRect(this.x + this.hitboxes[i][0], this.y + this.hitboxes[i][1], 3, 3);
        //}
    }

    draw() {

    }
}

class PlayerShot extends BasicShot {
    constructor(x,y,rotation,ownerID) {
        super(false, x, y, 1, 0, [[-5, 0], [5, 0]], rotation);
        this.ownerID = ownerID;
    }

    hit(thing, gameInfo) {
        let wasDead = (!thing.alive || thing.dying);
        thing.hit();
        if (!wasDead && (!thing.alive || thing.dying)) {
            gameInfo.players[this.ownerID].didHit();
        }
        return true;
    }

    draw() {
        Game.drawOn.fillStyle = "#3d3";
        Game.drawOn.fillRect(-5, -2, 11, 5);
    }
}

class NormalEnemyShot extends BasicShot {
    constructor(x, y, rotation) {
        super(true, x, y, -0.5, 0, [[-5, 0], [5, 0]], rotation);
    }

    draw() {
        Game.drawOn.fillStyle = "#de3";
        Game.drawOn.fillRect(-5, -2, 11, 5);
    }
}

class Lazer extends BasicShot {
    constructor(x, y, rotation, endRotation,time) {
        super(true, x, y, 0, 0, [], rotation);
        this.time = time;
        this.endLocationX = 0;
        this.endLocationY = 0;
        this.endRotation = endRotation;
        this.totalTime = time;
        this.startRotation = rotation;
    }

    update(time, gameInfo) {
        this.time = Math.max(0, this.time - time);
        this.rotation = this.startRotation - (this.startRotation - this.endRotation) * (1 - this.time / this.totalTime);
        this.hitboxes = [];

        let direction = Game.rotatePoint(10, 0, 0, 0, this.rotation);
        let tryLocationX = 0;
        let tryLocationY = 0;
        while (!gameInfo.terrain.hitboxesIsInTerrain(tryLocationX + this.x, tryLocationY + this.y, [[0, 0]]) && -10 < tryLocationX + this.x && tryLocationX + this.x < 1290 && -10 < tryLocationY + this.y && tryLocationY + this.y < 730) {
            tryLocationX += direction.x;
            tryLocationY += direction.y;
            this.hitboxes.push([tryLocationX, tryLocationY]);
        }
        gameInfo.particles.push(new LazerParticle(tryLocationX + this.x, tryLocationY + this.y));

        this.endLocationX = tryLocationX;
        this.endLocationY = tryLocationY;
        return (this.time <= 0);
    }

    draw() {
        Game.drawOn.setTransform(1, 0, 0, 1, 0, 0);
        Game.drawOn.translate(this.x, this.y);
        Game.drawOn.beginPath();
        Game.drawOn.lineWidth = 5 * (this.totalTime / 2 > this.time ? (this.time / (this.totalTime / 2)) : (1 - (this.time - (this.totalTime / 2)) / (this.totalTime / 2))) + 5;
        Game.drawOn.strokeStyle = "#f00";
        Game.drawOn.moveTo(0, 0);
        Game.drawOn.lineTo(this.endLocationX, this.endLocationY);
        Game.drawOn.stroke();
    }

    hit(thing) {
        thing.hit();
        return false;
    }

    hitWall() {
        return false;
    }
}

