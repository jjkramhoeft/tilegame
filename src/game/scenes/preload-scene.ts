import * as Phaser from 'phaser';
import { loadGameAssets } from '../common/asset-loader';
import { createAnimations } from '../common/animation-loader';
import { ASSET_KEYS } from '../common/assets';
import { SCENE_KEYS } from './scene-keys';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    public preload(): void {
        loadGameAssets(this);
    }

    public create(): void {
        createAnimations(this);

        const fx = this.sound.add(ASSET_KEYS.MAGIC_AUDIO_SPRITE);
        fx.addMarker({ name: 'spell-cast-1', start: 0, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-2', start: 2, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-3', start: 4, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-4', start: 6, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-5', start: 8, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-6', start: 10, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-7', start: 12, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-8', start: 14, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-9', start: 16, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-10', start: 18, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-11', start: 20, duration: 1.5 });
        fx.addMarker({ name: 'spell-cast-12', start: 22, duration: 1.5 });

        const fxBad = this.sound.add(ASSET_KEYS.MAGIC_AUDIO_SPRITE_BAD);
        fxBad.addMarker({ name: 'spell-cast-1-bad', start: 0, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-2-bad', start: 2, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-3-bad', start: 4, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-4-bad', start: 6, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-5-bad', start: 8, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-6-bad', start: 10, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-7-bad', start: 12, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-8-bad', start: 14, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-9-bad', start: 16, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-10-bad', start: 18, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-11-bad', start: 20, duration: 1.5 });
        fxBad.addMarker({ name: 'spell-cast-12-bad', start: 22, duration: 1.5 });

        this.scene.start(SCENE_KEYS.INTRO);
    }
}
