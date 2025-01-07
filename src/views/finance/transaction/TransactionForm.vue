<script setup>
import { appendFormData, getValue, isNumericMoney } from '@/utils/helpers';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CategoryLookup from '../lookup/CategoryLookup.vue';
import FinanceTypeLookup from '../lookup/FinanceTypeLookup.vue';
import SubCategoryLookup from '../lookup/SubCategoryLookup.vue';

const router = useRouter();
const route = useRoute();

// ui
const modeView = 'view';
const modeEdit = 'edit';
const mode = ref(modeView);
const canEdit = () => {
  return mode.value == modeEdit;
}
watch(mode, (newMode, oldMode) => {
  console.log(`Mode ID changed from ${oldMode} to ${newMode}`);
  if(newMode == "view" && oldMode == "edit") {
    record.value = {...defaultRecord};
    getData();
  }
});

const recordId = ref(route.params.kpop_item_id || 'new');
watch(recordId, (newId, oldId) => {
  console.log(`Record ID changed from ${oldId} to ${newId}`);
  mode.value = 'view';
  record.value = {...defaultRecord};
  getData();
});

if(recordId.value == 'new') //change to edit mode if new
  mode.value = modeEdit;

// Data related function
const errorMessages = ref({})
const defaultRecord = {
  money_subcategory : null,
  money_category : null,
  amount : '',
  transaction_date : new Date().toISOString(),
  description : '',
  type : { id: "EXPENSE", name: "Expense" },
};
const record = ref({...defaultRecord});

onMounted(() => {
  getData();
});

const getData = async () => {
  if(recordId.value == 'new')
    return;

  try {
    console.log(`Fetching data for record ID: ${recordId.value}`);
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/finance/v1/transaction/${recordId.value}`)
    record.value = response.data.data;
    record.value.photocard_image_upload = [];
    // console.log(record.value)

  } catch (error) {
    // console.error('saveData Function failed:', error);
    errorMessages.value = getValue(error, "response.data.errors") ?? {};
    Swal.fire({ icon: "error", title: "Oops...", text: "Something is wrong!" });
  }
}

const saveData = async () => {
  try {

    // console.log(record.value)
    const formData = new FormData();

    Object.entries(record.value).forEach(([key, value]) => {
      // Skip keys if necessary
      if (['img'].includes(key)) return;

      // console.log(value);
      appendFormData(formData, key, value);
    });

    errorMessages.value = {} //reset error msg
    let url= `${import.meta.env.VITE_API_BASE_URL}/finance/v1/transaction`;
    if(recordId.value != 'new') {
      url += '/'+recordId.value;
      formData.append('_method', 'PUT');
    }
    const response = await axios.post(url, formData);
    // console.log(response)

    record.value = response.data.data;
    recordId.value = record.value.id;
    mode.value = modeView; // reset back to view

    Swal.fire({ icon: "success", title: "Success", text: "Record saved!"});

    await router.push(`/finance/transaction/${record.value.id}`);

  } catch (error) {
    console.error('saveData Function failed:', error);
    errorMessages.value = getValue(error, "response.data.errors") ?? {};
    Swal.fire({ icon: "error", title: "Oops...", text: "Something is wrong!" });
  }
}

const breadcrumbs = ref([
  {
    title: 'Transaction',
    disabled: false,
    show: true,
    route: { name: 'finance.transaction.item.listing'},
  },
]);
</script>

<template>
  <VCard>
    <template v-slot:title>
      <VRow align="center"> 
        <VCol md="4" cols="12">
          <Breadcrumbs :items="breadcrumbs"/>        
        </VCol>
        <VCol class="d-none d-md-block" md="8" cols="12" align="right">
          <v-fab-transition group :disabled="!canEdit()" key="editing-btns">
            <template v-if="canEdit()">
              <VBtn @click="saveData" class="me-2">Submit</VBtn>
              <VBtn @click="mode = modeView" v-if="recordId != 'new'" color="secondary" type="reset" variant="tonal">Cancel</VBtn>
            </template>
          </v-fab-transition>
          <v-fab-transition group :disabled="canEdit()" key="view-btns">
            <template v-if="!canEdit()">
              <VBtn @click="mode = modeEdit" class="me-2">Edit</VBtn>
            </template>
          </v-fab-transition>
        </VCol>
      </VRow>
    </template>
    <VCardText>
      <VForm>
        <!-- <h1>Current Mode: {{ mode }}</h1>
        <h1>Current RecordId: {{ recordId }}</h1>
        <h1>Current RecordId: {{ record }}</h1> -->
        <VRow>

          <VCol md="6" cols="12">
            <VTextField
              v-if="!canEdit()"
              :readonly="true"
              :value="getValue(record, 'type.name')"
              prepend-inner-icon="bx-user"
              label="Type"
            />
            <FinanceTypeLookup
              v-else
              v-model="record.type" 
              :dense="true"
              :box="true"
              :outline="true"
              :single-line="false"
              class="thin-border"
              :return-object="true"
              :error="getValue(errorMessages, 'type.id')"
              prepend-inner-icon="bx-user"
              label="Type"
            ></FinanceTypeLookup>
          </VCol>

        </VRow>
        <VRow>

          <VCol md="6" cols="12">
            <!-- <VDateInput
              :readonly="!canEdit()"
              v-model="record.transaction_date"
              prepend-inner-icon="bx-calendar"
              label="Date"
              :error-messages="getValue(errorMessages, 'transaction_date')"
              hide-actions
              placeholder="dd/mm/yyyy" 
            /> -->
            <DateInputField
              v-model="record.transaction_date"
              :rules="[(v) => !!v || 'Date is required!']"
              clearable
              hide-details="auto"
              color="primary"
              label="Date"
            ></DateInputField>  
          </VCol>
           
          <VCol md="6" cols="12">
            <VTextField
              :readonly="!canEdit()"
              v-model="record.amount"
              prepend-inner-icon="bx-money"
              label="Total (RM)"
              placeholder="10.00"
              @keypress="isNumericMoney($event, record.amount)" 
              :error-messages="getValue(errorMessages, 'amount')"
              inputmode="numeric"
            />
          </VCol>

        </VRow>
        <VRow>

          <VCol md="6" cols="12">
            <VTextField
              v-if="!canEdit()"
              :readonly="true"
              :value="getValue(record, 'category.name')"
              prepend-inner-icon="bx-user"
              label="Category"
            />
            <CategoryLookup
              v-else
              v-model="record.money_category" 
              :dense="true"
              :box="true"
              :outline="true"
              :single-line="false"
              class="thin-border"
              :return-object="true"
              :error="getValue(errorMessages, 'money_category.id')"
              prepend-inner-icon="bx-user"
              label="Category"
            ></CategoryLookup>
          </VCol>
       
          <VCol md="6" cols="12">
            <VTextField
              v-if="!canEdit()"
              :readonly="true"
              :value="getValue(record, 'subcategory.name')"
              prepend-inner-icon="bx-user"
              label="Sub-Category"
            />
            <SubCategoryLookup
              v-else
              v-model="record.money_subcategory"
              :money-category-id="record.money_category?.id" 
              :dense="true"
              :box="true"
              :outline="true"
              :single-line="false"
              class="thin-border"
              :return-object="true"
              :error="getValue(errorMessages, 'money_subcategory.id')"
              prepend-inner-icon="bx-user"
              label="Sub-Category"
              :readonly="!canEdit()"
            ></SubCategoryLookup>
          </VCol>
        </VRow>
        <VRow> 

          <VCol md="6" cols="12">
            <VTextarea
              :readonly="!canEdit()"
              v-model="record.description"
              prepend-inner-icon="bx-envelope"
              label="Description"
              placeholder="..."
              :error-messages="getValue(errorMessages, 'description')"
            />
          </VCol>
          
        </VRow>
        <VRow> 
          <VCol cols="12" align="right">
            <v-fab-transition group :disabled="!canEdit()">
              <template v-if="canEdit()">
                <VBtn @click="saveData" class="me-2">Submit</VBtn>
                <VBtn @click="mode = modeView" v-if="recordId != 'new'" color="secondary" type="reset" variant="tonal">Cancel</VBtn>
              </template>
            </v-fab-transition>
            <v-fab-transition group :disabled="canEdit()">
              <template v-if="!canEdit()">
                <VBtn @click="mode = modeEdit" class="me-2">Edit</VBtn>
              </template>
            </v-fab-transition>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
