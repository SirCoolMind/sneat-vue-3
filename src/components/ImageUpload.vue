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
});

// Custom event handlers
const handleFilePondInit = () => {
  console.log("FilePond has initialized");
};


// Reactive state for the files inside the component
const internalFiles = ref(props.modelValue || []);
const emit = defineEmits(['update:modelValue']);
const onFileUpdate = (fileItems) => {
  console.log("onfileupdate");
  internalFiles.value = fileItems.map(item => item.file);
  emit('update:modelValue', internalFiles.value);
  console.log(internalFiles.value);
};

// Watch for changes in modelValue and update internalFiles
watch(() => props.modelValue, (newFiles) => {
  internalFiles.value = newFiles || [];
});

</script>
