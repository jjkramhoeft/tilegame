import { Scene } from 'phaser';
import { ASSET_KEYS } from '../common/assets';
import { getText } from '../common/texts';

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

        this.add.text(200, 150, getText('credits.title'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 58, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
        }).setOrigin(0.5).setDepth(100);

        // -------------------------------------------------------------------------------------------
        
        this.add.text(60, 230, getText('credits.madeFor'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 800 },
            lineSpacing: 4,
        });
        
        this.add.text(60, 340, getText('credits.thanks'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 800 },
            lineSpacing: 4,
        });
        
        this.add.text(60, 460, getText('credits.codeHelp'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 600 },
            lineSpacing: 4,
        });
        
        this.add.text(60, 540, getText('credits.tutorials'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 600 },
            lineSpacing: 4,
        });

        this.add.text(60, 620, getText('credits.graphicsMusic'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 800 },
            lineSpacing: 4,
        });

        // -------------------------------------------------------------------------------------------
        
        const exit_text = this.add.text(980, 750, getText('credits.back'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 42, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
        });
        exit_text.setOrigin(1);
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
