<script lang="ts">
import SvgIcon from "../svg_icon/SVGIcon.svelte";

export let expanded : boolean = false;

</script>

<div class="ui-expandable-container {expanded ? 'expanded' : ''}">
  <slot name="header"></slot>
  <slot></slot>
  <div class="ui-expandable-container-arrow">
    <SvgIcon src="/img/icons/arrow.svg" />
  </div>
</div>