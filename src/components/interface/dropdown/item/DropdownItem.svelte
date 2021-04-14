<script lang="ts">
  import SvgIcon from "../../svg_icon/SVGIcon.svelte";
  import type { SVGIconStyle } from "../../svg_icon/SVGIconStyle";

  export let icon: string;
  export let icon_style: Partial<SVGIconStyle> = {};

  export let title: string;
</script>

<div class="ui-dropdown-item">
  {#if icon != null}
    <div class="ui-dropdown-icon">
      <SvgIcon src={icon} styles={icon_style} />
    </div>
  {/if}
  <div class="ui-dropdown-title">
    {title}
  </div>
  <div class="ui-dropdown-buttons">
    <slot name="buttons"></slot>
  </div>
</div>
