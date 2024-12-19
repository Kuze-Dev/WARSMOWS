import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/store';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    
    {
      path: '/',
      name: 'login',
      component: () => import('../views/loginView.vue'),
      meta: {requiresAuth: false}
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/dashboardView.vue'),
      meta: {requiresAuth:true}
    }, 
    {
      path: '/pos',
      name: 'pos',
      component: () => import('../views/posView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/delivery',
      name: 'delivery',
      component: () => import('../views/deliverystatusView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/successfuldelivery',
      name: 'successfuldelivery',
      component: () => import('../views/successfuldeliveryView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/monitoring',
      name: 'monitoring',
      component: () => import('../views/monitoringView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/creditbalance',
      name: 'creditbalance',
      component: () => import('../views/credit_balanceView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/topcustomer',
      name: 'topcustomer',
      component: () => import('../views/top_customerView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/sales',
      name: 'sales',
      component: () => import('../views/salesreportView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/customer',
      name: 'customer',
      component: () => import('../views/customerView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/stock',
      name: 'stock',
      component: () => import('../views/stockView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: () => import('../views/expensesView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/itemlist',
      name: 'itemlist',
      component: () => import('../views/itemlistView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/manageaccount',
      name: 'manageaccount',
      component: () => import('../views/manageaccountView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/salessummary',
      name: 'salessummary',
      component: () => import('../views/salessummaryView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/dailysales',
      name: 'dailysales',
      component: () => import('../views/dailysalesView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/newcustomer',
      name: 'newcustomer',
      component: () => import('../views/newcustomerView.vue'),
      meta: {requiresAuth:true}
    },
    // Catch-all 404 route
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('../views/notfoundView.vue'),
      meta: {requiresAuth:true}
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: () => import('../views/unauthorizedaccessView.vue')
    }

    
  ]
})

// router.beforeEach((to,from,next)=>{
//   const authStore = useAuthStore(); 
//   const token = authStore.token; 
  
//     if(to.meta.requiresAuth){
//     if(token){
//       next();
//     }else{
//       next({name:'login'})
//     }
//   }else{
//     if (token) {
//       next({ name: 'dashboard' });
//     } else {
//       next();
//     }
//   }
// })
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (to.meta.requiresAuth) {
    // If the route requires authentication
    if (token) {
      next(); // Proceed if authenticated
    } else {
      next({ name: 'login' }); // Redirect to login on logout
    }
  } else {
    // For routes that don't require authentication
    if (token && to.name === 'login') {
      next({ name: 'dashboard' }); // Redirect authenticated users away from login
    } else {
      next(); // Allow access
    }
  }
});

export default router