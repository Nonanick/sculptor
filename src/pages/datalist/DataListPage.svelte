<script lang="ts">
  import DataListController from "../../components/data/data_list/controller/DataListController.svelte";

  import DataList from "../../components/data/data_list/DataList.svelte";
  import type { DataListField } from "../../components/data/data_list/field/DataListField";
  import UserAvatar from "./UserAvatar.svelte";

  let allPatients = [
    {
      user_image: "",
      name: "Nicholas Frai",
      age: "26y",
    },
  ];

  let PatientInfoFields: DataListField[] = [
    {
      name: "avatar",
      hint: "User's avatar",
      title: "User's avatar",
      output: (data) => {
        return {
          component: UserAvatar,
          componentArgs: {
            src: data.user_image ?? "/img/default/avatar.png",
          },
        };
      },
    },
    {
      name: "name",
      title: "Name",
    },
    {
      name: "age",
      title: "Age",
    },
  ];
</script>

<div class="ui-data-list-page">
  <DataListController bind:fields={PatientInfoFields} bind:data={allPatients} />
  <DataList bind:fields={PatientInfoFields} bind:data={allPatients} />
</div>
