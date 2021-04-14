<script>
  import SvgIcon from "../svg_icon/SVGIcon.svelte";
  import { onScreen } from "../../actions/onScreen";

  import type { SVGIconStyle } from "../svg_icon/SVGIconStyle";
  import type { FloatingActionButtonStyle } from "./FloatingActionButtonStyle";
  import App from "../../../App.svelte";

  export let title: string = "";
  export let icon: string;
  export let icon_style: Partial<SVGIconStyle> = {};

  export let bindVisibilityTo: HTMLElement;

  export let visible: boolean = true;

  export let style: Partial<FloatingActionButtonStyle> = {};
</script>

<div
  class="ui-floating-action-button {visible ? '' : 'hidden'} "
  use:onScreen={{ target: bindVisibilityTo, threshold: 0.5 }}
  on:visibilitychange={(ev) => {
    visible = ev.detail.isVisible;
    console.log("Is visible now?", visible, style);
  }}
>
  <div class="ui-fab-main clickable">
    <div class="ui-fab-main-container">
      <div class="ui-fab-icon">
        <SvgIcon
          src={icon}
          styles={{
            color : "var(--text-on-main-color)",
            ...icon_style,
          }}
        />
      </div>
      <div class="ui-fab-title">
        {title}
      </div>
    </div>
  </div>
  <div class="ui-fab-subitems">
    <slot />
  </div>
</div>

<style>
  .ui-floating-action-button {
    position: fixed;
    bottom: 3em;
    right: 2em;
    opacity: 1;
    transition: opacity 0.4s;
    pointer-events: all;
    z-index: 10;
  }
  .ui-floating-action-button.hidden {
    opacity: 0;
    pointer-events: none;
  }
  .ui-fab-main {
    background-color: var(--main-color);
    padding: 2.3em;
    border-radius: 50%;
    box-shadow: var(--box-shadow-2);
  }
  .ui-fab-main-container {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template: 1fr / 1fr;
    align-items: center;
    justify-items: center;
  }
  .ui-fab-title {
    position: absolute;
    top: 5.2em;
    background-color: var(--background-color);
    box-shadow: var(--box-shadow);
    padding: 2px 6px;
    border-radius: var(--border-radius);
    border: 1px solid var(--secondary-color-25);
    transform: scale(10%) translate(0em, -2em);
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
  }
  .ui-fab-main-container:hover .ui-fab-title {
    transform: scale(100%) translate(0em, 0em);
    opacity: 1;

  }
</style>
