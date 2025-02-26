<script setup>
import { getValue } from '@/utils/helpers';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';

// Define reactive state variables
const headers = ref([
  { 
    title: 'No', 
    key: 'no', 
    align: 'start' 
  },
  { 
    title: 'Name', 
    key: 'name', 
    align: 'start' 
  },
  { 
    title: 'Description', 
    key: 'description', 
    align: 'start' 
  },
  { 
    title: 'Action', 
    key: 'action', 
    align: 'center' 
  },
])

const itemsPerPage = ref(10)
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
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/finance/v1/admin/money-account`, {
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
    title: 'Data Setup - Account',
    disabled: true,
    show: true,
    route: '',
  },
  {
    title: 'Listing',
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
          :buttonTo="{name: 'finance.setup-account.view', params: {account_id: 'new'}}"
        />
        <VCardText>  
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
                <td>
                  {{ index + 1 }}
                </td>
                <td>
                  {{ getValue(item, 'name') }}
                </td>
                <td>
                  {{ getValue(item, 'description') }}
                </td>
                <td align="center">
                  <VBtn 
                    :to="{name: 'finance.setup-account.view', params: {account_id: item.id}}"
                    prepend-icon="bx-show"
                    text="View"
                  ></VBtn>
                </td>
              </tr>
            </template>
          </VDataTableServer>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
