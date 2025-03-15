<script setup>
import { useAuthStore } from '@/plugins/auth';
import { getValue } from '@/utils/helpers';
import avatar1 from '@images/avatars/avatar-1.png';
import axios from 'axios';
// import Swal from 'sweetalert2-neutral';
import { useRouter } from 'vue-router';

const router = useRouter()
const authStore = useAuthStore()

const userName = ref(localStorage.getItem('user_name') || 'Guest')

// Function to handle logout
const logout = async () => {

  const success = await authStore.logout()
  if (success) {
    router.push('/login') // Redirect on successful login
  } else {
    console.error('Logout failed')
  }
}

// Data related function
const errorMessages = ref({})
const userData = ref({});

onMounted(() => {
  getData();
});

const getData = async () => {
  try {
    console.log(`Fetching user data`);
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user-setting/account`)
    // console.log(response.data.data)
    userData.value = response.data.data;
  } catch (error) {
    console.error('getData Function failed:', error);
    errorMessages.value = getValue(error, "response.data.errors") ?? {};
    // Swal.fire({ icon: "error", title: "Oops...", text: "Something is wrong!" });
  }
}
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
    bordered
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg v-if="userData?.profile_image?.[0]" :src="userData.profile_image[0].source" />
      <VImg v-else :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <VImg v-if="userData?.profile_image?.[0]" :src="userData.profile_image[0].source" />
                    <VImg v-else :src="avatar1" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ userName }}
            </VListItemTitle>
            <!-- <VListItemSubtitle>Admin</VListItemSubtitle> -->
          </VListItem>
          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-user"
                size="22"
              />
            </template>

            <VListItemTitle>Profile</VListItemTitle>
          </VListItem>

          <!-- 👉 Settings -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-cog"
                size="22"
              />
            </template>

            <VListItemTitle>Settings</VListItemTitle>
          </VListItem>

          <!-- 👉 Pricing -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-dollar"
                size="22"
              />
            </template>

            <VListItemTitle>Pricing</VListItemTitle>
          </VListItem>

          <!-- 👉 FAQ -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-help-circle"
                size="22"
              />
            </template>

            <VListItemTitle>FAQ</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem @click="logout">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-log-out"
                size="22"
              />
            </template>

            <VListItemTitle>Logout</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
