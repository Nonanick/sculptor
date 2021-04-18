<script lang="ts">
import { createEventDispatcher } from "svelte";

  import { portal } from "../../actions/portal";

  export let root: HTMLElement | undefined = undefined;

  const closeDispatcher = createEventDispatcher();

</script>

<div
  class="ui-backdrop"
  use:portal={{ to: root ?? document.body }}
  on:click={() => {
    closeDispatcher('close');
  }}
>
  <slot />
</div>

<style>
  @keyframes growAndShow {
    0% {
      transform: scale(70%);
      opacity: 0;
    }
    100% {
      transform: scale(100%);
      opacity: 1;
    }
  }

  @keyframes shrinkAndHide {
    0% {
      transform: scale(70%);
      opacity: 0;
    }
    100% {
      transform: scale(100%);
      opacity: 1;
    }
  }

  .ui-backdrop {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: var(--item-padding, 10px 20px);
    animation: growAndShow 0.15s cubic-bezier(0.645, 0.045, 0.355, 1);

    background-color: rgba(0,0,0,0.5 );

    -moz-backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(3px);

    display: grid;
    grid-template: 1fr / 1fr;
    align-items: center;
    justify-items: center;
    z-index: 20;
    overflow: auto;
    overscroll-behavior: contain;
  }
</style>
