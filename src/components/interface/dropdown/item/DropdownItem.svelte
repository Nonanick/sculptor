<script lang="ts">
  import SvgIcon from "../../svg_icon/SVGIcon.svelte";
  import type { SVGIconStyle } from "../../svg_icon/SVGIconStyle";

  export let icon: string;
  export let icon_style: Partial<SVGIconStyle> = {};

  export let title: string;
</script>

<div class="ui-dropdown-item clickable" on:click on:contextmenu on:dblclick>
  <div class="ui-dropdown-icon">
    {#if icon != null}
      <SvgIcon src={icon} styles={icon_style} />
    {/if}
  </div>
  <div class="ui-dropdown-title">
    {title}
  </div>
  <div class="ui-dropdown-buttons">
    <slot name="buttons" />
  </div>
</div>

<style>
  .ui-dropdown-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    filter: brightness(100%);
    transition: filter 0.3s;
    background-color: var(--background-color);
    padding: var(--item-padding, 6px 15px);
  }
  .ui-dropdown-item :global(.ui-icon) {
    margin-right: 10px;
  }
  .ui-dropdown-item:hover {
    filter: brightness(var(--accent-brightness, 90%));
  }
</style>
