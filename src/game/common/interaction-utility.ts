import * as Phaser from 'phaser';
import { INTERACTIVE_OBJECT_TYPE } from './common';
import { GameObject2, InteractiveObjectType } from './types';
import { InteractiveObjectComponent } from '../components/game-object/interactive-object-component';
import { isArcadePhysicsBody } from './utils';

export type FindNearestInteractiveObjectOptions = {
  maxDistance: number;
  objectType?: InteractiveObjectType;
};

export function getInteractionPoint(gameObject: GameObject2): Phaser.Math.Vector2 {
  if (isArcadePhysicsBody(gameObject.body)) {
    return new Phaser.Math.Vector2(gameObject.body.center.x, gameObject.body.center.y);
  }

  const bounds = gameObject.getBounds();
  return new Phaser.Math.Vector2(bounds.centerX, bounds.centerY);
}

export function findNearestInteractiveObject(
  actor: GameObject2,
  candidates: GameObject2[],
  options: FindNearestInteractiveObjectOptions,
): GameObject2 | undefined {
  const actorPoint = getInteractionPoint(actor);
  let nearestObject: GameObject2 | undefined;
  let nearestDistance = options.maxDistance;

  for (const candidate of candidates) {
    if (!candidate.active || !candidate.visible) {
      continue;
    }

    const interactiveObjectComponent = InteractiveObjectComponent.getComponent<InteractiveObjectComponent>(candidate);
    if (interactiveObjectComponent === undefined) {
      continue;
    }

    if (options.objectType !== undefined && interactiveObjectComponent.objectType !== options.objectType) {
      continue;
    }

    if (!interactiveObjectComponent.canInteractWith()) {
      continue;
    }

    const candidatePoint = getInteractionPoint(candidate);
    const distance = Phaser.Math.Distance.Between(actorPoint.x, actorPoint.y, candidatePoint.x, candidatePoint.y);
    if (distance > nearestDistance) {
      continue;
    }

    nearestObject = candidate;
    nearestDistance = distance;
  }

  return nearestObject;
}

export function findNearestOpenInteractiveObject(
  actor: GameObject2,
  candidates: GameObject2[],
  maxDistance: number,
): GameObject2 | undefined {
  return findNearestInteractiveObject(actor, candidates, {
    maxDistance,
    objectType: INTERACTIVE_OBJECT_TYPE.OPEN,
  });
}