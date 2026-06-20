import * as Phaser from 'phaser';
import { loadGameAssets } from '../common/asset-loader';
import { createAnimations } from '../common/animation-loader';
import { createMagicAudioMarkers } from '../common/audio-markers';
import { SCENE_KEYS } from './scene-keys';
import { GameDataManager } from '../common/game-data-manager';
import { DIFFICULTY } from '../common/common';

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

        // Test/debug deep-link: `?debug=1` skips the menu and boots straight into
        // a seeded GameScene in debug mode (see GameScene.#startDebugGameplay).
        if (PreloadScene.#debugRequested()) {
            GameDataManager.instance.resetForNewGame({ isDebugMode: true, difficulty: DIFFICULTY.DEBUG });
            this.scene.start(SCENE_KEYS.GAME_SCENE);
            return;
        }

        this.scene.start(SCENE_KEYS.INTRO);
    }

    static #debugRequested(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }
        const value = new URLSearchParams(window.location.search).get('debug');
        return value === '1' || value === 'true' || value === '';
    }
}
