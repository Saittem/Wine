let config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xF5F5F5, // ✅ Set background color to whitesmoke
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
let splash; // The splash image
let lastDetectionTime = 0; // Cooldown timer
let score = 0; // Score counter
let waterAmount = 100; // Water amount (starts at 100%)
let overlap; // Stores the overlap collider
let refillZone; // Refill area
let refillZoneWidth; // Stores the width of the refill zone
let lastCollisionTime = 0;  // Track the last collision time
let splashResetDelay = 1000; // 5 seconds to reset opacity if no collision happens

function preload() {
    this.load.image('playerImage', 'Assets/sponge.png');
    this.load.image('splashImage', 'Assets/wine-splash.svg');
}

function create() {
    // ✅ Create water refill zone (8% width, full height)
    refillZoneWidth = window.innerWidth * 0.15;
    refillZone = this.add.rectangle(refillZoneWidth / 2, window.innerHeight / 2, refillZoneWidth, window.innerHeight, 0x0000FF);
    this.physics.add.existing(refillZone, true); // Make it a physics static object

    // Create player (Spongeimage) as a physics object
    Spongeimage = this.physics.add.image(0, 0, 'playerImage');
    Spongeimage.setScale(0.2);
    Spongeimage.setCollideWorldBounds(true);
    Spongeimage.setDepth(1); // Ensure Sponge is always above the splash

    // Store initial position
    prevX = Spongeimage.x;
    prevY = Spongeimage.y;

    // Create the first splash
    spawnNewSplash.call(this);

    // Add score text in the top-right corner (shifted 100px to the left)
    scoreText = this.add.text(window.innerWidth - 200, 10, `Score: ${score}`, {
        fontSize: '32px',
        fill: '#000000',
        fontFamily: 'Arial'
    }).setDepth(2); // Score text depth

    // Add water amount text beneath the score
    waterText = this.add.text(window.innerWidth - 200, 50, `Water: ${waterAmount}%`, {
        fontSize: '32px',
        fill: '#000000',
        fontFamily: 'Arial'
    }).setDepth(2); // Water text depth

    // Enable overlap detection
    overlap = this.physics.add.overlap(Spongeimage, splash, detectMovement, null, this);
}

function update() {
    let mouseX = this.input.mousePointer.x;
    let mouseY = this.input.mousePointer.y;

    // Move Spongeimage with the mouse
    Spongeimage.setVelocity(0);
    Spongeimage.x = mouseX;
    Spongeimage.y = mouseY;
    Spongeimage.rotation = -50;

    // ✅ Check if sponge is fully inside the refill zone
    checkRefill();

    // Check for splash opacity reset after inactivity
    let currentTime = this.time.now;
    if (currentTime - lastCollisionTime >= splashResetDelay) {
        // Reset splash opacity if no collision happened in the last 5 seconds
        if (splash.alpha < 1) {
            splash.setAlpha(1);
        }
    }
}

// Function to detect movement inside the splash
function detectMovement(player, splash) {
    let currentTime = this.time.now; // Get current time in ms

    // Stop detection if water is 0%
    if (waterAmount === 0) return;

    // Check if enough time has passed since last detection
    if (currentTime - lastDetectionTime >= 150) { // Cooldown set to 150ms
        if (player.x !== prevX || player.y !== prevY) {
            lastDetectionTime = currentTime; // Update cooldown timer

            // Reduce splash opacity by 0.1
            splash.setAlpha(splash.alpha - 0.1);

            // If splash is fully faded, destroy and spawn a new one
            if (splash.alpha <= 0) {
                splash.destroy();
                spawnNewSplash.call(this);

                // Increase the score
                score++;
                scoreText.setText(`Score: ${score}`); // Update score display

                // Reduce water amount, but don't let it go below 0%
                waterAmount = Math.max(0, waterAmount - 10);
                waterText.setText(`Water: ${waterAmount}%`); // Update water amount display

                // If water reaches 0, remove collision
                if (waterAmount === 0) {
                    this.physics.world.removeCollider(overlap); // Remove collision
                }
            }

            // Update the last collision time when a collision happens
            lastCollisionTime = currentTime;
        }
    }

    // Update previous position
    prevX = player.x;
    prevY = player.y;
}

// Function to spawn a new splash inside the screen
function spawnNewSplash() {
    let randomX = Phaser.Math.Between(300, window.innerWidth - 100); // Avoid spawn in refill zone
    let randomY = Phaser.Math.Between(100, window.innerHeight - 100);

    splash = this.physics.add.staticImage(randomX, randomY, 'splashImage').setAlpha(1);
    splash.setScale(1).refreshBody();
    splash.setDepth(0); // Ensure the splash is always below the sponge

    // If waterAmount > 0, enable collision again
    if (waterAmount > 0) {
        overlap = this.physics.add.overlap(Spongeimage, splash, detectMovement, null, this);
    }
}

// ✅ Function to check if Spongeimage is fully inside the blue refill zone
function checkRefill() {
    let spongeBounds = Spongeimage.getBounds();
    let refillBounds = refillZone.getBounds();

    // Check if the sponge is completely inside the refill zone
    if (
        spongeBounds.left >= refillBounds.left &&
        spongeBounds.right <= refillBounds.right &&
        spongeBounds.top >= refillBounds.top &&
        spongeBounds.bottom <= refillBounds.bottom
    ) {
        refillWater();
    }
}

// ✅ Function to refill water when inside the blue zone
function refillWater() {
    if (waterAmount < 100) {
        waterAmount = 100;
        waterText.setText(`Water: ${waterAmount}%`); // Update water text

        // Re-enable cleaning if it was disabled
        if (!overlap) {
            overlap = this.physics.add.overlap(Spongeimage, splash, detectMovement, null, this);
        }
    }
}

let game = new Phaser.Game(config);