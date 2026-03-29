import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('background', 'bg2.png');
        this.load.image('logo', 'tilegameheading.png');
    }

    create ()
    {
        
        this.add.image(512, 384, 'background');
        this.add.image(512, 150, 'logo').setDepth(100);
        this.add.text(512, 415, '...', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#5eb1da',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
    }
}
