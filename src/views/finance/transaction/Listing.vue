<script setup>
import { formatMoney, getDateFromISO, getValue } from '@/utils/helpers';
import imageIncome from '@images/cards/finance-income.png';
import imageWallet from '@images/cards/finance-wallet.png';
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
    title: 'Amount / Account',
    align: 'center',
    maxWidth: "10"
  },
  { 
    title: 'Category / Description',
    align: 'center', 
    maxWidth: "10"
  },
  // { 
  //   title: 'Action', 
  //   key: 'version', 
  //   align: 'center' 
  // },
])

const totalIncome = ref('0.00')
const totalSpent = ref('0.00')
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

  // Default sort order desc
  if (!sortBy || Object.keys(sortBy).length === 0) {
    sortBy = { 0: { key: 'date', order: 'desc' } };
  }
  try {
    loading.value = true
    console.log(`Fetching listing data`);
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/finance/v2/transaction`, {
      params: {
        page, rows_per_page: itemsPerPage, sort_by: sortBy, filter: filter.value
      },
    })
    // console.log(response);
    serverItems.value = response.data.data;
    totalIncome.value = getValue(response, 'data.total_income', '0.00');
    totalSpent.value = getValue(response, 'data.total_expense', '0.00');
    filter.value.start_date = getValue(response, 'data.start_date');
    filter.value.end_date = getValue(response, 'data.end_date');
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
          :buttonTo="{name: 'finance.transaction.item.view', params: {transaction_id: 'new'}}"
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
                  six-weeks="fair"
                ></VueDatePicker>
              </div>
              <!-- <VCol md="12" cols="12">
                {{ filter.start_date }}
              </VCol>
              <VCol md="12" cols="12">
                {{ filter.end_date }}
              </VCol> -->
            </VCol>
            <VCol md="8" col="12">
              <VRow>
                <VCol md="12" cols="12" class="py-0" v-if="filter.start_date">
                  <span class="text-no-wrap">
                    <i>Date: {{ getDateFromISO(filter.start_date, 'Do MMMM YYYY') }}&nbsp;&nbsp;-&nbsp;&nbsp;{{ getDateFromISO(filter.end_date, 'Do MMMM YYYY') }} </i>
                  </span>
                </VCol>
                <VCol md="4" cols="6" class="pt-1 border-t">
                  <VCardText class="d-flex align-center gap-2 pa-0">
                    <VAvatar
                      size="48"
                      rounded
                      :image="imageIncome"
                    />
                    <div>
                      <p class="mb-0 text-no-wrap">
                        Total Income
                      </p>
                      <div class="d-flex align-center gap-2">
                        <h6 class="text-h6">
                          RM {{ totalIncome }}
                        </h6>
                      </div>
                    </div>
                  </VCardText>
                </VCol>
                <VCol md="4" cols="6" class="pt-1 border-t">
                  <VCardText class="d-flex align-center gap-2 pa-0">
                    <VAvatar
                      size="48"
                      rounded
                      :image="imageWallet"
                    />

                    <div>
                      <p class="mb-0 text-no-wrap">
                        Total Spent
                      </p>
                      <div class="d-flex align-center gap-2">
                        <h6 class="text-h6">
                          RM {{ totalSpent }}
                        </h6>
                      </div>
                    </div>
                  </VCardText>
                </VCol>
              
              </VRow>
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
                key: 'date',
                order: 'desc',
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
                  <b>{{ getDateFromISO(item.value, "Do MMM YYYY") }}</b>
                </td>
              </tr>
            </template>
            <template v-slot:item="{item, index}">
              <tr>
                <td class="border" style="white-space: nowrap;">
                  <RouterLink 
                    :to="{name: 'finance.transaction.item.view', params: {transaction_id: item.id}}"
                    style="color:rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));"
                    class="d-flex align-center"
                  >
                    {{ formatMoney(getValue(item, 'amount')) }}
                    &nbsp;&nbsp;<VIcon icon="bx-expand"></VIcon>
                  </RouterLink>
                </td>
                <td class="border">
                  {{ getValue(item, 'money_category.name') }}
                  <br>
                  ▪️{{ getValue(item, 'money_subcategory.name') }}
                </td>
              </tr>
              <tr>    
                <td class="border border-b-lg">
                  <VIcon icon="bx-wallet-alt"></VIcon> {{ getValue(item, 'money_account.name') }}
                </td>
                <td class="border border-b-lg">
                  {{ getValue(item, 'description') }}
                </td>
              </tr>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
