<template>
  <VCardItem class="py-4 mb-4" style="border-bottom: 1px solid gray;">
    <VCardTitle>
      <VContainer class="pa-0">
        <VRow class="d-flex align-center" dense>
          <VCol cols="9" class="overflow-hidden">
            <Breadcrumbs :items="breadcrumbs" />
          </VCol>
          <VCol cols="3" class="d-flex justify-end">
            <VFabTransition>
              <VBtn :to="buttonTo">{{ buttonText }}</VBtn>
            </VFabTransition>
          </VCol>
        </VRow>
      </VContainer>
    </VCardTitle>
  </VCardItem>
</template>

<script>
export default {
  name: 'CardHeaderDefault',
  props: {
    breadcrumbs: {
      type: Array,
      required: true,
    },
    buttonTo: {
      type: Object,
      required: true,
    },
    buttonText: {
      type: String,
      default: 'New',
    },
  },
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
