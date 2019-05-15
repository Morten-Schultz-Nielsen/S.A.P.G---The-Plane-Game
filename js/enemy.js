class BaseEnemy {
    constructor(x, y, hitboxes, squareBox, cooldown, affectedByScroll) {
        this.x = x;
        this.y = y;
        this.cooldown = cooldown;
        this.tillCooldownOver = Math.random() * cooldown;
        this.alive = true;
        this.normalHitboxes = hitboxes;
        this.hitboxes = this.normalHitboxes;
        this.squareBox = squareBox;
        this.rotation = 0;
        this.lerpToRotation = 0;
        this.dying = false;
        this.affectedByScroll = affectedByScroll;
    }

    startUpdate(time, movement, gameInfo) {
        if (this.rotation < this.lerpToRotation) {
            this.rotation = Math.min(this.lerpToRotation, this.rotation + time * 0.005);
        } else if (this.rotation > this.lerpToRotation) {
            this.rotation = Math.max(this.lerpToRotation, this.rotation - time * 0.005);
        }
        if (this.alive && gameInfo.terrain.hitboxesIsInTerrain(this.x, this.y, this.hitboxes)) {
            this.alive = false;
        }
        this.hitboxes = Game.rotateHitboxes(this.normalHitboxes, this.rotation);
        if (this.affectedByScroll) {
            this.x -= movement;
        }
        if (!this.dying) {
            this.tillCooldownOver -= time;
            while (this.tillCooldownOver <= 0) {
                this.tillCooldownOver += this.cooldown;
                this.attack(gameInfo);
            }
            if (this.x < -100) {
                return true;
            }
        }
        return this.update(time, gameInfo);
    }

    update(time, gameInfo) {
        return false;
    }

    attack(gameInfo) {

    }

    startDraw() {
        Game.drawOn.translate(this.x, this.y);
        Game.drawOn.rotate(this.rotation);
        this.draw();
        Game.drawOn.setTransform(1, 0, 0, 1, 0, 0);
    }

    draw() {

    }
}

class BaseEnemyPlane extends BaseEnemy {
    constructor(x, y, hitboxes, squareBox, cooldown, flySpeed) {
        super(x, y, hitboxes, squareBox, cooldown, true);
        this.flySpeed = Math.random() * (flySpeed / 2) + flySpeed / 2;
        this.lastDogdeMove = -1;
        this.randomMove = 1000;
        this.moveDirection = -1;
    }

    update(time, gameInfo) {
        this.x -= this.flySpeed * time;

        if (!this.dying) {
            this.lerpToRotation = 0;
            let difference = gameInfo.terrain.yFromTop(this.x, this.y) - gameInfo.terrain.yFromBottom(this.x, this.y);
            let spaceBetween = 720 + gameInfo.terrain.yFromTop(this.x, 0) + gameInfo.terrain.yFromBottom(this.x, 720);
            let maximumLengthFromWall = spaceBetween / 5 * 2;
            let moveTo;
            if (Math.abs(difference) >= maximumLengthFromWall || (Math.abs(difference) + 60 >= maximumLengthFromWall && this.lastDogdeMove !== -1)) {
                if (difference < 0) {
                    this.lastDogdeMove = 0;
                    moveTo = 0;
                    this.moveDirection = -1;
                } else {
                    this.lastDogdeMove = 1;
                    moveTo = 1;
                    this.moveDirection = -1;
                }
            } else {
                this.lastDogdeMove = -1;
                this.randomMove -= time;
                if (this.randomMove <= 0) {
                    this.randomMove = 1000;
                    this.moveDirection = Math.floor(Math.random() * 2);
                }
                moveTo = this.moveDirection;
            }

            if (moveTo === 0) {
                this.y += this.flySpeed * time;
                this.lerpToRotation = Math.PI / -4;
            } else if (moveTo === 1) {
                this.y -= this.flySpeed * time;
                this.lerpToRotation = Math.PI / 4;
            }
        }

        if (this.planeUpdate(time, gameInfo)) {
            return true;
        }

        if (!this.alive) {
            gameInfo.particles.push(new ExplosionParticle(this.x, this.y, 100));
            gameInfo.terrain.flashColor = [100, 80, 60];
            for (let i = 0; i < 30; i++) {
                gameInfo.particles.push(new ExplosionParticle(this.x - Math.round(Math.random() * 10 - 5), this.y - Math.round(Math.random() * 10 - 5), 40));
            }
            return true;
        }

        return false;
    }

    hit() {
        this.dying = true;
        this.lerpToRotation = Math.PI / -4;
    }

    planeUpdate(time, gameInfo) {

    }
}

class NormalEnemy extends BaseEnemyPlane {
    constructor(x, y) {
        super(x, y, [[-15, 0],[15,-15],[15,15]], [-15, -15, 30, 30], 2000, 0.2);
    }
     
    planeUpdate(time, gameInfo) {
        if (this.dying || !this.alive) {
            gameInfo.particles.push(new ExplosionParticle(this.x, this.y, 20));
            this.y += time / 8;
        }
    }

    attack(gameInfo) {
        gameInfo.shots.push(new NormalEnemyShot(this.x, this.y, this.rotation));
    }

    draw() {
        if (this.alive) {
            Game.drawOn.fillStyle = "#f00";
            Game.drawOn.beginPath();
            Game.drawOn.moveTo(-15, 0);
            Game.drawOn.lineTo(15, -15);
            Game.drawOn.lineTo(6, 0);
            Game.drawOn.lineTo(15, 15);
            Game.drawOn.lineTo(-15, 0);
            Game.drawOn.fill();
        }
    }
}

class SpeedPlane extends BaseEnemyPlane {
    constructor(x, y, hard) {
        super(x, y, [[-5, 0], [5, -5], [5, 5]], [-7, -7, 14, 14], 300, 0.4);
        this.hard = hard;
    }

    planeUpdate(time, gameInfo) {
        if (this.dying && this.alive) {
            for (let i = 0; i < 10; i++) {
                gameInfo.particles.push(new ExplosionParticle(this.x - Math.round(Math.random() * 10 - 5), this.y - Math.round(Math.random() * 10 - 5), 20));
            }
            return true;
        }
    }

    attack(gameInfo) {
        if (this.hard) {
            gameInfo.shots.push(new NormalEnemyShot(this.x, this.y, this.rotation));
        }
    }

    draw() {
        if (this.alive) {
            if (this.hard) {
                Game.drawOn.fillStyle = "#000";
            } else {
                Game.drawOn.fillStyle = "#fa0";
            }
            Game.drawOn.beginPath();
            Game.drawOn.moveTo(-5, 0);
            Game.drawOn.lineTo(5, -5);
            Game.drawOn.lineTo(1, 0);
            Game.drawOn.lineTo(5, 5);
            Game.drawOn.lineTo(-5, 0);
            Game.drawOn.fill();
        }
    }
}

class ShooterBall extends BaseEnemy {
    constructor(x,y,hard) {
        super(x, y, [[10, 0], [0, 10], [-10, 0], [0, -10]], [-12, -12, 24, 24], 2000, false);
        this.toScreen = x - 1100 + Math.random() * 100;
        this.direction = -1;
        this.tillNewDirection = 10000 * Math.random();
        this.isHit = 0;
        this.dissapear = 15000;
        this.hard = hard;
        if (this.hard) {
            this.health = 5;
        } else {
            this.health = 1;
            this.cooldown = 3500;
        }
    }

    update(time, gameInfo) {
        this.dissapear -= time;
        if (this.dissapear < 0) {
            this.affectedByScroll = true;
        }
        this.isHit -= time;
        let moveDown = 0;
        let amountToTop = gameInfo.terrain.yFromTop(this.x, this.y);
        let amountToBottom = gameInfo.terrain.yFromBottom(this.x, this.y);
        if (amountToTop < 60) {
            moveDown = 0.1;
            this.direction = -1;
        } else if (amountToBottom < 60) {
            moveDown = -0.1;
            this.direction = -1;
        }
        this.tillNewDirection -= time;
        if (this.tillNewDirection < 0) {
            this.tillNewDirection += 8000 * Math.random();
            this.direction = Math.floor(Math.random() * 2);
        }

        if (this.direction === 0) {
            moveDown = 0.05;
        } else if (this.direction === 1) {
            moveDown = -0.05;
        }

        this.y += moveDown * time;
        if (this.toScreen > 0) {
            this.x -= Math.min(0.05 * time, this.toScreen);
            this.toScreen -= 0.05 * time;
        }

        if (!this.alive) {
            gameInfo.particles.push(new ExplosionParticle(this.x, this.y, 100));
            gameInfo.terrain.flashColor = [100, 80, 60];
            for (let i = 0; i < 30; i++) {
                gameInfo.particles.push(new ExplosionParticle(this.x - Math.round(Math.random() * 20 - 10), this.y - Math.round(Math.random() * 20 - 10), 40));
            }
            return true;
        }
        return false;
    }

    attack(gameInfo) {
        gameInfo.shots.push(new NormalEnemyShot(this.x, this.y, 0));
    }

    hit() {
        this.health -= 1;
        this.isHit = 100;
        if (this.health <= 0) {
            this.alive = false;
        }
    }

    draw() {
        Game.drawOn.beginPath();
        Game.drawOn.arc(0, 0, 20, 0, Math.PI * 2);
        if (this.hard) {
            Game.drawOn.fillStyle = "#a00";
            if (this.isHit > 0) {
                Game.drawOn.fillStyle = "#f00";
            }
            Game.drawOn.strokeStyle = "#500";
        } else {
            Game.drawOn.fillStyle = "#00a";
            Game.drawOn.strokeStyle = "#005";
        }
        Game.drawOn.fill();
        Game.drawOn.lineWidth = 4;
        Game.drawOn.stroke();
    }
}

class GroundCanon extends BaseEnemy {
    constructor(x,y,hard) {
        super(x + 20, y, [], [-20, -20, 40, 40], 2000, false);
        this.randomSpawnDelay = Math.random() * 3000;
        this.spawned = false;
        this.shootDirection = Math.random() * (Math.PI * 2);
        this.shootLocation = Game.rotatePoint(45, 0, 0, 0, this.shootDirection);
        this.rotationWay = 0;
        this.hard = hard;
        this.isHit = 0;
        if (this.hard) {
            this.health = 4;
            this.cooldown = 500;
        } else {
            this.health = 1;
        }
    }

    attack(gameInfo) {
        gameInfo.shots.push(new NormalEnemyShot(this.x + this.shootLocation.x, this.y + this.shootLocation.y, Math.PI - this.shootDirection));
    }

    update(time, gameInfo) {
        if (!this.spawned) {
            //Not spawned
            this.randomSpawnDelay -= time;
            if (this.randomSpawnDelay < 0) {
                this.spawned = true;
                this.affectedByScroll = true;
                let fromBottom = gameInfo.terrain.yFromBottom(this.x, this.y);
                let fromTop = gameInfo.terrain.yFromTop(this.x, this.y);
                if (fromBottom < fromTop) {
                    this.y += fromBottom;
                } else {
                    this.y -= fromTop;
                }
                let tries = 0;
                while (gameInfo.terrain.hitboxesIsInTerrain(this.x, this.y, [[this.shootLocation.x, this.shootLocation.y]])) {
                    this.shootDirection += Math.PI * time / 1000;
                    this.shootLocation = Game.rotatePoint(45, 0, 0, 0, this.shootDirection);
                    tries++;
                    if (this.tries > 200)
                    {
                        this.alive = false;
                        break;
                    }
                }
            }
        } else {
            //Spawned
            this.isHit -= time;
            if (this.rotationWay === 0) {
                this.shootDirection += Math.PI * time / 4000;
            } else {
                this.shootDirection -= Math.PI * time / 4000;
            }
            this.shootLocation = Game.rotatePoint(45, 0, 0, 0, this.shootDirection);
            let testLocation = 0;
            if (this.rotationWay === 0) {
                testLocation = Game.rotatePoint(45, 0, 0, 0, this.shootDirection + Math.PI / 8);
            } else {
                testLocation = Game.rotatePoint(45, 0, 0, 0, this.shootDirection - Math.PI / 8);
            }
            if (gameInfo.terrain.hitboxesIsInTerrain(this.x, this.y, [[testLocation.x, testLocation.y]])) {
                if (this.rotationWay === 0) {
                    this.rotationWay = 1;
                } else {
                    this.rotationWay = 0;
                }
            }
        }

        if (!this.alive) {
            gameInfo.particles.push(new ExplosionParticle(this.x, this.y, 100));
            gameInfo.terrain.flashColor = [100, 80, 60];
            for (let i = 0; i < 30; i++) {
                gameInfo.particles.push(new ExplosionParticle(this.x - Math.round(Math.random() * 10 - 5), this.y - Math.round(Math.random() * 10 - 5), 40));
            }
            return true;
        }
        return false;
    }

    hit() {
        this.health -= 1;
        this.isHit = 100;
        if (this.health <= 0) {
            this.alive = false;
        }
    }

    draw() {
        if (this.spawned) {
            Game.drawOn.lineWidth = 16;
            Game.drawOn.strokeStyle = "#000";
            Game.drawOn.beginPath();
            Game.drawOn.moveTo(0, 0);
            Game.drawOn.lineTo(this.shootLocation.x, this.shootLocation.y);
            Game.drawOn.stroke();


            Game.drawOn.lineWidth = 8;
            Game.drawOn.beginPath();
            if (this.hard) {
                Game.drawOn.fillStyle = "#f80";
                if (this.isHit > 0) {
                    Game.drawOn.fillStyle = "#fa0";
                }
                Game.drawOn.strokeStyle = "#820";
            } else {
                Game.drawOn.fillStyle = "#aaa";
                Game.drawOn.strokeStyle = "#555";
            }
            Game.drawOn.rect(-20, -20, 40, 40);
            Game.drawOn.fill();

            if (this.hard) {
                Game.drawOn.fillStyle = "#ff0";
                if (this.health <= 3) {
                    Game.drawOn.beginPath();
                    Game.drawOn.moveTo(-20, -20);
                    Game.drawOn.lineTo(0, 0);
                    Game.drawOn.lineTo(-20, 20);
                    Game.drawOn.fill();
                }
                if (this.health <= 2) {
                    Game.drawOn.beginPath();
                    Game.drawOn.moveTo(-20, 20);
                    Game.drawOn.lineTo(0, 0);
                    Game.drawOn.lineTo(20, 20);
                    Game.drawOn.fill();
                }
                if (this.health <= 1) {
                    Game.drawOn.beginPath();
                    Game.drawOn.moveTo(20, 20);
                    Game.drawOn.lineTo(0, 0);
                    Game.drawOn.lineTo(20, -20);
                    Game.drawOn.fill();
                }
            }
            Game.drawOn.beginPath();
            Game.drawOn.rect(-20, -20, 40, 40);
            Game.drawOn.moveTo(-20, -20);
            Game.drawOn.lineTo(20, 20);
            Game.drawOn.moveTo(20, -20);
            Game.drawOn.lineTo(-20, 20);
            Game.drawOn.stroke();
        }
    }
}