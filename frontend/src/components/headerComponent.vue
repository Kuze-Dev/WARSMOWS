<script setup>
import { ref, onMounted} from 'vue';
import { RouterLink} from 'vue-router';
import { decodeJWT } from '../stores/jwt';

const token = ref(localStorage.getItem('token'));
const role = ref('');

// Decode the token and extract the accountType (role)
onMounted(() => {
  if (token.value) {
    try {
      const decoded = decodeJWT(token.value);
      role.value = decoded.accountType;
      console.log('User Role:', role.value);
    } catch (error) {
      console.error('Error', error.message);
     
    }
  }
});

const showMenu = ref(false);
const slideOut = ref(false);

const toggleMenu = () => {
    showMenu.value = !showMenu.value;
}

const cancelMenu = () => {
    slideOut.value = true;
    setTimeout(() => {
        showMenu.value = false;
        slideOut.value = false;
    }, 500); // Match the duration with your CSS animation time
}

const logout =() => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    token.value =null;
    location.reload();

    
}

const showNotifModal = ref(false);

const openNotifModal = () => {
  // Toggle the modal's visibility
  showNotifModal.value = !showNotifModal.value;
};

const closeNotifModal = () => {
  showNotifModal.value = false;
};

</script>

<template>
      <main class="bg-orange w-full h-[62.5px] z-20  top-0">
        <section :class="(role === 'POS User' || role === 'Delivery Boy') ? 'flex border-t border-b border-r pb-[8px] bg-white fixed lg:w-[83%] xl:w-[83%] w-full z-10' : ' flex border-t border-b border-r pb-[8px] bg-white fixed lg:w-[80%] xl:w-[80%] w-full z-10'">
          <div class="xl:hidden lg:hidden">
          <i @click="toggleMenu"
            class="fas fa-bars  text-[24px] text-gray-500 mt-2 mx-3 p-3 cursor-pointer hover:text-white hover:bg-[#4195C9] hover:rounded-full transition-all duration-300 ease-in-out">
          </i>
        </div>
          <div class="flex justify-center px-3 mx-3">
            <img class="h-6 mt-2" src="../assets/R.png" alt="">
            <img class="h-6 mt-7" src="../assets/R.png" alt="">
            <img class="h-9 mt-3 mx-1" src="../assets/warsmows.png" alt="">
          </div>
          <div class="flex justify-end ml-auto mr-5">
            <!-- <img @click="openNotifModal" class="w-[25px] h-[25px] mt-4 mx-2" src="../assets/notification.png" alt=""> -->
            <button @click="logout"
              class="border shadow-md w-[100px] h-[35px] mt-3 bg-[#3e60d8] hover:bg-[#3e64ed] text-white rounded-full lg:block xl:block hidden">SIGN
              OUT</button>
          </div>
        </section>
  
        <!-- Background Overlay for Sidebar -->
        <div v-show="showMenu"
             class="fixed inset-0 bg-gray-500 opacity-50 z-20 lg:hidden xl:hidden"
             @click="cancelMenu">
        </div>
  
        <!-- Menu Bar Display Route -->
        <nav v-show="showMenu" :class="{ 'animate-slide-in': showMenu, 'animate-slide-out': slideOut }"
          class="bg-white border-r overflow-y-auto h-screen w-2/3 fixed top-0 lg:hidden xl:hidden md:block z-30">
          <div class="mt-1 border-b h-[58px]">
            <div class="flex mr-auto mx-2">
              <img class="w-[57px] mx-2" src="../assets/logowarsmows.png" alt="">
              <img class="w-[100px] h-[25px] mt-4" src="../assets/textwarsmows.png" alt="">
              <div class="ml-auto">
                <i @click="cancelMenu"
                   class="fas fa-times text-[22px] text-gray-500 mt-2 mx-1 p-2 pr-3 pl-3 cursor-pointer hover:text-white hover:bg-[#4195C9] rounded-full transition-all duration-300 ease-in-out">
                </i>
              </div>
            </div>
          </div>
          
          <!-- Sidebar Content -->
          <div class="mr-auto flex mx-6 py-2">
            <h4 class="text-sm text-gray-400 mb-1">Main</h4>
          </div>
  
          <RouterLink to="/" class="flex pl-12 py-2 text-md hover:text-white hover:bg-[#4195C9] font-semibold mb-2">
            <img class="mr-4 w-[25px]" src="../assets/dashboardicon.png" alt="">Dashboard
          </RouterLink>
          <RouterLink to="/pos"
              class="flex pl-12 py-2 text-md hover:text-white hover:bg-[#4195C9] font-semibold mb-2">
            <img class="mr-4 w-[25px]" src="../assets/posicon.png" alt="">POS
          </RouterLink>
          <RouterLink to="/delivery"
              class="flex pl-12 py-2 text-md hover:text-white hover:bg-[#4195C9] font-semibold mb-2">
            <img class="mr-4 w-[25px]" src="../assets/deliveryicon.png" alt="">Delivery Status
          </RouterLink>
          <RouterLink to="/monitoring"
              class="flex pl-12 py-2 text-md hover:text-white hover:bg-[#4195C9] font-semibold mb-2">
            <img class="mr-4 w-[25px]" src="../assets/monitoringicon.png" alt="">Monitoring
          </RouterLink>
          <RouterLink to="/sales"
              class="flex pl-12 py-2 text-md hover:text-white hover:bg-[#4195C9] font-semibold mb-2">
            <img class="mr-4 w-[25px]" src="../assets/salesreporticon.png" alt="">Sales Report
          </RouterLink>
          
          <div class="mr-auto flex mx-5 py-2">
            <h4 class="text-sm text-gray-400 mb-1">Manage</h4>
          </div>
          <RouterLink to="/customer"
              class="flex pl-12 py-2 text-md hover:text-white hover:bg-[#4195C9] font-semibold mb-2">
            <img class="h-6 w-4" src="../assets/customericon.png" alt="">
            <img class="w-[18px] h-5 mt-2 mr-1" src="../assets/customericon1.png" alt="">Customer
          </RouterLink>
          <RouterLink to="/stock"
              class="flex pl-12 py-2 text-md hover:text-white hover:bg-[#4195C9] font-semibold mb-2">
            <img class="mr-4 w-[22px]" src="../assets/stockexpensesicon.png" alt="">Stock & Expenses
          </RouterLink>
          <RouterLink to="/itemlist"
              class="flex pl-12 py-2 text-md hover:text-white hover:bg-[#4195C9] font-semibold mb-2">
            <img class="mr-4 w-[25px]" src="../assets/itemlisticon.png" alt="">Item List
          </RouterLink>
          
          <div class="mr-auto flex mx-5 py-2">
            <h4 class="text-sm text-gray-400">Settings</h4>
          </div>
          <div class="pb-1 border-b">
            <RouterLink to="/manageaccount"
                class="flex pl-12 py-2 text-md hover:text-white hover:bg-[#4195C9] font-semibold">
              <img class="mr-4 w-[25px]" src="../assets/manageaccounticon.png" alt="">Manage Account
            </RouterLink>
          </div>
  
          <button @click="logout"
            class="border flex mx-auto px-3 py-1 mb-2 w-[100px] h-[35px] mt-3 bg-[#3e60d8] hover:bg-[#3e64ed] text-white rounded-full">
            SIGN OUT
          </button>
        </nav>

        <!-- Notification Modal  -->
        <div v-if="showNotifModal" @click.self="closeNotifModal" 
                          class="fixed inset-0 bg-transparent z-20 flex justify-end items-start p-4">
                        <!-- Notification Modal Content -->
                        <section class="mt-[50px] lg:mr-10 w-80 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-gray-300  rounded-lg relative">
                          <div class="flex items-center justify-between p-3 border-b">
                            <h3 class="text-gray-800 font-bold">Notifications</h3>
                            
                          </div>
                          <div class="p-4  max-h-[450px] overflow-y-auto ">
                            <!-- Notification content goes here -->
                            <p>Your notifications will appear here.</p>
                            <p>Your notifications will appear here.</p>
                            

                            
                            
                            
                            
                          </div>
                        </section>
                      </div>
    </main>
  </template>

<style scoped>
@keyframes slide-in {
    from {
        transform: translateX(-100%);
    }

    to {
        transform: translateX(0);
    }
}

.animate-slide-in {
    animation: slide-in 0.5s forwards;
}

@keyframes slide-out {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(-100%);
    }
}

.animate-slide-out {
    animation: slide-out 0.5s forwards;
}
</style>
