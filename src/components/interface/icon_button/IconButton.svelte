<script lang="ts">
  import SvgIcon from "../svg_icon/SVGIcon.svelte";
import type { SVGIconStyle } from "../svg_icon/SVGIconStyle";

  export let shape: "circle" | "square" | "rounded-square" | "none" =
    "circle";

  export let src: string;

  export let icon_style : Partial<SVGIconStyle> = {
    margin: "0.5em"
  };

</script>

<style>
  .ui-icon-button {
    display: inline-block;
    vertical-align: middle;
    padding: 3px;
    box-sizing: border-box;
  }

  .bg-shape {
    background-color: var(--main-color);
    box-shadow: var(--box-shadow-2);
    padding: 0.3em;
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

<div
  class="ui-icon-button clickable"
  on:click
  on:contextmenu
  on:mousedown
  on:mouseleave
  on:mouseup
  on:mouseleave
  on:dblclick
>
  <div class="bg-shape {shape}">
    <SvgIcon
      {src}
      styles={{
        color: "var(--text-on-main-color)",
        ...icon_style
      }}
    />
  </div>
</div>
