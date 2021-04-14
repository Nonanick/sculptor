<script>
  import Backdrop from "../backdrop/Backdrop.svelte";
  import type { PopupStyle } from "./PopupStyle";

  export let visible: boolean = false;

  export let style: Partial<PopupStyle> = {};
</script>

<div class="ui-popup" on:click|stopPropagation>
  {#if visible === true}
    <Backdrop
      on:close={() => {
        visible = false;
      }}
    >
      <div class="ui-popup-window"  
      on:click|stopPropagation
      style="
      --width: {style.width ?? '80vw'}
      ">
        <div class="ui-popup-header">
          <slot name="header" />
        </div>
        <div class="ui-popup-body">
          <slot />
        </div>
        <div class="ui-popup-footer" />
      </div>
    </Backdrop>
  {/if}
</div>

<style>
  .ui-popup-window {
    position: relative;
    width: var(--width, 90vw);
    min-width: 200px;
    height: auto;
    max-height: 90vh;
    min-height: 100px;
    border-radius: var(--border-radius, 4px);
    background-color: var(--background-color);
    display: grid;
    grid-template-rows: max-content 1fr auto;
  }
  .ui-popup-header:not(:empty) {
    padding: var(--header-padding, 10px 20px);
    border-bottom: 1px solid var(--secondary-color-25);
    font-weight: 500;
    font-size: 1.3em;
  }
  .ui-popup-body {
    padding: var(--window-padding, 10px 20px);

  }
</style>
