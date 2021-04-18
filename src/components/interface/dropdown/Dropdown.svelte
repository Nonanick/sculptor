<script lang="ts">
  import SvgIcon from "../svg_icon/SVGIcon.svelte";
  import { listenToOuterClick } from "../../actions/onOuterClick";
  import type { DropdownStyle } from "./DropdownStyle";

  export let placeholder: string = "";
  export let expanded: boolean = false;
  export let styles: Partial<DropdownStyle> = {};
  export let outerClickContainer: HTMLElement = document.body;
</script>

<div
  class="ui-dropdown {expanded ? 'expanded' : ''} clickable"
  on:click|stopPropagation
  on:click
  on:dblclick
  on:contextmenu
  use:listenToOuterClick={{ container: outerClickContainer }}
  on:outerclick={() => {
    expanded = false;
  }}
>
  <div
    class="ui-dropdown-arrow"
    style="transform: rotate({expanded ? '180' : '0'}deg);"
    on:click|stopPropagation={() => {
      expanded = !expanded;
    }}
  >
    <SvgIcon
      src="/img/icons/arrow.svg"
      styles={{
        ...styles,
        size: "0.8em",
      }}
    />
  </div>
  <div
    class="ui-dropdown-header"
    on:click|stopPropagation={() => (expanded = !expanded)}
  >
    <slot name="header">{placeholder}</slot>
  </div>
  <div class="ui-dropdown-items">
    <slot />
  </div>
</div>

<style>
  .ui-dropdown {
    position: relative;
    width: 100%;
    height: auto;
    line-height: calc(var(--item-height, 35px) - 6px);
    background-color: var(--background-color);
    box-shadow: var(--box-shadow-1);
    box-sizing: border-box;
    border-radius: var(--border-radius);
    transform: rotate(0deg);
    z-index: 10;
    border: 1px solid transparent;
    border-bottom: 0;
    transition: border 0.4s;

  }
  .ui-dropdown-header {
    padding: var(--item-padding, 6px 15px);
    margin-right: 30px;
  }
  .ui-dropdown.expanded {
    height: auto;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border: 1px solid var(--main-color-25);
    border-bottom: 0;
  }
  .ui-dropdown-arrow {
    position: absolute;
    top: 3px;
    right: 20px;
    transition: transform 0.4s;
  }
  .ui-dropdown-items {
    position: fixed;
    top:  var(--item-height, 35px);
    left: -1px;
    width: 100%;
    height: 0px;
    overflow: hidden;
    z-index: 999;
    border: 1px solid transparent;
    transition: border 0.4s;
    border-top: 0;
    border-radius: var(--border-radius);
    border-top-left-radius: 0;
    border-top-right-radius: 0;

  }
  .expanded > .ui-dropdown-items {
    height: auto;
    border: 1px solid var(--main-color-25);
    border-top: 0;
  }
</style>
