(() => {
  const mark = document.querySelector('.brand-mark');
  const stage = mark?.querySelector('.brand-mark-stage');
  const letters = [...(mark?.querySelectorAll('.mark-letter') ?? [])];

  if (!mark || !stage || !letters.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeAnimations = [];
  let ordered = false;

  const cancelAnimations = () => {
    activeAnimations.forEach((animation) => animation.cancel());
    activeAnimations = [];
  };

  const currentFrame = (letter) => ({
    transform: getComputedStyle(letter).transform,
    opacity: getComputedStyle(letter).opacity
  });

  const measurements = (letter) => {
    const scale = stage.getBoundingClientRect().width / 780;
    const style = letter.style;
    const restX = Number.parseFloat(style.getPropertyValue('--x'));
    const restY = Number.parseFloat(style.getPropertyValue('--y'));
    const targetX = Number.parseFloat(style.getPropertyValue('--tx'));
    const targetY = Number.parseFloat(style.getPropertyValue('--ty'));

    return {
      dx: (targetX - restX) * scale,
      dy: (targetY - restY) * scale,
      nudgeX: Number.parseFloat(style.getPropertyValue('--nx')) * scale,
      nudgeY: Number.parseFloat(style.getPropertyValue('--ny')) * scale,
      nudgeRotation: Number.parseFloat(style.getPropertyValue('--nr'))
    };
  };

  const settleIntoName = () => {
    if (ordered) return;
    ordered = true;
    const starts = letters.map(currentFrame);
    cancelAnimations();

    letters.forEach((letter, index) => {
      const { dx, dy, nudgeX, nudgeY, nudgeRotation } = measurements(letter);
      const hiddenAtRest = letter.matches('.concealed-letter');
      const start = starts[index];
      const arcDirection = index % 2 === 0 ? -1 : 1;
      const arcLift = (5 + (index % 3) * 2) * arcDirection;

      const animation = letter.animate(
        [
          {
            transform: start.transform,
            opacity: start.opacity,
            offset: 0
          },
          {
            transform: `translate3d(${nudgeX}px, ${nudgeY}px, 0) rotate(${nudgeRotation}deg)`,
            opacity: hiddenAtRest ? 0 : 1,
            offset: 0.24
          },
          {
            transform: `translate3d(${dx * 0.62}px, ${dy * 0.62 + arcLift}px, 0) rotate(${nudgeRotation * 0.35}deg)`,
            opacity: 1,
            offset: 0.62
          },
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) rotate(0deg)`,
            opacity: 1,
            offset: 1
          }
        ],
        {
          duration: reduceMotion.matches ? 1 : 760,
          delay: reduceMotion.matches ? 0 : index * 17,
          easing: 'cubic-bezier(0.22, 0.72, 0.18, 1)',
          fill: 'forwards'
        }
      );

      activeAnimations.push(animation);
    });
  };

  const loosenBackToRest = () => {
    if (!ordered) return;
    ordered = false;

    const starts = letters.map(currentFrame);
    cancelAnimations();

    const leaveOrder = [3, 7, 1, 9, 5, 0, 10, 4, 8, 2, 6];

    letters.forEach((letter, index) => {
      const hiddenAtRest = letter.matches('.concealed-letter');
      const { nudgeX, nudgeY, nudgeRotation } = measurements(letter);
      const orderIndex = leaveOrder.indexOf(index);
      const start = starts[index];

      const animation = letter.animate(
        [
          {
            transform: start.transform,
            opacity: start.opacity,
            offset: 0
          },
          {
            transform: `translate3d(${nudgeX * -0.7}px, ${nudgeY * -0.7}px, 0) rotate(${-nudgeRotation * 0.55}deg)`,
            opacity: hiddenAtRest ? 0.55 : 1,
            offset: 0.56
          },
          {
            transform: 'translate3d(0, 0, 0) rotate(0deg)',
            opacity: hiddenAtRest ? 0 : 1,
            offset: 1
          }
        ],
        {
          duration: reduceMotion.matches ? 1 : 680,
          delay: reduceMotion.matches ? 0 : orderIndex * 15,
          easing: 'cubic-bezier(0.32, 0, 0.18, 1)',
          fill: 'forwards'
        }
      );

      animation.onfinish = () => {
        if (!ordered) animation.cancel();
      };

      activeAnimations.push(animation);
    });
  };

  mark.addEventListener('pointerenter', settleIntoName);
  mark.addEventListener('pointerleave', loosenBackToRest);
  mark.addEventListener('focusin', settleIntoName);
  mark.addEventListener('focusout', loosenBackToRest);
})();
