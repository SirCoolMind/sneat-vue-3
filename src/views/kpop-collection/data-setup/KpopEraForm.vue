<script setup>
import { getValue } from '@/utils/helpers';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VDataTable } from 'vuetify/components';

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

const recordId = ref(route.params.kpop_era_id || 'new');
watch(recordId, (newId, oldId) => {
  console.log(`Record ID changed from ${oldId} to ${newId}`);
  mode.value = 'view';
  record.value = {...defaultRecord};
  getData();
});

// Data related function
const errorMessages = ref({})
const defaultRecord = {
  name : '',
  versions : [],
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
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/kpop/v1/admin/kpop-era/${recordId.value}`)
    record.value = response.data.data;
    console.log(record.value)

  } catch (error) {
    // console.error('saveData Function failed:', error);
    errorMessages.value = getValue(error, "response.data.errors") ?? {};
    Swal.fire({ icon: "error", title: "Oops...", text: "Something is wrong!" });
  }
}

const saveData = async () => {
  try {

    console.log("trigger saveData")
    console.log(record.value)
    const formData = new FormData();
    Object.entries(record.value).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // If an array, custom append
        value.forEach((item, index) => {
          Object.entries(item).forEach(([nestedKey, nestedValue]) => {
            formData.append(`${key}[${index}][${nestedKey}]`, nestedValue);
          });
        });
      } else {
        // If not an array, append normally
        formData.append(key, value);
      }
    });

    errorMessages.value = {} //reset error msg
    let url= `${import.meta.env.VITE_API_BASE_URL}/kpop/v1/admin/kpop-era`;
    if(recordId.value != 'new') {
      url += '/'+recordId.value;
      formData.append('_method', 'PUT');
    }
    const response = await axios.post(url, formData);
    console.log(response)

    record.value = response.data.data;
    mode.value = modeView; // reset back to view

    Swal.fire({ icon: "success", title: "Success", text: "Record saved!"});

    await router.push(`/kpop/data-setup/${record.value.id}`);

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
    title: 'Data Setup - Era',
    disabled: false,
    show: true,
    route: { name: 'kpop-collection.data-setup.listing'},
  },
  {
    title: title,
    disabled: true,
    show: true,
  }
]);

// Table CRUD
const removeItemRecord = (index) => {
  console.log("trigger removeItemRecord");
  record.value.versions.splice(index, 1)
}
const addItemRecord = () => {
  console.log("trigger addItemRecord");
  const defaultVersion = {

  };
  record.value.versions.push(defaultVersion);
}
// END Table CRUD
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
              <VBtn @click="mode = modeView" color="secondary" type="reset" variant="tonal">Cancel</VBtn>
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
              label="Era Name"
              placeholder="Armageddon etc."
              :error-messages="getValue(errorMessages, 'name')"
            />
          </VCol>
        </VRow>
        <VRow align="center">    
          <VCol md="6" cols="12">
            <span>Versions</span>
          </VCol>
          <VCol md="6" cols="12" align="end">
            <VBtn 
              v-if="canEdit()"
              @click="addItemRecord"
              prepend-icon="bx-plus"
              color="#2196F3"
              size="small"
            >Add More</VBtn>
          </VCol>
          <VDataTable
            :headers="[
              { 
                title: 'No', 
                key: 'no', 
                align: 'start' 
              },
              { 
                title: 'Version Name', 
                key: 'name', 
                align: 'start' 
              },
              { 
                title: '',
                align: 'center' 
              },
            ]"
            :items="record.versions"
            :items-length="getValue(record, 'versions.length', 0)"
            item-value="id"
          >
            <template v-slot:item="{item, index}">
              <tr>
                <td>
                  {{ index + 1 }}
                </td>
                <td>
                  <template v-if="canEdit()">
                    <VTextField
                      v-model="item.name"
                      placeholder="Insert version name"
                      :error-messages="getValue(errorMessages, 'name')"
                      variant="solo-filled"
                      max-width="300"
                    />
                  </template>
                  <template v-else>
                    {{ getValue(item, 'name') }}
                  </template>
                </td>
                <td align="center">
                  <VBtn 
                    v-if="canEdit()"
                    @click="removeItemRecord(index)"
                    icon="bx-trash"
                    color="error"
                  ></VBtn>
                </td>
              </tr>
            </template>
            <template #bottom>
              <!-- Leave this slot empty to hide pagination controls -->
            </template>
          </VDataTable>
        </VRow>
        <VRow class="pt-3"> 
          <VCol cols="12" align="right">
            <v-fab-transition group :disabled="!canEdit()">
              <template v-if="canEdit()">
                <VBtn @click="saveData" class="me-2">Submit</VBtn>
                <VBtn @click="mode = modeView" color="secondary" type="reset" variant="tonal">Cancel</VBtn>
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
