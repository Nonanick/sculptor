<script lang="ts">
  export let direction: "row" | "column" = "column";
</script>

<div
  class="ui-group {$$props.class ?? ''}"
  style="{$$props.style ?? ''}; --direction : {direction};"
>
  <slot />
</div>

<style>
  .ui-group {
    position: relative;
    display: inline-grid;
    vertical-align: middle;
    grid-auto-columns: auto;
    grid-auto-flow: var(--direction);
    grid-template-rows: var(--item-height, 35px);
    border-radius: var(--border-radius);
    width: max-content;
    height: var(--item-height, 35px);
  }

  .ui-group > :global(*) {
    margin: 0 !important;
    border-radius: 0 !important;
  }

  .ui-group > :global(*):hover {
    filter: brightness(90%);
  }
  .ui-group > :global(*:not(:last-child)) {
    border-right: 2px solid var(--secondary-color-75) !important;
  }
  .ui-group > :global(*:last-child) {
    border-top-right-radius: var(--border-radius) !important;
    border-bottom-right-radius: var(--border-radius) !important;
  }

  .ui-group > :global(*:first-child) {
    border-top-left-radius: var(--border-radius) !important;
    border-bottom-left-radius: var(--border-radius) !important;
  }
</style>
