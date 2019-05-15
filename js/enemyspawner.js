class EnemySpawner {
    constructor(enemyList) {
        this.enemyList = enemyList;
        this.timeTillNextBatch = 0;
        this.batchSize = 1;
        this.randomSpawnTimer = 1000;
        this.spawns = [
            { id: 0, baseWeight: 1, levelWeightAdder: 1, unlockLevel: 1 },
            { id: 1, baseWeight: 0.5, levelWeightAdder: 1, unlockLevel: 2 },
            { id: 2, baseWeight: 1, levelWeightAdder: 1.1, unlockLevel: 4 },
            { id: 1, baseWeight: 2, levelWeightAdder: 1, unlockLevel: 6 },
            { id: 3, baseWeight: 3, levelWeightAdder: 1.1, unlockLevel: 8 },
            { id: 4, baseWeight: 5, levelWeightAdder: 1.2, unlockLevel: 14 },
            { id: 5, baseWeight: 8, levelWeightAdder: 1.2, unlockLevel: 18 },
            { id: 6, baseWeight: 20, levelWeightAdder: 1, unlockLevel: 24 }
        ];
    }


    spawnEnemy(id, height) {
        switch (id) {
            case 0:
                this.enemyList.push(new NormalEnemy(1300, height));
                break;
            case 1:
                this.enemyList.push(new SpeedPlane(1300, height, false));
                break;
            case 2:
                this.enemyList.push(new ShooterBall(1300, height, false));
                break;
            case 3:
                this.enemyList.push(new GroundCanon(1300, height, false));
                break;
            case 4:
                this.enemyList.push(new ShooterBall(1300, height, true));
                break;
            case 5:
                this.enemyList.push(new GroundCanon(1300, height, true));
                break;
            case 6:
                this.enemyList.push(new SpeedPlane(1300, height, true));
                break;
        }
    }

    update(time, gameInfo) {
        //Batch timer
        this.timeTillNextBatch -= time;
        this.randomSpawnTimer -= time;
        if (this.timeTillNextBatch <= 0 && (this.boss === null || this.enemyList.length <= 10)) {
            this.timeTillNextBatch = Math.random() * 10000; + 5000;
            let bottomHeight = gameInfo.terrain.yFromBottom(1300, 720) * -1;
            let topHeight = gameInfo.terrain.yFromTop(1300, 0) * -1;
            this.spawnEnemies(topHeight + 30, 720 - bottomHeight - 30, gameInfo, this.batchSize);

            this.batchSize = Math.floor(Math.random() * (3 + gameInfo.level / 5) + 1);
            if (gameInfo.boss !== null) {
                this.batchSize = Math.round(this.batchSize / 2);
            }
            this.timeTillNextBatch = Math.max(Math.random() * 500 + 750, Math.random() * 5000 + (3000 - gameInfo.level * 100));
        }
        if (this.randomSpawnTimer < 0 && gameInfo.boss !== null) {
            this.randomSpawnTimer = Math.random() * 5000 / (gameInfo.level / 5) + 5000 / (gameInfo.level / 5);
            let bottomHeight = gameInfo.terrain.yFromBottom(1300, 720) * -1;
            let topHeight = gameInfo.terrain.yFromTop(1300, 0) * -1;
            this.spawnEnemies(topHeight + 30, 720 - bottomHeight - 30, gameInfo, 1);
        }
    }

    spawnEnemies(minY, maxY, gameInfo, amount) {
        //Calculate weights
        let totalWeight = 0;
        for (let i = 0; i < this.spawns.length; i++) {
            if (this.spawns[i].unlockLevel <= gameInfo.level) {
                this.spawns[i].calculatedWeight = this.spawns[i].baseWeight + this.spawns[i].levelWeightAdder * (gameInfo.level - this.spawns[i].unlockLevel);
                totalWeight += this.spawns[i].calculatedWeight;
            }
        }

        //Spawn enemies
        for (let i = 0; i < amount; i++) {
            let randomNumber = Math.random() * (totalWeight);
            let spawnID = -1;
            for (let j = 0; j < this.spawns.length; j++) {
                if (this.spawns[j].unlockLevel <= gameInfo.level) {
                    if (this.spawns[j].calculatedWeight >= randomNumber) {
                        spawnID = this.spawns[j].id;
                        break;
                    }
                    randomNumber -= this.spawns[j].calculatedWeight;
                }
            }
            let randomHeight = Math.floor(Math.random() * (maxY - minY) + minY);
            this.spawnEnemy(spawnID, randomHeight);
        }
    }
}