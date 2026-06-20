import * as Phaser from 'phaser';
import { loadGameAssets } from '../common/asset-loader';
import { createAnimations } from '../common/animation-loader';
import { createMagicAudioMarkers } from '../common/audio-markers';
import { SCENE_KEYS } from './scene-keys';
import { GameDataManager } from '../common/game-data-manager';
import { DIFFICULTY } from '../common/common';
import type { Difficulty } from '../common/common';

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

        // Test/debug deep-link: `?debug=...` skips the menu and boots straight into
        // a seeded GameScene. `?debug=play` enters the gameplay shortcut
        // (GameScene.#startDebugPlay); any other accepted value (`1`, `true`,
        // empty, `assets`) enters the asset/sandbox view (#startDebugGameplay).
        const debugDifficulty = PreloadScene.#requestedDebugDifficulty();
        if (debugDifficulty) {
            GameDataManager.instance.resetForNewGame({ isDebugMode: true, difficulty: debugDifficulty });
            this.scene.start(SCENE_KEYS.GAME_SCENE);
            return;
        }

        this.scene.start(SCENE_KEYS.INTRO);
    }

    static #requestedDebugDifficulty(): Difficulty | undefined {
        if (typeof window === 'undefined') {
            return undefined;
        }
        const value = new URLSearchParams(window.location.search).get('debug');
        if (value === null) {
            return undefined;
        }
        if (value === 'play') {
            return DIFFICULTY.DEBUG_PLAY;
        }
        if (value === '1' || value === 'true' || value === '' || value === 'assets') {
            return DIFFICULTY.DEBUG_ASSETS;
        }
        return undefined;
    }
}
