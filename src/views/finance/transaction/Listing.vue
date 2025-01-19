<script setup>
import { formatMoney, getDateFromISO, getValue } from '@/utils/helpers';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';

// Define reactive state variables
const headers = ref([
  { 
    title: "", 
    key: "data-table-group", 
    align: ' d-none' 
  },
  { 
    title: 'Amount', 
    key: 'money', 
    align: 'center',
    maxWidth: "10"
  },
  { 
    title: 'Category', 
    key: 'category', 
    align: 'center', 
    maxWidth: "10"
  },
  { 
    title: 'Description', 
    key: 'description', 
    align: 'center', 
    maxWidth: "10"
  },
  // { 
  //   title: 'Action', 
  //   key: 'version', 
  //   align: 'center' 
  // },
])

const itemsPerPage = ref(5)
const loading = ref(true)
const serverItems = ref([])
const totalItems = ref(0)
const dateRange = ref(null)
const filter = ref({
  start_date: '',
  end_date: '',
})

watch([dateRange], () => {
  // console.log("dateRange watch")
  // console.log(dateRange.value)

  if (!Array.isArray(dateRange.value)) {
    throw new Error("Input must be an array");
  }

  // Handle cases based on array length
  if (dateRange.value.length === 0) {
    filter.value.start_date = null;
    filter.value.end_date = null;
  } else if (dateRange.value.length === 1) {
    filter.value.start_date = dateRange.value[0];
    filter.value.end_date = dateRange.value[0];
  } else {
    filter.value.start_date = dateRange.value[0];
    filter.value.end_date = dateRange.value[dateRange.value.length - 1];
  }
  
  getTablesData({ page: 1, itemsPerPage: itemsPerPage.value });
})

const getTablesData = async ({ page, itemsPerPage, sortBy = '' }) => {
  
  try {
    loading.value = true
    console.log(`Fetching listing data`);
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/finance/v1/transaction`, {
      params: {
        page, rows_per_page: itemsPerPage, sort_by: sortBy, filter: filter.value
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
    title: 'Transaction',
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
          :buttonTo="{name: 'finance.transaction.item.view', params: {kpop_item_id: 'new'}}"
        />
        <VCardText>  
          <VRow align="center">
            <VCol md="4" cols="12">
              <!-- Filter Date Range -->
              <div class="d-flex">
                <VueDatePicker 
                  v-model="dateRange"
                  teleport
                  range
                  inline
                  :enable-time-picker="false"
                  auto-apply
                ></VueDatePicker>
              </div>
              <!-- <VCol md="12" cols="12">
                {{ filter.start_date }}
              </VCol>
              <VCol md="12" cols="12">
                {{ filter.end_date }}
              </VCol> -->
            </VCol>
          </VRow>
          <VDataTable
            class="border-sm rounded mt-2"
            :headers="headers"
            :items="serverItems"
            :loading="loading"
            :search="filter.search"
            item-value="id"
            @update:options="getTablesData"
            hide-default-footer
            disable-pagination
            :group-by="[
              {
                key: 'transaction_date',
                order: 'asc',
              },
            ]"
          >
            <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
              <template :ref="(el)=>{ if (!isGroupOpen(item)) toggleGroup(item); }"></template>
              <tr>
                <td :colspan="columns.length" 
                  class="border-sm" 
                  style="height: 30px; background-color: #e7e7ff; border-color: rgba(var(--v-border-color), 0.25) !important;" 
                >
                  {{ getDateFromISO(item.value) }}
                </td>
              </tr>
            </template>
            <template v-slot:item="{item, index}">
              <tr>
                <td class="border" style="white-space: nowrap;">
                  {{ formatMoney(getValue(item, 'amount')) }}
                </td>
                <td class="border">
                  {{ getValue(item, 'money_category.name') }}
                  <br>
                  ▪️{{ getValue(item, 'money_subcategory.name') }}
                </td>
                <td class="border">
                  {{ getValue(item, 'description') }}
                </td>
                <!-- <td class="border" align="center">
                  <VBtn
                    :to="{name: 'finance.transaction.item.view', params: {kpop_item_id: item.id}}"
                    prepend-icon="bx-show"
                    text="View"
                  ></VBtn>
                </td> -->
              </tr>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
