<script lang="ts">
  import { portal } from "../../actions/portal";
  import { getComputedStyles, Style } from "../../style.type";

  export let root: HTMLElement | undefined = undefined;

  export let styles: Style = {};
</script>

<div
  class="ui-backdrop"
  style={getComputedStyles(styles)}
  use:portal={{ to: root ?? document.body }}
/>
