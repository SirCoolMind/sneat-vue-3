<style scoped>

/* Remove opacity even if disabled */
.v-breadcrumbs-item--disabled {
  opacity: 1 !important;
}

.v-breadcrumbs ,
.v-breadcrumbs-item {
  padding:0px !important;
}
</style>

<template>
  <VBreadcrumbs :items="items">
    <template v-slot:item="{ item }">
      <!-- {{ item }} -->
      <VBreadcrumbsItem 
        v-if="item.show" 
        :title="item.title"
        :to="item.route"
        :disabled="item.disabled"
      ></VBreadcrumbsItem>
    </template>

  </VBreadcrumbs>
</template>

<script setup>
import { watch } from 'vue';
import { VBreadcrumbsItem } from 'vuetify/lib/components/index.mjs';

/** Make sure every props have structure like below 
 * {
    title: '', // name of breadcrumb
    disabled: true, // can click link or not
    show: false, // will be shown or not
    route: { name: 'named-route', params: { object_id: 'new'}},
  }
*/
const props = defineProps({
  items: {
    type: Array,
    default: () => [
      {
        title: '', // name of breadcrumb
        disabled: true, // can click link or not
        show: false, // will be shown or not
        route: '',
      }
    ]
  },
});

// Watch for changes in newItem
watch(() => props.items, (newItem) => {
  // console.log(newItem)
});

</script>
