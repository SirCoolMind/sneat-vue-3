<script setup>
import { appendFormData, getValue, updateBreadcrumbTitle } from '@/utils/helpers';
import axios from 'axios';
import Swal from 'sweetalert2-neutral';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VDataTable } from 'vuetify/components';
import FinanceTypeLookup from '../lookup/FinanceTypeLookup.vue';

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

const recordId = ref(route.params.category_id || 'new');
if(recordId.value == 'new') //change to edit mode if initial is new
  mode.value = modeEdit;
watch(() => route.params.category_id, (newId, oldId) => {
  console.log(`Record ID changed from ${oldId} to ${newId}`);
  recordId.value = newId || 'new';
  mode.value = recordId.value == 'new' ? modeEdit : modeView;
  record.value = {...defaultRecord};
  getData();
});

// Data related function
const errorMessages = ref({})
const defaultRecord = {
  name : '',
  description : '',
  sub_categories : [],
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
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/finance/v1/admin/money-category/${recordId.value}`)
    record.value = response.data.data;
    // console.log(record.value)

    const newTitle = getValue(record.value, 'name', '...');
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
      // if (['photocard_image', 'photocard_image_upload'].includes(key)) return;

      appendFormData(formData, key, value);
    });

    errorMessages.value = {} //reset error msg
    let url= `${import.meta.env.VITE_API_BASE_URL}/finance/v1/admin/money-category`;
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

    await router.push(`/finance/setup-category/${record.value.id}`);

  } catch (error) {
    console.error('saveData Function failed:', error);
    errorMessages.value = getValue(error, "response.data.errors") ?? {};
    Swal.fire({ icon: "error", title: "Oops...", text: "Something is wrong!" });
  }
}

const breadcrumbs = ref([
  {
    title: 'Data Setup - Category',
    disabled: false,
    show: true,
    route: { name: 'finance.setup-category.listing'},
  },
  {
    title: '...',
    disabled: true,
    show: true,
    route: '',
  },
]);

// Table CRUD
const removeItemRecord = (index) => {
  console.log("trigger removeItemRecord");
  record.value.sub_categories.splice(index, 1)
}
const addItemRecord = () => {
  console.log("trigger addItemRecord");
  const defaultSubCategory = {
    name: "",
    description: ""
  };
  record.value.sub_categories.push(defaultSubCategory);
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
        <VRow>    
          <VCol md="6" cols="12">
            <VTextField
              :readonly="!canEdit()"
              v-model="record.name"
              prepend-inner-icon="bx-detail"
              label="Category Name"
              placeholder="Armageddon etc."
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
          <VCol md="6" cols="12"></VCol>
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
              :error="getValue(errorMessages, 'type.id', [])"
              prepend-inner-icon="bx-user"
              label="Type"
            ></FinanceTypeLookup>
          </VCol>
        </VRow>
        <VRow align="center">    
          <VCol md="6" cols="12">
            <span>SubCategories</span>
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
                align: 'start',
                width: '1%'
              },
              { 
                title: 'SubCategory Name', 
                key: 'name', 
                align: 'start' 
              },
              { 
                title: 'SubCategory Description', 
                key: 'description', 
                align: 'start' 
              },
              { 
                title: '',
                align: 'center' 
              },
            ]"
            :items="record.sub_categories"
            :items-length="getValue(record, 'sub_categories.length', 0)"
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
                      placeholder="Insert Sub Categories name"
                      :error-messages="getValue(errorMessages, 'name')"
                      variant="solo-filled"
                      max-width="300"
                    />
                  </template>
                  <template v-else>
                    {{ getValue(item, 'name') }}
                  </template>
                </td>
                <td>
                  <template v-if="canEdit()">
                    <VTextField
                      v-model="item.description"
                      placeholder="Insert Sub Categories description"
                      :error-messages="getValue(errorMessages, 'description')"
                      variant="solo-filled"
                      max-width="300"
                    />
                  </template>
                  <template v-else>
                    {{ getValue(item, 'description') }}
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
