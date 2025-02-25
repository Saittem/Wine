function playGame(){
    playButton.style.display = "";
    playButton.style.animation = "playButtonOpacity 250ms ease-in";
}

playButton.addEventListener("click", function(){
    document.getElementById("page").style.display = "none";
    
    let config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0xF5F5F5,
        physics: {
            default: "arcade",
            arcade: { debug: false }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    
    let Spongeimage;
    let prevX, prevY;
    let splash;
    let lastDetectionTime = 0;
    let score = 0;
    let waterAmount = 100;
    let overlap;
    let refillZone;
    let refillZoneImage;
    let refillZoneWidth;
    let lastCollisionTime = 0;
    let splashResetDelay = 1000;
    let timeInRefillZone = 0;
    let refillRate = 500;
    let refillAmount = 20;
    let timeLeft = 60;
    let fireObstacles = [];
    let maxFires = 4;
    let lastFireCollisionTime = 0;
    let fireCooldown = 2000;
    let spongeSound;
    let waterSound;
    let canPlaySpongeSound;
    let canPlayWaterSound;
    
    let gameOverPopup;
    let refreshButton;
    let startGamePopup;
    let startGameButton;
    
    function preload() {
        this.load.image('playerImage', 'Assets/sponge.png');
        this.load.image('splashImage', 'Assets/wine-splash.svg');
        this.load.image('refillZoneImage', 'Assets/water.png');
        this.load.image('fireImage', 'Assets/fire.png');
        this.load.image('carpet', 'Assets/carpet.png');

        this.load.audio('spongeSound',  'Assets/sponge-sound-effect.mp3');
        this.load.audio('waterSound', 'Assets/water-sound-effect.mp3');
    }
    
    function create() {
        this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'carpet').setDisplaySize(window.innerWidth, window.innerHeight).setDepth(-1);
    
        spongeSound = this.sound.add("spongeSound");
        canPlaySpongeSound = true;

        spongeSound.on('complete', () => {
            canPlaySpongeSound = true;
        });

        waterSound = this.sound.add("waterSound");
        canPlayWaterSound = true;

        waterSound.on('complete', () => {
            canPlayWaterSound = true;
        });

        createStartGamePopup();
        createGameOverPopup();
    
        this.scene.pause();
    }
    
    function update() {
        Spongeimage.setVelocity(0);
        Spongeimage.x = this.input.mousePointer.x;
        Spongeimage.y = this.input.mousePointer.y;
        Spongeimage.rotation = -50;
    
        if (isInRefillZone()) {
            timeInRefillZone += this.game.loop.delta;
            if (timeInRefillZone >= refillRate && waterAmount < 100) {
                waterAmount = Math.min(100, waterAmount + refillAmount);
                waterText.setText(`Water: ${waterAmount}%`);

                if (canPlayWaterSound){
                    waterSound.play();
                    canPlayWaterSound = false;
                }

                timeInRefillZone = 0;
                moveFireObstacles.call(this);
            }
        } else {
            timeInRefillZone = 0;
        }
    }
    
    function detectMovement(player, splash) {
        let currentTime = this.time.now;
        if (waterAmount === 0) return;
        if (currentTime - lastDetectionTime >= 150) {
            if (player.x !== prevX || player.y !== prevY) {
                lastDetectionTime = currentTime;
                splash.setAlpha(splash.alpha - 0.1);
                
                if(canPlaySpongeSound){
                    spongeSound.play();
                    canPlaySpongeSound = false;
                }

                if (splash.alpha <= 0) {
                    splash.destroy();
                    spawnNewSplash.call(this);
                    score++;
                    scoreText.setText(`Score: ${score}`);
                    waterAmount = Math.max(0, waterAmount - 10);
                    waterText.setText(`Water: ${waterAmount}%`);
                    timeLeft += 5;
                    timerText.setText(`Time: ${timeLeft}`);
                    if (waterAmount === 0) {
                        this.physics.world.removeCollider(overlap);
                    }
                }
                lastCollisionTime = currentTime;
            }
        }
        prevX = player.x;
        prevY = player.y;
    }
    
    function updateTimer() {
        timeLeft--;
        timerText.setText(`Time: ${timeLeft}`);
        if (timeLeft <= 0) gameOver.call(this);
    }
    
    function gameOver() {
        this.physics.pause();
        showGameOverPopup();
    }
    
    function spawnNewSplash() {
        let randomX, randomY;
        let isValidPosition = false;
    
        do {
            randomX = Phaser.Math.Between(300, window.innerWidth - 100);
            randomY = Phaser.Math.Between(100, window.innerHeight - 100);
    
            let splashBounds = new Phaser.Geom.Rectangle(randomX - 50, randomY - 50, 100, 100);
    
            isValidPosition = fireObstacles.every(fire => {
                let fireBounds = fire.getBounds();
                return getDistanceBetweenRectangles(splashBounds, fireBounds) >= 100;
            });
    
            let refillBounds = refillZone.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(splashBounds, refillBounds)) {
                isValidPosition = false;
            }
        } while (!isValidPosition);
    
        splash = this.physics.add.staticImage(randomX, randomY, 'splashImage').setAlpha(1).setScale(1).setDepth(0);
        if (waterAmount > 0) overlap = this.physics.add.overlap(Spongeimage, splash, detectMovement, null, this);
    }
    
    function spawnFireObstacles() {
        while (fireObstacles.length < maxFires) {
            let fire;
            let isValidPosition = false;
    
            do {
                let randomX = Phaser.Math.Between(200, window.innerWidth - 200);
                let randomY = Phaser.Math.Between(200, window.innerHeight - 200);
                fire = this.physics.add.image(randomX, randomY, 'fireImage');
    
                let refillBounds = refillZone.getBounds();
                let fireBounds = fire.getBounds();
                let isInRefillZone = Phaser.Geom.Intersects.RectangleToRectangle(fireBounds, refillBounds);
    
                let splashBounds = splash.getBounds();
                let isNearSplash = getDistanceBetweenRectangles(fireBounds, splashBounds) < 100;
    
                let isNearOtherFires = fireObstacles.some(existingFire => {
                    let existingFireBounds = existingFire.getBounds();
                    return getDistanceBetweenRectangles(fireBounds, existingFireBounds) < 100;
                });
    
                if (!isInRefillZone && !isNearSplash && !isNearOtherFires) {
                    isValidPosition = true;
                } else {
                    fire.destroy();
                }
            } while (!isValidPosition);
    
            fire.setScale(0.15);
            fireObstacles.push(fire);
            this.physics.add.overlap(Spongeimage, fire, touchFire, null, this);
        }
    }
    
    function getDistanceBetweenRectangles(rect1, rect2) {
        let rect1CenterX = rect1.x + rect1.width / 2;
        let rect1CenterY = rect1.y + rect1.height / 2;
        let rect2CenterX = rect2.x + rect2.width / 2;
        let rect2CenterY = rect2.y + rect2.height / 2;
        let dx = rect1CenterX - rect2CenterX;
        let dy = rect1CenterY - rect2CenterY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    function touchFire(player, fire) {
        let currentTime = this.time.now;
    
        if (currentTime - lastFireCollisionTime >= fireCooldown) {
            waterAmount = Math.max(0, waterAmount);
            waterText.setText(`Water: ${waterAmount}%`);
            timeLeft = Math.max(0, timeLeft - 10);
            timerText.setText(`Time: ${timeLeft}`);
            lastFireCollisionTime = currentTime;
    
            if (waterAmount === 0) {
                this.physics.world.removeCollider(overlap);
            }
        }
    }
    
    function isInRefillZone() {
        let spongeBounds = Spongeimage.getBounds();
        let refillBounds = refillZone.getBounds();
        return (
            spongeBounds.left >= refillBounds.left &&
            spongeBounds.right <= refillBounds.right &&
            spongeBounds.top >= refillBounds.top &&
            spongeBounds.bottom <= refillBounds.bottom
        );
    }
    
    function moveFireObstacles() {
        fireObstacles.forEach(fire => {
            let newX, newY;
            let isValidPosition = false;
    
            do {
                newX = Phaser.Math.Between(200, window.innerWidth - 200);
                newY = Phaser.Math.Between(200, window.innerHeight - 200);
    
                let fireBounds = new Phaser.Geom.Rectangle(newX - 50, newY - 50, 100, 100);
    
                let refillBounds = refillZone.getBounds();
                let isInRefillZone = Phaser.Geom.Intersects.RectangleToRectangle(fireBounds, refillBounds);
    
                let splashBounds = splash.getBounds();
                let isNearSplash = getDistanceBetweenRectangles(fireBounds, splashBounds) < 100;
    
                let isNearOtherFires = fireObstacles.some(existingFire => {
                    if (existingFire === fire) return false;
                    let existingFireBounds = existingFire.getBounds();
                    return getDistanceBetweenRectangles(fireBounds, existingFireBounds) < 100;
                });
    
                if (!isInRefillZone && !isNearSplash && !isNearOtherFires) {
                    isValidPosition = true;
                }
            } while (!isValidPosition);
    
            fire.setPosition(newX, newY);
        });
    }
    
    function createStartGamePopup() {
        startGamePopup = document.createElement('div');
        startGamePopup.style.position = 'fixed';
        startGamePopup.style.top = '50%';
        startGamePopup.style.left = '50%';
        startGamePopup.style.transform = 'translate(-50%, -50%)';
        startGamePopup.style.backgroundColor = 'white';
        startGamePopup.style.padding = '20px';
        startGamePopup.style.border = '2px solid black';
        startGamePopup.style.borderRadius = '10px';
        startGamePopup.style.textAlign = 'center';
        startGamePopup.style.zIndex = '1000';
    
        let message = document.createElement('p');
        message.textContent = 'Tato hra je o čištění skvrn od vína z koberce houbičkou. Vaše houbička má ale jenom omezené množství vody takže si ji budete muset doplňovat, ale musíte ji namočit celou. Dávajte si ale pozor na oheň co je na koberci, asi nějakej blb si hrál se sirkama.';
        message.style.fontSize = '18px';
        message.style.marginBottom = '20px';
        startGamePopup.appendChild(message);
    
        startGameButton = document.createElement('button');
        startGameButton.textContent = 'Start Game';
        startGameButton.style.fontSize = '18px';
        startGameButton.style.padding = '10px 20px';
        startGameButton.style.cursor = 'pointer';
        startGameButton.addEventListener('click', () => {
            hideStartGamePopup();
            initializeGame();
        });
        startGamePopup.appendChild(startGameButton);
    
        document.body.appendChild(startGamePopup);
    }
    
    function hideStartGamePopup() {
        startGamePopup.style.display = 'none';
    }
    
    function initializeGame() {
        refillZoneWidth = window.innerWidth * 0.15;
        refillZoneImage = game.scene.scenes[0].add.image(refillZoneWidth / 2, window.innerHeight / 2, 'refillZoneImage');
        refillZoneImage.setDisplaySize(refillZoneWidth, window.innerHeight).setDepth(0);
        refillZone = game.scene.scenes[0].add.rectangle(refillZoneWidth / 2, window.innerHeight / 2, refillZoneWidth, window.innerHeight);
        game.scene.scenes[0].physics.add.existing(refillZone, true);
        refillZone.visible = false;
    
        Spongeimage = game.scene.scenes[0].physics.add.image(0, 0, 'playerImage');
        Spongeimage.setScale(0.2);
        Spongeimage.setCollideWorldBounds(true);
        Spongeimage.setDepth(1);
    
        prevX = Spongeimage.x;
        prevY = Spongeimage.y;
    
        spawnNewSplash.call(game.scene.scenes[0]);
        spawnFireObstacles.call(game.scene.scenes[0]);
    
        scoreText = game.scene.scenes[0].add.text(window.innerWidth - 250, 10, `Score: ${score}`, { fontSize: '32px', fill: '#fff', fontStyle: 'bold' }).setDepth(2);
        waterText = game.scene.scenes[0].add.text(window.innerWidth - 250, 50, `Water: ${waterAmount}%`, { fontSize: '32px', fill: '#fff', fontStyle: 'bold' }).setDepth(2);
        timerText = game.scene.scenes[0].add.text(window.innerWidth / 2, 10, `Time: ${timeLeft}`, { fontSize: '32px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5, 0);
    
        overlap = game.scene.scenes[0].physics.add.overlap(Spongeimage, splash, detectMovement, null, game.scene.scenes[0]);
        game.scene.scenes[0].time.addEvent({ delay: 1000, callback: updateTimer, callbackScope: game.scene.scenes[0], loop: true });
    
        game.scene.scenes[0].scene.resume();
    }
    
    function createGameOverPopup() {
        gameOverPopup = document.createElement('div');
        gameOverPopup.style.position = 'fixed';
        gameOverPopup.style.top = '50%';
        gameOverPopup.style.left = '50%';
        gameOverPopup.style.transform = 'translate(-50%, -50%)';
        gameOverPopup.style.backgroundColor = 'white';
        gameOverPopup.style.padding = '20px';
        gameOverPopup.style.border = '2px solid black';
        gameOverPopup.style.borderRadius = '10px';
        gameOverPopup.style.textAlign = 'center';
        gameOverPopup.style.zIndex = '1000';
        gameOverPopup.style.display = 'none';
    
        let message = document.createElement('p');
        message.textContent = 'Game Over!';
        message.style.fontSize = '24px';
        message.style.marginBottom = '20px';
        gameOverPopup.appendChild(message);
    
        refreshButton = document.createElement('button');
        refreshButton.textContent = 'Restart stránky';
        refreshButton.style.fontSize = '18px';
        refreshButton.style.padding = '10px 20px';
        refreshButton.style.cursor = 'pointer';
        refreshButton.addEventListener('click', () => {
            location.reload();
        });
        gameOverPopup.appendChild(refreshButton);
    
        document.body.appendChild(gameOverPopup);
    }
    
    function showGameOverPopup() {
        gameOverPopup.style.display = 'block';
    }
    
    function hideGameOverPopup() {
        gameOverPopup.style.display = 'none';
    }
    
    let game = new Phaser.Game(config);   
});

