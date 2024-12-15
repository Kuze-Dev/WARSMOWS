<script setup>
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import { RouterLink, RouterView } from 'vue-router';
import axios from '../../axios';
import { ref, onMounted } from 'vue';
import { format } from 'date-fns';

const searchQuery = ref('')
const searchQueryBarangay =ref('');
const dateFrom = ref('');
const dateTo = ref('');

const topcustomers = ref([]);
const fetchTopCustomers = async () => {
    try {
        const response = await axios.get(`/topcustomer`,{
            params: {
                page: currentPage.value,
                limit: perPage.value,
                search: searchQuery.value,
                barangay: searchQueryBarangay.value,
                dateFrom: dateFrom.value, // Include dateFrom in request
                dateTo: dateTo.value,    // Include dateTo in request // Pass the barangay filter
            },
        });
        topcustomers.value = response.data.customers;
        // alert(topcustomers.value);
        totalCustomers.value = response.data.totalCustomers;
        currentPage.value = response.data.currentPage;
        perPage.value = response.data.perPage;
          // After fetching data, check if the current page is empty
          if (topcustomers.value.length === 0 && currentPage.value > 1) {
            // If the page is empty, go to the previous page
            currentPage.value--;
            fetchCustomerData(); // Fetch users for the updated page
        }
    } catch (error) {
        console.error("Failed to fetch top customers:", error);
    }
};

//Pages
const currentPage = ref(0);
const perPage = ref(0); // Number of customers per page
const totalCustomers = ref(0); // To track total customers for pagination

const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        fetchTopCustomers();
    }
};

const goToNextPage = () => {
    const totalPages = Math.ceil(totalCustomers.value / perPage.value); // Calculate total pages
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchTopCustomers(); // Fetch users for the updated page
    }
};


// Fetch top customers when the component is mounted
onMounted(fetchTopCustomers);




</script>

<template>
    <main class="lg:w-[1200px] xl:w-[1310px] w-full h-screen overflow-y-auto">
        <headerComponent />
        <div class="flex justify-center w-full">
            <section class="lg:w-[95%] xl:w-[95%] w-[90%] mt-7 border rounded-md  shadow-md">
                <div class="lg:flex mx-6 my-2 space-y-4 lg:space-y-0 lg:space-x-7">
                    <!-- Added space-y-4 for small screens and space-x-7 for larger screens -->

                    <div class="">
                        <RouterLink to="/monitoring" class="flex">
                            <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/posicon.png" alt="">
                            <span class="mt-3 ">POS TRANSACTION</span>
                        </RouterLink>

                    </div>

                    <div class="">
                        <RouterLink to="/creditbalance" class="flex">
                            <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/creditbalance.png" alt="">
                            <span class="mt-3 ">CREDIT/BALANCE</span>
                        </RouterLink>

                    </div>

                    <div class="">
                        <RouterLink to="/topcustomer" class="flex">
                            <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/topcustomer.png" alt="">
                            <span class="mt-3 font-bold">TOP CUSTOMER</span>
                        </RouterLink>

                        <div class="relative top-5">
                            <div class="border-b-2 border-black"></div>
                        </div>

                    </div>

                </div>

                <div>
                    <div class="mt-5 mx-3 mb-5">
                        <div class="border-b w-full"></div>
                    </div>
                </div>

             <!-- Start of Search Input and Button -->
<div class="xl:flex lg:flex items-center px-3  py-2 mb-2 bg-gray-300">
    <!-- Search Bar -->
    <div class="flex mx-auto flex-col lg:w-[30%] xl:w-[30%] w-[97%]  ">
        <label for="search-bar" class="text-sm text-gray-700 mb-1 font-medium">SEARCH</label>
        <div class="flex rounded-md shadow-md bg-white border border-black overflow-hidden font-[sans-serif]">
            <input 
                id="search-bar"
                type="search" 
                v-model="searchQuery"
                @input="fetchTopCustomers" 
                placeholder="Search ..." 
                class="outline-none w-full bg-white text-gray-600 text-sm px-2 lg:py-2 xl:py-2 py-2.5" 
            />
            <button 
                type="button" 
                class="flex items-center justify-center border-l border-black px-5"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 192.904 192.904" 
                    width="16px" 
                    class="fill-gray"
                >
                    <path
                        d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"
                    ></path>
                </svg>
            </button>
        </div>
    </div>
   <div></div>
    <!-- Input Boxes to the Right -->
    <div class="lg:flex xl:flex lg:space-x-5 xl:space-x-5 lg:ml-4 xl:ml-4  px-2 py-2">
        <!-- Input 1 -->
        <div class="flex flex-col">
            <label for="input-1" class="text-sm font-medium text-gray-700 mb-1">BARANGAY</label>
            <input 
                id="input-1"
                type="text" 
                v-model="searchQueryBarangay"
                @input="fetchTopCustomers"
                placeholder="All Barangay" 
                class="outline-none  w-full bg-white text-gray-600 text-sm border border-black px-2 py-[9.5px] rounded-md"
            />
        </div>
        
        <!-- Input 2 -->
        <div class="flex flex-col">
            <label for="input-2" class="text-sm text-gray-700 mb-1 font-medium">DATE FROM</label>
            <input 
                id="input-2"
                type="date" 
                v-model="dateFrom"
                placeholder="Input 2" 
                class="outline-none w-full bg-white text-gray-600 text-sm border border-black px-2 py-2 rounded-md"
            />
        </div>
        
        <!-- Input 3 -->
        <div class="flex flex-col">
            <label for="input-3" class="text-sm text-gray-700 mb-1 font-medium">DATE TO</label>
            <input 
                id="input-3"
                type="date" 
                v-model="dateTo"
                placeholder="Input 3" 
                class="outline-none w-full bg-white text-gray-600 text-sm border border-black px-2 py-2 rounded-md"
            />
        </div>
        
        <!-- Submit Button -->
        <div class="flex flex-col">
    <button @click="fetchTopCustomers"
        id="filter-record-button"
        type="button" 
        class="flex items-center justify-center lg:mt-6 xl:mt-6 mt-3 outline-none lg:w-[180px] w-full bg-[#4E95C9] text-black text-sm border border-black px-2 py-2 rounded-md hover:bg-blue-600"
    >
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.570068 0.394531H19.4301L12.5001 10.2115V18.3945H7.50007V10.2115L0.570068 0.394531ZM4.43007 2.39453L9.50007 9.57753V16.3945H10.5001V9.57753L15.5701 2.39453H4.43007Z" fill="#555555"/>
</svg>

        FILTER RECORD
    </button>
</div>

    </div>
</div>
<!-- End of Search Input and Button -->


                <!--Start of Table -->
                <section>
                    <div class="w-full ">
                        <div class="font-[sans-serif] overflow-x-auto border h-[777px] ">
                            <table class=" w-full bg-[#4E95C9]">
                                <thead class="whitespace-nowrap">
                                    <tr>
                                        <th class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            #
                                        </th>
                                        <th class="px-5 text-left text-xs font-semibold  uppercase tracking-wider">
                                            <div class="flex justify-center items-center">
                                                NAME
                                                <svg class="mx-2" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>

                                        </th>

                                        <th
                                            class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">

                                                <div class="flex justify-center  items-center ml-7">
                                                    QTY

                                                    <svg class="mx-2" width="21" height="20" viewBox="0 0 21 20"
                                                        fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                            stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </th>
                                        <th
                                            class="px-4  py-3 text-center text-xs font-semibold  uppercase tracking-wider ">

                                            <div class="flex   justify-center items-center">
                                                <div class="mx-4"></div>
                                                TOTAL
                                                <svg class="mx-2" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>

                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">
                                                <div class="mx-4"></div>
                                                LAST PURCHASED
                                                <svg class="mx-2" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </th>

                                    </tr>
                                </thead>
                                <tbody class="bg-white whitespace-nowrap">
                                  
                                    <tr class="border-b border-gray-300" v-if="topcustomers.length>0" v-for="(topcustomer, index) in topcustomers"
                                        :key="topcustomer.customer_id">
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ (currentPage - 1) * perPage + (index + 1) }}
                                        </td>
                                        <td class="px-4 w-2 py-4  text-sm  text-gray-800">
                                            <div class="text-[15px] font-bold">{{ topcustomer.firstname }} {{
                                                topcustomer.lastname }}</div>
                                            <div>{{ topcustomer.sitio }}, {{ topcustomer.barangay }},{{
                                                topcustomer.city }}</div>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center  text-sm text-gray-800">
                                            {{ topcustomer.total_quantity }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center  text-sm text-gray-800">
                                            {{ topcustomer.total }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                            {{ format(new Date(topcustomer.last_transaction_date), 'MMMM dd, yyyy') }}
                                        </td>
                                    </tr>
                                      <!-- Display message if no top customers are found -->
                                      <tr v-else>
                                        <td colspan="5" class="py-4 text-center text-gray-500 text-xl font-semibold">
                                            No top customers available.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                         <!-- Start of Pages -->
                <div
                    class=" flex justify-center py-2">
                    <!-- Start Of Previous Page -->
                    <svg @click="goToPreviousPage" class="bg-gray-200 border-l rounded-l-full " width="40" height="30"
                        viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M11.707 7.05451C11.8945 7.24203 11.9998 7.49634 11.9998 7.76151C11.9998 8.02667 11.8945 8.28098 11.707 8.4685L7.414 12.7615L11.707 17.0545C11.8892 17.2431 11.99 17.4957 11.9877 17.7579C11.9854 18.0201 11.8802 18.2709 11.6948 18.4563C11.5094 18.6417 11.2586 18.7469 10.9964 18.7492C10.7342 18.7515 10.4816 18.6507 10.293 18.4685L5.293 13.4685C5.10553 13.281 5.00021 13.0267 5.00021 12.7615C5.00021 12.4963 5.10553 12.242 5.293 12.0545L10.293 7.05451C10.4805 6.86703 10.7348 6.76172 11 6.76172C11.2652 6.76172 11.5195 6.86703 11.707 7.05451ZM17.707 7.05451C17.8945 7.24203 17.9998 7.49634 17.9998 7.76151C17.9998 8.02667 17.8945 8.28098 17.707 8.4685L13.414 12.7615L17.707 17.0545C17.8892 17.2431 17.99 17.4957 17.9877 17.7579C17.9854 18.0201 17.8802 18.2709 17.6948 18.4563C17.5094 18.6417 17.2586 18.7469 16.9964 18.7492C16.7342 18.7515 16.4816 18.6507 16.293 18.4685L11.293 13.4685C11.1055 13.281 11.0002 13.0267 11.0002 12.7615C11.0002 12.4963 11.1055 12.242 11.293 12.0545L16.293 7.05451C16.4805 6.86703 16.7348 6.76172 17 6.76172C17.2652 6.76172 17.5195 6.86703 17.707 7.05451Z"
                            fill="#555555" />
                    </svg>
                    <!-- End of Previous -->

                    <!-- Start of Current Page -->
                    <span class="bg-[#4E95C9] px-3 pt-1 hover:text-white ">{{ currentPage }}</span>
                    <!-- End of Current Page -->

                    <!-- Start of Next Page -->
                    <svg @click="goToNextPage" class="bg-gray-200 border-r rounded-r-full" width="40" height="30"
                        viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M13.2024 18.473C13.0179 18.2825 12.9166 18.0265 12.9208 17.7614C12.9251 17.4963 13.0344 17.2437 13.2248 17.0591L17.5854 12.8348L13.361 8.47422C13.1818 8.28275 13.0851 8.02858 13.0915 7.76645C13.0979 7.50432 13.2071 7.25521 13.3954 7.07277C13.5837 6.89032 13.8362 6.78914 14.0984 6.79102C14.3606 6.7929 14.6115 6.89769 14.7972 7.08282L19.7173 12.1615C19.9018 12.352 20.003 12.6079 19.9988 12.873C19.9946 13.1382 19.8853 13.3908 19.6949 13.5753L14.6162 18.4954C14.4257 18.6799 14.1698 18.7811 13.9047 18.7769C13.6395 18.7727 13.3869 18.6634 13.2024 18.473ZM7.20314 18.3778C7.01867 18.1873 6.9174 17.9314 6.9216 17.6662C6.92581 17.4011 7.03514 17.1485 7.22557 16.964L11.5861 12.7396L7.36173 8.37906C7.18259 8.1876 7.08581 7.93343 7.09225 7.6713C7.09868 7.40917 7.20782 7.16006 7.39614 6.97761C7.58447 6.79517 7.83692 6.69399 8.09912 6.69587C8.36132 6.69775 8.61229 6.80254 8.79798 6.98766L13.7181 12.0663C13.9025 12.2568 14.0038 12.5128 13.9996 12.7779C13.9954 13.043 13.8861 13.2956 13.6956 13.4802L8.61696 18.4002C8.42649 18.5847 8.17054 18.686 7.90541 18.6818C7.64028 18.6776 7.38767 18.5682 7.20314 18.3778Z"
                            fill="#555555" />
                    </svg>
                    <!--End of Next Page  -->
                </div>
                <!-- End of Pages -->
                    </div>
                </section>
            </section>
        </div>
        <RouterView />
        <footerComponent class="mt-3"  />
    </main>
    
</template>