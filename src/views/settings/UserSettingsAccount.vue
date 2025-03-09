<script setup>
import { appendFormData, getValue } from '@/utils/helpers';
import axios from 'axios';
import Swal from 'sweetalert2-neutral';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

// ui
const modeEdit = 'edit';
const mode = ref(modeEdit);
const recordId = ref('new');

// Data related function
const errorMessages = ref({})
const defaultRecord = {
  name : null,
  email : null,
  profile_image : [],
  profile_image_upload : [],
};
const record = ref({...defaultRecord});

onMounted(() => {
  getData();
});

const getData = async () => {
  try {
    console.log(`Fetching data for record ID: ${recordId.value}`);
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user-setting/account`)
    record.value = response.data.data;
    record.value.profile_image_upload = [];
    recordId.value = record.value.id;
    // console.log(record.value)
    localStorage.setItem('user_name', record.value.name)
    localStorage.setItem('user_email', record.value.email)

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
      if (['profile_image','profile_image_upload'].includes(key)) return;

      // console.log(value);
      appendFormData(formData, key, value);
    });

    if (record.value.profile_image_upload.length > 0) {
      record.value.profile_image_upload.forEach((file, index) => {
        formData.append(`profile_image_upload[${index}]`, file);
      });
    }

    errorMessages.value = {} //reset error msg
    let url= `${import.meta.env.VITE_API_BASE_URL}/user-setting/account`;
    if(recordId.value != 'new') {
      url += '/'+recordId.value;
      formData.append('_method', 'PUT');
    }
    const response = await axios.post(url, formData);
    // console.log(response)

    record.value = response.data.data;
    record.value.profile_image_upload = [];
    recordId.value = record.value.id;

    Swal.fire({ icon: "success", title: "Success", text: "Record saved!"});

    // await router.push(`/finance/transaction/${record.value.id}`);

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
    title: 'Account Details',
    disabled: true,
    show: true,
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
      </VRow>
    </template>
    <VCardText>
      <VForm>
        <VRow v-if="typeof errorMessages == 'string'">
          <VCol md="4">
            <VAlert :value="errorMessages" type="error">
              {{ errorMessages }}
            </VAlert>
          </VCol>
        </VRow>
        
        <!-- <h1>Current Mode: {{ mode }}</h1>
        <h1>Current RecordId: {{ recordId }}</h1>
        <h1>Current RecordId: {{ record }}</h1> -->

        <VRow v-if="checkIfAvailable(record.profile_image)">
          <VCol md="4" cols="12" v-for="(image, i) in record.profile_image">
            <ImagePreview
              v-if="image.is_available"
              v-model="record.profile_image[i]"
              :key="'preview'+i"
              :mode="mode"
            />
          </VCol>
        </VRow>
        <VRow v-else>
          <VCol md="4" cols="12">
            <ImageUpload
              v-model ="record.profile_image_upload"
              :accepted-file-types="['image/jpeg', 'image/png']"
              :errorMessages="getValue(errorMessages, 'profile_image_upload', [])"
            />
          </VCol>
          <VCol md="6" cols="12"></VCol>
        </VRow>
        <VRow>

          <VCol md="6" cols="12">
            <VTextField
              v-model="record.name"
              prepend-inner-icon="mdi-account"
              label="Account Name"
              placeholder="Insert your name here..."
              :error-messages="getValue(errorMessages, 'name')"
            />
          </VCol>
          <VCol md="6" cols="12">
            <VTextField
              v-model="record.email"
              prepend-inner-icon="mdi-email"
              label="Account Email"
              placeholder="Insert your email here..."
              :error-messages="getValue(errorMessages, 'email')"
            />
          </VCol>

        </VRow>
        <VRow> 
          <VCol cols="12" align="left">
            <VBtn @click="saveData" class="me-2">Save Changes</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
