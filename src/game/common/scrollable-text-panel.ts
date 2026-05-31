import * as Phaser from 'phaser';

export type ScrollableTextPanelEntry = {
    text: string;
    width: number;
    style: Phaser.Types.GameObjects.Text.TextStyle;
    topSpacing?: number;
};

export type ScrollableTextPanelConfig = {
    top: number;
    bottom: number;
    textX: number;
    textSpacing: number;
    keyboardScrollSpeed: number;
    wheelScrollSpeed: number;
    entries: ScrollableTextPanelEntry[];
    depth?: number;
};

export class ScrollableTextPanel {
    readonly #scene: Phaser.Scene;
    readonly #top: number;
    readonly #height: number;
    readonly #keyboardScrollSpeed: number;
    readonly #wheelScrollSpeed: number;
    readonly #container: Phaser.GameObjects.Container;
    readonly #cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
    #scrollOffset = 0;
    #maxScrollOffset = 0;

    readonly #handleWheel = (
        _pointer: Phaser.Input.Pointer,
        _gameObjects: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
    ) => {
        this.scroll(deltaY * this.#wheelScrollSpeed);
    };

    constructor(scene: Phaser.Scene, config: ScrollableTextPanelConfig) {
        this.#scene = scene;
        this.#top = config.top;
        this.#height = config.bottom - config.top;
        this.#keyboardScrollSpeed = config.keyboardScrollSpeed;
        this.#wheelScrollSpeed = config.wheelScrollSpeed;
        this.#container = scene.add.container(0, config.top).setDepth(config.depth ?? 0);
        this.#cursorKeys = scene.input.keyboard?.createCursorKeys();

        this.#createText(config);
        this.#addMask();
        this.#scene.input.on(Phaser.Input.Events.POINTER_WHEEL, this.#handleWheel);
    }

    update(delta: number): void {
        if (!this.#cursorKeys) {
            return;
        }

        const scrollAmount = this.#keyboardScrollSpeed * (delta / 1000);

        if (this.#cursorKeys.up.isDown) {
            this.scroll(-scrollAmount);
        }

        if (this.#cursorKeys.down.isDown) {
            this.scroll(scrollAmount);
        }
    }

    scroll(amount: number): void {
        this.#scrollOffset = Phaser.Math.Clamp(this.#scrollOffset + amount, 0, this.#maxScrollOffset);
        this.#container.y = this.#top - this.#scrollOffset;
    }

    destroy(): void {
        this.#scene.input.off(Phaser.Input.Events.POINTER_WHEEL, this.#handleWheel);
    }

    #createText(config: ScrollableTextPanelConfig): void {
        let currentY = 0;

        config.entries.forEach((entry) => {
            currentY += entry.topSpacing ?? 0;

            const text = this.#scene.add.text(config.textX, currentY, entry.text, {
                ...entry.style,
                wordWrap: {
                    ...entry.style.wordWrap,
                    width: entry.width,
                },
            });

            this.#container.add(text);
            currentY += text.height + config.textSpacing;
        });

        const contentHeight = Math.max(0, currentY - config.textSpacing);
        this.#maxScrollOffset = Math.max(0, contentHeight - this.#height);
    }

    #addMask(): void {
        Phaser.Actions.AddMaskShape(this.#container, {
            shape: 'rectangle',
            region: new Phaser.Geom.Rectangle(0, this.#top, this.#scene.scale.width, this.#height),
        });
    }
}
