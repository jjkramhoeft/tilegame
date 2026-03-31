import Phaser from 'phaser';
import {
    ACTOR_DEPTH_BASE,
    BASE_LAYER_DEPTH,
    BASE_TILESET_KEY,
    BLOCKING_TILESET_KEY,
    BORDER_LAYER_DEPTH,
    BORDER_TILESET_KEY,
    DECORATION_LAYER_DEPTH,
    DECORATION_TILESET_KEY,
    DEMO_BASE_LAYER,
    DEMO_BLOCKING_PLACEMENTS,
    DEMO_BORDER_LAYER,
    DEMO_DECORATION_LAYER,
    EMPTY_TILE,
    FLOATING_LAYER_DEPTH,
    FLOATING_TILESET_KEY,
    TILE_SIZE,
    ANIMATED_LAYER_DEPTH,
    ANIMATED_BASE_TILE_CONFIG,
    ANIMATED_TILESET_KEY,
    getAnimatedTileConfig,
    getBlockingTileMetadata,
    toTileKey,
} from './TileConfig';

type DepthTrackedObject = Phaser.GameObjects.GameObject & {
    y: number;
    setDepth: (depth: number) => Phaser.GameObjects.GameObject;
};

interface OccupiedTile
{
    x: number;
    y: number;
}

interface BlockingTileRuntime
{
    image: Phaser.GameObjects.Image;
    collisionHeight: number;
    collisionOffsetY: number;
    sortY: number;
}

export class WorldMap
{
    private readonly scene: Phaser.Scene;
    private readonly baseTiles = new Map<string, Phaser.GameObjects.Image>();
    private readonly animatedTiles = new Map<string, Phaser.GameObjects.Sprite>();
    private readonly borderTiles = new Map<string, Phaser.GameObjects.Image>();
    private readonly decorationTiles = new Map<string, Phaser.GameObjects.Image>();
    private readonly blockingTiles = new Map<string, BlockingTileRuntime>();
    private readonly floatingTiles = new Map<string, Phaser.GameObjects.Image>();
    private readonly occupiedTiles = new Map<string, OccupiedTile>();
    private trackedDepthTarget?: DepthTrackedObject;

    constructor (scene: Phaser.Scene)
    {
        this.scene = scene;
        this.registerAnimations();
    }

    static preload (scene: Phaser.Scene): void
    {
        scene.load.spritesheet(BASE_TILESET_KEY, 'tile-base.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });

        scene.load.spritesheet(ANIMATED_TILESET_KEY, 'tile-animated.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });

        scene.load.spritesheet(BORDER_TILESET_KEY, 'tile-boarder.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });

        scene.load.spritesheet(DECORATION_TILESET_KEY, 'tile-decoration.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });

        scene.load.spritesheet(BLOCKING_TILESET_KEY, 'tile-blocking.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });

        scene.load.spritesheet(FLOATING_TILESET_KEY, 'tile-floating.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });
    }

    initializeEmpty (): void
    {
        this.refreshCameraBounds();
    }

    seedDemoWorld (): void
    {
        for (let y = 0; y < DEMO_BASE_LAYER.length; y++) {
            for (let x = 0; x < DEMO_BASE_LAYER[y].length; x++) {
                this.CreateTile(
                    x,
                    y,
                    DEMO_BASE_LAYER[y][x],
                    DEMO_BORDER_LAYER[y][x],
                    DEMO_DECORATION_LAYER[y][x],
                    EMPTY_TILE,
                    EMPTY_TILE
                );
            }
        }

        for (const placement of DEMO_BLOCKING_PLACEMENTS) {
            this.CreateTile(
                placement.x,
                placement.y,
                DEMO_BASE_LAYER[placement.y][placement.x],
                DEMO_BORDER_LAYER[placement.y][placement.x],
                DEMO_DECORATION_LAYER[placement.y][placement.x],
                placement.blocking,
                placement.floating ?? EMPTY_TILE
            );
        }
    }

    CreateTile (
        x: number,
        y: number,
        base: number,
        border: number,
        decoration: number,
        blocking: number,
        floating: number
    ): void
    {
        this.createTile(x, y, base, border, decoration, blocking, floating);
    }

    createTile (
        x: number,
        y: number,
        base: number,
        border = EMPTY_TILE,
        decoration = EMPTY_TILE,
        blocking = EMPTY_TILE,
        floating = EMPTY_TILE
    ): void
    {
        this.renderStaticTile(this.baseTiles, BASE_TILESET_KEY, BASE_LAYER_DEPTH, x, y, base);
        this.renderAnimatedTile(x, y, base);
        this.renderStaticTile(this.borderTiles, BORDER_TILESET_KEY, BORDER_LAYER_DEPTH, x, y, border);
        this.renderStaticTile(this.decorationTiles, DECORATION_TILESET_KEY, DECORATION_LAYER_DEPTH, x, y, decoration);
        this.renderBlockingTile(x, y, blocking);
        this.renderStaticTile(this.floatingTiles, FLOATING_TILESET_KEY, FLOATING_LAYER_DEPTH, x, y, floating);
        this.syncOccupiedTile(x, y, base, border, decoration, blocking, floating);
    }

    clearTile (x: number, y: number): void
    {
        this.createTile(x, y, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE);
    }

    setTrackedDepthTarget (target?: DepthTrackedObject): void
    {
        this.trackedDepthTarget = target;

        if (target) {
            target.setDepth(ACTOR_DEPTH_BASE + target.y);
        }
    }

    update (): void
    {
        if (this.trackedDepthTarget) {
            this.trackedDepthTarget.setDepth(ACTOR_DEPTH_BASE + this.trackedDepthTarget.y);
        }
    }

    isBlockedAtTile (x: number, y: number): boolean
    {
        return this.blockingTiles.has(toTileKey(x, y));
    }

    getBlockingSortY (x: number, y: number): number | undefined
    {
        return this.blockingTiles.get(toTileKey(x, y))?.sortY;
    }

    getBlockingCollisionRect (x: number, y: number): Phaser.Geom.Rectangle | undefined
    {
        const tile = this.blockingTiles.get(toTileKey(x, y));

        if (!tile) {
            return undefined;
        }

        return new Phaser.Geom.Rectangle(
            x * TILE_SIZE,
            y * TILE_SIZE + tile.collisionOffsetY,
            TILE_SIZE,
            tile.collisionHeight
        );
    }

    private registerAnimations (): void
    {
        for (const config of Object.values(ANIMATED_BASE_TILE_CONFIG)) {
            if (this.scene.anims.exists(config.animKey)) {
                continue;
            }

            this.scene.anims.create({
                key: config.animKey,
                frames: this.scene.anims.generateFrameNumbers(ANIMATED_TILESET_KEY, {
                    start: config.startFrame,
                    end: config.endFrame,
                }),
                frameRate: config.frameRate,
                repeat: -1,
            });
        }
    }

    private renderStaticTile (
        layer: Map<string, Phaser.GameObjects.Image>,
        textureKey: string,
        depth: number,
        x: number,
        y: number,
        frame: number
    ): void
    {
        const key = toTileKey(x, y);
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;
        const existingTile = layer.get(key);

        if (frame === EMPTY_TILE) {
            existingTile?.destroy();
            layer.delete(key);
            return;
        }

        if (existingTile) {
            existingTile.setPosition(worldX, worldY);
            existingTile.setTexture(textureKey, frame);
            existingTile.setDepth(depth);
            return;
        }

        layer.set(
            key,
            this.scene.add
                .image(worldX, worldY, textureKey, frame)
                .setOrigin(0, 0)
                .setDepth(depth)
        );
    }

    private renderAnimatedTile (x: number, y: number, baseTileIndex: number): void
    {
        const key = toTileKey(x, y);
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;
        const animatedConfig = getAnimatedTileConfig(baseTileIndex);
        const existingTile = this.animatedTiles.get(key);

        if (!animatedConfig) {
            existingTile?.destroy();
            this.animatedTiles.delete(key);
            return;
        }

        if (existingTile) {
            existingTile.setPosition(worldX, worldY);
            existingTile.setDepth(ANIMATED_LAYER_DEPTH);
            existingTile.play(animatedConfig.animKey, true);
            return;
        }

        const tile = this.scene.add
            .sprite(worldX, worldY, ANIMATED_TILESET_KEY)
            .setOrigin(0, 0)
            .setDepth(ANIMATED_LAYER_DEPTH)
            .play(animatedConfig.animKey);

        this.animatedTiles.set(key, tile);
    }

    private renderBlockingTile (x: number, y: number, frame: number): void
    {
        const key = toTileKey(x, y);
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;
        const existingTile = this.blockingTiles.get(key);

        if (frame === EMPTY_TILE) {
            existingTile?.image.destroy();
            this.blockingTiles.delete(key);
            return;
        }

        const metadata = getBlockingTileMetadata(frame);
        const sortY = worldY + metadata.sortOffsetY;
        const depth = ACTOR_DEPTH_BASE + sortY;

        if (existingTile) {
            existingTile.image.setPosition(worldX, worldY);
            existingTile.image.setTexture(BLOCKING_TILESET_KEY, frame);
            existingTile.image.setDepth(depth);
            existingTile.collisionHeight = metadata.collisionHeight;
            existingTile.collisionOffsetY = metadata.collisionOffsetY;
            existingTile.sortY = sortY;
            return;
        }

        this.blockingTiles.set(key, {
            image: this.scene.add
                .image(worldX, worldY, BLOCKING_TILESET_KEY, frame)
                .setOrigin(0, 0)
                .setDepth(depth),
            collisionHeight: metadata.collisionHeight,
            collisionOffsetY: metadata.collisionOffsetY,
            sortY,
        });
    }

    private syncOccupiedTile (
        x: number,
        y: number,
        base: number,
        border: number,
        decoration: number,
        blocking: number,
        floating: number
    ): void
    {
        const key = toTileKey(x, y);
        const hasVisibleTile =
            base !== EMPTY_TILE ||
            border !== EMPTY_TILE ||
            decoration !== EMPTY_TILE ||
            blocking !== EMPTY_TILE ||
            floating !== EMPTY_TILE;

        if (hasVisibleTile) {
            this.occupiedTiles.set(key, { x, y });
        } else {
            this.occupiedTiles.delete(key);
        }

        this.refreshCameraBounds();
    }

    private refreshCameraBounds (): void
    {
        if (this.occupiedTiles.size === 0) {
            this.scene.cameras.main.setBounds(
                0,
                0,
                Math.max(this.scene.scale.width, TILE_SIZE),
                Math.max(this.scene.scale.height, TILE_SIZE)
            );
            return;
        }

        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        for (const tile of this.occupiedTiles.values()) {
            minX = Math.min(minX, tile.x);
            minY = Math.min(minY, tile.y);
            maxX = Math.max(maxX, tile.x);
            maxY = Math.max(maxY, tile.y);
        }

        this.scene.cameras.main.setBounds(
            minX * TILE_SIZE,
            minY * TILE_SIZE,
            (maxX - minX + 1) * TILE_SIZE,
            (maxY - minY + 1) * TILE_SIZE
        );
    }
}
