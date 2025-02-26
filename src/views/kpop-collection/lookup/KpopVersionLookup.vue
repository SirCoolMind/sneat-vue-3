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
      :hide-details="!errorMessages"
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
    readonly: {
      type: Boolean, default: false,
    },
    hideDetails: {
      type: Boolean, default: false,
    },
    returnObject: {
      type: Boolean, default: false,
    },
    eraId: [Number, String],
  },

  data() {
    return {
      internalValue: this.modelValue,
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
    eraId(newValue) {
      // console.log("eraId changed");
      // console.log(newValue);
      this.loading = true;
      this.fetchLookupOptions();
    },
    searchQuery(newValue) {
      if (!this.lookupOptions.length && !this.loading) {
        this.loading = true;
        this.fetchLookupOptions();
      }
    },
    internalValue(newValue) {
      // console.log(newValue);
      this.$emit('update:modelValue', newValue);
    },
  },

  methods: {
    fetchLookupOptions() {

      const url = this.eraId
        ? `/kpop/v1/lookup/kpop-versions?kpop_era_id=${this.eraId}` // With query parameter
        : `/kpop/v1/lookup/kpop-versions`; // Without query parameter

      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}`+url)
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
