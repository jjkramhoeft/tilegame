import { BIOME } from '../../common/common';
import { Position } from '../../common/types';
import { Spider } from '../../game-objects/enemies/spider';
import { Snake } from '../../game-objects/enemies/snake';
import { Lamb } from '../../game-objects/enemies/lamb';
import { Chicken } from '../../game-objects/enemies/chicken';
import { Earth } from '../../ground/earth';
import { Tile } from '../../ground/tile';
import { GameDataManager } from '../../common/game-data-manager';
import { Sheep } from '../../game-objects/enemies/sheep';
import { Piglet } from '../../game-objects/enemies/piglet';
import { Rooster } from '../../game-objects/enemies/rooster';
import { Turkey } from '../../game-objects/enemies/turkey';
import { Bull } from '../../game-objects/enemies/bull';
import { Calf } from '../../game-objects/enemies/calf';
import { Plant } from '../../game-objects/enemies/plant';
import { Skeleton } from '../../game-objects/enemies/skeleton';
import { Lizard } from '../../game-objects/enemies/lizard';

export function spawnDebugEnemies(
    scene: Phaser.Scene,
    enemyGroup: Phaser.GameObjects.Group,
    critterGroup: Phaser.GameObjects.Group,
    earth: Earth,
    firstTilePosition: Position,
): void {

    // A spider, added on a empty tile away from chests and the player.
    const spiderTileOffset: Position = { x: 3, y: 0 };
    addTileAndVoid(earth, { x: firstTilePosition.x + spiderTileOffset.x, y: firstTilePosition.y + spiderTileOffset.y });
    const spiderWorldPosition = {
        x: (spiderTileOffset.x + firstTilePosition.x) * earth.getTileSize() + 10,
        y: (spiderTileOffset.y + firstTilePosition.y) * earth.getTileSize() + 20,
    };
    const spider = new Spider({
        scene: scene,
        position: spiderWorldPosition,
    });
    spider.enableObject();
    enemyGroup.add(spider);
    GameDataManager.instance.increaseLivingCreatureCount();



    // A snake, added on an empty tile next to the spider.
    const snakeTileOffset: Position = { x: 3, y: 2 };
    addTileAndVoid(earth, { x: firstTilePosition.x + snakeTileOffset.x, y: firstTilePosition.y + snakeTileOffset.y });
    const snakeWorldPosition = {
        x: (snakeTileOffset.x + firstTilePosition.x) * earth.getTileSize() + 10,
        y: (snakeTileOffset.y + firstTilePosition.y) * earth.getTileSize() + 20,
    };
    const snake = new Snake({
        scene: scene,
        position: snakeWorldPosition,
    });
    snake.enableObject();
    enemyGroup.add(snake);
    GameDataManager.instance.increaseLivingCreatureCount();

    // A carnivorous plant, added on an empty swamp tile next to the snake.
    const plantTileOffset: Position = { x: 3, y: 4 };
    addTileAndVoid(earth, { x: firstTilePosition.x + plantTileOffset.x, y: firstTilePosition.y + plantTileOffset.y }, BIOME.SWAMP);
    const plantWorldPosition = {
        x: (plantTileOffset.x + firstTilePosition.x) * earth.getTileSize() + 32,
        y: (plantTileOffset.y + firstTilePosition.y) * earth.getTileSize() + 32,
    };
    const plant = new Plant({
        scene: scene,
        position: plantWorldPosition,
    });
    plant.enableObject();
    enemyGroup.add(plant);
    GameDataManager.instance.markCreatureEverCreated('plant');
    GameDataManager.instance.increaseLivingCreatureCount();

    // A skeleton, added on an empty crystal tile next to the plant.
    const skeletonTileOffset: Position = { x: 3, y: 6 };
    addTileAndVoid(earth, { x: firstTilePosition.x + skeletonTileOffset.x, y: firstTilePosition.y + skeletonTileOffset.y }, BIOME.CRYSTAL);
    const skeletonWorldPosition = {
        x: (skeletonTileOffset.x + firstTilePosition.x) * earth.getTileSize() + 32,
        y: (skeletonTileOffset.y + firstTilePosition.y) * earth.getTileSize() + 32,
    };
    const skeleton = new Skeleton({
        scene: scene,
        position: skeletonWorldPosition,
    });
    skeleton.enableObject();
    enemyGroup.add(skeleton);
    GameDataManager.instance.markCreatureEverCreated('skeleton');
    GameDataManager.instance.increaseLivingCreatureCount();

    // A lizard, added on an empty crystal tile next to the skeleton.
    const lizardTileOffset: Position = { x: 3, y: 8 };
    addTileAndVoid(earth, { x: firstTilePosition.x + lizardTileOffset.x, y: firstTilePosition.y + lizardTileOffset.y }, BIOME.CRYSTAL);
    const lizardWorldPosition = {
        x: (lizardTileOffset.x + firstTilePosition.x) * earth.getTileSize() + 32,
        y: (lizardTileOffset.y + firstTilePosition.y) * earth.getTileSize() + 32,
    };
    const lizard = new Lizard({
        scene: scene,
        position: lizardWorldPosition,
    });
    lizard.enableObject();
    enemyGroup.add(lizard);
    GameDataManager.instance.markCreatureEverCreated('lizardman');
    GameDataManager.instance.increaseLivingCreatureCount();

    // A lamb, added on a empty tile away from chests and the player.
    const lambTileOffset: Position = { x: 5, y: 0 };
    addTileAndVoid(earth, { x: firstTilePosition.x + lambTileOffset.x, y: firstTilePosition.y + lambTileOffset.y });
    const lambWorldPosition = {
        x: (lambTileOffset.x + firstTilePosition.x) * earth.getTileSize() + 10,
        y: (lambTileOffset.y + firstTilePosition.y) * earth.getTileSize() + 20,
    };
    const lamb = new Lamb({
        scene: scene,
        position: lambWorldPosition,
    });
    lamb.enableObject();
    critterGroup.add(lamb);
    GameDataManager.instance.increaseLivingCreatureCount();

    // A Chicken, added on a empty tile away from chests and the player.
    const chickenOffset: Position = { x: 5, y: -2 };
    addTileAndVoid(earth, { x: firstTilePosition.x + chickenOffset.x, y: firstTilePosition.y + chickenOffset.y });
    const chickenWorldPosition = {
        x: (chickenOffset.x + firstTilePosition.x) * earth.getTileSize() + 10,
        y: (chickenOffset.y + firstTilePosition.y) * earth.getTileSize() + 20,
    };
    const chicken = new Chicken({
        scene: scene,
        position: chickenWorldPosition,
    });
    chicken.enableObject();
    critterGroup.add(chicken);
    GameDataManager.instance.increaseLivingCreatureCount();

    // A Sheep, added on a empty tile away from chests and the player.
    const sheepOffset: Position = { x: 5, y: 2 };
    addTileAndVoid(earth, { x: firstTilePosition.x + sheepOffset.x, y: firstTilePosition.y + sheepOffset.y });
    const sheepWorldPosition = {
        x: (sheepOffset.x + firstTilePosition.x) * earth.getTileSize() + 10,
        y: (sheepOffset.y + firstTilePosition.y) * earth.getTileSize() + 20,
    };
    const sheep = new Sheep({
        scene: scene,
        position: sheepWorldPosition,
    });
    sheep.enableObject();
    critterGroup.add(sheep);
    GameDataManager.instance.increaseLivingCreatureCount();

    // A Piglet, added on a empty tile away from chests and the player.
    const pigletOffset: Position = { x: 5, y: 4 };
    addTileAndVoid(earth, { x: firstTilePosition.x + pigletOffset.x, y: firstTilePosition.y + pigletOffset.y });
    const pigletWorldPosition = {
        x: (pigletOffset.x + firstTilePosition.x) * earth.getTileSize() + 10,
        y: (pigletOffset.y + firstTilePosition.y) * earth.getTileSize() + 20,
    };
    const piglet = new Piglet({
        scene: scene,
        position: pigletWorldPosition,
    });
    piglet.enableObject();
    critterGroup.add(piglet);
    GameDataManager.instance.increaseLivingCreatureCount();

    // A Rooster, added on a empty tile away from chests and the player.
    const roosterOffset: Position = { x: 5, y: -4 };
    addTileAndVoid(earth, { x: firstTilePosition.x + roosterOffset.x, y: firstTilePosition.y + roosterOffset.y });
    const roosterWorldPosition = {
        x: (roosterOffset.x + firstTilePosition.x) * earth.getTileSize() + 10,
        y: (roosterOffset.y + firstTilePosition.y) * earth.getTileSize() + 20,
    };
    const rooster = new Rooster({
        scene: scene,
        position: roosterWorldPosition,
    });
    rooster.enableObject();
    critterGroup.add(rooster);
    GameDataManager.instance.increaseLivingCreatureCount();

    // A Turkey, added on a empty tile away from chests and the player.
    const turkeyOffset: Position = { x: 7, y: -2 };
    addTileAndVoid(earth, { x: firstTilePosition.x + turkeyOffset.x, y: firstTilePosition.y + turkeyOffset.y });
    const turkeyWorldPosition = {
        x: (turkeyOffset.x + firstTilePosition.x) * earth.getTileSize() + 10,
        y: (turkeyOffset.y + firstTilePosition.y) * earth.getTileSize() + 20,
    };
    const turkey = new Turkey({
        scene: scene,
        position: turkeyWorldPosition,
    });
    turkey.enableObject();
    critterGroup.add(turkey);
    GameDataManager.instance.increaseLivingCreatureCount();

    // A Bull, added on a empty tile away from chests and the player.
    const bullOffset: Position = { x: 7, y: 6 };
    addTileAndVoid(earth, { x: firstTilePosition.x + bullOffset.x, y: firstTilePosition.y + bullOffset.y });
    const bullWorldPosition = {
        x: (bullOffset.x + firstTilePosition.x) * earth.getTileSize() + 10,
        y: (bullOffset.y + firstTilePosition.y) * earth.getTileSize() + 20,
    };
    const bull = new Bull({
        scene: scene,
        position: bullWorldPosition,
    });
    bull.enableObject();
    critterGroup.add(bull);
    GameDataManager.instance.increaseLivingCreatureCount();

    // A Calf, added on a empty tile away from chests and the player.
    const calfOffset: Position = { x: 5, y: 6 };
    addTileAndVoid(earth, { x: firstTilePosition.x + calfOffset.x, y: firstTilePosition.y + calfOffset.y });
    const calfWorldPosition = {
        x: (calfOffset.x + firstTilePosition.x) * earth.getTileSize() + 10,
        y: (calfOffset.y + firstTilePosition.y) * earth.getTileSize() + 20,
    };
    const calf = new Calf({
        scene: scene,
        position: calfWorldPosition,
    });
    calf.enableObject();
    critterGroup.add(calf);
    GameDataManager.instance.increaseLivingCreatureCount();
}

function addTileAndVoid(earth: Earth, tilenumber: Position, biome: BIOME = BIOME.ROCK): void {
    earth.AddTile(new Tile({ tilenumber: tilenumber, biome }));
    earth.AddTile(new Tile({ tilenumber: { x: tilenumber.x + 1, y: tilenumber.y }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: tilenumber.x - 1, y: tilenumber.y }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: tilenumber.x, y: tilenumber.y + 1 }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: tilenumber.x, y: tilenumber.y - 1 }, biome: BIOME.VOID }));
}
