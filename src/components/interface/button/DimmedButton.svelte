<script lang="ts">

  import Button from "./Button.svelte";
  import type { ButtonStyle } from "./ButtonStyle";

  export let styles: Partial<ButtonStyle> = {};
</script>

<Button
  styles={{
    background_color: 'var(--main-color-25)',
    text_color: 'var(--main-color)',
    ...styles,
  }}
  on:click
  on:contextmenu
  on:dblclick
  on:mouseover
  on:mouseleave
  on:focus
  on:blur
  on:mousedown
  on:mouseup
>
  <slot />
</Button>
