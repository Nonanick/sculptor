export interface Style extends Partial<CSSStyleDeclaration> {
  
}

export function getComputedStyles(styles : Style) : string {
  return Object.entries(styles).map(([name, value]) => {
    return `${name.split(/(?=[A-Z])/).join('-')}:${value};`;
  }).join(' ');
}