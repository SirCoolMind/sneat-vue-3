<script setup>
import axios from "axios";
import Swal from "sweetalert2-neutral";
import { ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  delete_api_url: String,
  route_success: String,
});

const router = useRouter();
const errorMessages = ref({});

const deleteData = async () => {
  try {
    const segments = props.delete_api_url.split("/");
    const lastSegment = segments.pop();

    if (lastSegment === "new") {
      Swal.fire({ icon: "error", title: "Error", text: "Invalid action!" });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    });

    if (!confirmResult.isConfirmed) return;

    const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}${props.delete_api_url}`);
    console.log("response delete", response);

    Swal.fire({ icon: "success", title: "Success", text: "Record deleted!" });

    await router.push(props.route_success);
  } catch (error) {
    console.error("deleteData Function failed:", error);
    errorMessages.value = error?.response?.data?.errors ?? {};
    Swal.fire({ icon: "error", title: "Oops...", text: "Something is wrong!" });
  }
};
</script>

<template>
  <VBtn color="error" @click="deleteData" class="me-2">
    <slot>Delete</slot>
  </VBtn>
</template>
