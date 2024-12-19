<script setup>
import axios from '../../axios';
import { ref, onMounted } from 'vue';
import { format } from 'date-fns'; // Import date-fns for date formatting
import { formatDate } from '../utils/dateFormatter';

defineProps({
    transactions: {
        type: Array,
        required: true,
    },
    totalTodaysPreviousTransaction: {
        type: Number,
        required: true,
    },
    currentPage: {
        type: Number,
        required: true,
    },
    perPage: {
        type: Number,
        required: true,
    },
    goToPreviousPage: {
        type: Function,
        required: true,
    },
    goToNextPage: {
        type: Function,
        required: true,
    },
});

const calculateTotals = (transaction) => {
    let totalQuantity = 0;
    let totalFree = 0;
    let totalPrice = 0;

    for (const item of transaction.items) {
        totalQuantity += item.quantity || 0;
        totalFree += item.free || 0;
        totalPrice += item.total || 0;
    }

    return {
        totalQuantity,
        totalFree,
        totalPrice
    };
};

const firstname = ref('');
const lastname = ref('');
const alias = ref('');
const sitio = ref('');
const barangay = ref('');
const city = ref('');
const mobile1 = ref('');
const selectedService = ref('');
const orderStatus = ref('');
const transaction_date = ref('');
const orderNumber = ref('');
const totalDue = ref('');
const selectedCustomer = ref(false)
const showInvoiceModal = ref(false);

const openInvoiceModal = async (id) => {
    try {
        // Fetch all invoices (reuse fetchInvoice)
        await fetchInvoice();

        // Filter the selected invoice after fetching
        const invoice = invoices.value.find(invoice => invoice.transaction_id === id);
        if (invoice) {
            showInvoiceModal.value = true; // Show modal only if invoice exists
            selectedCustomer.value = id;

            // Populate the form fields
            firstname.value = invoice.firstname;
            lastname.value = invoice.lastname;
            alias.value = invoice.alias;
            sitio.value = invoice.sitio;
            barangay.value = invoice.barangay;
            city.value = invoice.city;
            mobile1.value = invoice.mobile1;
            selectedService.value = invoice.selectedService;
            orderStatus.value = invoice.orderStatus;
            transaction_date.value = invoice.transaction_date;
            orderNumber.value = invoice.orderNumber;
            totalDue.value = invoice.totalDue;

              // Filter items for the modal
              flattenedItems.value = invoice.items.map(item => ({
                ...item,
                invoiceTitle: invoice.title, // Add invoice-level info if needed
            }));
        } else {
            console.warn('Invoice not found for the given ID:', id);
        }
    } catch (error) {
        console.error('Error opening invoice modal:', error);
    }
};


const closeInvoiceModal = () => {
    showInvoiceModal.value = false;
}

const invoices = ref([]);
const flattenedItems = ref([]);


const fetchInvoice = async () => {
    try {
        const response = await axios.get(`/getinvoice`);
        invoices.value = response.data.results.map(invoice => {
            return {
                ...invoice,
                items: Array.isArray(invoice.items)
                    ? invoice.items // Use as-is if it's already an array
                    : typeof invoice.items === 'string' && invoice.items.trim().startsWith('[')
                    ? JSON.parse(invoice.items) // Parse if it's a valid JSON string
                    : [] // Default to an empty array if items are invalid
            };
        });
        console.log('Fetched invoices:', invoices.value);
    } catch (error) {
        console.error('Error fetching invoices:', error);
    }
};

onMounted(fetchInvoice);

</script>

<template>
    <main>
        <section class="lg:w-[95.5%] xl:w-[95%] w-[90%] border mt-12 ml-5 h-full  rounded-md shadow-md">
            <div class=" mt-2 flex justify-center">
                <img class="w-[25px] h-7 mr-2" src="../assets/todaysprevioustransaction.png" alt="">
                <h1 class=" font-semibold leading-tight">Today's Previous Transaction</h1>
            </div>
            <div class=" mx-3 mb-5 mt-2">
                <div class="w-full border-t-2 border-black"></div>
            </div>

            <div class=" border-2 border-gray-300 h-[819px] overflow-x-auto">
                <table class=" font-[sans-serif] bg-[#4E95C9] w-full">
                    <thead class="whitespace-nowrap">
                        <tr>
                            <th class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                #
                            </th>
                            <th class="px-5 py-4 text-center text-xs font-semibold  uppercase tracking-wider">
                                NAME
                            </th>
                            <th class="px-5 py-4 text-center text-xs font-semibold  uppercase tracking-wider">
                                PRODUCT
                            </th>
                            <th class="px-5 py-4 text-center text-xs font-semibold  uppercase tracking-wider">
                                SERVICES/STATUS
                            </th>
                            <th class="px-5 py-4 text-center text-xs font-semibold  uppercase tracking-wider">
                                DATE
                            </th>
                            <th class="px-5 py-4 text-center text-xs font-semibold  uppercase tracking-wider">
                                ACTION
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white  whitespace-nowrap">
                        <tr class="border-b border-gray-300" v-for="(transaction, index) in transactions"
                            :key="transaction.transaction_id">
                            <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                {{ index + 1 }}
                            </td>
                            <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                <div class="flex">
                                    <div class=" h-4 w-6">
                                        <img class="h-full" src="../assets/customerIcon3.png" alt="">
                                    </div>
                                    <div class="text-[15px] font-bold">{{ transaction.firstname }} {{
                                        transaction.lastname }}</div>
                                </div>
                                <div class="flex">
                                    <div class="h-5 w-6">
                                        <img class="h-full" src="../assets/aliasinfoIcon2.png" alt="">
                                    </div>
                                    <div>{{ transaction.alias }}</div>
                                </div>
                                <div class="flex">
                                    <div class=" h-5 w-[25px]   ">
                                        <img class="h-full pr-1 " src="../assets/addressinfoIcon.png" alt="">
                                    </div>
                                    <div class="text-center">{{ transaction.sitio }}, {{ transaction.barangay }}</div>
                                </div>
                            </td>

                            <td class=" w-2 py-3 text-sm  text-gray-800">
                                <table class=" font-[sans-serif]  bg-[#4E95C9]">
                                    <thead class="whitespace-nowrap">
                                        <tr>


                                            <th class="px-5 py-1  text-center text-xs   ">
                                                Item
                                            </th>
                                            <th class="px-5 py-1  text-center text-xs  ">
                                                Qty
                                            </th>
                                            <th class="px-5 py-1 text-center text-xs font-semibold ">
                                                Free
                                            </th>
                                            <th class="px-5 py-1 text-center text-xs font-semibold ">
                                                Price
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white whitespace-nowrap">
                                        <tr v-for="(item, index) in transaction.items" :key="item.item_id"
                                            class="border-b border-gray-300">
                                            <td class="flex items-center  px-1 py-1 w-full">
                                                <div class="h-8 w-8 mr-1 rounded-full overflow-hidden">
                                                    <img :src="`../src/assets/uploads/${item.image_item}`"
                                                        class="h-full w-full object-cover" alt="" />
                                                </div>
                                                <div class="text-[0.7rem] text-gray-800 ">
                                                    <span class="mt-2 block">{{ item.title }}</span>
                                                </div>
                                            </td>
                                            <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                                {{ item.quantity }}
                                            </td>
                                            <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                                {{ item.free }}
                                            </td>
                                            <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                                {{ item.total }}
                                            </td>
                                        </tr>
                                        <!-- Totals Row -->
                                        <tr v-if="transaction.items.length" class="bg-gray-100 font-semibold">
                                            <td class="px-4 w-2 py-4 text-sm text-gray-800">Total</td>
                                            <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                                {{ calculateTotals(transaction).totalQuantity }}
                                            </td>
                                            <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                                {{ calculateTotals(transaction).totalFree }}
                                            </td>
                                            <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                                {{ calculateTotals(transaction).totalPrice }}
                                            </td>
                                        </tr>
                                    </tbody>

                                </table>
                            </td>
                            <td class="px-4 w-2 py-4 text-sm    text-gray-800">
                                <div class="flex justify-center">

                                    <span
                                        :class="transaction.selectedService === 'Delivery' ? 'bg-blue-400 border rounded-full px-5 p-2' : 'bg-sky-500 border rounded-full px-5 p-2'">{{
                                            transaction.selectedService }}</span>
                                    <div class="mx-2"></div>
                                    <span :class="transaction.paymentStatus === 'Paid' ? 'bg-[#4E95C9]' : 'bg-red-500'"
                                        class="border rounded-full px-5 p-2">
                                        {{ transaction.paymentStatus }}
                                    </span>
                                </div>
                            </td>
                            <td class="px-4 w-2 py-4 text-sm text-center text-gray-800">
                                {{ format(new Date(transaction.transaction_date), 'MMMM dd, yyyy') }}
                            </td>
                            <td class="px-4 w-2  text-sm      text-gray-800">
                                <span @click="openInvoiceModal(transaction.transaction_id)"
                                    class="text-blue-400 text-[17px] cursor-pointer text-center block hover:underline hover:text-blue-400">
                                    View
                                </span>
                            </td>


                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- Start of Pages -->
            <div class=" flex justify-center   relative py-2  ">
                <!-- Start Of Previous Page -->
                <svg @click="goToPreviousPage" class="bg-gray-200 border-l rounded-l-full cursor-pointer" width="40"
                    height="30" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M11.707 7.05451C11.8945 7.24203 11.9998 7.49634 11.9998 7.76151C11.9998 8.02667 11.8945 8.28098 11.707 8.4685L7.414 12.7615L11.707 17.0545C11.8892 17.2431 11.99 17.4957 11.9877 17.7579C11.9854 18.0201 11.8802 18.2709 11.6948 18.4563C11.5094 18.6417 11.2586 18.7469 10.9964 18.7492C10.7342 18.7515 10.4816 18.6507 10.293 18.4685L5.293 13.4685C5.10553 13.281 5.00021 13.0267 5.00021 12.7615C5.00021 12.4963 5.10553 12.242 5.293 12.0545L10.293 7.05451C10.4805 6.86703 10.7348 6.76172 11 6.76172C11.2652 6.76172 11.5195 6.86703 11.707 7.05451ZM17.707 7.05451C17.8945 7.24203 17.9998 7.49634 17.9998 7.76151C17.9998 8.02667 17.8945 8.28098 17.707 8.4685L13.414 12.7615L17.707 17.0545C17.8892 17.2431 17.99 17.4957 17.9877 17.7579C17.9854 18.0201 17.8802 18.2709 17.6948 18.4563C17.5094 18.6417 17.2586 18.7469 16.9964 18.7492C16.7342 18.7515 16.4816 18.6507 16.293 18.4685L11.293 13.4685C11.1055 13.281 11.0002 13.0267 11.0002 12.7615C11.0002 12.4963 11.1055 12.242 11.293 12.0545L16.293 7.05451C16.4805 6.86703 16.7348 6.76172 17 6.76172C17.2652 6.76172 17.5195 6.86703 17.707 7.05451Z"
                        fill="#555555" />
                </svg>
                <!-- End of Previous -->

                <!-- Start of Current Page -->
                <span class="bg-[#4E95C9] px-3 pt-1 ">{{ currentPage }}</span>
                <!-- End of Current Page -->

                <!-- Start of Next Page -->
                <svg @click="goToNextPage" class="bg-gray-200 border-r rounded-r-full cursor-pointer" width="40"
                    height="30" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M13.2024 18.473C13.0179 18.2825 12.9166 18.0265 12.9208 17.7614C12.9251 17.4963 13.0344 17.2437 13.2248 17.0591L17.5854 12.8348L13.361 8.47422C13.1818 8.28275 13.0851 8.02858 13.0915 7.76645C13.0979 7.50432 13.2071 7.25521 13.3954 7.07277C13.5837 6.89032 13.8362 6.78914 14.0984 6.79102C14.3606 6.7929 14.6115 6.89769 14.7972 7.08282L19.7173 12.1615C19.9018 12.352 20.003 12.6079 19.9988 12.873C19.9946 13.1382 19.8853 13.3908 19.6949 13.5753L14.6162 18.4954C14.4257 18.6799 14.1698 18.7811 13.9047 18.7769C13.6395 18.7727 13.3869 18.6634 13.2024 18.473ZM7.20314 18.3778C7.01867 18.1873 6.9174 17.9314 6.9216 17.6662C6.92581 17.4011 7.03514 17.1485 7.22557 16.964L11.5861 12.7396L7.36173 8.37906C7.18259 8.1876 7.08581 7.93343 7.09225 7.6713C7.09868 7.40917 7.20782 7.16006 7.39614 6.97761C7.58447 6.79517 7.83692 6.69399 8.09912 6.69587C8.36132 6.69775 8.61229 6.80254 8.79798 6.98766L13.7181 12.0663C13.9025 12.2568 14.0038 12.5128 13.9996 12.7779C13.9954 13.043 13.8861 13.2956 13.6956 13.4802L8.61696 18.4002C8.42649 18.5847 8.17054 18.686 7.90541 18.6818C7.64028 18.6776 7.38767 18.5682 7.20314 18.3778Z"
                        fill="#555555" />
                </svg>
                <!--End of Next Page  -->
            </div>
            <!-- End of Pages -->



            <!-- Invoice Modal -->
            <div v-if="showInvoiceModal" @click.self="closeInvoiceModal"
                class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-10 ">

                <!-- Invoice Modal Content -->
                <div
                    class="lg:w-[70%] xl:w-[70%] w-full lg:h-[460px] xl:h-[460px] h-[550px] bg-white rounded-lg py-2 relative lg:pb-2 xl:pb-2 pb-4">
                    <div class="flex pb-3 border-b border-black">
                        <h3 class="text-graay-800 mt-6 font-bold mx-3 flex-1"></h3>
                        
                        <svg @click="closeInvoiceModal" xmlns="http://www.w3.org/2000/svg"
                            class="w-3 mx-3 ml-2 cursor-pointer shrink-0" viewBox="0 0 320.591 320.591">
                            <path
                                d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                                data-original="#000000"></path>
                            <path
                                d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                                data-original="#000000"></path>
                        </svg>

                        
                    </div>

                    <!-- START OF CONTENTS -->
                    <div class="h-[400px] mx-10 mt-5">
                        <!-- Header Section -->
                        <div class="flex">
                            <h3 class="text-sm font-bold flex-1">BILLED TO:</h3>
                            <h1 class="text-indigo-500 font-semibold text-3xl">INVOICE</h1>
                        </div>

                        <!-- Billing and Invoice Information -->
                        <div class="lg:flex xl:flex mt-3">
                            <div class="lg:w-[45%] xl:w-[45%]">
                                <h3 class="text-[15px] uppercase font-bold">{{ firstname }} {{ lastname }}</h3>
                                <h3 class="text-[15px] uppercase">{{ alias }}</h3>
                                <h3 class="text-[15px] uppercase">{{ sitio }},{{ barangay }},{{ city }}</h3>
                                <h3 class="text-[15px] uppercase">{{ mobile1 }}</h3>
                            </div>

                            <div class="lg:w-[50%] xl:w-[50%]">
                                <h3 class="font-bold">Invoice Information</h3>
                                <div class="flex">
                                    <h3 class="flex-1">Order No.:</h3>
                                    <h3>{{ orderNumber }}</h3>
                                </div>
                                <div class="flex">
                                    <h3 class="flex-1">Date Order:</h3>
                                    <h3>{{ formatDate(transaction_date) }}</h3>
                                </div>
                                <div class="flex">
                                    <h3 class="flex-1">Service:</h3>
                                    <h3>{{ selectedService }}</h3>
                                </div>
                                <div class="flex">
                                    <h3 class="flex-1">Order Status:</h3>
                                    <h3 class="font-bold">{{ orderStatus }}</h3>
                                </div>
                            </div>
                        </div>

                        <!-- Invoice Items Section -->
                        <div class="border border-gray-400 mt-3">
                            <div class="font-[sans-serif] overflow-x-auto overflow-y-hidden pb-[30px]">
                                <table class="w-full">
    <thead class="bg-[#4E95C9]">
        <tr class="">
            <th class="p-2 text-left">Product</th>
            <th class="p-2 ">Quantity</th>
            <th class="p-2 ">Free</th>

            <th class="p-2 ">Price</th>
            <th class="p-2 ">Total</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="(item, index) in flattenedItems" :key="index" class="text-center">
            <td class="flex items-center justify-start px-2 py-2">
                <div class="h-8 w-8 mr-2 rounded-full overflow-hidden">
                    <img :src="`../src/assets/uploads/${item.image_item}`" 
                         class="h-full w-full object-cover" alt="" />
                </div>
                <div class="text-sm text-gray-800">
                    <span>{{ item.title }}</span>
                </div>
            </td>
            <td class="px-2 py-2">{{ item.quantity }}</td>
            <td class="px-2 py-2">
                <span v-if="selectedService === 'Delivery'">{{ item.free }}</span>
                <span v-else-if="selectedService === 'Pick Up'">{{ item.free }}</span>
            </td>
            <td class="px-2 py-2">
                <span v-if="selectedService === 'Delivery'">{{ item.deliver }}</span>
                <span v-else-if="selectedService === 'Pick Up'">{{ item.pick_up }}</span>
                <span v-else>{{ item.buy }}</span>
            </td>
          
            <td class="px-2 py-2">{{ item.total }}</td>
        </tr>
    </tbody>
    <tfoot class="bg-gray-100">
        <tr class="text-center">
            <td colspan="4" class="font-bold p-2 ">Total</td>
            <td class="font-bold p-2">₱{{ totalDue }}</td>
        </tr>
    </tfoot>
</table>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    </main>
</template>