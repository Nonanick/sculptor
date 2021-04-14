export function onScreen(node: HTMLElement, parameters: OnScreenActionParameter) {

  if (parameters.target == null) {
    console.info('[OnScreen Action] No target, NOOP');
  }

  let threshold = parameters.threshold ?? 0.1;

  let intersection = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const visibilitychanged = new CustomEvent<any>(
        'visibilitychange',
        { detail: { isVisible: entry.intersectionRatio > threshold }, bubbles: false }
      );

      node.dispatchEvent(visibilitychanged);
    });
  },
    {
     // root: document.body,
      threshold: threshold,
      rootMargin: parameters.margin
    }
  );

  let target = parameters.target;

  if (parameters.target != null) {
    intersection.observe(parameters.target);
  }

  return {
    destroy: () => {
      intersection.disconnect();
    },
    update: (newParameters: OnScreenActionParameter) => {

      if (target != null) {
        intersection.unobserve(target);
      }

      if (newParameters.target != null) {
        console.log('[OnScreen] Now observing target: ', target, threshold);
        intersection.observe(newParameters.target);
        target = newParameters.target;
      }

      if (newParameters.threshold != null) {
        threshold = newParameters.threshold;
      }

    }
  }
}

type OnScreenActionParameter = { target: HTMLElement; threshold?: number; margin?: string; };