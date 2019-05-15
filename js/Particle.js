class BaseParticle {
    constructor(x, y, xMotion, yMotion, rotationSpeed) {
        this.x = x;
        this.y = y;
        this.xMotion = xMotion;
        this.yMotion = yMotion;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = rotationSpeed;
        this.totalTimeAlive = 0;
    }

    startUpdate(time, movement) {
        this.x += this.xMotion * time - movement;
        this.y += this.yMotion * time;
        this.rotation += this.rotationSpeed * time;
        this.totalTimeAlive += time;
        return this.update(time);
    }

    update(time) {
        return false;
    }

    startDraw() {
        Game.drawOn.translate(this.x, this.y);
        Game.drawOn.rotate(this.rotation);
        this.draw();
        Game.drawOn.setTransform(1,0,0,1,0,0);
    }

    draw() {

    }
}

class ExplosionParticle extends BaseParticle {
    constructor(x, y, size) {
        super(x, y, Math.random() * 0.05 - 0.025, Math.random() * 0.05 - 0.025, Math.random() * 0.01 - 0.005);
        this.size = Math.round(Math.random() * size / 2 + size / 2);
        this.rawColor = [255, Math.floor(Math.random() * 255), 0];
        this.effectOffset = Math.floor(Math.random() * 300);
    }

    update(time) {
        return (this.totalTimeAlive >= 1000 + this.effectOffset);
    }

    draw() {
        //Get color and size
        let useColor;
        let displaySize = this.size;
        if (this.totalTimeAlive < 150 + this.effectOffset) {
            let percentDone = this.totalTimeAlive / (150 + this.effectOffset);
            useColor = Game.colorLight(this.rawColor, 2 - percentDone);
            displaySize = percentDone * this.size;
        } else if (this.totalTimeAlive >= 150 + this.effectOffset && this.totalTimeAlive < 500 + this.effectOffset) {
            useColor = this.rawColor;
        } else if (this.totalTimeAlive >= 500 + this.effectOffset) {
            let percentDone = (this.totalTimeAlive - 500 - this.effectOffset) / (500 + this.effectOffset);
            let slerpPercent = Math.pow((1 - percentDone), 5);

            displaySize = slerpPercent * this.size;
            useColor = Game.colorLight(this.rawColor, slerpPercent);
        }
        let halfSize = displaySize / -2;

        //Draw particle
        Game.drawOn.fillStyle = Game.colorStringify(useColor);
        Game.drawOn.fillRect(halfSize, halfSize, displaySize, displaySize);
    }
}

class LazerParticle extends BaseParticle {
    constructor(x, y) {
        super(x, y, Math.random() * 0.05 - 0.025, Math.random() * 0.05 - 0.025, Math.random() * 0.01 - 0.005);
        this.size = Math.round(Math.random() * 10 + 10);
        this.color = Game.colorStringify([Math.random() * 100 + 155, 0, 0]);
    }

    update() {
        return (this.totalTimeAlive >= 100);
    }

    draw() {
        let halfSize = this.size / -2;
        Game.drawOn.fillStyle = this.color;
        Game.drawOn.fillRect(halfSize, halfSize, this.size, this.size);
    }
}

class FireParticle extends BaseParticle {
    constructor(x, y, xMotion, yMotion, rawColor) {
        super(x, y, xMotion, yMotion, Math.random() * 0.01 - 0.005);
        this.baseSize = Math.round(Math.random() * 5 + 5);
        this.size = this.baseSize;
        this.color = Game.colorStringify(Game.colorLight(rawColor, 1 - Math.random() * 0.5));
    }

    update() {
        this.size = (1 - this.totalTimeAlive / 200) * this.baseSize;
        return (this.totalTimeAlive >= 200);
    }

    draw() {
        let halfSize = this.size / -2;
        Game.drawOn.fillStyle = this.color;
        Game.drawOn.fillRect(halfSize, halfSize, this.size, this.size);
    }
}