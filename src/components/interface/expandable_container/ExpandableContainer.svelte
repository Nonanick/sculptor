<script lang="ts">
  import SvgIcon from "../svg_icon/SVGIcon.svelte";
  import type { ExpandableContainerStyle } from "./ExpandableContainerStyle";

  export let placeholder: string = "";
  export let expanded: boolean = false;
  export let styles: Partial<ExpandableContainerStyle> = {};
</script>

<div
  class="ui-expandable-container {expanded ? 'expanded' : ''}"
  on:click|stopPropagation
  on:click
  on:dblclick
  on:contextmenu
>
  <div
    class="ui-expandable-container-arrow  clickable"
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
    class="ui-expandable-container-header clickable"
    on:click|stopPropagation={() => (expanded = !expanded)}
  >
    <slot name="header">{placeholder}</slot>
  </div>
  <div class="ui-expandable-container-items">
    <slot />
  </div>
</div>

<style>
  .ui-expandable-container {
    position: relative;
    width: 100%;
    height: var(--height, 35px);
    line-height: calc(var(--item-height, 35px) - 6px);
    background-color: var(--transparent-background-70);
    box-sizing: border-box;
    border-radius: var(--border-radius);
    padding: var(--item-padding, 6px 15px);

  }

  .ui-expandable-container.expanded {
    height: auto;
  }
  .ui-expandable-container-arrow {
    position: absolute;
    top: 3px;
    right: 20px;
    transition: transform 0.4s;
  }
  .ui-expandable-container-items {
    position: relative;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 0px;
    overflow: hidden;
  }
  .expanded > .ui-expandable-container-items {
    height: auto;
  }
</style>
