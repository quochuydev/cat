// Barrel module: re-exports the active cat version's sprites
// To switch cat version, change CAT_VERSION in ../config.ts

import { CAT_VERSION } from "../config";
import type { CatVersion } from "../config";

import * as v1Sprites from "../cat-v1/cat-sprites";
import * as v5Sprites from "../cat-v5/cat-sprites";

import { setupCatClickDetection as v1Click } from "../cat-v1/cat-interaction";
import { setupCatClickDetection as v5Click } from "../cat-v5/cat-interaction";

const ver: CatVersion = CAT_VERSION;

const spritesMap = { v1: v1Sprites, v5: v5Sprites };
const clickMap = { v1: v1Click, v5: v5Click };

const sprites = spritesMap[ver];

export const ANIMATIONS = sprites.ANIMATIONS;
export const FRAME_DURATION = sprites.FRAME_DURATION;
export const ACTION_DURATION = sprites.ACTION_DURATION;
export const MOVE_SPEED = sprites.MOVE_SPEED;
export const SPRITE_WIDTH = sprites.SPRITE_WIDTH;
export const SPRITE_HEIGHT = sprites.SPRITE_HEIGHT;
export const renderFrame = sprites.renderFrame;
export type CatAction = v1Sprites.CatAction;

export const setupCatClickDetection = clickMap[ver];
