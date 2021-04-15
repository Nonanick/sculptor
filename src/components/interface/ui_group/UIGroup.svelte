<script lang="ts">


</script>

<div class="ui-group">
  <slot></slot>
</div>

<style>
  .ui-group {
    position: relative;
    display: inline-grid;
    vertical-align: middle;
    grid-auto-columns: auto;
    grid-auto-flow: column;
    grid-template-rows: var(--item-height, 35px);
    border-radius: var(--border-radius);
    overflow: hidden;
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
</style>