<script lang="ts">
import SvgIcon from "../svg_icon/SVGIcon.svelte";
import type { DropdownStyle } from "./DropdownStyle";

 export let placeholder : string = "";
 export let expanded : boolean = false;
 export let styles : Partial<DropdownStyle> = {};

</script>

<div class="ui-dropdown {expanded ? 'expanded' : ''}" >
  <div class="ui-dropdown-arrow">
    <SvgIcon src="/img/icons/arrow.svg" styles={styles}></SvgIcon>
  </div>
  <div class="ui-dropdown-header" on:click={() => expanded = !expanded }>
    <slot name="header"> {placeholder} </slot>
  </div>
  <div class="ui-dropdown-items">
    <slot></slot>
  </div>
</div>

<style>
 
</style>
