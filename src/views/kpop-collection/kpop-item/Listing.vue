<script setup>
import { getValue } from '@/utils/helpers';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';

// Define reactive state variables
const headers = ref([
  { 
    title: '', 
    align: 'start',
    sortable: false,
    key: 'id'
  },
  { 
    title: 'Artist Name', 
    key: 'name', 
    align: 'start' 
  },
  { 
    title: 'Version', 
    key: 'version', 
    align: 'start' 
  },
  { 
    title: 'Action', 
    key: 'version', 
    align: 'start' 
  },
])

const itemsPerPage = ref(5)
const loading = ref(true)
const serverItems = ref([])
const totalItems = ref(0)
const name = ref('')
const filter = ref([
  name => ''
])

// Watchers to update search based on name and calories changes
watch([name], () => {
  filter.name.value = String(Date.now())
  console.log("name watch")
  console.log(filter.value)
})

const getTablesData = async ({ page, itemsPerPage, sortBy = '' }) => {
  
  try {
    loading.value = true
    console.log(`Fetching listing data`);
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/kpop/v1/admin/kpop-item`, {
      params: {
        page, rows_per_page: itemsPerPage, sort_by: sortBy, filter: name.value
      },
    })
    // console.log(response);
    serverItems.value = response.data.data;
    totalItems.value = response.data.meta.total;
    loading.value = false;

  } catch (error) {
    console.error('getTablesData Function failed:', error);
  }
}

// On component mount, load the initial data
onMounted(() => {
  getTablesData({ page: 1, itemsPerPage: itemsPerPage.value })
})

const breadcrumbs = ref([
  {
    title: 'Photocard',
    disabled: true,
    show: true,
    route: '',
  },
]);
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <CardHeaderDefault
          :breadcrumbs="breadcrumbs"
          :buttonTo="{name: 'kpop-collection.item.view', params: {kpop_item_id: 'new'}}"
        />
        <template v-slot:text>
          <VDataTableServer
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            :items="serverItems"
            :items-length="totalItems"
            :loading="loading"
            :search="filter.search"
            item-value="id"
            @update:options="getTablesData"
            :items-per-page-options="[5,10,30]"
          >
            <template v-slot:item="{item, index}">
              <tr>
                <td align="center">
                  <VImg
                    v-if="getValue(item, 'photocard_image.0')"
                    :src="getValue(item, 'photocard_image.0.source')"
                    :width="150"
                    height="auto"
                    class="my-2"
                  />
                </td>
                <td>
                  {{ getValue(item, 'artist_name') }}
                </td>
                <td>
                  {{ getValue(item, 'kpop_era_id.name') + (getValue(item, 'kpop_era_version_id.name') ? ' - '+ getValue(item, 'kpop_era_version_id.name') : '') }}
                </td>
                <td>
                  <!-- <RouterLink 
                    :to="{name: 'kpop-collection.item.view', params: {kpop_item_id: item.id}}"
                  >{{ getValue(item, 'name') }}</RouterLink> -->
                  <VBtn 
                    :to="{name: 'kpop-collection.item.view', params: {kpop_item_id: item.id}}"
                    prepend-icon="bx-show"
                    text="View"
                  ></VBtn>
                </td>
              </tr>
            </template>
          </VDataTableServer>
        </template>
      </VCard>
    </VCol>
  </VRow>
</template>
