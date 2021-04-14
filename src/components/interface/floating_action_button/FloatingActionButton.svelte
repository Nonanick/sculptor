<script>
import SvgIcon from "../svg_icon/SVGIcon.svelte";

export let title : string;

</script>

<div class="ui-floating-action-button">
  <div class="ui-fab-main">
    <div class="ui-fab-main-container">
      <div class="ui-fab-icon">
        <SvgIcon src="" />
      </div>
      <div class="ui-fab-title">
        {title}
      </div>
    </div>
  </div>
  <div class="ui-fab-subitems">

  </div>
</div>