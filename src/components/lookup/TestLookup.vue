<template>
  <div>
    <VAutocomplete
      v-model="internalValue"
      :items="itemLookupOptions"
      :loading="loading"
      :search-input.sync="searchQuery"
      clearable
      item-title="name"
      item-value="id"
      placeholder="Select an option"
      :return-object="returnObject"
      :error-messages="errorMessages"
      :menu-props="{ fixed: true, nudgeBottom: 10, maxHeight: 300 }"
      :dense="dense"
      :solo="solo"
      :flat="flat"
      :outline="outline"
      :hide-details="hideDetails"
      :prepend-inner-icon="prependInnerIcon"
      :label="label"
    >
      <template v-if="label" #label>
        <span class="info--text text--darken-3">{{ label }}</span>
      </template>
    </VAutocomplete>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    modelValue: Object,
    itemOptions: {
      type: Array,
      default: () => [],
    },
    label: String,
    prependInnerIcon: String,
    errorMessages: Array,
    dense: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    outline: {
      type: Boolean,
      default: false,
    },
    hideDetails: {
      type: Boolean,
      default: false,
    },
    returnObject: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      internalValue: this.value,
      lookupOptions: this.itemOptions, // Default options or fetched from API
      loading: false,
      searchQuery: null,
    };
  },

  created() {
    if (!this.itemOptions.length) {
      this.fetchLookupOptions();
    }
  },

  computed: {
    itemLookupOptions() {
      return this.lookupOptions.map(option => ({
        ...option,
        name: option.name, // Simplifying field mapping
        id: option.id, // Simplifying field mapping
      }));
    },
  },

  watch: {
    searchQuery(newValue) {
      if (!this.lookupOptions.length && !this.loading) {
        this.loading = true;
        this.fetchLookupOptions();
      }
    },
    internalValue(newValue) {
      console.log(newValue);
      this.$emit('update:modelValue', newValue);
    },
  },

  methods: {
    fetchLookupOptions() {
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/kpop/v1/admin/kpop-era`)
        .then(response => {
          this.lookupOptions = response.data.data; // Assuming API returns data inside data
        })
        .catch(error => {
          console.error('Error fetching lookup options', error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
