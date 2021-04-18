<script lang="ts">
  import CircularFrame from "../../components/interface/circular_frame/CircularFrame.svelte";
  export let src: string = "";
</script>

<div class="user-avatar">
  <CircularFrame size="3.5rem">
    <img {src} alt="User's avatar" />
  </CircularFrame>
</div>
