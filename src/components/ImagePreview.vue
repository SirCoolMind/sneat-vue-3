<style scoped>
.filepond--item {
  width: 100%;
}

.filepond-wrapper {
  /* Ensure the wrapper respects the image size */
  max-width: 100%;
}

.filepond-wrapper .filepond--root {
  width: 100%;
  /* Set the input width to follow the image width */
  max-width: 100%;
}

</style>

<template>
  <file-pond
    name="test"
    ref="pond"
    credits="false"
    :accepted-file-types="acceptedFileTypes"
    :files="internalFiles"
    @init="handleFilePondInit"
    @removefile="clearFile"
    allowImagePreview="true"
    imagePreviewMaxFileSize="5MB"
    @updatefiles="onFileUpdate"
    :allowRemove="isModeNotView"
  />
</template>

<script setup>

import { computed, ref, watch } from 'vue';

// Import Vue FilePond and plugins
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import vueFilePond from "vue-filepond";

// Import CSS
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import "filepond/dist/filepond.min.css";

// Create component
const FilePond = vueFilePond(
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview
);

/** Make sure every props have structure like below 
 * {
    source => '', // usually url of file
    filename =>'', 
    is_available => true // will determine should show component or not
  }
*/

// Define props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      source:  '',
      filename: '',
      is_available:  true
    })
  },
  acceptedFileTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/png']
  },
  mode: {
    type: String,
    default: "edit",
  },
});

// Computed property to check if mode is NOT "view"
const isModeNotView = computed(() => props.mode != "view");

// Custom event handlers
const handleFilePondInit = () => {
  // console.log("FilePond Image Preview has initialized");
};

// Reactive state for the files inside the component
const internalFiles = ref(props.modelValue.source || []);
const emit = defineEmits(['update:modelValue']);

const onFileUpdate = (fileItems) => {
  // try {
  //   console.log("onfileupdate");
  //   console.log(props.modelValue.filename);
  //   console.log(fileItems[0].getMetadata());
  //   console.log(fileItems[0].file);
  //   fileItems[0].setMetadata('filename', props.modelValue.filename)
  //   fileItems[0].file.name = props.modelValue.filename
  //   console.log(fileItems[0]);
  // } catch (error) {
  //   console.error(error)
  // }

};

const clearFile = () => {
  // Emit the updated file data with is_available set to false
  // console.log("clearFile");
  emit('update:modelValue', {
    ...props.modelValue,
    is_available: false
  });
};

// Watch for changes in modelValue and update internalFiles
watch(() => props.modelValue, (newFiles) => {
  internalFiles.value = newFiles.source || [];
});

</script>
