<script lang="ts">
  import Dropdown from "../../../interface/dropdown/Dropdown.svelte";
  import DropdownItem from "../../../interface/dropdown/item/DropdownItem.svelte";
  import UiGroup from "../../../interface/ui_group/UIGroup.svelte";
  import type { DataListField } from "../field/DataListField";

  export let fields: DataListField[] = [];

  export let data: any[] = [];
</script>

<div class="ui-datalist-controller">
  <UiGroup>
    <div class="group-name">Filtrar</div>
    <Dropdown placeholder="Filtrar por">
      {#each fields as f}
        <DropdownItem title={f.title ?? f.name} />
      {/each}
    </Dropdown>
    <Dropdown placeholder="">
      {#each ["=", "<", ">", "<=", ">=", "<>"] as equality}
        <DropdownItem title={equality} />
      {/each}
    </Dropdown>
  </UiGroup>
</div>
