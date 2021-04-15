<script lang="ts">
  import SvgIcon from "../svg_icon/SVGIcon.svelte";
  import type { SVGIconStyle } from "../svg_icon/SVGIconStyle";

  export let shape: "circle" | "square" | "rounded-square" | "none" = "circle";

  export let src: string;

  export let icon_style: Partial<SVGIconStyle> = {
    margin: "0.6em",
  };
</script>

<div
  class="ui-icon-button clickable bg-shape {shape}"
  on:click
  on:contextmenu
  on:mousedown
  on:mouseleave
  on:mouseup
  on:mouseleave
  on:dblclick
>
  <SvgIcon
    {src}
    styles={{
      color: "var(--text-on-main-color)",
      ...icon_style,
    }}
  />
</div>

<style>
  .ui-icon-button {
    display: inline-grid;
    box-sizing: border-box;
    grid-template: 1fr / 1fr;
    align-items: center;
    justify-items: center;
    vertical-align: middle;
  }

  .bg-shape {
    background-color: var(--main-color);
    box-shadow: var(--box-shadow-2);
  }

  .bg-shape.circle {
    border-radius: 50%;
  }

  .bg-shape.square {
    border-radius: 3px;
  }

  .bg-shape.rounded-square {
    border-radius: 5% 30% 30% 30%;
  }
</style>
