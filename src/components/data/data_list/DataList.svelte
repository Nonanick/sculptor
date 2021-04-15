<script lang="ts">
import type { DataListField } from "./field/DataListField";

  export let fields : DataListField[] = [];

  export let data : any[] = [];

  export let sortData : undefined | ((data : any[])=> any[]);

  let sortedData : any[] = [];
  
</script>