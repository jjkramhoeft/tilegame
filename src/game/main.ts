import { PreloadScene } from './scenes/preload-scene';
import { Intro } from './scenes/intro';
import { GameScene } from './scenes/game-scene';
import { Credits } from './scenes/credits';
import { Reflection } from './scenes/reflection';
import { Settings } from './scenes/settings';
import { AUTO, Game, Scale,Types } from 'phaser';
import { UiScene } from './scenes/ui-scene';
import { MapScene } from './scenes/map-scene';

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
            debugShowBody: false,
            debugShowStaticBody: false,
        },
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
