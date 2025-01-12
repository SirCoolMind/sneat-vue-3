<script setup>
import { appendFormData, getValue } from '@/utils/helpers';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import KpopEraLookup from '../lookup/KpopEraLookup.vue';
import KpopVersionLookup from '../lookup/KpopVersionLookup.vue';

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
watch(() => route.params.kpop_item_id, (newId) => {
  console.log(`Record ID changed from ${oldId} to ${newId}`);
  recordId.value = newId || 'new';
  mode.value = 'view';
  record.value = {...defaultRecord};
  getData();
});

if(recordId.value == 'new') //change to edit mode if new
  mode.value = modeEdit;

// Data related function
const errorMessages = ref({})
const defaultRecord = {
  artist_name : '',
  era_name : '',
  version_name : '',
  kpop_era_id : {},
  kpop_era_version_id : {},
  comment : '',
  bought_price : '',
  bought_place : '',
  bought_comment : '',
  photocard_image : [],
  photocard_image_upload : [],
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
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/kpop/v1/admin/kpop-item/${recordId.value}`)
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
      if (['photocard_image', 'photocard_image_upload'].includes(key)) return;

      appendFormData(formData, key, value);
    });

    if (record.value.photocard_image_upload.length > 0) {
      formData.append('photocard_image_upload', record.value.photocard_image_upload[0]); // Append the first image file
    }

    errorMessages.value = {} //reset error msg
    let url= `${import.meta.env.VITE_API_BASE_URL}/kpop/v1/admin/kpop-item`;
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

    await router.push(`/kpop-collection/${record.value.id}`);

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

const title = computed(() => {
  return record 
    ? getValue(record.value, 'kpop_era_id.name', '') + ' (' + getValue(record.value, 'kpop_era_version_id.name', '') + ' - ' + getValue(record.value, 'kpop_era_version_id.name', '') + ')'
    : '';
})
const breadcrumbs = ref([
  {
    title: 'Photocard',
    disabled: false,
    show: true,
    route: { name: 'kpop-collection.item.listing'},
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
        <VRow v-if="checkIfAvailable(record.photocard_image)">
          <VCol md="4" cols="12" v-for="(image, i) in record.photocard_image">
            <ImagePreview
              v-if="image.is_available"
              v-model="record.photocard_image[i]"
              :key="new Date().getSeconds()+i"
            />
          </VCol>
        </VRow>
        <VRow v-else>
          <VCol md="4" cols="12">
            <ImageUpload
              v-model ="record.photocard_image_upload"
              :accepted-file-types="['image/jpeg', 'image/png']"
            />
          </VCol>
          <VCol md="6" cols="12"></VCol>
        </VRow>
        <VRow>    
          <VCol md="6" cols="12">
            <VTextField
              :readonly="!canEdit()"
              v-model="record.artist_name"
              prepend-inner-icon="bx-user"
              label="Artist Name"
              placeholder="Winter Aespa"
              :error-messages="getValue(errorMessages, 'artist_name')"
            />
          </VCol>
        </VRow>
        <VRow> 
          <VCol md="6" cols="12">
            <VTextField
              v-if="!canEdit()"
              :readonly="true"
              :value="getValue(record, 'kpop_era_id.name')"
              prepend-inner-icon="bx-user"
              label="Era"
            />
            <KpopEraLookup
              v-else
              v-model="record.kpop_era_id" 
              :dense="true"
              :box="true"
              :outline="true"
              :single-line="false"
              class="thin-border"
              :return-object="true"
              :error="getValue(errorMessages, 'kpop_era_id')"
              prepend-inner-icon="bx-user"
              label="Era"
            ></KpopEraLookup>
          </VCol>
       
          <VCol md="6" cols="12">
            <VTextField
              v-if="!canEdit()"
              :readonly="true"
              :value="getValue(record, 'kpop_era_version_id.name')"
              prepend-inner-icon="bx-user"
              label="Era"
            />
            <KpopVersionLookup
              v-else
              v-model="record.kpop_era_version_id"
              :era-id="record.kpop_era_id?.id" 
              :dense="true"
              :box="true"
              :outline="true"
              :single-line="false"
              class="thin-border"
              :return-object="true"
              :error="getValue(errorMessages, 'kpop_era_version_id')"
              prepend-inner-icon="bx-user"
              label="Version"
              :readonly="!canEdit()"
            ></KpopVersionLookup>
          </VCol>

          <VCol md="6" cols="12">
            <VTextField
              :readonly="!canEdit()"
              v-model="record.comment"
              prepend-inner-icon="bx-envelope"
              label="Comment"
              placeholder="..."
              :error-messages="getValue(errorMessages, 'comment')"
            />
          </VCol>

        </VRow>
        <VRow> 
        
          <VCol md="6" cols="12">
            <VTextField
              :readonly="!canEdit()"
              v-model="record.bought_price"
              prepend-inner-icon="bx-envelope"
              label="Bought Price (RM)"
              placeholder="10.00"
              :error-messages="getValue(errorMessages, 'bought_price')"
            />
          </VCol>
        
          <VCol md="6" cols="12">
            <VTextField
              :readonly="!canEdit()"  
              v-model="record.bought_place"
              prepend-inner-icon="bx-envelope"
              label="Bought Place"
              placeholder="Twitter"
              :error-messages="getValue(errorMessages, 'bought_place')"
            />
          </VCol>

          <VCol md="6" cols="12">
            <VTextField
              :readonly="!canEdit()"
              v-model="record.bought_comment"
              prepend-inner-icon="bx-envelope"
              label="Bought Comment"
              placeholder="..."
              :error-messages="getValue(errorMessages, 'bought_comment')"
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
