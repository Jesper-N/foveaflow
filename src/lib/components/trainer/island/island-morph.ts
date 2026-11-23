interface Spring {
  x: number;
  v: number;
  target: number;
  stiffness: number;
  damping: number;
}

const WIDTH_SPRING = { damping: 24, stiffness: 380 };
const HEIGHT_SPRING = { damping: 22, stiffness: 300 };
const SHRINK_HEIGHT_STIFFNESS = 390;
const SHRINK_DAMPING_RATIO = 0.92;
const STRETCH_SHARE = 0.4;
const CORNER_RADIUS = 28;
const SUBSTEPS = 4;
const REST_DISTANCE = 0.25;
const REST_SPEED = 2;

const createSpring = (value: number, stiffness: number, damping: number) => ({
  damping,
  stiffness,
  target: value,
  v: 0,
  x: value,
});

const advance = (spring: Spring, elapsed: number) => {
  const force =
    -spring.stiffness * (spring.x - spring.target) - spring.damping * spring.v;

  spring.v += force * elapsed;
  spring.x += spring.v * elapsed;
};

const atRest = (spring: Spring) =>
  Math.abs(spring.x - spring.target) < REST_DISTANCE &&
  Math.abs(spring.v) < REST_SPEED;

export const createIslandMorph = (island: HTMLElement, notch: HTMLElement) => {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const width = createSpring(
    notch.offsetWidth,
    WIDTH_SPRING.stiffness,
    WIDTH_SPRING.damping
  );

  const height = createSpring(
    notch.offsetHeight,
    HEIGHT_SPRING.stiffness,
    HEIGHT_SPRING.damping
  );

  let expanded = false;
  let frame = 0;
  let previous = 0;

  const render = () => {
    const fullWidth = island.offsetWidth;
    const fullHeight = island.offsetHeight;
    const give = Math.max(-0.05, Math.min(0.05, -height.v / 7000));
    const shownWidth = width.x * (1 + give);
    const shownHeight = Math.max(height.x, 20);
    const insetX = Math.max(0, (fullWidth - shownWidth) / 2);
    const insetBottom = Math.max(0, fullHeight - shownHeight);
    const radius = Math.min(shownHeight / 2, CORNER_RADIUS);

    island.style.setProperty(
      "clip-path",
      `inset(0 ${insetX}px ${insetBottom}px round ${radius}px)`
    );
    const stretchX = Math.max(0, shownWidth / fullWidth - 1) * STRETCH_SHARE;
    const stretchY = Math.max(0, shownHeight / fullHeight - 1) * STRETCH_SHARE;

    island.style.setProperty("scale", `${1 + stretchX} ${1 + stretchY}`);
  };

  const tick = (now: number) => {
    const elapsed = Math.min((now - previous) / 1000, 1 / 30) / SUBSTEPS;

    previous = now;

    for (let step = 0; step < SUBSTEPS; step += 1) {
      advance(width, elapsed);
      advance(height, elapsed);
    }

    render();

    if (atRest(width) && atRest(height)) {
      width.x = width.target;
      height.x = height.target;
      width.v = 0;
      height.v = 0;
      render();
      frame = 0;

      return;
    }

    frame = requestAnimationFrame(tick);
  };

  const retarget = () => {
    const nextWidth = expanded ? island.offsetWidth : notch.offsetWidth;
    const nextHeight = expanded ? island.offsetHeight : notch.offsetHeight;
    const growing = nextHeight > height.target;

    width.target = nextWidth;
    height.target = nextHeight;
    height.stiffness = growing
      ? HEIGHT_SPRING.stiffness
      : SHRINK_HEIGHT_STIFFNESS;
    width.damping = growing
      ? WIDTH_SPRING.damping
      : 2 * Math.sqrt(width.stiffness) * SHRINK_DAMPING_RATIO;
    height.damping = growing
      ? HEIGHT_SPRING.damping
      : 2 * Math.sqrt(height.stiffness) * SHRINK_DAMPING_RATIO;

    if (still) {
      width.x = nextWidth;
      height.x = nextHeight;
      render();

      return;
    }

    if (frame === 0) {
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  const resize = new ResizeObserver(retarget);

  resize.observe(island);
  render();

  return {
    destroy: () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
    },
    setExpanded: (next: boolean) => {
      expanded = next;
      retarget();
    },
  };
};
