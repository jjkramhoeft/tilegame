import { Intro } from './scenes/Intro';
import { GameScene } from './scenes/GameScene';
import { Credits } from './scenes/Credits';
import { Settings } from './scenes/Settings';
import { AUTO, Game, Scale,Types } from 'phaser';
import { PreloadScene } from './scenes/preload-scene';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#171718',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        PreloadScene,
        Intro,
        GameScene,
        Credits,
        Settings
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
