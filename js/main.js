var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: false
        }
    }, 
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config)

var map;
var player;
var cursors;
var groundLayer, coinLayer;
var text;
var score = 0;

function preload(){
    //Mapa feito com uma versão de formato JSON
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    //tiles de sprite
    this.load.spritesheet('tiles', 'assets/tiles.png', {frameWidth: 70, frameHeight:70});
    //sprite do cerebro
    this.load.image('coin', 'assets/coinGold.png');
    //animações do player JSON
    this.load.atlas('player', 'assets/player.png', 'assets/player.json');
    //animação do plano de fundo
    this.load.image('background', 'assets/background.png');
}

function create(){
    //Plano de fundo (background)
    this.add.image(0,0, 'background');
    //carregar o mapa
    map = this.make.tilemap({key: 'map'});
    //tiles de chão (ground)
    var groundTiles = map.addTilesetImage('tiles');
    //criar a camada do chão (ground)
    groundLayer = map.createDynamicLayer('World', groundTiles, 0,0);
    //player colida com essa layer
    groundLayer.setCollisionByExclusion([-1])

    //moedas tiles
    var cointTiles = map.addTilesetImage('coin');
    //adiciona as moedas como sprites
    coinLayer = map.createDynamicLayer('Coins', cointTiles, 0,0);


    //colocar as bordas limites do game
    this.physics.world.bounds.width= groundLayer.width;
    this.physics.world.bounds.height= groundLayer.height;

    //adicionar o player
    player = this.physics.add.sprite(200,200, 'player');
    player.setBounce(0.2); // ricochetea
    player.setCollideWorldBounds(true); // não sair do mapa
    this.physics.add.collider(groundLayer, player);


    coinLayer.setTileIndexCallback(17, collectCoin, this);
    this.physics.add.overlap(player, coinLayer);

    //animação de andar
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });
    // 
    this.anims.create({
        key: 'idle',
        frames: [{key: 'player', frame: 'p1_stand'}],
        frameRate: 10,
    });

    cursors = this.input.keyboard.createCursorKeys();

    //camera nao sair do mundo
    this.cameras.main.setBounds(0,0, map.widthInPixels, map.heightInPixels);
    //fazer a camera seguir o player
    this.cameras.main.startFollow(player);

    text = this.add.text(20, 570, '0', {
        fontSize: '20px',
        fill: '#fffffff'
    });
    text.setScrollFactor(0); 

}
    //esta função é chamada quando o player pega o cerebro
function collectCoin(sprite,tile){
    coinLayer.removeTileAt(tile.x, tile.y); //remover o cerebro qd coletado
    score++; // adiciona pontos
    text.setText(score); // mostra o texto dos pontos
    return false;
}

function update(time,delta){
    if (cursors.left.isDown) //se pressionado para a esquerda
    {
        player.body.setVelocityX(-200)// mover pra esquerda
        player.anims.play('walk', true)// andar animação
        player.flipX=true; //espelhar a animação
    }
    else if (cursors.right.isDown)// se pressionado para a direita
    {
        player.body.setVelocityX(200)
        player.anims.play('walk', true)// andar animação
        player.flipX=false; 
    } else {
        player.body.setVelocityX(0);
        player.anims.play('idle', true);
    } 

    if ((cursors.space.isDown || cursors.up.isDown) && player.body.onFloor()) //o player pula
    {
        player.body.setVelocityY(-500);
    }
}