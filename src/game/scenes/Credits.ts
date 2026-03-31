import { Scene } from 'phaser';

const COLORS = {
    title: '#5eb1da',
    titleStroke: '#000000',
    uiText: '#93c9e4',
    uiTextBorder: '#000000',
};

export class Credits extends Scene
{
    creditsMusic?: Phaser.Sound.BaseSound;

    constructor ()
    {
        super('Credits');
    }

    create ()
    {
        const centerY = this.cameras.main.centerY;
        const centerX = this.cameras.main.centerX;
        const registryVolume = this.registry.get('musicVolume');
        const musicVolume = typeof registryVolume === 'number' ? registryVolume : 0.1;

        this.registry.set('musicVolume', musicVolume);
        this.sound.volume = musicVolume;

        this.creditsMusic = this.sound.add('creditsMusic', {
            loop: true
        });
        this.creditsMusic.play();

        this.add.image(centerX, centerY, 'credit-bg');
        this.add.image(centerX+180, 120, 'logo').setDepth(100);

        this.add.text(200, 150, 'Credits', {
            fontFamily: 'Arial Black', fontSize: 52, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        this.add.text(200, 250, '...', {
            fontFamily: 'Arial Black', fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        this.add.text(200, 300, '...', {
            fontFamily: 'Arial Black', fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        this.add.text(200, 350, '...', {
            fontFamily: 'Arial Black', fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        this.add.text(200, 400, '...', {
            fontFamily: 'Arial Black', fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        const exit_text = this.add.text(900, 700, 'Back', {
            fontFamily: 'Arial Black', fontSize: 38, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
            align: 'center'
        });
        exit_text.setOrigin(0);
        exit_text.setInteractive({ useHandCursor: true });
        exit_text.on('pointerdown', () => {
            this.creditsMusic?.stop();
            this.scene.start('Intro');
        });

        this.events.once('shutdown', () => {
            this.creditsMusic?.stop();
            this.creditsMusic?.destroy();
            this.creditsMusic = undefined;
        });
    }
}
