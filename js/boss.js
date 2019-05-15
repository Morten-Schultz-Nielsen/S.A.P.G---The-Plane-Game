class BaseBoss {
    constructor(squareBox, health) {
        this.squareBox = squareBox;
        this.x = 1400;
        this.y = 360;
        this.spawnTimer = 2500;
        this.health = health;
        this.hitTimer = 0;
        this.rotation = 0;
        this.dying = false;
        this.particles = [];
        this.startHealth = health;
    }

    startUpdate(time, movement, gameInfo) {
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].startUpdate(time, movement)) {
                this.particles.splice(i, 1);
                i--;
            }
        }

        if (this.spawnTimer > 0) {
            this.spawnTimer -= time;
            this.x -= movement;
        }
        return this.update(time, movement, gameInfo);
    }

    hit() {
        this.health--;
        this.hitTimer = 100;
    }

    startDraw() {
        Game.drawOn.translate(this.x, this.y);
        Game.drawOn.rotate(this.rotation);
        this.draw();
        Game.drawOn.setTransform(1, 0, 0, 1, 0, 0);

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].startDraw();
        }
    }
}

class FirstBoss extends BaseBoss {
    constructor(healthMultiplier) {
        super([-85, -85, 170, 170], 150 * healthMultiplier);
        this.superRotationCooldown = 7500;
        this.superRotation = 0;
        this.shotCooldown = 1000;
        this.moveDirection = 0;
        this.screenFlash = 0;
    }

    update(time, movement, gameInfo) {
        this.rotation += time / 1000;

        if (!this.dying) {
            this.superRotationCooldown -= time;
            if (this.superRotationCooldown < 0) {
                this.superRotation = 1000;
                this.superRotationCooldown = 7500;
            }

            let movementSpeed = 0.1;
            if (this.superRotation > 0) {
                this.superRotation -= time;
                this.shotCooldown -= time * 20;
                this.rotation += time / 10000 * this.superRotation / 5;
                movementSpeed = 0.5;
                if (this.superRotation > 0) {
                    if (this.y < 300) {
                        this.moveDirection = 0;
                    } else if (this.y > 420) {
                        this.moveDirection = 1;
                    }
                }
            }

            if (this.health < this.startHealth / 2) {
                this.superRotationCooldown -= time;
                if (this.moveDirection === 0) {
                    this.y += time * movementSpeed;
                    if (this.y > 600) {
                        this.y = 600;
                        this.moveDirection = 1;
                    }
                } else {
                    this.y -= time * movementSpeed;
                    if (this.y < 120) {
                        this.y = 120;
                        this.moveDirection = 0;
                    }
                }
            }

            this.shotCooldown -= time;
            while (this.shotCooldown < 0) {
                this.shotCooldown += 1000;
                this.shoot(gameInfo);
            }

            if (this.health < 0) {
                this.dying = true;
            }
        } else {
            this.screenFlash -= time;
            if (this.screenFlash < 0) {
                this.screenFlash = 200;
                gameInfo.terrain.flashColor = [100, 80, 60];
            }
            this.x -= movement;
            this.y += 0.1 * time;
            this.particles.push(new ExplosionParticle(this.x - Math.round(Math.random() * 160 - 80), this.y - Math.round(Math.random() * 160 - 80), 60));
            if (this.y > 660) {
                gameInfo.terrain.flashColor = [150, 20, 20];
                gameInfo.terrain.flashCounter = -200;
                gameInfo.particles.push(new ExplosionParticle(this.x - Math.round(Math.random() * 160 - 80), this.y - Math.round(Math.random() * 160 - 80), 100));
                for (let i = 0; i < 20; i++) {
                    gameInfo.particles.push(new ExplosionParticle(this.x - Math.round(Math.random() * 160 - 80), this.y - Math.round(Math.random() * 160 - 80), 60));
                }
                return true;
            }
        }
    }

    shoot(gameInfo) {
        let shootingPoints = [[-90, 0], [0, 90], [90, 0], [0, -90]];
        shootingPoints = Game.rotateHitboxes(shootingPoints, this.rotation);
        for (let i = 0; i < 4; i++) {
            gameInfo.shots.push(new NormalEnemyShot(shootingPoints[i][0] + this.x, this.y - shootingPoints[i][1], this.rotation + Math.PI / 2 * i));
        }
    }

    draw() {
        Game.drawOn.beginPath();
        Game.drawOn.fillStyle = "#f20";
        Game.drawOn.lineWidth = 5;
        Game.drawOn.strokeStyle = "#300";
        Game.drawOn.arc(0, 0, 80, 0, Math.PI * 2);
        Game.drawOn.fill();

        Game.drawOn.beginPath();
        Game.drawOn.fillStyle = "#fa0";
        Game.drawOn.moveTo(0, 0);
        Game.drawOn.arc(0, 0, 80, Math.PI / 4, Math.PI / 4 + Math.PI * 2 * (1 - this.health / this.startHealth));
        Game.drawOn.moveTo(0, 0);
        Game.drawOn.fill();

        Game.drawOn.beginPath();
        Game.drawOn.arc(0, 0, 80, 0, Math.PI * 2);
        Game.drawOn.stroke();

        Game.drawOn.lineWidth = 20;
        Game.drawOn.strokeStyle = "#300";
        Game.drawOn.beginPath();
        Game.drawOn.moveTo(-90, 0);
        Game.drawOn.lineTo(90, 0);
        Game.drawOn.moveTo(0, -90);
        Game.drawOn.lineTo(0, 90);
        Game.drawOn.stroke();
    }
}

class SecondBoss extends BaseBoss {
    constructor(healthMultiplier) {
        super([-80, -80, 160, 160], 200 * healthMultiplier);
        this.lazerCooldown = 4000;
        this.lastLazer = 0;
        this.secondPhaseStartAnimation = null;
        this.canonOffset = 0;
        this.dying = false;
        this.deathAnimation = 0;
        this.halfSize = 80;
        this.phase = 0;
        this.firstLazerShot = 0;
        this.secondLazerShot = 0;
        this.firstLazerStarted = 0;
        this.secondLazerStarted = 0;
    }

    update(time, movement, gameInfo) {
        this.firstLazerShot = Math.max(0, this.firstLazerShot - time);
        this.secondLazerShot = Math.max(0, this.secondLazerShot - time);
        this.firstLazerStarted = Math.max(0, this.firstLazerStarted - time);
        this.secondLazerStarted = Math.max(0, this.secondLazerStarted - time);

        if (this.firstLazerShot === 0 && this.secondLazerShot === 0) {
            if (this.health <= this.startHealth / 2 && this.health > 0) {
                this.phase = 1;
            } else if (this.health <= 0) {
                this.phase = 2;
            }
        }
        if (this.phase === 0) {
            //First phase
            this.lazerCooldown -= time;
            if (this.lazerCooldown < 0) {
                this.lazerCooldown = 4000;
                if (this.lastLazer === 0) {
                    gameInfo.shots.push(new Lazer(this.x - 80, this.y, Math.PI * 1.5, Math.PI, 2000));
                    this.firstLazerShot = 2000;
                    this.firstLazerStarted = 200;
                    this.lastLazer = 1;
                } else {
                    gameInfo.shots.push(new Lazer(this.x - 80, this.y, Math.PI * 0.5, Math.PI, 2000));
                    this.firstLazerShot = 2000;
                    this.firstLazerStarted = 200;
                    this.lastLazer = 0;
                }
            }
        } else if (this.phase === 1) {
            //Second phase
            if (this.secondPhaseStartAnimation === null) {
                this.secondPhaseStartAnimation = 1000;
                this.lastLazer = 0;
                this.lazerCooldown = 2000;
            } else if (this.secondPhaseStartAnimation > 0) {
                //animation
                this.secondPhaseStartAnimation -= time;
                if (this.secondPhaseStartAnimation > 500) {
                    this.rotation = Math.PI / 2 * (1 - (this.secondPhaseStartAnimation - 500) / 500);
                } else {
                    this.rotation = Math.PI / 2;
                    this.canonOffset = 80 * (1 - this.secondPhaseStartAnimation / 500);
                }
            } else {
                //Run second phase
                this.canonOffset = 80;
                this.lazerCooldown -= time;
                if (this.lazerCooldown <= 0) {
                    this.lazerCooldown = 2500;
                    switch (this.lastLazer) {
                        case 0:
                            gameInfo.shots.push(new Lazer(this.x - 80, this.y - 80, Math.PI * 0.5, Math.PI * 1.03, 2000));
                            this.firstLazerShot = 2000;
                            this.firstLazerStarted = 200;
                            break;
                        case 1:
                            gameInfo.shots.push(new Lazer(this.x - 80, this.y + 80, Math.PI * 1.5, Math.PI * 0.97, 2000));
                            this.secondLazerShot = 2000;
                            this.secondLazerStarted = 200;
                            break;
                        case 2:
                            gameInfo.shots.push(new Lazer(this.x - 80, this.y + 80, Math.PI * 1.5, Math.PI, 2000));
                            gameInfo.shots.push(new Lazer(this.x - 80, this.y - 80, Math.PI * 0.5, Math.PI, 2000));
                            this.firstLazerShot = 2000;
                            this.firstLazerStarted = 200;
                            this.secondLazerShot = 2000;
                            this.secondLazerStarted = 200;
                            break;
                    }
                    //Crazy lazer
                    if (this.lastLazer >= 3) {
                        let shot = (this.lastLazer - 3) / 4;
                        gameInfo.shots.push(new Lazer(this.x - 80, this.y + 80, Math.PI * 1.5 - shot, Math.PI * 1.5 - shot, 800));
                        gameInfo.shots.push(new Lazer(this.x - 80, this.y - 80, Math.PI * 0.5 + shot, Math.PI * 0.5 + shot, 800));
                        this.firstLazerShot = 800;
                        this.secondLazerShot = 800;
                        if (this.lastLazer === 3) {
                            this.firstLazerStarted = 200;
                            this.secondLazerStarted = 200;
                        }
                        if (this.lastLazer !== 15) {
                            this.lazerCooldown = 200;
                        }
                    }
                    this.lastLazer = (this.lastLazer + 1) % 14;
                }
            }
        } else {
            this.deathAnimation -= time;
            //Dead
            if (!this.dying) {
                this.dying = true;
                this.deathAnimation = 3000;
                this.lastLazer = 0;
            }
            if (this.deathAnimation > 2500) {
                this.canonOffset = 80 * ((this.deathAnimation - 2500) / 500);
            } else {
                this.canonOffset = 0;
                this.halfSize = 80 * this.deathAnimation / 2500;
                if (this.lastLazer === 0) {
                    gameInfo.shots.push(new Lazer(this.x, this.y, Math.PI * 1.5, Math.PI * 1.5, 2500));
                    gameInfo.shots.push(new Lazer(this.x, this.y, Math.PI * 0.5, Math.PI * 0.5, 2500));
                    this.firstLazerStarted = 200;
                    this.secondLazerStarted = 200;
                    this.firstLazerShot = 3000;
                    this.secondLazerShot = 3000;
                    this.lastLazer = 1;
                }
                if (this.deathAnimation <= 0) {
                    gameInfo.terrain.flashColor = [150, 20, 20];
                    gameInfo.terrain.flashCounter = -200;
                    for (let i = 0; i < 20; i++) {
                        gameInfo.particles.push(new ExplosionParticle(this.x - Math.round(Math.random() * 160 - 80), this.y - Math.round(Math.random() * 160 - 80), 100));
                        gameInfo.particles.push(new ExplosionParticle(this.x - Math.round(Math.random() * 160 - 80), this.y - Math.round(Math.random() * 160 - 80), 60));
                    }
                    return true;
                }
            }
        }
    }

    draw() {
        let negativeHalfSize = this.halfSize * -1;
        let fullSize = this.halfSize * 2;
        let quarterSize = this.halfSize / 2;
        let halfQuarter = quarterSize / 2;
        Game.drawOn.beginPath();
        Game.drawOn.fillStyle = "#a0f";
        Game.drawOn.strokeStyle = "#000";
        Game.drawOn.lineWidth = 5;
        Game.drawOn.rect(negativeHalfSize, negativeHalfSize, fullSize, fullSize);
        Game.drawOn.fill();
        Game.drawOn.stroke();

        if (this.firstLazerStarted === 0) {
            if (this.firstLazerShot === 0) {
                Game.drawOn.fillStyle = Game.colorStringify([255, 0, 44]);
            } else if (this.firstLazerShot < 200) {
                Game.drawOn.fillStyle = Game.colorStringify(Game.colorLight([255, 0, 44], 1 - 0.5 * this.firstLazerShot / 200));
            } else {
                Game.drawOn.fillStyle = Game.colorStringify(Game.colorLight([255, 0, 44], 0.5));
            }
        } else {
            Game.drawOn.fillStyle = Game.colorStringify(Game.colorLight([255, 0, 44], 0.5 + 0.5 * this.firstLazerStarted / 200));
        }
        Game.drawOn.beginPath();
        Game.drawOn.arc(negativeHalfSize, 0 + this.canonOffset, halfQuarter, 0, Math.PI * 2);
        Game.drawOn.fill();
        Game.drawOn.stroke();

        if (this.secondLazerStarted === 0) {
            if (this.secondLazerShot === 0) {
                Game.drawOn.fillStyle = Game.colorStringify([255, 0, 44]);
            } else if (this.secondLazerShot < 200) {
                Game.drawOn.fillStyle = Game.colorStringify(Game.colorLight([255, 0, 44], 1 - 0.5 * this.secondLazerShot / 200));
            } else {
                Game.drawOn.fillStyle = Game.colorStringify(Game.colorLight([255, 0, 44], 0.5));
            }
        } else {
            Game.drawOn.fillStyle = Game.colorStringify(Game.colorLight([255, 0, 44], 0.5 + 0.5 * this.secondLazerStarted / 200));
        }
        Game.drawOn.beginPath();
        Game.drawOn.arc(this.halfSize, 0 + this.canonOffset, halfQuarter, 0, Math.PI * 2);
        Game.drawOn.fill();
        Game.drawOn.stroke();     

        Game.drawOn.fillStyle = "#f04";
        Game.drawOn.beginPath();
        Game.drawOn.arc(0, 0, quarterSize, 0, Math.PI * 2);
        Game.drawOn.fill();

        let percentHealth = (1 - this.health / this.startHealth);
        Game.drawOn.fillStyle = "#000";
        Game.drawOn.beginPath();
        Game.drawOn.arc(0, 0, quarterSize, Math.PI * -2 * percentHealth / 2 + Math.PI * 1.5, Math.PI * 2 * percentHealth / 2 + Math.PI * 1.5);
        Game.drawOn.fill();

        Game.drawOn.beginPath();
        Game.drawOn.arc(0, 0, quarterSize, 0, Math.PI * 2);
        Game.drawOn.stroke();  
    }
}