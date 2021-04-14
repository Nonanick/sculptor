export function portal (node : HTMLElement, parameters?: PortalParameters ) {

  let target = parameters?.to ?? document.body;

  if(typeof target === 'string') {
    target = document.body.querySelector(target) as HTMLElement ?? document.body;
  }

  target.append(node);

  return {
    destroy() {
      node.remove();
    }
  }
}

export interface PortalParameters {
  to?: HTMLElement | string;

}