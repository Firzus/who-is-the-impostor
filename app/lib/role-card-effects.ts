const MAX_TILT = 12;
const HOVER_SCALE = 1.05;

interface CardRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CardPointerInput {
  pointerX: number;
  pointerY: number;
  rect: CardRect;
}

interface RoleCardHoverState {
  revealed: boolean;
  animationComplete: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function getRelativePosition({ pointerX, pointerY, rect }: CardPointerInput) {
  const x = clamp((pointerX - rect.left) / rect.width, 0, 1);
  const y = clamp((pointerY - rect.top) / rect.height, 0, 1);

  return { x, y };
}

export function getCardHoverState(input: CardPointerInput) {
  const { x, y } = getRelativePosition(input);
  const offsetX = x * 2 - 1;
  const offsetY = y * 2 - 1;

  return {
    rotateX: round(-offsetY * MAX_TILT),
    rotateY: round(offsetX * MAX_TILT),
    scale: HOVER_SCALE,
    glareX: round(x * 100),
    glareY: round(y * 100),
  };
}

export function createHolographicBackground(input: CardPointerInput) {
  const { glareX, glareY } = getCardHoverState(input);

  return `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.55), rgba(255,255,255,0.18) 18%, rgba(255,255,255,0) 42%), linear-gradient(135deg, rgba(80, 220, 255, 0.18), rgba(160, 120, 255, 0.2), rgba(255, 120, 180, 0.18), rgba(255, 220, 120, 0.2))`;
}

export function isRoleCardHoverEnabled({
  revealed,
  animationComplete,
}: RoleCardHoverState) {
  return revealed && animationComplete;
}
