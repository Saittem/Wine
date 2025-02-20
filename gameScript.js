/*let config = {
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        create:create
    },
};
console.log(window.innerHeight);
console.log(window.innerWidth);

var game = new Phaser.Game(config);

function create() {
    var width = this.scale.width;
    var height = this.scale.height;

    this.add.rectangle(0, 0, 100, 30, 0x00f000, .5);
}*/

let config = {
    type: Phaser.AUTO,
    width: window.innerWidth, // Use the window width for the game size
    height: window.innerHeight, // Use the window height for the game size
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let Spongeimage;

function preload() {
    this.load.image('myImage', 'Assets/sponge.png');
}

function create() {
    Spongeimage = this.add.image(0, 0, 'myImage');  
    Spongeimage.setScale(0.3);
}

function update() {
    let mouseX = this.input.mousePointer.x;
    let mouseY = this.input.mousePointer.y;

    Spongeimage.x = mouseX;
    Spongeimage.y = mouseY;

    Spongeimage.rotation = -50;
}

let game = new Phaser.Game(config);
