<template>
  <div>
    <VSelect
      v-model="internalValue"
      :items="itemLookupOptions"
      :loading="loading"
      :search-input.sync="searchQuery"
      clearable
      item-title="name"
      item-value="id"
      placeholder="Select an option"
      :return-object="returnObject"
      :error-messages="error"
      :menu-props="{ fixed: true, nudgeBottom: 10, maxHeight: 300 }"
      :hide-details="!error"
      :prepend-inner-icon="prependInnerIcon"
      :label="label"
    >
      <template v-if="label" #label>
        <span class="info--text text--darken-3">{{ label }}</span>
      </template>
    </VSelect>
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
    error: Array,
    readonly: {
      type: Boolean, default: false,
    },
    hideDetails: {
      type: Boolean, default: false,
    },
    returnObject: {
      type: Boolean, default: false,
    },
    moneyCategoryId: [Number, String],
    typeIncomeExpense: [Number, String],
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
    typeIncomeExpense(newValue) {
      // console.log("moneyCategoryId changed");
      // console.log(newValue);
      this.loading = true;
      this.fetchLookupOptions();
    },
    moneyCategoryId(newValue) {
      // console.log("moneyCategoryId changed");
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

      let url = '/finance/v1/lookup/get-sub-categories';
      let params = [];
      if (this.moneyCategoryId) params.push(`money_category_id=${this.moneyCategoryId}`);
      if (this.typeIncomeExpense) params.push(`type_income_expense=${this.typeIncomeExpense}`);
      if (params.length) url += '?' + params.join('&');

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
