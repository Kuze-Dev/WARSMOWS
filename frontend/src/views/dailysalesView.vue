<script setup>
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import dashboardComponent from '../components/dashboardComponent.vue';
import axios from '../../axios';
import { format } from 'date-fns'; // Import date-fns for date formatting
import { ref, onMounted } from 'vue';

const dailysales = ref([])

const fetchAllDailySales = async () => {
    try {
        const response = await axios.get('/dailySales', {
            params: {
                page: currentPage.value,
                limit: perPage.value,
            },
        });
        dailysales.value = response.data.Results.map(dailysale => {
            return {
                ...dailysale,
                items: JSON.parse(`[${dailysale.items}]`)
            };
        });
        console.log('Daily Sales', dailysales.value);



        totalDeliveries.value = response.data.TotalDeliveries;
        currentPage.value = response.data.currentPage;
        perPage.value = response.data.perPage;


        // Handle empty results when not on the first page
        if (dailysales.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
            fetchAllDailySales(); // Fetch updated page data
        }
    } catch (err) {
        console.error('Error Fetching Daily Sales:', err);
    }
};

//Pages
const currentPage = ref(0);
const perPage = ref(0); // Number of customers per page
const totalDeliveries = ref(0); // To track total customers for pagination

const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        fetchAllDailySales()
    }
};

const goToNextPage = () => {
    const totalPages = Math.ceil(totalDeliveries.value / perPage.value); // Calculate total pages
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchAllDailySales();
    }
};


onMounted(fetchAllDailySales);
</script>

<template>
    <main class="lg:w-[1200px] xl:w-[1310px] w-full h-screen  overflow-y-auto">
        <headerComponent />
        <dashboardComponent />

        <!-- routes -->
        <div class="flex justify-center">

            <section class="lg:w-[95%] xl:w-[95%] w-[90%] border mt-2 lg:h-[674px] xl:h-[674px] h-[828px] rounded-md shadow-md">
                <div class="lg:flex mx-6 my-2 space-y-4 lg:space-y-0 lg:space-x-7 ">
                    <!-- Added space-y-4 for small screens and space-x-7 for larger screens -->

                    <div class="">
                        <RouterLink to="/" class="flex">
                            <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/salesanalytics.png" alt="">
                            <span class="mt-3 ">SALES ANALYTICS</span>
                        </RouterLink>
                    </div>

                    <div class="mt-2">
                        <RouterLink to="/salessummary" class="flex">
                            <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/salessummary.png" alt="">
                            <span class="mt-3">SALES SUMMARY</span>
                        </RouterLink>
                    </div>

                    <div class="mt-2">
                        <RouterLink to="/dailysales" class="flex">
                            <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/dailysales.png" alt="">
                            <span class="mt-3 font-bold">DAILY SALES</span>
                        </RouterLink>
                        <div class="relative top-5">
                            <div class="border-b-2 border-black"></div>
                        </div>
                    </div>

                    <div class="mt-2">
                        <RouterLink to="/newcustomer" class="flex">
                            <img class="w-[28px] h-5 mt-4 mr-2" src="../assets/newcustomer.png" alt="">
                            <span class="mt-3">NEW CUSTOMER</span>
                        </RouterLink>
                    </div>
                </div>

                <div>
                    <div class="mt-5 mx-3 mb-5">
                        <div class="border-b w-full"></div>
                    </div>
                </div>


                <!--Start of Table -->
                <section class="mt-2">
                    <div class="w-full  h-[270px]">
                        <div class="font-[sans-serif] overflow-x-auto border  lg:h-[540px] xl:h-[540px] h-[540px] ">
                            <table class=" w-full bg-[#4E95C9]">
                                <thead class="whitespace-nowrap">
                                    <tr>
                                        <th class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            #
                                        </th>
                                        <th
                                            class="px-[100px] text-left text-xs font-semibold  uppercase tracking-wider">
                                            <div class="flex justify-center items-center">
                                                DATE
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
                                                PICK UP
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
                                                DELIVERED
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
                                                <div class="mx-5"></div>

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
                                                <div class="mx-5"></div>

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
                                                <div class="mx-5"></div>

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
                                                <div class="mx-5"></div>
                                                UNPAID
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
                                                <div class="mx-5"></div>

                                                INCHARGE
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
                                    <tr class="border-b border-gray-300" v-if="dailysales.length > 0"
                                        v-for="(dailysale, index) in dailysales" :key="dailysale.transaction_id">
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ (currentPage - 1) * perPage + (index + 1) }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm uppercase text-gray-800">
                                            {{ format(new Date(dailysale.transaction_date), 'MMMM dd, yyyy') }}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ dailysale.totalPickUp }}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ dailysale.totalDelivered }}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ dailysale.totalQuantity }}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ dailysale.totalFree }}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ dailysale.totalTotalDue }}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ dailysale.totalUnpaid }}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ dailysale.transaction_user_firstname }} {{
                                            dailysale.transaction_user_lastname }}

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
                    </div>
                </section>
            </section>
        </div>

        <footerComponent class="mt-3" />
    </main>
</template>