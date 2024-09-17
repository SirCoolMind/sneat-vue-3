<script setup>
import { getValue } from '@/utils/helpers';
import axios from 'axios';
import Swal from 'sweetalert2';

const form = ref({
  artist_name : '',
  era_name : '',
  version_name : '',
  kpop_era_id : '1',
  kpop_era_version_id : '1',
  comment : '',
  bought_price : '',
  bought_place : '',
  bought_comment : '',
})

const errorMessages = ref({})

// Function to handle login
const saveData = async () => {

  try {
    errorMessages.value = {}
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/kpop/v1/admin/kpop-item`, form.value)

    console.log(response)

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Record saved!",
    });

  } catch (error) {
    console.error('Function failed:', error)
    errorMessages.value = getValue(error, "response.data.errors") ?? {};
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Something wrong!",
    });
  }
}
</script>

<template>
  <VForm @submit.prevent="saveData">
    <VRow>
      <VCol md="6" cols="12">
        <VTextField
          v-model="form.artist_name"
          prepend-inner-icon="bx-user"
          label="Artist Name"
          placeholder="Winter Aespa"
          :error-messages="getValue(errorMessages, 'artist_name')"
        />
      </VCol>
      <VCol md="6" cols="12">

      </VCol>
      
      <VCol md="6" cols="12">
        <VTextField
          v-model="form.era_name"
          prepend-inner-icon="bx-envelope"
          label="Era Name"
          placeholder="Armageddon"
          :error-messages="getValue(errorMessages, 'era_name')"
        />
      </VCol>

      <VCol md="6" cols="12">
        <VTextField
          v-model="form.version_name"
          prepend-inner-icon="bx-envelope"
          label="Version Name"
          placeholder="Superbeing Album PC"
          :error-messages="getValue(errorMessages, 'version_name')"
        />
      </VCol>

      <VCol md="6" cols="12">
        <VTextField
          v-model="form.comment"
          prepend-inner-icon="bx-envelope"
          label="Comment"
          placeholder="..."
          :error-messages="getValue(errorMessages, 'comment')"
        />
      </VCol>
      <VCol md="6" cols="12">

      </VCol>
    
      <VCol md="6" cols="12">
        <VTextField
          v-model="form.bought_price"
          prepend-inner-icon="bx-envelope"
          label="Bought Price (RM)"
          placeholder="10.00"
          :error-messages="getValue(errorMessages, 'bought_price')"
        />
      </VCol>
     
      <VCol md="6" cols="12">
        <VTextField
          v-model="form.bought_place"
          prepend-inner-icon="bx-envelope"
          label="Bought Place"
          placeholder="Twitter"
          :error-messages="getValue(errorMessages, 'bought_place')"
        />
      </VCol>

      <VCol md="6" cols="12">
        <VTextField
          v-model="form.bought_comment"
          prepend-inner-icon="bx-envelope"
          label="Bought Comment"
          placeholder="..."
          :error-messages="getValue(errorMessages, 'bought_comment')"
        />
      </VCol>
      <VCol md="6" cols="12">

      </VCol>

      <VCol cols="12">
        <VBtn type="submit" class="me-2">Submit</VBtn>
        <VBtn color="secondary" type="reset" variant="tonal">Reset</VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
