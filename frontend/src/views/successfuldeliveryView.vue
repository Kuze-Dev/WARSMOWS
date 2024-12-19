<script setup>
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import headerbar from '../components/headerbarComponent.vue'
import { format } from 'date-fns'; // Import date-fns for date formatting
import { RouterLink, RouterView } from 'vue-router';
import { decodeJWT } from '../stores/jwt';

import { ref, onMounted } from 'vue';
import axios from '../../axios';


const token = ref(localStorage.getItem('token'));
const role = ref('');


onMounted(() => {
    if (token.value) {
        try {
            const decoded = decodeJWT(token.value);
            role.value = decoded.accountType;
            console.log('Role:', role.value);

        } catch (error) {
            console.error('Error:', error.message);

        }
    }
});

const searchQuery = ref('');

const successdeliveries = ref([]);
const fetchAllSuccessDelivery = async () => {
    try {
        const response = await axios.get('/successfullDelivery', {
            params: {
                page: currentPage.value,
                limit: perPage.value,
                search: searchQuery.value,
            },
        });
        successdeliveries.value = response.data.Results.map(successdelivery => {
            return {
                ...successdelivery,
                items: JSON.parse(`[${successdelivery.items}]`)
            };
        });
        console.log('Successfull Delivery', successdeliveries.value);



        totalDeliveries.value = response.data.TotalDeliveries;
        currentPage.value = response.data.currentPage;
        perPage.value = response.data.perPage;

        // Handle empty results when not on the first page
        if (successdeliveries.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
            fetchAllSuccessDelivery(); // Fetch updated page data
        }
    } catch (err) {
        console.error('Error Fetching Success Delivery:', err);
    }
};

//Pages
const currentPage = ref(0);
const perPage = ref(0); // Number of customers per page
const totalDeliveries = ref(0); // To track total customers for pagination

const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        fetchAllSuccessDelivery();
    }
};

const goToNextPage = () => {
    const totalPages = Math.ceil(totalDeliveries.value / perPage.value); // Calculate total pages
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchAllSuccessDelivery();
    }
};

const selectedDeliveryDetails =ref(false);
const showDeliveryDetails = ref(false);
const customer_firstname =ref('');
const customer_lastname = ref('');
const alias = ref('');
const sitio = ref('');
const barangay =ref('');
const city = ref('');
const mobile1 = ref('');
const transaction_date = ref('');
const user_firstname =ref('');
const user_lastname = ref('');
const user_contact =ref('');
const delivered_at =ref('');
const proof_image =ref('');

const openDeliveryDetails=(id)=>{
    showDeliveryDetails.value = true;
    selectedDeliveryDetails.value = id;
  const succesdelivery = successdeliveries.value.find(succesdelivery => succesdelivery.delivery_id === id);
    if (succesdelivery) {
        customer_firstname.value = succesdelivery.customer_firstname;
        customer_lastname.value = succesdelivery.customer_lastname;
        alias.value = succesdelivery.alias;
        sitio.value = succesdelivery.sitio;
        barangay.value = succesdelivery.barangay;
        city.value = succesdelivery.city;
        mobile1.value = succesdelivery.mobile1;
        transaction_date.value = succesdelivery.transaction_date;
        user_firstname.value = succesdelivery.user_firstname;
        user_lastname.value = succesdelivery.user_lastname;
        user_contact.value =succesdelivery.user_contact;
        delivered_at.value =succesdelivery.delivered_at;
        proof_image.value = `../src/assets/uploads/${succesdelivery.proof_image}`;
    }
}

const closeDeliveryDetails=()=>{
    showDeliveryDetails.value = false;
}

onMounted(fetchAllSuccessDelivery);
</script>

<template>
    <main
        :class="role === 'Delivery Boy' ? 'lg:w-[1300px] lg:h-screen xl:h-[700px] h-[680px] overflow-y-auto' : 'lg:w-[1200px] xl:w-[1310px] h-screen overflow-y-auto'">
        <div class="flex fixed top z-10">
            <headerbar class="w-[220px] border-b " />
            <headerComponent />
        </div>
        <div class="flex justify-center">
            <section class="lg:w-[95%] xl:w-[95%] w-[90%] border rounded-md mt-[88px]  lg:h-[622px] xl:h-[622px] h-[643px]  shadow-md">
                <div class="flex mx-3 ">
                    <div class=" mt-2 ">
                        <RouterLink to="/delivery" class="flex">
                            <img class="w-[25px] h-7 mt-2  mr-2" src="../assets/deliveryicon.png" alt="">
                            <span class="mt-3">DELIVERY STATUS</span>
                        </RouterLink>
                    </div>
                    <div class="mt-2 ml-7">
    <RouterLink 
        v-if="role === 'Admin'" 
        to="/successfuldelivery" 
        class="flex"
    >
        <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/succesfuldelivery.png" alt="">
        <span class="mt-3 font-bold">SUCCESSFUL DELIVERY</span>
    </RouterLink>
    <div class="relative top-5">
        <div class="border-b-2 border-black"></div>
    </div>
</div>

                </div>
                <div>
                    <div class="mt-5 mx-3 mb-5">
                        <div class="border-b  w-full"></div>
                    </div>
                </div>

                <!-- Start of Search Input and Button -->
                <div class="xl:flex lg:flex  px-3 pb-4 pt-1">
                    <div class="flex rounded-md  shadow-md border overflow-hidden     font-[sans-serif]">
                        <input type="search" v-model="searchQuery" @input="fetchAllSuccessDelivery"
                            placeholder="Search ..."
                            class="outline-none  w-full  bg-white text-gray-600 text-sm    px-2 py-2    " />
                        <button @click="search" type='button' class="flex  items-center justify-center border-l px-5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="16px"
                                class="fill-gray">
                                <path
                                    d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
                <!-- End of Search Input and Button -->


                <!--Start of Table -->
                <section>
                    <div class="w-full  h-[270px]">
                        <div class="font-[sans-serif] overflow-x-auto border  h-[430px]">
                            <table class=" w-full bg-[#4E95C9]">
                                <thead class="whitespace-nowrap">
                                    <tr>
                                        <th class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            #
                                        </th>
                                        <th
                                            class="px-[100px] text-left text-xs font-semibold  uppercase tracking-wider">
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
                                            class="px-[100px] text-left text-xs font-semibold  uppercase tracking-wider">
                                            <div class="flex justify-center items-center">
                                                ITEM
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
                                            class="px-[15px] py-3 text-left text-xs font-semibold  uppercase tracking-wider">
                                            <div class="flex justify-center  items-center ml-7">
                                                SERVICE
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

                                                <div class="flex flex-col text-center">
                                                    <span>CREDIT</span>
                                                    <span>BALANCE</span>
                                                </div>
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
                                                QTY
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
                                                FREE
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

                                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">
                                                <div class="flex flex-col text-center">
                                                    <span>DATE</span>
                                                    <span>ORDER</span>
                                                </div>
                                                <svg class="ml-2" width="21" height="20" viewBox="0 0 21 20" fill="none"
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
                                                STATUS
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
                                                ACTION
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
                                <tbody class="bg-white  whitespace-nowrap">
                                    <tr class="border-b border-gray-300" v-if="successdeliveries.length > 0"
                                        v-for="(successdelivery, index) in successdeliveries"
                                        :key="successdelivery.delivery_id">
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ (currentPage - 1) * perPage + (index + 1) }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            <div class="flex">
                                                <div class=" h-4 w-6">
                                                    <img class="h-full" src="../assets/customerIcon3.png" alt="">
                                                </div>
                                                <div class="text-[15px] font-bold">{{ successdelivery.customer_firstname
                                                    }} {{
                                                        successdelivery.customer_lastname }}</div>
                                            </div>
                                            <div class="flex">
                                                <div class="h-5 w-6">
                                                    <img class="h-full" src="../assets/aliasinfoIcon2.png" alt="">
                                                </div>
                                                <div>{{ successdelivery.alias }}</div>
                                            </div>
                                            <div class="flex">
                                                <div class=" h-5 w-[25px]   ">
                                                    <img class="h-full pr-1 " src="../assets/addressinfoIcon.png"
                                                        alt="">
                                                </div>
                                                <div class="text-center">{{ successdelivery.sitio }},
                                                    {{ successdelivery.barangay }}
                                                </div>
                                            </div>
                                        </td>

                                        <td class=" w-2 py-3 text-sm  text-gray-800">
                                            <table class=" font-[sans-serif]  bg-[#4E95C9]">
                                                <thead class="whitespace-nowrap">

                                                </thead>
                                                <tbody class="bg-white whitespace-nowrap">
                                                    <tr v-for="(item, index) in successdelivery.items"
                                                        :key="item.item_id" class=" border-gray-300">
                                                        <td class="flex items-center  px-1 py-1 w-full">
                                                            <div class="mx-6"></div>
                                                            <div class="h-8 w-8 mr-1 rounded-full overflow-hidden">
                                                                <img :src="`../src/assets/uploads/${item.image_item}`"
                                                                    class="h-full w-full object-cover" alt="" />
                                                            </div>
                                                            <div class="text-[0.7rem] text-gray-800 ">
                                                                <span class="mt-2 block">{{ item.title }}</span>
                                                            </div>
                                                        </td>

                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center  text-sm text-gray-800">
                                            <span class="bg-blue-400 rounded-full px-5 p-2">
                                                {{ successdelivery.selectedService }}
                                            </span>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center  text-sm text-gray-800">
                                            {{ successdelivery.unpaid }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                            <table class="font-[sans-serif] w-full">
                                                <tbody class="bg-white whitespace-nowrap">
                                                    <!-- Loop through transaction items -->
                                                    <tr v-for="(item, index) in successdelivery.items"
                                                        :key="item.item_id" class="border-b border-gray-300">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ item.quantity }}
                                                        </td>
                                                    </tr>
                                                    <!-- Totals Row -->
                                                    <tr v-if="successdelivery.items" class="bg-gray-100 font-semibold">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ successdelivery.totalQuantity }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                            <table class="font-[sans-serif] w-full">
                                                <tbody class="bg-white whitespace-nowrap">
                                                    <!-- Loop through transaction items -->
                                                    <tr v-for="(item, index) in successdelivery.items"
                                                        :key="item.item_id" class="border-b border-gray-300">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ item.free }}
                                                        </td>
                                                    </tr>
                                                    <!-- Totals Row -->
                                                    <tr v-if="successdelivery.items" class="bg-gray-100 font-semibold">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ successdelivery.totalFree || 0 }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                            <table class="font-[sans-serif] w-full">
                                                <tbody class="bg-white whitespace-nowrap">
                                                    <!-- Loop through transaction items -->
                                                    <tr v-for="(item, index) in successdelivery.items"
                                                        :key="item.item_id" class="border-b border-gray-300">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ item.total }}
                                                        </td>
                                                    </tr>
                                                    <!-- Totals Row -->
                                                    <tr v-if="successdelivery.items" class="bg-gray-100 font-semibold">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ successdelivery.totalDue }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ format(new Date(successdelivery.transaction_date), 'MMMM dd, yyyy') }}
                                        </td>

                                        <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                            <span class="bg-[#4E95C9] rounded-full px-5 p-2">
                                                {{ successdelivery.orderStatus }}
                                            </span>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm  text-gray-800">
                                            <span @click="openDeliveryDetails(successdelivery.delivery_id)"
                                                class="text-blue-400 text-[17px] cursor-pointer text-center block hover:underline hover:text-blue-400">
                                                View
                                            </span>

                                        </td>
                                    </tr>
                                    <!-- Display message if no successfull delivery are found -->
                                    <tr v-else>
                                        <td colspan="11" class="py-4 text-center text-gray-500 text-xl font-semibold">
                                            No successfull deliveries available.
                                        </td>
                                    </tr>
                                </tbody>

                            </table>
                        </div>
                         <!-- Pagination Controls -->
                         <div class="flex justify-center py-2">
                            <!-- Previous Page Button -->
                            <svg @click="goToPreviousPage" class="bg-gray-200 border-l rounded-l-full " width="40"
                                height="30" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M11.707 7.05451C11.8945 7.24203 11.9998 7.49634 11.9998 7.76151C11.9998 8.02667 11.8945 8.28098 11.707 8.4685L7.414 12.7615L11.707 17.0545C11.8892 17.2431 11.99 17.4957 11.9877 17.7579C11.9854 18.0201 11.8802 18.2709 11.6948 18.4563C11.5094 18.6417 11.2586 18.7469 10.9964 18.7492C10.7342 18.7515 10.4816 18.6507 10.293 18.4685L5.293 13.4685C5.10553 13.281 5.00021 13.0267 5.00021 12.7615C5.00021 12.4963 5.10553 12.242 5.293 12.0545L10.293 7.05451C10.4805 6.86703 10.7348 6.76172 11 6.76172C11.2652 6.76172 11.5195 6.86703 11.707 7.05451ZM17.707 7.05451C17.8945 7.24203 17.9998 7.49634 17.9998 7.76151C17.9998 8.02667 17.8945 8.28098 17.707 8.4685L13.414 12.7615L17.707 17.0545C17.8892 17.2431 17.99 17.4957 17.9877 17.7579C17.9854 18.0201 17.8802 18.2709 17.6948 18.4563C17.5094 18.6417 17.2586 18.7469 16.9964 18.7492C16.7342 18.7515 16.4816 18.6507 16.293 18.4685L11.293 13.4685C11.1055 13.281 11.0002 13.0267 11.0002 12.7615C11.0002 12.4963 11.1055 12.242 11.293 12.0545L16.293 7.05451C16.4805 6.86703 16.7348 6.76172 17 6.76172C17.2652 6.76172 17.5195 6.86703 17.707 7.05451Z"
                                    fill="#555555" />
                            </svg>

                            <!-- Current Page -->
                            <span class="bg-[#4E95C9] px-3 pt-1 hover:text-white ">
                                {{ currentPage }}
                            </span>

                            <!-- Next Page Button -->
                            <svg @click="goToNextPage" class="bg-gray-200 border-r rounded-r-full" width="40"
                                height="30" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M13.2024 18.473C13.0179 18.2825 12.9166 18.0265 12.9208 17.7614C12.9251 17.4963 13.0344 17.2437 13.2248 17.0591L17.5854 12.8348L13.361 8.47422C13.1818 8.28275 13.0851 8.02858 13.0915 7.76645C13.0979 7.50432 13.2071 7.25521 13.3954 7.07277C13.5837 6.89032 13.8362 6.78914 14.0984 6.79102C14.3606 6.7929 14.6115 6.89769 14.7972 7.08282L19.7173 12.1615C19.9018 12.352 20.003 12.6079 19.9988 12.873C19.9946 13.1382 19.8853 13.3908 19.6949 13.5753L14.6162 18.4954C14.4257 18.6799 14.1698 18.7811 13.9047 18.7769C13.6395 18.7727 13.3869 18.6634 13.2024 18.473ZM7.20314 18.3778C7.01867 18.1873 6.9174 17.9314 6.9216 17.6662C6.92581 17.4011 7.03514 17.1485 7.22557 16.964L11.5861 12.7396L7.36173 8.37906C7.18259 8.1876 7.08581 7.93343 7.09225 7.6713C7.09868 7.40917 7.20782 7.16006 7.39614 6.97761C7.58447 6.79517 7.83692 6.69399 8.09912 6.69587C8.36132 6.69775 8.61229 6.80254 8.79798 6.98766L13.7181 12.0663C13.9025 12.2568 14.0038 12.5128 13.9996 12.7779C13.9954 13.043 13.8861 13.2956 13.6956 13.4802L8.61696 18.4002C8.42649 18.5847 8.17054 18.686 7.90541 18.6818C7.64028 18.6776 7.38767 18.5682 7.20314 18.3778Z"
                                    fill="#555555" />
                            </svg>
                        </div>
                    </div>
                </section>



            </section>
        </div>


 <!-- Start Of Proof Modal -->
 <section v-if="showDeliveryDetails" @click.self="closeDeliveryDetails"
            class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-10 ">
            <div class="bg-white lg:w-[50%] xl:w-[50%]  w-full relative border py-2  rounded-lg">
                <div class="flex pb-3 border-b mx-3 border-gray-300">
                    <h3 class="text-gray-800 mt-1  font-bold  flex-1">DELIVERY DETAILS</h3>
                    <svg @click="closeDeliveryDetails" xmlns="http://www.w3.org/2000/svg"
                        class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>
                </div>
                <section  class="mx-3 mt-3">
                 <div class="flex justify-center">
                    <div class="w-full">
                     <h2 class="uppercase font-semibold lg:text-[15px] xl:text-[15px] text-[13px]">Customer Details:</h2>
                     <h2 class="font-semibold lg:text-[15px] xl:text-[15px] text-[12px] uppercase" >{{customer_firstname}} {{customer_lastname}}</h2>
                     <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ alias }}</div>
                     <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ sitio }}, {{ barangay }}, {{ city }}</div>
                     <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ mobile1 }}</div>
                     <h2 class="uppercase font-semibold lg:text-[15px] xl:text-[15px] text-[13px] mt-2">Time & Date Ordered:</h2>
                     <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ format(new Date(transaction_date), 'MMMM dd, yyyy hh:mm:ss a') }}

                    </div>


                    </div>
                    <div class="w-full text-center">
                        <h2 class="uppercase font-semibold lg:text-[15px] xl:text-[15px] text-[13px]">Delivered By:</h2>
                        <h2 class="font-semibold lg:text-[15px] xl:text-[15px] text-[12px] uppercase" >{{user_firstname}} {{user_lastname}}</h2>
                        <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ user_contact }}</div>
                    
                    <h2 class="uppercase font-semibold lg:text-[15px] xl:text-[15px] text-[13px]  lg:mt-[55px] xl:mt-[55px] mt-[62px]">Time & Date Delivered:</h2>
                     <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ format(new Date(delivered_at), 'MMMM dd, yyyy hh:mm:ss a') }}</div>
                    </div>

                 </div>
                 <h2 class="uppercase font-semibold text-[15px] mt-2">Proof Of Delivery:</h2>
                 <div class=" w-full">
                     <!-- Start of Image and Title -->
                <div class="mx-3 mt-3 ">
                    <div class="flex justify-center ">
                        <div class="bg-white lg:w-[50%] xl:w-[50%] w-[60%]    h-[150px]  items-center justify-center ">
                            <img :src="proof_image" class="lg:h-full xl:h-full h-[100%] lg:w-full xl:w-full w-full   "
                                alt="">
                        </div>
                    </div>
                </div>
                <!-- End of Image and Title -->
                       

                     
                 </div>
                </section>
            </div>
        </section>
        <!-- End Of Proof Modal -->




        <RouterView />
        <footerComponent class="mt-3" />

    </main>
</template>