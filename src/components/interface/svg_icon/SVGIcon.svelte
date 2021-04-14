<script lang="ts">
  import DefaultStyles from "../../style.defaults";

  import type { SVGIconStyle } from "./SVGIconStyle";

  export let src: string;

  export let styles: Partial<SVGIconStyle> = {};

  const defaultStyles: SVGIconStyle = DefaultStyles.interface.SVGIcon;
</script>

<div
  class="ui-icon {$$props.class ?? ''}"
  style="
  --source: url({src}); 
  --size : {styles.size ??
    defaultStyles.size}; 
  --icon-color: {styles.color ??
    defaultStyles.color}; 
  --radius: {styles.box_radius ??
    defaultStyles.box_radius}; 
  --bg-color : {styles.bg_color ??
    defaultStyles.bg_color}; 
  --aspect-ratio: {styles.aspect_ratio ??
    defaultStyles.aspect_ratio};
  --margin: {styles.margin ??
    defaultStyles.margin}
  "
>
  <div class="fix-ratio" />
</div>

<style>
  @keyframes bellshake {
    0% {
      transform: rotate(0);
    }
    30% {
      transform: rotate(-8deg);
    }
    60% {
      transform: rotate(6deg);
    }
    85% {
      transform: rotate(-4deg);
    }
    92% {
      transform: rotate(2deg);
    }
    100% {
      transform: rotate(0);
    }
  }

  :global(.ui-icon.clickable:hover > .fix-ratio),
  :global(.clickable .ui-icon:hover > .fix-ratio) {
    animation: bellshake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
  :global(.ui-icon) {
    position: relative;
    display: inline-block;
    width: var(--size);
    height: var(--size);

    background-color: var(--bg-color);
    overflow: hidden;
    vertical-align: middle;
    margin: var(--margin);
  }
  :global(.ui-icon > .fix-ratio) {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    padding-top: calc(var(--aspect-ratio) * 100%);
    background-color: var(--icon-color);

    -webkit-mask-image: var(--source);
    mask-image: var(--source);

    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;

    -webkit-mask-position: center;
    mask-position: center;

    -webkit-mask-size: 100%;
    mask-size: 100%;
  }
</style>
