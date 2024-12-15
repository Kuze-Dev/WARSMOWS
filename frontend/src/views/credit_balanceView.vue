<script setup>
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import { RouterLink, RouterView } from 'vue-router';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useToast } from "vue-toastification";
import axios from '../../axios';
import { format } from 'date-fns'; // Import date-fns for date formatting

const toast = useToast();


const isDropdownOpen = ref(false);
const isPayModalOpen = ref(false);
const isNoteModalOpen = ref(false);
const selectedCreditedCustomerId = ref(false);
const toggleDropdown = (creditedId) => {
    if (isDropdownOpen.value && selectedCreditedCustomerId === creditedId) {
        closeDropdown();
    } else {
        isDropdownOpen.value = true;
        selectedCreditedCustomerId.value = creditedId;
        // alert(selectedCreditedCustomerId.value);
        document.addEventListener("mousedown", handleClickOutside);


    }
};

const firstname = ref('');
const lastname = ref('');
const unpaid = ref('');
const payment_date = ref('');



const openModal = (type, creditedId) => {
    if (type === 'pay') {
        // alert(creditedId);
        isPayModalOpen.value = true;
        const customercredit = customercreditbalance.value.find(
            customercredit => customercredit.credit_balance_id === creditedId
        );
        if (customercredit) {
            firstname.value = customercredit.firstname;
            lastname.value = customercredit.lastname;
            unpaid.value = customercredit.unpaid;
            payment_date.value = format(new Date(), 'MMMM dd, yyyy');

        }

    } else if (type === 'note') {
        isNoteModalOpen.value = true;
        const customercredit = customercreditbalance.value.find(
            customercredit => customercredit.credit_balance_id === creditedId
        );
        if (customercredit) {
            firstname.value = customercredit.firstname;
            lastname.value = customercredit.lastname;
         

        }
    }
    //   isDropdownOpen.value = false; // Close dropdown after selection
};

const closeDropdown = () => {
    isDropdownOpen.value = false;
    document.removeEventListener("mousedown", handleClickOutside);

}

const closeModal = () => {
    isPayModalOpen.value = false;
    isNoteModalOpen.value = false;
};


// Handle clicks outside the modal
const handleClickOutside = (event) => {
    const modal = document.querySelector(".modal-content"); // Class of your modal content div
    if (modal && !modal.contains(event.target)) {
        closeDropdown();
    }
};


// Filter values
const searchQuery = ref('');
const searchQueryBarangay = ref(''); // New barangay search query
const dateFrom = ref('');
const dateTo = ref('');


    const customercreditbalance = ref([]);
    const fetchAllCreditBalance = async () => {
        try {
            const response = await axios.get('/getcreditbalance',{
                params: {
                    page: currentPage.value,
                    limit: perPage.value,
                    search: searchQuery.value,
                    barangay: searchQueryBarangay.value,
                    date_from: dateFrom.value, // Include dateFrom in request
                    date_to: dateTo.value, 
                    totalResults:totalResults.value,   // Include dateTo in request // Pass the barangay filter
                },
            });
            customercreditbalance.value = response.data.results.map(customercredit => {
                return {
                    ...customercredit,
                    items: JSON.parse(`[${customercredit.items}]`)
                };
            });
            console.log('All Customer Credit Balance:', customercreditbalance.value);
            totalResults.value = response.data.totalResults;
            currentPage.value = response.data.currentPage;
            perPage.value = response.data.perPage;
            // Handle empty results when not on the first page
            if (customercreditbalance.value.length === 0 && currentPage.value > 1) {
                currentPage.value--;
                fetchAllCreditBalance(); // Fetch updated page data
            }

        } catch (err) {
            console.error('Error All Customers Credit Balance:', err);
        }
    };

//Pages
const currentPage = ref(0);
const perPage = ref(0); // Number of customers per page
const totalResults = ref(0); // To track total customers for pagination

const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        fetchAllCreditBalance();
    }
};

const goToNextPage = () => {
    const totalPages = Math.ceil(totalResults.value / perPage.value); // Calculate total pages
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchAllCreditBalance(); // Fetch users for the updated page
    }
};


// Computed properties
const updatedTotalUnpaid = computed(() => {
    const unpaidAmount = parseFloat(unpaid.value) || 0;
    const paidAmount = parseFloat(cash_paid.value) || 0;

    // Prevent negative calculations
    if (paidAmount < 0) return unpaidAmount.toFixed(2);

    // Subtract paid amount from unpaid balance (clamp to minimum of 0)
    return Math.max(unpaidAmount - paidAmount, 0).toFixed(2);
});

const change = computed(() => {
    const unpaidAmount = parseFloat(unpaid.value) || 0;
    const paidAmount = parseFloat(cash_paid.value) || 0;

    // Prevent negative calculations
    if (paidAmount < 0) return '0.00';

    // Calculate change only if paid amount exceeds unpaid amount
    return paidAmount > unpaidAmount ? (paidAmount - unpaidAmount).toFixed(2) : '0.00';
});


const cash_paid = ref('');


const submitPayment = async () => {
    try {
        const paymentAmount = parseFloat(cash_paid.value); // Ensure to get the raw value
        const changeAmount = parseFloat(change.value); // Ensure to get the raw value

        // Get current date and format it as MM/DD/YYYY
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}`;
        payment_date.value = formattedDate;

        // Prepare the payload, passing only the raw values
        const payload = {
            cash_paid: paymentAmount,
            amount_change: changeAmount, // Include the change value
            payment_date: formattedDate, // Use the formatted date directly
        };

        // Send PUT request to the backend
        const response = await axios.put(`/confirmCreditPayment/${selectedCreditedCustomerId.value}`, payload);

        if (response.data.success) {
            toast.success(response.data.msg);

            // Reset fields
            cash_paid.value = '';
            fetchAllCreditBalance();
            closeModal();
        } else {
            toast.error(response.data.errors[0].msg);
        }
    } catch (error) {
        console.error('Error during payment submission:', error);
        alert('An unexpected error occurred. Please try again.');
    }
};

const paymentnoteData =ref({
    payment_note:''
})
const submitNote = async () => {
    try {
      

       

        const response = await axios.put(`/paymentnote/${selectedCreditedCustomerId.value}`, paymentnoteData.value);

        if (response.data.success) {
            toast.success(response.data.msg);

            fetchAllCreditBalance();
            closeModal();
        } else {
            toast.error(response.data.errors[0].msg);
        }
    } catch (error) {
        console.error('Error during payment note submission:', error);
        alert('An unexpected error occurred. Please try again.');
    }
};





// Clean up event listener when component unmounts
onUnmounted(() => {
    document.removeEventListener("mousedown", handleClickOutside);
});
onMounted(fetchAllCreditBalance);

</script>


<template>
    <main class="lg:w-[1200px] xl:w-[1310px] w-full h-screen  overflow-y-auto">
        <headerComponent />
        <div class="flex justify-center">
            <section class="lg:w-[95%] xl:w-[95%] w-[90%] border rounded-md mt-7 lg:h-[669px] xl:h-[670px] h-800 shadow-md">
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
                            <span class="mt-3 font-bold">CREDIT/BALANCE</span>
                        </RouterLink>
                        <div class="relative top-5">
                            <div class="border-b-2 border-black"></div>
                        </div>
                    </div>

                    <div class="">
                        <RouterLink to="/topcustomer" class="flex">
                            <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/topcustomer.png" alt="">
                            <span class="mt-3">TOP CUSTOMER</span>
                        </RouterLink>
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
                    <div class="flex flex-col ">
                        <label for="search-bar" class="text-sm text-gray-700 mb-1 font-medium">SEARCH</label>
                        <div
                            class="flex rounded-md shadow-md bg-white border border-black overflow-hidden font-[sans-serif]">
                            <input id="search-bar" type="search" placeholder="Search ..." v-model="searchQuery" @input="fetchAllCreditBalance"
                                class="outline-none w-full bg-white text-gray-600 text-sm px-2 py-2" />
                            <button type="button" class="flex items-center justify-center border-l border-black px-5">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="16px"
                                    class="fill-gray">
                                    <path
                                        d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Input Boxes to the Right -->
                    <div class="lg:flex xl:flex lg:space-x-5 xl:space-x-5 lg:ml-4 xl:ml-4  px-2 py-2">
                        <!-- Input 1 -->
                        <div class="flex flex-col">
                            <label for="input-1" class="text-sm font-medium text-gray-700 mb-1">BARANGAY</label>
                            <input id="input-1" type="text" placeholder="All Barangay" v-model="searchQueryBarangay"  @input="fetchAllCreditBalance"
                                class="outline-none  w-full bg-white text-gray-600 text-sm border border-black px-2 py-[9.5px] rounded-md" />
                        </div>

                        <!-- Input 2 -->
                        <div class="flex flex-col">
                            <label for="input-2" class="text-sm text-gray-700 mb-1 font-medium">DATE FROM</label>
                            <input id="input-2" type="date" v-model="dateFrom" placeholder="Input 2"
                                class="outline-none w-full bg-white text-gray-600 text-sm border border-black px-2 py-2 rounded-md" />
                        </div>

                        <!-- Input 3 -->
                        <div class="flex flex-col">
                            <label for="input-3" class="text-sm text-gray-700 mb-1 font-medium">DATE TO</label>
                            <input id="input-3" type="date" v-model="dateTo" placeholder="Input 3"
                                class="outline-none w-full bg-white text-gray-600 text-sm border border-black px-2 py-2 rounded-md" />
                        </div>

                        <!-- Submit Button -->
                        <div class="flex flex-col">
                            <button id="filter-record-button" type="button" @click="fetchAllCreditBalance"
                                class="flex items-center justify-center lg:mt-6 xl:mt-6 mt-3 outline-none lg:w-[180px] w-full bg-[#4E95C9] text-black text-sm border border-black px-2 py-2 rounded-md hover:bg-blue-600">
                                <svg width="20" height="19" viewBox="0 0 20 19" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M0.570068 0.394531H19.4301L12.5001 10.2115V18.3945H7.50007V10.2115L0.570068 0.394531ZM4.43007 2.39453L9.50007 9.57753V16.3945H10.5001V9.57753L15.5701 2.39453H4.43007Z"
                                        fill="#555555" />
                                </svg>

                                FILTER RECORD
                            </button>
                        </div>

                    </div>
                </div>
                <!-- End of Search Input and Button -->



                <!--Start of Table -->
                <section>
                    <div class="w-full  h-[270px]">
                        <div class="font-[sans-serif] overflow-x-auto border pb-[40px] h-[430px]">
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
                                            class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">

                                            <div class="flex justify-center items-center">
                                                <div class="mx-3"></div>

                                                <span>TOTAL</span>
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
                                                NOTE
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
                                                <div class="flex justify-center  items-center ml-7">
                                                    DATE
                                                    <svg class="ml-2" width="21" height="20" viewBox="0 0 21 20"
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
                                            class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">
                                                ACTION

                                            </div>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody class="bg-white whitespace-nowrap">
                                    <tr class="border-b border-gray-300" v-if="customercreditbalance.length>0"
                                        v-for="(customercredit, index) in customercreditbalance"
                                        :key="customercredit.credit_balance_id">
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ (currentPage - 1) * perPage + (index + 1) }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm  text-gray-800">
                                            <div class="text-[15px] font-bold">{{ customercredit.firstname }} {{
                                                customercredit.lastname }}</div>
                                            <div>{{ customercredit.sitio }}, {{ customercredit.barangay }},{{
                                                customercredit.city }}</div>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center  text-sm text-gray-800">
                                            <span
                                                :class="customercredit.selectedService === 'Delivery' ? 'bg-blue-400  rounded-full px-5 p-2' : 'bg-sky-500  rounded-full px-5 p-2'">
                                                {{ customercredit.selectedService }}
                                            </span>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                            {{ customercredit.totalQuantity }}

</td>
<td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
    {{ customercredit.totalDue }}

</td>
                                        <td class="px-4 w-2 py-4  text-sm text-gray-800">
                                            {{ customercredit.unpaid }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center  text-sm text-gray-800">
                                            {{ customercredit.notes }}
                                        </td>

                                        <td class="px-4 w-2 py-4 text-center  text-sm text-gray-800">
                                            {{ format(new Date(customercredit.latest_transaction_date), 'MMMM dd, yyyy')
                                            }} </td>

                                        <td class="px-4 py-4 text-sm text-gray-800">
                                            <svg class="mx-auto cursor-pointer"
                                                @click="toggleDropdown(customercredit.credit_balance_id)" width="24"
                                                height="40" viewBox="0 0 24 25" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M10.325 5.07921C10.751 3.32321 13.249 3.32321 13.675 5.07921C13.7389 5.34301 13.8642 5.58799 14.0407 5.79421C14.2172 6.00043 14.4399 6.16206 14.6907 6.26595C14.9414 6.36984 15.2132 6.41306 15.4838 6.39208C15.7544 6.37109 16.0162 6.28651 16.248 6.14521C17.791 5.20521 19.558 6.97121 18.618 8.51521C18.4769 8.74686 18.3924 9.00854 18.3715 9.27898C18.3506 9.54942 18.3938 9.82098 18.4975 10.0716C18.6013 10.3222 18.7627 10.5448 18.9687 10.7213C19.1747 10.8977 19.4194 11.0231 19.683 11.0872C21.439 11.5132 21.439 14.0112 19.683 14.4372C19.4192 14.5011 19.1742 14.6264 18.968 14.8029C18.7618 14.9794 18.6001 15.2021 18.4963 15.4529C18.3924 15.7036 18.3491 15.9754 18.3701 16.246C18.3911 16.5166 18.4757 16.7785 18.617 17.0102C19.557 18.5532 17.791 20.3202 16.247 19.3802C16.0153 19.2391 15.7537 19.1547 15.4832 19.1337C15.2128 19.1128 14.9412 19.156 14.6906 19.2597C14.44 19.3635 14.2174 19.5249 14.0409 19.7309C13.8645 19.9369 13.7391 20.1816 13.675 20.4452C13.249 22.2012 10.751 22.2012 10.325 20.4452C10.2611 20.1814 10.1358 19.9364 9.95929 19.7302C9.7828 19.524 9.56011 19.3624 9.30935 19.2585C9.05859 19.1546 8.78683 19.1114 8.51621 19.1323C8.24559 19.1533 7.98375 19.2379 7.752 19.3792C6.209 20.3192 4.442 18.5532 5.382 17.0092C5.5231 16.7776 5.60755 16.5159 5.62848 16.2454C5.64942 15.975 5.60624 15.7034 5.50247 15.4528C5.3987 15.2022 5.23726 14.9796 5.03127 14.8032C4.82529 14.6267 4.58056 14.5013 4.317 14.4372C2.561 14.0112 2.561 11.5132 4.317 11.0872C4.5808 11.0233 4.82578 10.898 5.032 10.7215C5.23822 10.545 5.39985 10.3223 5.50375 10.0716C5.60764 9.82079 5.65085 9.54904 5.62987 9.27842C5.60889 9.0078 5.5243 8.74596 5.383 8.51421C4.443 6.97121 6.209 5.20421 7.753 6.14421C8.753 6.75221 10.049 6.21421 10.325 5.07921Z"
                                                    stroke="black" stroke-width="2" stroke-linecap="round"
                                                    stroke-linejoin="round" />
                                                <path
                                                    d="M9 12.7622C9 13.5579 9.31607 14.3209 9.87868 14.8835C10.4413 15.4461 11.2044 15.7622 12 15.7622C12.7956 15.7622 13.5587 15.4461 14.1213 14.8835C14.6839 14.3209 15 13.5579 15 12.7622C15 11.9666 14.6839 11.2035 14.1213 10.6409C13.5587 10.0783 12.7956 9.76221 12 9.76221C11.2044 9.76221 10.4413 10.0783 9.87868 10.6409C9.31607 11.2035 9 11.9666 9 12.7622Z"
                                                    stroke="black" stroke-width="2" stroke-linecap="round"
                                                    stroke-linejoin="round" />
                                            </svg>

                                            <!-- Dropdown Menu -->
                                            <section
                                                :class="isDropdownOpen && customercredit.credit_balance_id === selectedCreditedCustomerId ? 'modal-content relative mx-2  font-[sans-serif] right-[75px]' : 'hidden'">
                                                <div v-for="(customercredit, index) in customercreditbalance"
                                                    :key="customercredit.credit_balance_id"
                                                    v-show="customercredit.credit_balance_id === selectedCreditedCustomerId"
                                                    class=" bg-[#4E95C9] absolute   w-24 border shadow-lg rounded">

                                                    <div class="flex">

                                                        <img class="w-[20px] h-6 mt-1 ml-2 " src="..//assets/pay.png"
                                                            alt="pay">
                                                        <button
                                                            class="font-bold block px-2 py-2 text-left w-full hover:text-white"
                                                            @click="openModal('pay', customercredit.credit_balance_id)">Pay</button>
                                                    </div>
                                                    <!-- Border bottom -->
                                                    <div class="border-b w-full"></div>

                                                    <div class="flex">
                                                        <img class="w-[20px] h-6 mt-1 ml-2 " src="..//assets/note.png"
                                                            alt="pay">
                                                        <button
                                                            class="font-bold block px-2 py-2 text-left w-full hover:text-white"
                                                            @click="openModal('note',customercredit.credit_balance_id)">Note</button>
                                                    </div>
                                                </div>
                                            </section>

                                            <!-- Pay Modal -->
                                            <form novalidate @submit.prevent="submitPayment" v-if="isPayModalOpen"
                                                @click.self="closeModal"
                                                class="fixed  before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.2)] overflow-auto  font-[sans-serif] z-20 ">
                                                <div class="bg-white lg:w-[40%] w-full relative border py-2 rounded-lg">
                                                    <div class="flex pb-3 border-b border-gray-500">
                                                        <h3 class="text-gray-800 mt-1 font-bold text-center flex-1">
                                                            CONFIRM CREDIT PAYMENT</h3>
                                                        <svg @click="closeModal" xmlns="http://www.w3.org/2000/svg"
                                                            class="w-3 mx-3 ml-2 cursor-pointer"
                                                            viewBox="0 0 320.591 320.591">
                                                            <path
                                                                d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z">
                                                            </path>
                                                            <path
                                                                d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z">
                                                            </path>
                                                        </svg>
                                                    </div>

                                                    <div class="m-5  border border-black">
                                                        <div class="p-2 flex">
                                                            <div class="flex">
                                                            <img class="w-[15px] h-4 mt-1 lg:mr-2 xl:mr-2 mr-1"
                                                                src="..//assets/customerIcon3.png" alt="" />
                                                            <div class="flex mr-3">
                                                                <h3 class="font-bold lg:text-[21px] xl:text-[21px] uppercase mt-1 mr-1">{{ firstname }} {{
                                                                    lastname }}</h3>
                                                            </div>
                                                        </div>
                                                            <div class="ml-auto p-1 mr-1 mt-1 bg-gray-200">
                                                                <p class="text-xs font-semibold">{{ payment_date }}</p>
                                                            </div>
                                                        </div>
                                                        <div class="flex border-b w-full"></div>

                                                        <div class="flex p-2">
                                                            <h4 class="font-bold lg:ml-28">CREDIT TOTAL:</h4>
                                                            <div class="ml-auto p-1 px-3">
                                                                <p v-if="unpaid" class="text-xs font-semibold">P {{
                                                                    unpaid }}</p>
                                                            </div>
                                                        </div>

                                                        <div class="flex border-b w-full"></div>

                                                        <div class="flex p-2">
                                                            <h4 class="font-bold lg:ml-28">CASH:</h4>
                                                            <div class="ml-auto p-1 pl-12">
                                                                <input type="number" v-model="cash_paid"
                                                                    class="w-full text-right text-xs font-semibold border border-gray-500 p-1" />
                                                            </div>
                                                        </div>

                                                        <div class="flex p-2">
                                                            <h4 class="font-bold lg:ml-28">CHANGE:</h4>
                                                            <div class="ml-auto p-1 ">
                                                                <input type="text" :value="change" disabled
                                                                    class="w-full text-right text-xs font-semibold border border-gray-500 p-1 bg-gray-200" />
                                                            </div>
                                                        </div>

                                                        <div class="flex p-2 mr-1">
                                                            <div class="lg:mx-[113px] xl:mx-[113px]  flex justify-start " >
                                                            <h4 class="font-bold ">CREDIT:</h4>
                                                        </div>
                                                            <div class=" text-right p-1 lg:w-[70%] xl:w-[38.7%] w-[42%] ml-auto  bg-[#4195C9]">
                                                                <p v-if="updatedTotalUnpaid"
                                                                    class="text-xs font-semibold">P {{
                                                                    updatedTotalUnpaid }}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="flex">
                                                        <div class="mx-8 ml-auto">
                                                            <button type="submit"
                                                                class="bg-[#82BADD] p-1 rounded font-semibold border-2 border-[#3C61E4]">
                                                                <h1 class="text-sm">SUBMIT PAYMENT</h1>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>


                                            <!-- Note Modal -->
                                            <form @submit.prevent="submitNote" v-if="isNoteModalOpen" @click.self="closeModal"
                                                class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-20 ">
                                                <div
                                                    class="bg-white lg:w-[40%] xl:w-[40%]  w-full relative border py-2  rounded-lg">
                                                    <div class="flex pb-3 border-b  border-gray-500">
                                                        <h3 class="text-gray-800 mt-1  font-bold text-center  flex-1">
                                                            ADD NOTE</h3>
                                                        <svg @click="closeModal" xmlns="http://www.w3.org/2000/svg"
                                                            class="w-3 mx-3 ml-2 cursor-pointer shrink-0  "
                                                            viewBox="0 0 320.591 320.591">
                                                            <path
                                                                d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                                                                data-original="#000000"></path>
                                                            <path
                                                                d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                                                                data-original="#000000"></path>
                                                        </svg>
                                                    </div>

                                                    <div class="m-5 border border-black">
                                                        <div class="p-2 flex">
                                                            <img class="w-[15px] h-4 mt-1 mx-2 "
                                                                src="..//assets/customerIcon3.png" alt="">

                                                                <div class="flex mr-3">
                                                                <h3 class="font-bold lg:text-[21px] xl:text-[21px] uppercase mt-1 mr-1">{{ firstname }} {{
                                                                    lastname }}</h3>
                                                            </div>


                                                        </div>
                                                        <!-- Border bottom -->
                                                        <div class=" border-b w-full"></div>

                                                        <div class="p-2 lg:ml-8 text-left">
                                                            <h4 class="font-bold text-xs">NOTE FOR THIS CUSTOMER </h4>
                                                            <div class="">
                                                                <textarea type="text" v-model="paymentnoteData.payment_note"
                                                                    class="w-full  p-2 text-sm bg-gray-100 border border-gray-400 rounded"
                                                                    placeholder="Type here...."  rows="4"> </textarea>
                                                            </div>


                                                        </div>

                                                        <div class="flex border-b w-full"></div>




                                                    </div>
                                                    <!-- Border bottom -->
                                                    <div class=" border-b border-black w-full"></div>

                                                    <div class="mt-2 flex">
                                                        <div class=" mx-8  ml-auto ">
                                                            <button type="submit"
                                                                class="bg-[#82BADD] p-1 rounded font-semibold border-2 border-[#3C61E4] ">
                                                                <h1 class="text-sm">SUBMIT NOTE</h1>
                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>
                                            </form>







                                        </td>


                                    </tr>
                                     <!-- Display message if no top customers are found -->
                                     <tr v-else>
                                        <td colspan="9" class="py-4 text-center text-gray-500 text-xl font-semibold">
                                            No credit balance available.
                                        </td>
                                    </tr>

                                </tbody>

                            </table>
                        </div>
<!-- Start of Pages -->
<div class=" flex justify-center py-2">
                            <!-- Start Of Previous Page -->
                            <svg @click="goToPreviousPage" class="bg-gray-200 border-l rounded-l-full " width="40"
                                height="30" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M11.707 7.05451C11.8945 7.24203 11.9998 7.49634 11.9998 7.76151C11.9998 8.02667 11.8945 8.28098 11.707 8.4685L7.414 12.7615L11.707 17.0545C11.8892 17.2431 11.99 17.4957 11.9877 17.7579C11.9854 18.0201 11.8802 18.2709 11.6948 18.4563C11.5094 18.6417 11.2586 18.7469 10.9964 18.7492C10.7342 18.7515 10.4816 18.6507 10.293 18.4685L5.293 13.4685C5.10553 13.281 5.00021 13.0267 5.00021 12.7615C5.00021 12.4963 5.10553 12.242 5.293 12.0545L10.293 7.05451C10.4805 6.86703 10.7348 6.76172 11 6.76172C11.2652 6.76172 11.5195 6.86703 11.707 7.05451ZM17.707 7.05451C17.8945 7.24203 17.9998 7.49634 17.9998 7.76151C17.9998 8.02667 17.8945 8.28098 17.707 8.4685L13.414 12.7615L17.707 17.0545C17.8892 17.2431 17.99 17.4957 17.9877 17.7579C17.9854 18.0201 17.8802 18.2709 17.6948 18.4563C17.5094 18.6417 17.2586 18.7469 16.9964 18.7492C16.7342 18.7515 16.4816 18.6507 16.293 18.4685L11.293 13.4685C11.1055 13.281 11.0002 13.0267 11.0002 12.7615C11.0002 12.4963 11.1055 12.242 11.293 12.0545L16.293 7.05451C16.4805 6.86703 16.7348 6.76172 17 6.76172C17.2652 6.76172 17.5195 6.86703 17.707 7.05451Z"
                                    fill="#555555" />
                            </svg>
                            <!-- End of Previous -->

                            <!-- Start of Current Page -->
                            <span class="bg-[#4E95C9] px-3 pt-1 hover:text-white ">{{ currentPage }}</span>
                            <!-- End of Current Page -->

                            <!-- Start of Next Page -->
                            <svg @click="goToNextPage" class="bg-gray-200 border-r rounded-r-full" width="40"
                                height="30" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <RouterView />
        <footerComponent class="mt-3" />
    </main>
</template>