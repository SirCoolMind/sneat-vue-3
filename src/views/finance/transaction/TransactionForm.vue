<script setup>
import { appendFormData, getValue, isNumericMoney, updateBreadcrumbTitle } from '@/utils/helpers';
import axios from 'axios';
import Swal from 'sweetalert2-neutral';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AccountTypeLookup from '../lookup/AccountTypeLookup.vue';
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

const recordId = ref(route.params.transaction_id || 'new');
if(recordId.value == 'new') //change to edit mode if initial is new
  mode.value = modeEdit;
watch(() => route.params.transaction_id, (newId, oldId) => {
  console.log(`Record ID changed from ${oldId} to ${newId}`);
  recordId.value = newId || 'new';
  mode.value = recordId.value == 'new' ? modeEdit : modeView;
  record.value = {...defaultRecord};
  getData();
});

// Data related function
const errorMessages = ref({})
const defaultRecord = {
  money_account : null,
  money_subcategory : null,
  money_category : null,
  amount : '',
  transaction_date : new Date().toISOString(),
  description : '',
  type : { id: "EXPENSE", name: "Expense" },
  transaction_images : [],
  transaction_images_upload : [],
};
const record = ref({...defaultRecord});

onMounted(() => {
  getData();
});

const getData = async () => {
  if(recordId.value == 'new') {
    updateBreadcrumbTitle(breadcrumbs, 1, 'New');
    return;
  }

  try {
    console.log(`Fetching data for record ID: ${recordId.value}`);
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/finance/v1/transaction/${recordId.value}`)
    record.value = response.data.data;
    record.value.transaction_images_upload = [];
    // console.log(record.value)

    const newTitle = record.value.id || '...';
    updateBreadcrumbTitle(breadcrumbs, 1, newTitle);

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
      if (['transaction_images','transaction_images_upload'].includes(key)) return;

      // console.log(value);
      appendFormData(formData, key, value);
    });

    if (record.value.transaction_images_upload.length > 0) {
      record.value.transaction_images_upload.forEach((file, index) => {
        formData.append(`transaction_images_upload[${index}]`, file);
      });
    }

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

// Method to check if any image is available
const checkIfAvailable = (images = []) => {
  // console.log("checkIfAvailable");
  // console.log(images);
  return images.some(image => getValue(image,'is_available') == true);
};

const breadcrumbs = ref([
  {
    title: 'Transaction',
    disabled: false,
    show: true,
    route: { name: 'finance.transaction.item.listing'},
  },
  {
    title: '...',
    disabled: true,
    show: true,
    route: '',
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
              <DeleteButton
                :delete_api_url="`/finance/v1/transaction/${recordId}`"
                :route_success="`finance.transaction.item.listing`"
              />
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
              prepend-inner-icon="bx-category"
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
              prepend-inner-icon="bx-category"
              label="Type"
            ></FinanceTypeLookup>
          </VCol>

          <VCol md="6" cols="12">
            <VTextField
              v-if="!canEdit()"
              :readonly="true"
              :value="getValue(record, 'money_account.name')"
              prepend-inner-icon="bx-wallet-alt"
              label="Type"
            />
            <AccountTypeLookup
              v-else
              v-model="record.money_account" 
              :dense="true"
              :box="true"
              :outline="true"
              :single-line="false"
              class="thin-border"
              :return-object="true"
              :error="getValue(errorMessages, 'money_account.id')"
              prepend-inner-icon="bx-wallet-alt"
              label="Account"
            ></AccountTypeLookup>
          </VCol>

        </VRow>
        <VRow>

          <VCol md="6" cols="12">
            <VueDatePicker 
              v-model="record.transaction_date"
              teleport
              :is-24="false"
            ></VueDatePicker>
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
              :value="getValue(record, 'money_category.name')"
              prepend-inner-icon="bx-dialpad"
              label="Category"
            />
            <CategoryLookup
              v-else
              v-model="record.money_category" 
              :type-income-expense="record.type?.id"
              :dense="true"
              :box="true"
              :outline="true"
              :single-line="false"
              class="thin-border"
              :return-object="true"
              :error="getValue(errorMessages, 'money_category.id')"
              prepend-inner-icon="bx-dialpad"
              label="Category"
            ></CategoryLookup>
          </VCol>
       
          <VCol md="6" cols="12">
            <VTextField
              v-if="!canEdit()"
              :readonly="true"
              :value="getValue(record, 'money_subcategory.name')"
              prepend-inner-icon="bx-dialpad-alt"
              label="Sub-Category"
            />
            <SubCategoryLookup
              v-else
              v-model="record.money_subcategory"
              :type-income-expense="record.type?.id"
              :money-category-id="record.money_category?.id"
              :dense="true"
              :box="true"
              :outline="true"
              :single-line="false"
              class="thin-border"
              :return-object="true"
              :error="getValue(errorMessages, 'money_subcategory.id')"
              prepend-inner-icon="bx-dialpad-alt"
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
              prepend-inner-icon="bx-text"
              label="Description"
              placeholder="..."
              :error-messages="getValue(errorMessages, 'description')"
            />
          </VCol>
          
        </VRow>
        <VRow v-if="checkIfAvailable(record.transaction_images)">
          <VCol md="4" cols="12" v-for="(image, i) in record.transaction_images">
            <ImagePreview
              v-if="image.is_available"
              v-model="record.transaction_images[i]"
              :key="new Date().getSeconds()+i"
            />
          </VCol>
        </VRow>
        <VRow v-else>
          <VCol md="4" cols="12">
            <ImageUpload
              v-model ="record.transaction_images_upload"
              :accepted-file-types="['image/jpeg', 'image/png']"
            />
          </VCol>
          <VCol md="6" cols="12"></VCol>
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
                <DeleteButton
                  :delete_api_url="`/finance/v1/transaction/${recordId}`"
                  :route_success="`finance.transaction.item.listing`"
                />
              </template>
            </v-fab-transition>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
