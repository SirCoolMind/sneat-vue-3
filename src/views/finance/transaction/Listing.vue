<script setup>
import { getDateFromISO, getValue } from '@/utils/helpers';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';

// Define reactive state variables
const headers = ref([
  { 
    title: 'Date', 
    key: 'date', 
    align: 'start' 
  },
  { 
    title: 'Total (RM)', 
    key: 'money', 
    align: 'start' 
  },
  { 
    title: 'Category', 
    key: 'category', 
    align: 'start' 
  },
  { 
    title: 'Subcategory', 
    key: 'subcategory', 
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
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/finance/v1/transaction`, {
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
    title: 'Transaction Listing',
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
        <template v-slot:title>
          <VRow align="center"> 
            <VCol md="4" cols="12">
              <Breadcrumbs :items="breadcrumbs"/>        
            </VCol>
            <VCol md="8" cols="12" align="right">
              <v-fab-transition>
                <VBtn 
                  :to="{name: 'finance.transaction.item.view', params: {kpop_item_id: 'new'}}"
                >New</VBtn>
              </v-fab-transition>
            </VCol>
          </VRow>
        </template>
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
                {{ getDateFromISO(getValue(item, 'transaction_date')) }}
              </td>
              <td>
                {{ getValue(item, 'amount') }}
              </td>
              <td>
                {{ getValue(item, 'money_category.name') }}
              </td>
              <td>
                {{ getValue(item, 'money_subcategory.name') }}
              </td>
              <td>
                <!-- <RouterLink 
                  :to="{name: 'finance.transaction.item.view', params: {kpop_item_id: item.id}}"
                >{{ getValue(item, 'name') }}</RouterLink> -->
                <VBtn 
                  :to="{name: 'finance.transaction.item.view', params: {kpop_item_id: item.id}}"
                  prepend-icon="bx-show"
                  text="View"
                ></VBtn>
              </td>
            </tr>
          </template>
        </VDataTableServer>
      </VCard>
    </VCol>
  </VRow>
</template>
