export const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('@/pages/dashboard.vue'),
      },
      {
        path: 'user-settings',
        component: () => import('@/views/settings/UserSettings.vue'),
      },
      {
        path: 'account-settings',
        component: () => import('@/pages/account-settings.vue'),
      },
      {
        path: 'typography',
        component: () => import('@/pages/typography.vue'),
      },
      {
        path: 'icons',
        component: () => import('@/pages/icons.vue'),
      },
      {
        path: 'cards',
        component: () => import('@/pages/cards.vue'),
      },
      {
        path: 'tables',
        component: () => import('@/pages/tables.vue'),
      },
      {
        path: 'form-layouts',
        component: () => import('@/pages/form-layouts.vue'),
      },
      {
        path: 'kpop-collection',
        name: 'kpop-collection.item.listing',
        component: () => import('@/views/kpop-collection/kpop-item/Listing.vue'),
      },
      {
        path: 'kpop-collection/:kpop_item_id',
        name: 'kpop-collection.item.view',
        component: () => import('@/views/kpop-collection/kpop-item/View.vue'),
      },
      {
        path: 'kpop/data-setup',
        name: 'kpop-collection.data-setup.listing',
        component: () => import('@/views/kpop-collection/data-setup/Listing.vue'),
      },
      {
        path: 'kpop/data-setup/:kpop_era_id',
        name: 'kpop-collection.data-setup.view',
        component: () => import('@/views/kpop-collection/data-setup/View.vue'),
      },
      {
        path: 'finance/dashboard',
        name: 'finance.transaction.dashboard',
        component: () => import('@/views/finance/dashboard/Main.vue'),
      },
      {
        path: 'finance/transaction',
        name: 'finance.transaction.item.listing',
        component: () => import('@/views/finance/transaction/Listing.vue'),
      },
      {
        path: 'finance/transaction/:transaction_id',
        name: 'finance.transaction.item.view',
        component: () => import('@/views/finance/transaction/View.vue'),
      },
      {
        path: 'finance/setup-category',
        name: 'finance.setup-category.listing',
        component: () => import('@/views/finance/setup-category/Listing.vue'),
      },
      {
        path: 'finance/setup-category/:category_id',
        name: 'finance.setup-category.view',
        component: () => import('@/views/finance/setup-category/View.vue'),
      },
      {
        path: 'finance/setup-account',
        name: 'finance.setup-account.listing',
        component: () => import('@/views/finance/setup-account/Listing.vue'),
      },
      {
        path: 'finance/setup-account/:account_id',
        name: 'finance.setup-account.view',
        component: () => import('@/views/finance/setup-account/View.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/blank.vue'),
    children: [
      {
        path: 'login',
        component: () => import('@/pages/login.vue'),
      },
      {
        path: 'register',
        component: () => import('@/pages/register.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        component: () => import('@/pages/[...error].vue'),
      },
    ],
  },
]
