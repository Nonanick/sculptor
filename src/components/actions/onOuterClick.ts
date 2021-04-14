export function listenToOuterClick(
  node: HTMLElement,
  parameters?: { stopPropagation?: boolean; preventDefault?: boolean; container?: HTMLElement }
) {

  const targetClickListener = (ev: MouseEvent) => {

    if (parameters?.stopPropagation === true) ev.stopImmediatePropagation();
    if (parameters?.stopPropagation === true) ev.preventDefault();

    const outerClickEvent = new CustomEvent('outerclick', { bubbles: false });

    node.dispatchEvent(outerClickEvent);

  };

  let target = parameters?.container ?? document.body;

  target.addEventListener('click', targetClickListener);

  return {
    destroy() {
      target.removeEventListener('outerclick', targetClickListener)
    }
  }
}