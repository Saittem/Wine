let config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xF5F5F5,
    physics: {
        default: "arcade",
        arcade: { debug: true }
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

function preload() {
    this.load.image('playerImage', 'Assets/sponge.png');
    this.load.image('splashImage', 'Assets/wine-splash.svg');
    this.load.image('refillZoneImage', 'Assets/water.png');
    this.load.image('fireImage', 'Assets/fire.png'); // Added fireImage loading
}

function create() {
    refillZoneWidth = window.innerWidth * 0.15;
    refillZoneImage = this.add.image(refillZoneWidth / 2, window.innerHeight / 2, 'refillZoneImage');
    refillZoneImage.setDisplaySize(refillZoneWidth, window.innerHeight).setDepth(0);
    refillZone = this.add.rectangle(refillZoneWidth / 2, window.innerHeight / 2, refillZoneWidth, window.innerHeight);
    this.physics.add.existing(refillZone, true);
    refillZone.visible = false;

    Spongeimage = this.physics.add.image(0, 0, 'playerImage');
    Spongeimage.setScale(0.2);
    Spongeimage.setCollideWorldBounds(true);
    Spongeimage.setDepth(1);

    prevX = Spongeimage.x;
    prevY = Spongeimage.y;

    spawnNewSplash.call(this);
    spawnFireObstacles.call(this); // Spawn fire obstacles

    scoreText = this.add.text(window.innerWidth - 200, 10, `Score: ${score}`, { fontSize: '32px', fill: '#000' }).setDepth(2);
    waterText = this.add.text(window.innerWidth - 200, 50, `Water: ${waterAmount}%`, { fontSize: '32px', fill: '#000' }).setDepth(2);
    timerText = this.add.text(window.innerWidth / 2, 10, `Time: ${timeLeft}`, { fontSize: '32px', fill: '#000' }).setOrigin(0.5, 0);

    overlap = this.physics.add.overlap(Spongeimage, splash, detectMovement, null, this);
    this.time.addEvent({ delay: 1000, callback: updateTimer, callbackScope: this, loop: true });
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
            timeInRefillZone = 0;
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
    if (timeLeft <= 0) gameOver();
}

function gameOver() {
    this.physics.pause();
    this.add.text(window.innerWidth / 2 - 100, window.innerHeight / 2, "Game Over", { fontSize: "48px", fill: "#ff0000" });
}

function spawnNewSplash() {
    let randomX, randomY;
    let isValidPosition = false;

    do {
        // Generate a random position
        randomX = Phaser.Math.Between(300, window.innerWidth - 100);
        randomY = Phaser.Math.Between(100, window.innerHeight - 100);

        // Create a temporary bounds object for the splash
        let splashBounds = new Phaser.Geom.Rectangle(randomX - 50, randomY - 50, 100, 100);

        // Ensure the splash is not too close to any fire
        isValidPosition = fireObstacles.every(fire => {
            let fireBounds = fire.getBounds();
            return getDistanceBetweenRectangles(splashBounds, fireBounds) >= 100;
        });

        // Ensure the splash is not in the refill zone
        let refillBounds = refillZone.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(splashBounds, refillBounds)) {
            isValidPosition = false;
        }
    } while (!isValidPosition);

    // Create the splash at the valid position
    splash = this.physics.add.staticImage(randomX, randomY, 'splashImage').setAlpha(1).setScale(1).setDepth(0);
    if (waterAmount > 0) overlap = this.physics.add.overlap(Spongeimage, splash, detectMovement, null, this);
}

function spawnFireObstacles() {
    while (fireObstacles.length < maxFires) {
        let fire;
        let isValidPosition = false;

        do {
            // Generate a random position
            let randomX = Phaser.Math.Between(200, window.innerWidth - 200);
            let randomY = Phaser.Math.Between(200, window.innerHeight - 200);
            fire = this.physics.add.image(randomX, randomY, 'fireImage');

            // Ensure the fire is not in the refill zone
            let refillBounds = refillZone.getBounds();
            let fireBounds = fire.getBounds();
            let isInRefillZone = Phaser.Geom.Intersects.RectangleToRectangle(fireBounds, refillBounds);

            // Ensure the fire is not too close to the splash
            let splashBounds = splash.getBounds();
            let isNearSplash = getDistanceBetweenRectangles(fireBounds, splashBounds) < 100;

            // Ensure the fire is not too close to other fires
            let isNearOtherFires = fireObstacles.some(existingFire => {
                let existingFireBounds = existingFire.getBounds();
                return getDistanceBetweenRectangles(fireBounds, existingFireBounds) < 100;
            });

            // If the position is valid, keep the fire
            if (!isInRefillZone && !isNearSplash && !isNearOtherFires) {
                isValidPosition = true;
            } else {
                // Otherwise, destroy the fire and try again
                fire.destroy();
            }
        } while (!isValidPosition);

        // Set the scale of the fire
        fire.setScale(0.15);

        // Add the fire to the obstacles array
        fireObstacles.push(fire);

        // Add overlap detection for the fire
        this.physics.add.overlap(Spongeimage, fire, touchFire, null, this);
    }
}

// Helper function to calculate the distance between two rectangles
function getDistanceBetweenRectangles(rect1, rect2) {
    // Calculate the center points of the rectangles
    let rect1CenterX = rect1.x + rect1.width / 2;
    let rect1CenterY = rect1.y + rect1.height / 2;
    let rect2CenterX = rect2.x + rect2.width / 2;
    let rect2CenterY = rect2.y + rect2.height / 2;

    // Calculate the distance between the centers
    let dx = rect1CenterX - rect2CenterX;
    let dy = rect1CenterY - rect2CenterY;
    return Math.sqrt(dx * dx + dy * dy);
}

function touchFire(player, fire) {
    waterAmount = Math.max(0, waterAmount - 30);
    waterText.setText(`Water: ${waterAmount}%`);
    if (waterAmount === 0) {
        this.physics.world.removeCollider(overlap);
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

let game = new Phaser.Game(config);