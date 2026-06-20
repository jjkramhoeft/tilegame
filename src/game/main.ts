import { PreloadScene } from './scenes/preload-scene';
import { Intro } from './scenes/intro';
import { GameScene } from './scenes/game-scene';
import { Credits } from './scenes/credits';
import { Reflection } from './scenes/reflection';
import { Settings } from './scenes/settings';
import { AUTO, Game, Scale,Types } from 'phaser';
import { UiScene } from './scenes/ui-scene';
import { MapScene } from './scenes/map-scene';
import { GameDataManager } from './common/game-data-manager';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    pixelArt: true,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        PreloadScene,
        Intro,
        GameScene,
        UiScene,
        MapScene,
        Credits,
        Reflection,
        Settings
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false,
            debugShowBody: true,
            debugShowStaticBody: true,
        },
    },
};

const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });

    // Dev-only test hooks: expose the running game and the data singleton so
    // Playwright (and manual debugging) can read game state. Stripped in prod
    // builds because import.meta.env.DEV is false there.
    if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
        const w = window as unknown as { __game?: Game; __gameData?: unknown };
        w.__game = game;
        w.__gameData = GameDataManager.instance;
    }

    return game;
}

export default StartGame;
