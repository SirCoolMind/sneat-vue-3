<template>
  <div v-for="item in navItems" :key="item.title">
    <!-- Check if item has children (sub-items) to render as VerticalNavGroup -->
    <VerticalNavGroup v-if="item.children" :item="item">
      <VerticalNavLink v-for="child in item.children" :key="child.title" :item="child" />
    </VerticalNavGroup>
    
    <!-- Check if item is a section title -->
    <VerticalNavSectionTitle v-else-if="item.heading" :item="item" />
    
    <!-- Render a single VerticalNavLink -->
    <VerticalNavLink v-else :item="item" />
  </div>
</template>

<style>
  .layout-nav-type-vertical .layout-vertical-nav .nav-section-title {
    margin-block-end: 0.8rem;
    margin-block-start: 0.8rem;
  }
</style>

<script setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue';
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue';
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue';

const navItems = [
  {
    title: 'Dashboards',
    badgeContent: '5',
    badgeClass: 'bg-error',
    icon: 'bx-home-smile',
    children: [
      {
        title: 'Analytics',
        to: '/dashboard',
      }
    ]
  },
  {
    heading: 'Apps',
  },
  {
    title: 'KPOP Collection',
    icon: 'bx-collection',
    children: [
      {
        title: 'Photocards',
        icon: 'bx-collection',
        to: '/kpop-collection',
      },
      {
        title: 'Data Setup',
        icon: 'bx-wrench',
        to: '/kpop/data-setup',
      },
    ]
  },
  {
    title: 'Finance',
    icon: 'bx-collection',
    children: [
      {
        title: 'Finance Dashboard',
        icon: 'bx-board',
        to: '/finance/dashboard',
      },
      {
        title: 'New Transaction',
        icon: 'bx-collection',
        to: '/finance/transaction/new',
      },
      {
        title: 'Transaction',
        icon: 'bx-collection',
        to: '/finance/transaction',
      },
      {
        title: 'Setup Category',
        icon: 'bx-wrench',
        to: '/finance/setup-category',
      },
      {
        title: 'Setup Account',
        icon: 'bx-wrench',
        to: '/finance/setup-account',
      },
    ]
  },
  {
    heading: "Templates Things"
  },
  {
    title: "Account Settings",
    icon: "bx-user",
    to: "/account-settings"
  },
  {
    title: "Login",
    icon: "bx-log-in",
    to: "/login"
  },
  {
    title: "Register",
    icon: "bx-user-plus",
    to: "/register"
  },
  {
    title: "Error",
    icon: "bx-info-circle",
    to: "/no-existence"
  },
  {
    heading: "User Interface"
  },
  {
    title: "Typography",
    icon: "bx-text",
    to: "/typography"
  },
  {
    title: "Icons",
    icon: "bx-package",
    to: "/icons"
  },
  {
    title: "Cards",
    icon: "bx-credit-card",
    to: "/cards"
  },
  {
    heading: "Forms & Tables"
  },
  {
    title: "Form Layouts",
    icon: "bx-layout",
    to: "/form-layouts"
  },
  {
    title: "Tables",
    icon: "bx-table",
    to: "/tables"
  },
  {
    heading: "Others"
  },
  {
    title: "Documentation",
    icon: "bx-file",
    "href": "https://demos.themeselection.com/sneat-vuetify-vuejs-admin-template/documentation/",
    "target": "_blank"
  },
]
</script>
