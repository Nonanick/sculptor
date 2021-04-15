<script lang="ts">
  import type { ProgressBarStyle } from "./ProgressBarStyle";

  export let progress: number = 0;

  export let style: Partial<ProgressBarStyle> = {};
</script>

<div
  class="ui-progress-bar"
  style="
--progress : {progress}%;
--shelf-color : {style.shelf_color ??
    'var(--transparent-background-color-70)'};
--indicator-color : {style.indicator_color ??
    'var(--main-color)'};
"
>
  <div class="ui-progress-bar-container">
    <div class="ui-progress-bar-indicator" />
  </div>
</div>
