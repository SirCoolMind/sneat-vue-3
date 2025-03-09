<style>
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

.filepond-error-message {
  flex: 1 1 auto;
  font-size: 13px;
  min-height: 14px;
  min-width: 1px;
  position: relative;
  color:rgb(var(--v-theme-error));
  font-weight: 400;
}

.filepond-error-message__message {
  line-height: 13px;
  word-break: break-word;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  transition-duration: 150ms;
  padding-bottom: 0.5em;
}

</style>
<template>
  <file-pond
    name="test"
    ref="pond"
    credits="false"
    label-idle="Drop files here..."
    :accepted-file-types="acceptedFileTypes"
    :files="internalFiles"
    @init="handleFilePondInit"
    @updatefiles="onFileUpdate"
  />
  <div v-if="errorMessages && Array.isArray(errorMessages) && errorMessages.length > 0" class="filepond-error-message" role="alert" aria-live="polite">
    <div v-for="message in errorMessages" class="filepond-error-message__message">◉ {{ message }}</div>
  </div>
  
</template>

<script setup>

import { ref, watch } from 'vue';

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

// Define props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  acceptedFileTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/png']
  },
  errorMessages: Array,
});

// Custom event handlers
const handleFilePondInit = () => {
  // console.log("FilePond: Image Upload has initialized");
};

// Reactive state for the files inside the component
const internalFiles = ref(props.modelValue || []);
const emit = defineEmits(['update:modelValue']);

const onFileUpdate = (fileItems) => {
  // console.log("onfileupdate");
  internalFiles.value = fileItems.map(item => item.file);
  emit('update:modelValue', internalFiles.value);
  // console.log(internalFiles.value);
};

// Watch for changes in modelValue and update internalFiles
watch(() => props.modelValue, (newFiles) => {
  internalFiles.value = newFiles || [];
});

</script>
