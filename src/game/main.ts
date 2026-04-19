import { PreloadScene } from './scenes/preload-scene';
import { Intro } from './scenes/Intro';
import { GameScene } from './scenes/game-scene';
import { Credits } from './scenes/Credits';
import { Settings } from './scenes/Settings';
import { AUTO, Game, Scale,Types } from 'phaser';
import { UiScene } from './scenes/ui-scene';

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
        Credits,
        Settings
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: true,
            debugShowBody: true,
            debugShowStaticBody: true,
        },
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
