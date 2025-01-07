<script setup>
import { appendFormData, getValue } from '@/utils/helpers';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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

const recordId = ref(route.params.account_id || 'new');
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
  name : '',
  description : '',
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
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/finance/v1/admin/money-account/${recordId.value}`)
    record.value = response.data.data;
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
      // if (['photocard_image', 'photocard_image_upload'].includes(key)) return;

      appendFormData(formData, key, value);
    });

    errorMessages.value = {} //reset error msg
    let url= `${import.meta.env.VITE_API_BASE_URL}/finance/v1/admin/money-account`;
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

    await router.push(`/finance/setup-account/${record.value.id}`);

  } catch (error) {
    console.error('saveData Function failed:', error);
    errorMessages.value = getValue(error, "response.data.errors") ?? {};
    Swal.fire({ icon: "error", title: "Oops...", text: "Something is wrong!" });
  }
}

const title = computed(() => {
  return record 
    ? getValue(record.value, 'name', '')
    : '';
})
const breadcrumbs = ref([
  {
    title: 'Data Setup - Account',
    disabled: false,
    show: true,
    route: { name: 'finance.setup-account.listing'},
  },
  {
    title: title,
    disabled: true,
    show: true,
  }
]);
</script>

<template>
  <VCard>
    <template v-slot:title>
      <VRow align="center"> 
        <VCol md="4" cols="12">
          <Breadcrumbs :items="breadcrumbs"/>        
        </VCol>
        <VCol md="8" cols="12" align="right">
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
              :readonly="!canEdit()"
              v-model="record.name"
              prepend-inner-icon="bx-detail"
              label="Account Name"
              placeholder="Cash, Bank etc."
              :error-messages="getValue(errorMessages, 'name')"
            />
          </VCol>
          <VCol md="6" cols="12"></VCol>
          <VCol md="6" cols="12">
            <VTextField
              :readonly="!canEdit()"
              v-model="record.description"
              prepend-inner-icon="bx-detail"
              label="Description"
              :error-messages="getValue(errorMessages, 'description')"
            />
          </VCol>
        </VRow>
        <VRow class="pt-3"> 
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
