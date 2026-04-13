import * as Phaser from 'phaser';
import { Position } from '../common/types';

export type TileConfig = {
    tilenumber: Position;
    object?: number;
    floating?: number;
    blocking?: number;
    decoration?: number;
    border?: number;
    animation?: number;
    biome?: number;
    chest?: number;
};

export class Tile {
    public tileX : number;
    public tileY : number;
    public object : number;
    public floating : number;
    public blocking : number;
    public decoration : number;
    public border : number;
    public animation : number;
    public biome : number;
    public chest : number;

    constructor(config: TileConfig) {
        this.tileX = config.tilenumber.x;
        this.tileY = config.tilenumber.y;
        this.object = config.object ?? -1;
        this.floating = config.floating ?? -1;
        this.blocking = config.blocking ?? -1;
        this.decoration = config.decoration ?? -1;
        this.border = config.border ?? -1;
        this.animation = config.animation ?? -1;
        this.biome = config.biome ?? -1;
        this.chest = config.chest ?? -1;
    }
}