import type { SvelteComponent } from "svelte";
import type { SVGIconStyle } from "../../../interface/svg_icon/SVGIconStyle";

export interface DataListField {
  name : string;

  title?: string;
  hint? : string;
  icon? : string | { src : string } & SVGIconStyle;

  output? : string | ( (data : any) => {
    component : typeof SvelteComponent;
    componentArgs : any;
  });

  order? : number;

  size? : {
    grow?: number;
    shrink? : number;
    base?: number;
  };
  
  sortable? : 'ASC' | 'DESC';

}