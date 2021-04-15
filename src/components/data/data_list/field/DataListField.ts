import type { SvelteComponent } from "svelte";
import type { SVGIconStyle } from "../../../interface/svg_icon/SVGIconStyle";

export interface DataListField {
  name : string;
  title : string;
  hint? : string;
  icon? : string | { src : string } & SVGIconStyle;

  output : string | ( (data : any) => string);

  order? : number;
  
  sortable? : 'ASC' | 'DESC';

  use?: SvelteComponent;


}