<script lang="ts">
  import type { DataListField } from "./field/DataListField";

  export let idProperty: string = "_id";

  export let fields: DataListField[] = [];

  export let data: any[] = [];

  export let dataSorter: undefined | ((data: any[]) => number) = undefined;

  let sortedData: any[] = [];

  $: {
    if (dataSorter != null) {
      sortedData = data.sort(dataSorter);
    } else {
      sortedData = data;
    }
  }

  function sanitizeNameAsCssClass(name: string) {
    return name
      .split(/(?=[A-Z])/)
      .join("-") // Transform Pascal case
      .replace(/[^a-zA-Z0-9-_]|(--)/g, "-") // Specify which characters are allowed, _ is allowed but will be replaced by -
      .replace(/[_ ]/g, "-"); // Replace _ and whitespace with -
  }
</script>

<div class="ui-data-list">
  <div class="list-header">
    {#each fields as field (field.name)}
      <div
        class="list-header-column column column-{sanitizeNameAsCssClass(
          field.name
        )}"
      >
        <div class="title">
          {field.title}
        </div>
      </div>
    {/each}
  </div>

  <div class="list-body">
    {#each sortedData as row (row[idProperty])}
      <div class="list-row">
        {#each fields as field (field.name)}
          <div
            class="list-body-column column column-{sanitizeNameAsCssClass(
              field.name
            )}"
          >
            <div class="value">
              {#if typeof field.output === "string" || typeof field.output === "undefined"}
                {row[field.output ?? field.name]}
              {:else}
                <svelte:component
                  this={field.output(row).component}
                  {...field.output(row).componentArgs}
                />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .ui-data-list {
    position: relative;
    display: grid;
    grid-template-rows: var(--item-height, 35px) auto;
    width: 100%;
    height: auto;
  }
  .list-header, .list-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
  }
  .column {
    flex-grow: 1;
  }
</style>
