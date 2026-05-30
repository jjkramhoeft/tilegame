import * as Phaser from 'phaser';
import { ASSET_KEYS } from './assets';
import { SEX, GEAR, WEAPON } from './common';

type FrameConfig = Phaser.Types.Loader.FileTypes.ImageFrameConfig;

type ImageAsset = { key: string; path: string; };
type SpritesheetAsset = ImageAsset & { frameConfig: FrameConfig; };
type AsepriteAsset = { key: string; texturePath: string; atlasPath: string; };
type FontAsset = ImageAsset;
type AudioAsset = ImageAsset;

const ROOT_ASSET_PATH = 'assets';

const imageAssets: readonly ImageAsset[] = [
  { key: ASSET_KEYS.TILESET_BASE, path: 'assets/tile-base.png' },
  { key: ASSET_KEYS.MAP_BACKGROUND, path: 'assets/map-background.png' },
  { key: ASSET_KEYS.MAP_CALF, path: 'assets/map-calf.png' },
  { key: ASSET_KEYS.MAP_BULL, path: 'assets/map-bull.png' },
  { key: ASSET_KEYS.MAP_SPIDER, path: 'assets/map-spider.png' },
  { key: ASSET_KEYS.MAP_BIG_TREE, path: 'assets/map-big-tree.png' },
  { key: ASSET_KEYS.MAP_EVE, path: 'assets/map-eve.png' },
  { key: ASSET_KEYS.MAP_ADAM, path: 'assets/map-adam.png' },
  { key: ASSET_KEYS.MAP_ROCK, path: 'assets/map-rock.png' },
  { key: ASSET_KEYS.MAP_ROCK_DECO, path: 'assets/map-rock-deco.png' },
  { key: ASSET_KEYS.MAP_ROCK_BLOCKING, path: 'assets/map-rock-blocking.png' },
  { key: ASSET_KEYS.MAP_DESERT, path: 'assets/map-desert.png' },
  { key: ASSET_KEYS.MAP_DESERT_DECO, path: 'assets/map-desert-deco.png' },
  { key: ASSET_KEYS.MAP_DESERT_BLOCKING, path: 'assets/map-desert-blocking.png' },
  { key: ASSET_KEYS.MAP_GRASS, path: 'assets/map-grass.png' },
  { key: ASSET_KEYS.MAP_GRASS_DECO, path: 'assets/map-grass-deco.png' },
  { key: ASSET_KEYS.MAP_FOREST, path: 'assets/map-forest.png' },
  { key: ASSET_KEYS.MAP_FOREST_DECO, path: 'assets/map-forest-deco.png' },
  { key: ASSET_KEYS.MAP_FOREST_BLOCKING, path: 'assets/map-forest-blocking.png' },
  { key: ASSET_KEYS.MAP_WATER, path: 'assets/map-water.png' },
  { key: ASSET_KEYS.MAP_SWAMP, path: 'assets/map-swamp.png' },
  { key: ASSET_KEYS.MAP_SWAMP_DECO, path: 'assets/map-swamp-deco.png' },
  { key: ASSET_KEYS.MAP_SWAMP_BLOCKING, path: 'assets/map-swamp-blocking.png' },
  { key: ASSET_KEYS.MAP_CRYSTAL, path: 'assets/map-crystal.png' },
  { key: ASSET_KEYS.MAP_CRYSTAL_DECO, path: 'assets/map-crystal-deco.png' },
  { key: ASSET_KEYS.MAP_CRYSTAL_BLOCKING, path: 'assets/map-crystal-blocking.png' },
  { key: ASSET_KEYS.MAP_LAVA, path: 'assets/map-lava.png' },
  { key: ASSET_KEYS.MAP_MOUNTAIN, path: 'assets/map-mountain.png' },
  { key: ASSET_KEYS.MAP_CHICKEN, path: 'assets/map-chicken.png' },
  { key: ASSET_KEYS.MAP_LAMB, path: 'assets/map-lamb.png' },
  { key: ASSET_KEYS.MAP_SHEEP, path: 'assets/map-sheep.png' },
  { key: ASSET_KEYS.MAP_ROOSTER, path: 'assets/map-rooster.png' },
  { key: ASSET_KEYS.MAP_TURKEY, path: 'assets/map-turkey.png' },
  { key: ASSET_KEYS.MAP_PIGLET, path: 'assets/map-piglet.png' },
  { key: ASSET_KEYS.MAP_PLANT, path: 'assets/map-plant.png' },
  { key: ASSET_KEYS.MAP_SNAKE, path: 'assets/map-snake.png' },
  { key: ASSET_KEYS.MAP_SKELETON, path: 'assets/map-skeleton.png' },
  { key: ASSET_KEYS.MAP_LIZARDMAN, path: 'assets/map-lizard.png' },
  { key: ASSET_KEYS.MAP_STAR1, path: 'assets/map-star1.png' },
  { key: ASSET_KEYS.MAP_STAR2, path: 'assets/map-star2.png' },
  { key: ASSET_KEYS.MAP_STAR3, path: 'assets/map-star3.png' },
  { key: ASSET_KEYS.MAP_CONSTELLATIONS, path: 'assets/map-constellations.png' },
  { key: ASSET_KEYS.UI_DIALOG, path: 'assets/images/ui/dialog_ui.png' },
  { key: ASSET_KEYS.UI_CURSOR, path: 'assets/images/ui/cursor_white.png' },
  { key: ASSET_KEYS.INTRO_BACKGROUND, path: 'assets/bg-garden-genesis.png' },
  { key: ASSET_KEYS.CREDITS_BACKGROUND, path: 'assets/bg-lake.png' },
  { key: ASSET_KEYS.LOGO, path: 'assets/first-garden-logo150.png' },
];

const spritesheetAssets: readonly SpritesheetAsset[] = [
  { key: ASSET_KEYS.ENEMY_DEATH, path: 'assets/images/enemies/enemy_death.png', frameConfig: { frameWidth: 16, frameHeight: 16 } },
  { key: ASSET_KEYS.PLANT1_ATTACK, path: 'assets/Plant1_Attack_with_shadow.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.PLANT1_IDLE, path: 'assets/Plant1_Idle_with_shadow.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.PLANT1_DEATH, path: 'assets/Plant1_Death_with_shadow.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.PLANT2_ATTACK, path: 'assets/Plant2_Attack_with_shadow.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.PLANT2_IDLE, path: 'assets/Plant2_Idle_with_shadow.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.PLANT2_DEATH, path: 'assets/Plant2_Death_with_shadow.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.PLANT3_ATTACK, path: 'assets/Plant3_Attack_with_shadow.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.PLANT3_IDLE, path: 'assets/Plant3_Idle_with_shadow.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.PLANT3_DEATH, path: 'assets/Plant3_Death_with_shadow.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.MAGIC_FX_HOLY_EXPLOSION, path: 'assets/magic-fx-holy-explosion.png', frameConfig: { frameWidth: 96, frameHeight: 96 } },
  { key: ASSET_KEYS.MAGIC_FX_LIGHT_CAST, path: 'assets/magic-fx-light-cast.png', frameConfig: { frameWidth: 96, frameHeight: 96 } },
  { key: ASSET_KEYS.MAGIC_FX_BLUE_CIRCLE_EXPLOSION, path: 'assets/magic-fx-blue-circleexplosion.png', frameConfig: { frameWidth: 256, frameHeight: 256 } },
  { key: ASSET_KEYS.MAGIC_FX_NOTES, path: 'assets/spell-music-11_grayscale.png', frameConfig: { frameWidth: 150, frameHeight: 150 } },
  { key: ASSET_KEYS.TILESET_BORDER, path: 'assets/tile-border.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.TILESET_DECORATION, path: 'assets/tile-decoration.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.TILESET_ANIMATED, path: 'assets/tile-animated.png', frameConfig: { frameWidth: 64, frameHeight: 64, margin: 2, spacing: 4 } },
  { key: ASSET_KEYS.TILESET_BLOCKING, path: 'assets/tile-blocking.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.TILESET_FLOATING, path: 'assets/tile-floating.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.BIG_TREE, path: 'assets/big-tree.png', frameConfig: { frameWidth: 128, frameHeight: 256 } },
  { key: ASSET_KEYS.CONTAINERS, path: 'assets/containers.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.HEARTS_16, path: 'assets/hearts16.png', frameConfig: { frameWidth: 16, frameHeight: 16 } },
  { key: ASSET_KEYS.POWER_16, path: 'assets/power16.png', frameConfig: { frameWidth: 16, frameHeight: 16 } },
  { key: ASSET_KEYS.PROGRESS_16, path: 'assets/progress16.png', frameConfig: { frameWidth: 16, frameHeight: 16 } },
  { key: ASSET_KEYS.LAMB, path: 'assets/Lamb.png', frameConfig: { frameWidth: 32, frameHeight: 32 } },
  { key: ASSET_KEYS.CHICKEN, path: 'assets/Chicken.png', frameConfig: { frameWidth: 16, frameHeight: 16 } },
  { key: ASSET_KEYS.SHEEP, path: 'assets/Sheep.png', frameConfig: { frameWidth: 32, frameHeight: 32 } },
  { key: ASSET_KEYS.SNAKE, path: 'assets/Snake.png', frameConfig: { frameWidth: 32, frameHeight: 32 } },
  { key: ASSET_KEYS.TURKEY, path: 'assets/Turkey.png', frameConfig: { frameWidth: 32, frameHeight: 32 } },
  { key: ASSET_KEYS.PIGLET, path: 'assets/Piglet.png', frameConfig: { frameWidth: 32, frameHeight: 32 } },
  { key: ASSET_KEYS.ROOSTER, path: 'assets/Rooster.png', frameConfig: { frameWidth: 32, frameHeight: 32 } },
  { key: ASSET_KEYS.CALF, path: 'assets/Calf.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.BULL, path: 'assets/Bull.png', frameConfig: { frameWidth: 64, frameHeight: 64 } },
  { key: ASSET_KEYS.SPELL_MUSIC_11, path: 'assets/spell-music-11.png', frameConfig: { frameWidth: 150, frameHeight: 150 } },
];

const asepriteAssets: readonly AsepriteAsset[] = [
  { key: ASSET_KEYS.HUD_NUMBERS, texturePath: 'assets/images/hud/heart_and_hud_numbers.png', atlasPath: 'assets/images/hud/heart_and_hud_numbers.json' },
  { key: ASSET_KEYS.SPIDER, texturePath: 'assets/images/enemies/spider.png', atlasPath: 'assets/images/enemies/spider.json' },
];

const fontAssets: readonly FontAsset[] = [
  { key: ASSET_KEYS.FONT_PRESS_START_2P, path: 'assets/fonts/Press_Start_2P/PressStart2P-Regular.ttf' },
  { key: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, path: 'assets/fonts/PixelSerif_16px_v02.ttf' },
];

const audioAssets: readonly AudioAsset[] = [
  { key: ASSET_KEYS.MAGIC_AUDIO_SPRITE, path: 'assets/magic-audio-sprite.mp3' },
  { key: ASSET_KEYS.MAGIC_AUDIO_SPRITE_BAD, path: 'assets/magic-audio-sprite-bad.mp3' },
  { key: ASSET_KEYS.MENU_006, path: 'assets/menu_006.wav' },
  { key: ASSET_KEYS.MENU_018, path: 'assets/menu_018.wav' },
  { key: ASSET_KEYS.MENU_023, path: 'assets/menu_023.wav' },
  { key: ASSET_KEYS.MENU_024, path: 'assets/menu_024.wav' },
  { key: ASSET_KEYS.SUCCESS_1, path: 'assets/sucess1.mp3' },
  { key: ASSET_KEYS.BLIP_SELECT_7, path: 'assets/Blip_Select7.wav' },
  { key: ASSET_KEYS.NO_HIT, path: 'assets/no-hit.wav' },
  { key: ASSET_KEYS.BUMP, path: 'assets/bump.wav' },
  { key: ASSET_KEYS.POWERUP, path: 'assets/powerup.mp3' },
  { key: ASSET_KEYS.DUII_LASER, path: 'assets/duii-laser.mp3' },
  { key: ASSET_KEYS.GAME_OVER, path: 'assets/game-over.mp3' },
  { key: ASSET_KEYS.GAME_OVER_2, path: 'assets/game-over2.mp3' },
  { key: ASSET_KEYS.WIN, path: 'assets/win.mp3' },
  { key: ASSET_KEYS.INTRO_MUSIC, path: 'assets/music-awesome-god.ogg' },
  { key: ASSET_KEYS.CREDITS_MUSIC, path: 'assets/music-awesome-god2.ogg' },
  { key: ASSET_KEYS.REFLECTION_MUSIC_1, path: 'assets/music1.ogg' },
  { key: ASSET_KEYS.REFLECTION_MUSIC_2, path: 'assets/music2.ogg' },
  { key: ASSET_KEYS.REFLECTION_MUSIC_3, path: 'assets/music3.ogg' },
  { key: ASSET_KEYS.STEPS, path: 'assets/shortfootsteps.wav' },
  { key: ASSET_KEYS.WATER_SPLASH, path: 'assets/water-splash.mp3' },
  { key: ASSET_KEYS.SPELL_NOTES_1, path: 'assets/shortspell1.wav' },
  { key: ASSET_KEYS.LEVELUP, path: 'assets/levelup.mp3' },
  { key: ASSET_KEYS.LEVELUP_2, path: 'assets/levelup2.mp3' },
  { key: ASSET_KEYS.ATTACK_PUNCH, path: 'assets/attack-punch.mp3' },
  { key: ASSET_KEYS.ATTACK_DAGGER, path: 'assets/attack-dagger.mp3' },
  { key: ASSET_KEYS.ATTACK_STAFF, path: 'assets/attack-staff.mp3' },
  { key: ASSET_KEYS.ATTACK_SWORD, path: 'assets/attack-sword.mp3' },
  { key: ASSET_KEYS.CHEST, path: 'assets/chest.mp3' },
  { key: ASSET_KEYS.CHEST_2, path: 'assets/chest2.mp3' },
  { key: ASSET_KEYS.FEMALE_OW, path: 'assets/female-ow.mp3' },
  { key: ASSET_KEYS.MALE_OW, path: 'assets/male-ow.mp3' },
  { key: ASSET_KEYS.MAGIC_DOWN, path: 'assets/magic-down.mp3' },
  { key: ASSET_KEYS.MAGIC_DOWN_2, path: 'assets/magic-down-2.mp3' },
];

const playerSexes = Object.values(SEX);
const playerGears = Object.values(GEAR);
const playerWeapons = Object.values(WEAPON);
const playerActions = ['walk', 'idle', 'hurt', 'fall'] as const;

export function loadGameAssets(scene: Phaser.Scene): void {
  fontAssets.forEach(({ key, path }) => scene.load.font(key, path));
  imageAssets.forEach(({ key, path }) => scene.load.image(key, path));
  asepriteAssets.forEach(({ key, texturePath, atlasPath }) => scene.load.aseprite(key, texturePath, atlasPath));
  spritesheetAssets.forEach(({ key, path, frameConfig }) => scene.load.spritesheet(key, path, frameConfig));
  audioAssets.forEach(({ key, path }) => scene.load.audio(key, path));
  loadGeneratedPlayerSpritesheets(scene);
}

function loadGeneratedPlayerSpritesheets(scene: Phaser.Scene): void {
  playerSexes.forEach((sex) => {
    playerGears.forEach((gear) => {
      playerWeapons.forEach((weapon) => {
        playerActions.forEach((action) => {
          const key = `${sex}-${gear}-${weapon}-${action}`;
          scene.load.spritesheet(key, `${ROOT_ASSET_PATH}/${key}.png`, { frameWidth: 64, frameHeight: 64 });
        });

        const thrustKey = weapon === 'sword'
          ? `${sex}-${gear}-${weapon}-thrust128`
          : `${sex}-${gear}-${weapon}-thrust`;
        const frameSize = weapon === 'sword' ? 128 : 64;
        scene.load.spritesheet(thrustKey, `${ROOT_ASSET_PATH}/${thrustKey}.png`, { frameWidth: frameSize, frameHeight: frameSize });
      });
    });
  });
}
