import * as Phaser from 'phaser';
import { loadGameAssets } from '../common/asset-loader';
import { createAnimations } from '../common/animation-loader';
import { createMagicAudioMarkers } from '../common/audio-markers';
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
        createMagicAudioMarkers(this);

        this.scene.start(SCENE_KEYS.INTRO);
    }
}
