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

        // -------------------------------------------------------------------------------------------
        
        this.add.text(60, 230, 'Made for søndagsskolen i 2026, Inspiration: Genesis and C.S.Lewis', {
            fontFamily: 'Arial Black', fontSize: 28, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 800 },
            lineSpacing: 4,
        });
        
        this.add.text(60, 340, 'Beta Testers, Supporters and Special Thanks: William & Richard', {
            fontFamily: 'Arial Black', fontSize: 28, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 800 },
            lineSpacing: 4,
        });
        
        this.add.text(60, 460, 'Code help: Chat GPT & Grok', {
            fontFamily: 'Arial Black', fontSize: 28, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 600 },
            lineSpacing: 4,
        });
        
        this.add.text(60, 540, 'Phaser Tutorials: Scott Westover', {
            fontFamily: 'Arial Black', fontSize: 28, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 600 },
            lineSpacing: 4,
        });

        this.add.text(60, 620, 'Graphics & Music: ComfyUI, AceStep, Flux_2-Turbo-LoRA', {
            fontFamily: 'Arial Black', fontSize: 28, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 600 },
            lineSpacing: 4,
        });

        // -------------------------------------------------------------------------------------------
        
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
