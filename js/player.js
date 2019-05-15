class Player {
    constructor(controls, rawColor, id) {
        this.controls = controls;
        this.rawColor = rawColor;
        this.x = 100;
        this.y = 360;
        this.dying = false;
        this.alive = true;
        this.normalHitBoxes = [[10, 0], [-10, -10], [-10, 10]];
        this.hitBoxes = this.normalHitBoxes;
        this.lerpToRotation = 0;
        this.rotation = 0;
        this.shotCooldown = 0;
        this.health = 3;
        this.invulnerable = 0;
        this.invulnerableAnimation = 0;
        this.spawning = 0;
        this.id = id;
        this.power = 0;
        this.spawn();
        this.activateShieldTime = 0;
        this.activateShotTime = 0;
        this.shieldPower = false;
        this.shotPower = false;
        this.justActivatedShield = false;
        this.justActivatedShot = false;
    }

    update(time, gameInfo) {
        //Spawning
        this.invulnerable = Math.max(-1, this.invulnerable - time);
        if (this.spawning >= 0) {
            this.spawning -= time;
            this.x += time / 2;
        }

        this.invulnerableAnimation -= time;
        if (this.invulnerableAnimation < 0) {
            this.invulnerableAnimation += 300;
        }

        //Power
        if (!this.dying && this.power >= 0 && Game.keys[this.controls[1]] === true && Game.keys[this.controls[3]] === true) {
            if (!this.justActivatedShield) {
                this.activateShieldTime += time;
            }
        } else {
            this.justActivatedShield = false;
            this.activateShieldTime = 0;
        }
        if (!this.dying && this.power >= 0 && Game.keys[this.controls[0]] === true && Game.keys[this.controls[2]] === true) {
            if (!this.justActivatedShot) {
                this.activateShotTime += time;
            }
        } else {
            this.justActivatedShot = false;
            this.activateShotTime = 0;
        }
        if (this.activateShieldTime >= 100) {
            this.activateShieldTime = 0;
            this.shieldPower = !this.shieldPower;
            this.justActivatedShield = true;
            if (this.shieldPower) {
                let motion;
                for (let i = 0; i < 50; i++) {
                    motion = Game.rotatePoint(Math.random() * 0.1 + 0.1, 0, 0, 0, Math.random() * (Math.PI * 2));
                    gameInfo.particles.push(new FireParticle(this.x - 10, this.y, motion.x, motion.y, [0,0,255]));
                }
            }
        }
        if (this.activateShotTime >= 100) {
            this.activateShotTime = 0;
            this.shotPower = !this.shotPower;
            this.justActivatedShot = true;
            if (this.shotPower) {
                let motion;
                for (let i = 0; i < 50; i++) {
                    motion = Game.rotatePoint(Math.random() * 0.1 + 0.1, 0, 0, 0, Math.random() * (Math.PI * 2));
                    gameInfo.particles.push(new FireParticle(this.x - 10, this.y, motion.x, motion.y, [0, 255, 0]));
                }
            }
        }
        if (this.shieldPower) {
            if (this.invulnerable < 0) {
                this.power = Math.max(0, this.power - time);
                this.invulnerable += time * 2;
            }
            if (this.power <= 0) {
                this.shieldPower = false;
            }
        }

        //Movement
        let rotationSpeed = 0.005;
        let speedDivider = 4;
        let shooting = false;
        if (Game.keys[this.controls[4]] === true && this.alive && !this.dying) {
            rotationSpeed = 0.001;
            speedDivider = 8;
            shooting = true;
        }
        if (this.rotation < this.lerpToRotation) {
            this.rotation = Math.min(this.lerpToRotation, this.rotation + time * rotationSpeed);
        } else if (this.rotation > this.lerpToRotation){
            this.rotation = Math.max(this.lerpToRotation, this.rotation - time * rotationSpeed);
        }
        this.hitBoxes = Game.rotateHitboxes(this.normalHitBoxes, this.rotation);
        this.shotCooldown -= time;
        if (this.alive && !this.dying) {
            this.lerpToRotation = 0;
            //Movement
            if (Game.keys[this.controls[0]] === true) {
                this.y -= time / speedDivider;
                if (Game.keys[this.controls[2]] !== true) {
                    this.lerpToRotation = Math.PI / (Game.keys[this.controls[1]] === true && Game.keys[this.controls[3]] !== true ? 4 : -4);
                }
            }
            if (Game.keys[this.controls[2]] === true) {
                this.y += time / speedDivider;
                if (Game.keys[this.controls[0]] !== true) {
                    this.lerpToRotation = Math.PI / (Game.keys[this.controls[1]] === true && Game.keys[this.controls[3]] !== true ? -4 : 4);
                }
            }
            if (Game.keys[this.controls[3]] === true) {
                this.x += time / speedDivider;
            }
            if (shooting && this.shotCooldown < 0) {
                let shotLocation = Game.rotatePoint(10, 0, 0, 0, this.rotation);
                gameInfo.shots.push(new PlayerShot(this.x + shotLocation.x, this.y - shotLocation.y, this.rotation, this.id));
                if (this.shotPower) {
                    gameInfo.shots.push(new PlayerShot(this.x + shotLocation.x, this.y - shotLocation.y, this.rotation + Math.PI * 0.05, this.id));
                    gameInfo.shots.push(new PlayerShot(this.x + shotLocation.x, this.y - shotLocation.y, this.rotation - Math.PI * 0.05, this.id));
                    this.power = Math.max(0, this.power - 300);
                    if (this.power <= 0) {
                        this.shotPower = false;
                    }
                }
                this.shotCooldown = 100;
            }

            //Inside inside Map
            if (this.spawning <= 0) {
                if (Game.keys[this.controls[1]] === true) {
                    this.x -= time / speedDivider;
                }

                this.x = Math.max(20, this.x);
            }
            this.x = Math.min(1280, this.x);
            this.y = Math.max(54, this.y);
            this.y = Math.min(710, this.y);
        }

        if (!this.dying) {
            //Fire particle
            let motion = Game.rotatePoint(-0.1, 0, 0, 0, this.rotation);
            let engineLocation = Game.rotatePoint(-20, 0, 0, 0, this.rotation);
            let useColor = [255, 0, 0];
            if (this.shieldPower) { useColor = [0, 0, 255]; }
            if (this.shotPower) { useColor = [0, 255, 0]; }
            if (this.shotPower && this.shieldPower) { useColor = [255, 255, 0]; }
            gameInfo.particles.push(new FireParticle(engineLocation.x + this.x, engineLocation.y * -1 + this.y, motion.x, motion.y, useColor));

            //Hitting enemy check
            for (let i = 0; i < gameInfo.enemies.length; i++) {
                if (!gameInfo.enemies[i].alive) { continue; }
                if (Game.hitboxesInBox(this.x, this.y, this.hitBoxes, gameInfo.enemies[i].squareBox[0] + gameInfo.enemies[i].x, gameInfo.enemies[i].squareBox[1] + gameInfo.enemies[i].y, gameInfo.enemies[i].squareBox[2], gameInfo.enemies[i].squareBox[3])) {
                    this.hit();
                    gameInfo.enemies[i].hit();
                    break;
                }
            }
        }

        //Fall animation
        if (this.dying && this.alive) {
            gameInfo.particles.push(new ExplosionParticle(this.x - 10, this.y, 20));
            this.y += time / 8;
        }

        //Dead
        if (gameInfo.terrain.hitboxesIsInTerrain(this.x, this.y, this.hitBoxes)) {
            if (this.invulnerable < 0) {
                if (this.alive) {
                    this.health--;
                    if (this.health <= 0) {
                        this.alive = false;
                    }
                    gameInfo.particles.push(new ExplosionParticle(this.x, this.y, 100));
                    gameInfo.terrain.flashColor = [100, 80, 60];
                    for (let i = 0; i < 30; i++) {
                        gameInfo.particles.push(new ExplosionParticle(this.x - Math.round(Math.random() * 10 - 5), this.y - Math.round(Math.random() * 10 - 5), 40));
                    }

                    if (this.alive) {
                        this.dying = false;
                        this.spawn();
                    }
                }
            } else {
                this.y += gameInfo.terrain.toOutsideTerrain(this.x, this.y, this.hitBoxes);
            }
        }
    }

    hit() {
        if (this.invulnerable < 0) {
            this.dying = true;
            this.lerpToRotation = Math.PI / 4;
        }
    }

    didHit() {
        this.power = Math.min(10000, this.power + 500);
    }

    spawn() {
        this.invulnerable = 5000;
        this.spawning = 500;
        this.x = -100;
        this.y = Math.random() * 180 + 270;
    }

    draw() {
        if (this.alive) {
            Game.drawOn.translate(this.x - 10, this.y);
            Game.drawOn.rotate(this.rotation);
            if (this.invulnerable > 0) {
                Game.drawOn.fillStyle = Game.colorStringify(Game.colorLight(this.rawColor, 1 + this.invulnerableAnimation / 600));
            } else {
                Game.drawOn.fillStyle = Game.colorStringify(this.rawColor);
            }
            Game.drawOn.beginPath();
            Game.drawOn.moveTo(10, 0);
            Game.drawOn.lineTo(-10, -10);
            Game.drawOn.lineTo(-5, 0);
            Game.drawOn.lineTo(-10, 10);
            Game.drawOn.lineTo(10, 0);
            Game.drawOn.fill();
            Game.drawOn.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    drawHealth(x, y) {
        Game.drawOn.fillStyle = "#000";
        Game.drawOn.fillRect(x, y, 80, 30);
        Game.drawOn.fillStyle = Game.colorStringify(Game.colorLight(this.rawColor, 0.7));
        Game.drawOn.fillRect(x, y, this.power / 10000 * 80, 30);

        Game.drawOn.fillStyle = Game.colorStringify(this.rawColor);
        Game.drawOn.beginPath();
        Game.drawOn.moveTo(x + 25, y + 15);
        Game.drawOn.lineTo(x + 5, y + 5);
        Game.drawOn.lineTo(x + 10, y + 15);
        Game.drawOn.lineTo(x + 5, y + 25);
        Game.drawOn.lineTo(x + 25, y + 15);
        Game.drawOn.fill();

        Game.drawOn.textAlign = "Center";
        Game.drawOn.textBaseline = "Middle";
        Game.drawOn.font = "20px Verdana";
        Game.drawOn.fillStyle = "#fff";
        Game.drawOn.fillText(this.health, x + 60, 16 + y);
    }
}