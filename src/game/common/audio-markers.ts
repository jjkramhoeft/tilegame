import * as Phaser from 'phaser';
import { ASSET_KEYS } from './assets';

const MAGIC_AUDIO_MARKER_COUNT = 12;
const MAGIC_AUDIO_MARKER_DURATION = 1.5;
const MAGIC_AUDIO_MARKER_STEP = 2;

type MagicAudioSpriteConfig = {
    key: string;
    suffix: string;
};

const MAGIC_AUDIO_SPRITES: readonly MagicAudioSpriteConfig[] = [
    { key: ASSET_KEYS.MAGIC_AUDIO_SPRITE, suffix: '' },
    { key: ASSET_KEYS.MAGIC_AUDIO_SPRITE_BAD, suffix: '-bad' },
];

export function createMagicAudioMarkers(scene: Phaser.Scene): void {
    MAGIC_AUDIO_SPRITES.forEach(({ key, suffix }) => {
        const sound = scene.sound.add(key);
        for (let index = 0; index < MAGIC_AUDIO_MARKER_COUNT; index += 1) {
            const markerNumber = index + 1;
            sound.addMarker({
                name: `spell-cast-${markerNumber}${suffix}`,
                start: index * MAGIC_AUDIO_MARKER_STEP,
                duration: MAGIC_AUDIO_MARKER_DURATION,
            });
        }
    });
}
