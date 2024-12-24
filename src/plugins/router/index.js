import NProgress from 'nprogress';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  NProgress.start(); //Start loading
  next()
})

router.afterEach(() => {
  NProgress.done(); //Finish loading
})

export default function (app) {
  app.use(router)
}
export { router };

