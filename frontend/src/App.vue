<script setup>
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import { decodeJWT } from './stores/jwt';

const route = useRoute();
const currentRoute = ref(route.path); // Track the active route
const router = useRouter();
const token = ref(localStorage.getItem('token'));
const role = ref('');

// Watch for route changes to update active link
watch(() => route.path, (newPath) => {
  currentRoute.value = newPath;
});

// Function to check the token and navigate based on role sdfgbngfbdfbncvmgf
const handleTokenNavigation = () => {
  if (token.value) {
    try {
      const decoded = decodeJWT(token.value);
     

      // Set the role from the decoded token
      role.value = decoded.accountType;
      console.log('Valid token:', decoded.accountType);

      // Navigate based on the role
      if (role.value === 'POS User') {
        if (currentRoute.value !== '/pos') {
          router.push({ name: 'pos' });
        }
      } else if (role.value === 'Delivery Boy') {
        if (currentRoute.value !== '/delivery') {
          router.push({ name: 'delivery' });
        }
      }
    } catch (error) {
      console.error('Invalid token:', error.message);
      localStorage.removeItem('token');
      token.value = null;
      router.push({name:'unauthorized'})
    }
  }
};

// Run the function when the component is mounted
onMounted(() => {
  handleTokenNavigation();
});

// Watch for token changes to re-run navigation if needed
watch(token, () => {
  handleTokenNavigation();
});

</script>


<template>
  <main class="flex ">
    <header  v-if="token && role !== 'POS User'&&role!=='Delivery Boy' && route.name !== 'notfound'"
      class="border w-screen  lg:w-[279px] xl:w-[300px] h-screen lg:pb-3 xl:pb-2  lg:block xl:block hidden">
       
          <div  class="mt-1 border-b h-[56.6px]">
  <div class="flex mr-auto mx-2">
    <img class="w-[57px] mx-2" src="../src/assets/logowarsmows.png" alt="Logo" />
    <img class="w-[100px] h-[25px] mt-4" src="../src/assets/textwarsmows.png" alt="Text" />
  </div>
</div>

<nav class="relative overflow-y-hidden h-[90vh] hover:overflow-y-auto">
          <div class="mr-auto flex mx-6 py-2 ">
            <h4 class="text-sm text-gray-400 mb-1">Main</h4>
          </div>

          <RouterLink 
            to="/" 
            :class="['flex pl-12 py-2 text-md font-semibold mb-2', currentRoute === '/' ? 'text-white bg-[#4195C9]' : '']">
            <img class="mr-4 w-[25px]" src="../src/assets/dashboardicon.png" alt="" /> Dashboard
          </RouterLink>

          
          <RouterLink  v-if="role === 'POS User' || role === 'Admin'" to="/pos" 
          :class="['flex pl-12 py-2 text-md font-semibold mb-2', currentRoute === '/pos' ? 'text-white bg-[#4195C9]' : '']">
            <img class="mr-4 w-[25px]" src="../src/assets/posicon.png" alt="">POS</RouterLink>

          <RouterLink  v-if="role === 'Delivery Boy' || role === 'Admin'"  to="/delivery"
          :class="['flex pl-12 py-2 text-md font-semibold mb-2', currentRoute === '/delivery' ? 'text-white bg-[#4195C9]' : '']">

            <img
              class="mr-4 w-[25px]" src="../src/assets/deliveryicon.png" alt="">Delivery Status</RouterLink>

          <RouterLink to="/monitoring"
          :class="['flex pl-12 py-2 text-md font-semibold mb-2', currentRoute === '/monitoring' ? 'text-white bg-[#4195C9]' : '']">

            <img
              class="mr-4 w-[25px]" src="../src/assets/monitoringicon.png" alt="">Monitoring</RouterLink>
              
          <RouterLink to="/sales"
          :class="['flex pl-12 py-2 text-md font-semibold mb-2', currentRoute === '/sales' ? 'text-white bg-[#4195C9]' : '']">
          <img
              class="mr-4 w-[25px]" src="../src/assets/salesreporticon.png" alt="">Sales Report</RouterLink>
          <div class="mr-auto flex mx-5 py-2">
            <h4 class="text-sm text-gray-400 mb-1">Manage</h4>
          </div>
          <RouterLink to="/customer"
          :class="['flex pl-12 py-2 text-md font-semibold mb-2', currentRoute === '/customer' ? 'text-white bg-[#4195C9]' : '']">
          <img class="h-6 w-4"
              src="../src/assets/customericon.png" alt=""><img class=" w-[18px]  h-5 mt-2 mr-1"
              src="../src/assets/customericon1.png" alt="">Customer</RouterLink>

          <RouterLink to="/stock"
          :class="['flex pl-12 py-2 text-md font-semibold mb-2', currentRoute === '/stock' ? 'text-white bg-[#4195C9]' : '']">
          <img
              class="mr-4 w-[22px]" src="../src/assets/stockexpensesicon.png" alt="">Stock & Expenses</RouterLink>

          <RouterLink to="/itemlist"
          :class="['flex pl-12 py-2 text-md font-semibold mb-2', currentRoute === '/itemlist' ? 'text-white bg-[#4195C9]' : '']">
          <img
              class="mr-4 w-[25px]" src="../src/assets/itemlisticon.png" alt="">Item List</RouterLink>
          <div class="mr-auto flex mx-5 py-2">
            <h4 class="text-sm text-gray-400 ">Settings</h4>

          </div>
          <RouterLink to="/manageaccount"
          :class="['flex pl-12 py-2 text-md font-semibold mb-2', currentRoute === '/manageaccount' ? 'text-white bg-[#4195C9]' : '']">
          <img class="mr-4 w-[25px]"
              src="../src/assets/manageaccounticon.png" alt="">Manage Account</RouterLink>
        </nav>
    </header>
    <RouterView />

  </main>


  
</template>

<style scoped>
/* Custom scrollbar styles */
nav {
  scrollbar-width: thin; /* For Firefox */
}

nav::-webkit-scrollbar {
  width: 8px; /* Width of the scrollbar */
  height: 8px; /* Height of the scrollbar (for horizontal scrollbar) */
}

nav::-webkit-scrollbar-track {
  background: #f1f1f1; /* Color of the scrollbar track */
  border-radius: 10px; /* Rounded corners for the track */
}

nav::-webkit-scrollbar-thumb {
  background: #888; /* Color of the scrollbar handle */
  border-radius: 10px; /* Rounded corners for the handle */
}

nav::-webkit-scrollbar-thumb:hover {
  background: #555; /* Color of the scrollbar handle on hover */
}
</style>
