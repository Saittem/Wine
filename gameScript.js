var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: {
        create: create
    }
};
console.log(window.width);
console.log(window.height);

var game = new Phaser.Game(config);

function create() {
    var width = this.scale.width;
    var height = this.scale.height;

    // Create a red box covering the left half of the screen
    this.add.rectangle(width / 4, height / 2, width / 2, height, 0xff0000);

    // Create a blue box covering the right half of the screen
    this.add.rectangle((3 * width) / 4, height / 2, width / 2, height, 0x0000ff);
}