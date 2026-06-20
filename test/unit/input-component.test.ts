import { describe, expect, it } from 'vitest';
import { InputComponent } from '../../src/game/components/input/input-component';

// InputComponent is the programmatic input seam: setting its properties is how
// AI/enemies (and tests) drive a character without a real keyboard.
describe('InputComponent', () => {
  it('defaults to no input', () => {
    const input = new InputComponent();
    expect(input.isUpDown).toBe(false);
    expect(input.isCastKeyJustDown).toBe(false);
    expect(input.isMovementLocked).toBe(false);
  });

  it('reflects programmatically-set directions and action keys', () => {
    const input = new InputComponent();
    input.isRightDown = true;
    input.isCastKeyJustDown = true;

    expect(input.isRightDown).toBe(true);
    expect(input.isCastKeyJustDown).toBe(true);
  });

  it('reset() clears every input flag', () => {
    const input = new InputComponent();
    input.isUpDown = true;
    input.isAttackKeyJustDown = true;
    input.isMovementLocked = true;

    input.reset();

    expect(input.isUpDown).toBe(false);
    expect(input.isAttackKeyJustDown).toBe(false);
    expect(input.isMovementLocked).toBe(false);
  });
});
