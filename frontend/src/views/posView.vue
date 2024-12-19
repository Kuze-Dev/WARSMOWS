<script setup>
import headerbar from '../components/headerbarComponent.vue'
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import todayspreviousComponent from '../components/todayspreviousComponent.vue';
import axios from '../../axios';
import { ref, onMounted, computed,  watch } from 'vue';
import { useAuthStore } from '../stores/store';
import { decodeJWT } from '../stores/jwt';
import { useToast } from "vue-toastification";
import Swal from 'sweetalert2';



const toast = useToast();
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



const showSearchCustomerModal = ref(false);

const openSearchCustomerModal = () => {
    showSearchCustomerModal.value = true;
}

const closeSearchCustomerModal = () => {
    showSearchCustomerModal.value = false;
}


const store = useAuthStore();
const items = ref([]);
const fetchStockDataToPos = async () => {

    await axios.get(`/pos`, {
        headers: {
            Authorization: `Bearer ${store.token}`
        }
    }).then((response) => {
        items.value = Array.isArray(response.data.Items) ? response.data.Items : [];
        console.log(items.value);

    })
}
// Function to calculate total based on service type and quantity
const calculateTotal = (item) => {
    // Parse quantity and free items as numbers
    const quantity = Number(item.quantity) || 0;
    const free = Number(item.free) || 0;

    // Ensure that only positive quantities and free items are considered
    if (quantity <= 0) {
        return 0; // Return 0 if the quantity is not positive
    }

    // Determine the correct price based on checkbox and selected service
    let price;
    if (item.checked) {
        price = Number(item.buy); // Use the buy price if the item is checked
    } else if (selectedService.value === 'Delivery') {
        price = Number(item.deliver); // Use the delivery price if the selected service is delivery
    } else {
        price = Number(item.pick_up); // Use the pickup price if the selected service is pickup
    }

    // Calculate the total amount without deductions
    const totalWithoutDeduction = price * quantity;

    // Deduct the value of free items based on the pick_up price (only if positive)
    const deduction = Number(item.pick_up) * (free > 0 ? free : 0); // Ensure only positive free values are used

    // Calculate and return the total after deductions, ensuring it's non-negative
    const totalAfterDeduction = Math.max(0, totalWithoutDeduction - deduction);

    return totalAfterDeduction.toFixed(2);
};

// Computed property to filter and display items with positive totals only
const selectedItems = computed(() => {
    return items.value.filter(item => {
        const total = Number(calculateTotal(item));
        return total > 0; // Display only items with a positive total
    });
});

// Calculate total quantity
const totalQuantity = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

// Calculate total amount
const totalAmount = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + Number(calculateTotal(item)), 0);
});


// Calculate the subtotal based on selected items
const subTotal = computed(() => {
    const total = selectedItems.value.reduce((sum, item) => sum + Number(calculateTotal(item)), 0);
    return total > 0 ? total.toFixed(2) : ''; // Return only the numeric value as a string with 2 decimal places
});


const discountPercentage = ref(0); // Discount as a percentage

const cash = ref(0);


// Calculate total due with percentage-based discount, capping discount at 99%
const totalDue = computed(() => {
    const total = selectedItems.value.reduce((sum, item) => sum + Number(calculateTotal(item)), 0);
    const discount = discountPercentage.value >= 0 && discountPercentage.value < 99 ? discountPercentage.value : 0; // Cap discount at 99%
    const discountAmount = (total * discount) / 100;
    return (total - discountAmount).toFixed(2);
});

// Calculate change based on cash input and total due
const change_amount = computed(() => {
    const dueAmount = totalDue.value;
    return cash.value > dueAmount ? (cash.value - dueAmount).toFixed(2) : '0.00';
});






const showConfirmPaymentModal = ref(false);
const openConfirmPaymentModal = () => {
    showConfirmPaymentModal.value = true;
}

const closeConfirmPaymentModal = () => {
    showConfirmPaymentModal.value = false;
}



// Get the current date using ref
const currentDate = ref(new Date());

// Format the current date using computed
const formattedDate = computed(() => {
    return currentDate.value.toLocaleDateString();
});

const selectedPosUser = ref(null); // Set to null initially
const posusers = ref([]);


// Current page and perPage refs for pagination
const currentPageUser = ref(1);
const perPageUser = 1;

// Fetch POS users based on decoded role
const fetchPosUsers = async () => {

    try {
        const response = await axios.get(`/posuser?page=${currentPageUser.value}&limit=${perPageUser}`, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });

        if (token.value) {
            try {
                const decoded = decodeJWT(token.value);
                role.value = decoded.accountType;
                const loggedInUserId = decoded.user_id;

                // Filter users based on role and set `posusers`
                posusers.value = (role.value === 'POS User')
                    ? response.data.Users.filter(user => user.accountType === 'POS User')
                    : response.data.Users.filter(user => user.accountType !== 'POS User');

                // Check if the logged-in user is on the current page
                let userFound = posusers.value.some(user => user.user_id === loggedInUserId);

                // If not found, navigate through pages until user is found or all pages are checked
                while (!userFound && currentPageUser.value < Math.ceil(response.data.Totalusers / perPageUser)) {
                    currentPageUser.value++;
                    await fetchPosUsers();
                    userFound = posusers.value.some(user => user.user_id === loggedInUserId);
                }

                // Set `selectedPosUser` to the logged-in user's ID if found
                selectedPosUser.value = userFound ? loggedInUserId : null;

                // Log to verify
                console.log("Decoded Role:", role.value);
                console.log("Filtered posusers:", posusers.value);
                console.log("Selected Pos User:", selectedPosUser.value);

            } catch (error) {
                console.error('Error decoding token:', error.message);
            }
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

const selectedService = ref('Delivery');

const customers = ref([]);
const selectedCustomer = ref(null)
const fetchCustomerData = async () => {
    await axios.get(`/customer?page=${currentPage.value}&limit=${perPage}&search=${searchQuery.value}`, {
        headers: {
            Authorization: `Bearer ${store.token}`
        }
    }).then((response) => {
        // Ensure response.data.customers is an array
        customers.value = Array.isArray(response.data.customers) ? response.data.customers : [];
        totalCustomers.value = response.data.totalCustomers;
        // console.log(response.data);
        // After fetching data, check if the current page is empty
        if (customers.value.length === 0 && currentPage.value > 1) {
            // If the page is empty, go to the previous page
            currentPage.value--;
            fetchCustomerData();  //Fetch users for the updated page
        }
    });
}

function selectCustomer(customer) {
    selectedCustomer.value = customer;

    // Only set the service to 'delivery' if it is not already set to 'pickup'
    if (selectedService.value !== 'Pick Up') {
        selectedService.value = 'Delivery'; // Automatically set service to 'delivery' only if not in 'pickup' mode
    }

    closeSearchCustomerModal();
}


// Select "Guest" customer for pickup
const selectGuestCustomer = () => {
    selectedCustomer.value = {
        firstname: 'Guest',
        lastname: '',
        alias: 'Use this account for pick-up only',
        sitio: 'Bangkal Tumoy',
        barangay: 'Ibabao',
        city: 'Cordova',
        province: 'Cebu'
    };
    selectedService.value = 'Pick Up'; // Set service type to 'pickup' for Guest
    closeSearchCustomerModal();
};

// Watcher to handle automatic selection based on service type
watch(selectedService, (newService) => {
    if (newService === 'Pick Up') {
        // Automatically select "Guest" as customer for pickup
        selectedCustomer.value = {
            firstname: 'Guest',
            lastname: '',
            alias: 'Use this account for pick-up only',
            sitio: 'Bangkal Tumoy',
            barangay: 'Ibabao',
            city: 'Cordova',
            province: 'Cebu'
        };
    } else if (newService === 'Delivery' && selectedCustomer.value?.firstname === 'Guest') {
        // Clear selected customer only if it was previously set to "Guest"
        selectedCustomer.value = null;
    }
});

//Pages
const currentPage = ref(1);
const perPage = 5; // Number of customers per page
const totalCustomers = ref(0); // To track total customers for pagination

//Search
const searchQuery = ref('');



const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        fetchCustomerData();
    }
};

const goToNextPage = () => {
    const totalPages = Math.ceil(totalCustomers.value / perPage); // Calculate total pages
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchCustomerData(); // Fetch users for the updated page
    }
};




const customerData = ref({
    firstname: '',
    lastname: '',
    gender: '',
    alias: '',
    email: '',
    date_of_birth: '',
    mobile1: '',
    mobile2: '',
    house_number: '',
    sitio: '',
    barangay: '',
    city: '',
    selectedPosUser: selectedPosUser,
    province: '',
    status: 'Active'     // Pre-set value
});

let save = ref('Save');

const send = async () => {
    save.value = 'Sending';

    const response = await axios.post('/customer', customerData.value);
    console.log(response.data);
    setTimeout(() => {
        save.value = 'Save'
        if (response.data.success) {
            console.log(response.data.message);
            Swal.fire('Success!', response.data.message, 'success');
            closeAddCustomerModal();
            fetchCustomerData();
        } else {
            toast.error(response.data.errors[0].msg);
        }
    }, 2000);
}

const showAddCustomerModal = ref(false);

const openAddCustomerModal = () => {
    showAddCustomerModal.value = !showAddCustomerModal.value;
}

const closeAddCustomerModal = () => {
    showAddCustomerModal.value = !showAddCustomerModal.value;
    resetForm();
}

// Function to reset the form data to its initial state
const resetForm = () => {
    customerData.value = {
        firstname: '',
        lastname: '',
        gender: '',
        alias: '',
        email: '',
        date_of_birth: '',
        mobile1: '',
        mobile2: '',
        house_number: '',
        sitio: '',
        barangay: '',
        city: '',
        province: ''
    };
};

const provinces = ref([]);// Reactive reference to hold the provinces

const fetchProvinces = async () => {
    try {
        const response = await axios.get('https://psgc.cloud/api/provinces');
        provinces.value = response.data;
        provinces.value.sort((a, b) => a.name.localeCompare(b.name));

    } catch (error) {
        console.error('Error fetching provinces:', error);
    }
};


const notes = ref('');
const paymentStatus = ref(''); // Single variable for payment status
const unpaid = ref(0); // Declare unpaidValue with ref()
const orderStatus = ref(''); // Declare order status as a reactive variable

const confirmPayment = async () => {
    // Set payment status based on cash value
    paymentStatus.value = (cash.value === 0 || !cash.value) ? 'Credit' : 'Paid';

    // Set unpaidValue based on whether cash is provided or not
    unpaid.value = (cash.value === 0 || !cash.value) ? parseFloat(totalDue.value).toFixed(2) : 0;

    // Set order status to 'Pending' if the selected service is 'Delivery'
    orderStatus.value = (selectedService.value === 'Delivery') ? 'Pending' : 'Pick Up';

    // Filter items with quantity > 0 and map necessary fields
    const itemsData = items.value
        .filter(item => Number(item.quantity) > 0) // Include only items with quantity > 0
        .map(item => ({
            item_id: item.item_id,
            quantity: Number(item.quantity),
            free: Number(item.free) || 0,
            total: calculateTotal(item),
        }));

    // Prepare the payload with selected items
    const payload = {
        subTotal: subTotal.value,
        discountPercentage: discountPercentage.value || 0,
        totalDue: totalDue.value,
        cash: cash.value || 0,
        change_amount: change_amount.value,
        selectedCustomer: selectedCustomer.value,
        selectedService: selectedService.value,
        selectedPosUser: selectedPosUser.value,
        paymentStatus: paymentStatus.value,
        notes: notes.value,
        unpaid: unpaid.value, // Use .value to get the reactive value
        orderStatus: orderStatus.value, // Add order status to the payload
        items: itemsData,
    };

    console.log("Payload:", payload);

    try {
        const response = await axios.post('/transaction', payload);

        if (response.data.failed && response.data.errors) {
            // Handle validation errors from the backend
            response.data.errors.forEach(err => toast.error(err.msg));
        } else if (response.status === 200) {
            toast.success("Payment confirmed successfully!");

            // Process stock out for items
            for (const item of items.value) {
                if (item.checked) {
                    try {
                        const stockOutPayload = {
                            quantity_out: item.quantity, // Specify the quantity
                            stock_status: 'Buy', // Example: default stock status
                            comments_out: 'Buy From POS', // Example comment
                            stockOut_flow: 'Out', // Example flow
                        };

                        const stockOutResponse = await axios.put(`/stockOut/${item.stock_id}`, stockOutPayload,{
                            headers: {
                Authorization: `Bearer ${store.token}`
            }
                        });

                        if (stockOutResponse.data.success) {
                            toast.success(stockOutResponse.data.message);
                        } else {
                            toast.error(stockOutResponse.data.message);
                        }
                    } catch (error) {
                        console.error('Error stocking out item:', error);
                        toast.error('Failed to stock out item. Please try again.');
                    }
                }
            }

            fetchTransactionItem(); // Refresh the transaction list after successful payment
            closeConfirmPaymentModal(); // Close payment confirmation modal
        } else {
            toast.error("Failed to confirm payment. Please try again.");
        }
    } catch (error) {
        // Handle unexpected errors
        toast.error("An unexpected error occurred. Please try again.");
    }
};

// const handleStockOut = async (item) => {
//     if (item.checked) {
//         try {
//             // Call the stockOutItem API
//             const payload = {
//                 quantity_out: item.quantity, // Specify the quantity
//                 stock_status: 'Buy', // Example: default stock status
//                 comments_out: 'Buy From POS', // Example comment
//                 stockOut_flow: 'Out', // Example flow
//             };

//             const response = await axios.put(`/stockOut/${item.stock_id}`, payload);

//             if (response.data.success) {
//                 toast.success(response.data.message);
//                 fetchTransactionItem(); // Update the frontend list if needed
//                 closeConfirmPaymentModal();
//             } else {
//                 toast.error(response.data.message);
//             }
//         } catch (error) {
//             console.error('Error stocking out item:', error);
//             toast.error('Failed to stock out item. Please try again.');
//         }
//     }
// };









const transactions = ref([]);

const fetchTransactionItem = async () => {
    try {
        const response = await axios.get(`/transaction?page=${currentPagePreviousTransaction.value}&limit=${perPagePreviousTransaction.value}`);
        transactions.value = response.data.transactions.map(transaction => {
    return {
        ...transaction,
        items: transaction.items ? JSON.parse(`[${transaction.items}]`) : [], // Default to empty array if items are null
    };
});

        totalTodaysPreviousTransaction.value = response.data.totalTodaysPreviousTransaction;
        currentPagePreviousTransaction.value = response.data.currentPage;
        perPagePreviousTransaction.value = response.data.perPage; // Fixed this line

        // After fetching data, check if the current page is empty
        if (transactions.value.length === 0 && currentPagePreviousTransaction.value > 1) {
            // If the page is empty, go to the previous page
            currentPagePreviousTransaction.value--;
            fetchTransactionItem(); // Fetch users for the updated page
        }
        console.log('Results Transaction:', transactions.value);
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
};

// Pages
const currentPagePreviousTransaction = ref(0);
const perPagePreviousTransaction = ref(0); // Number of customers per page
const totalTodaysPreviousTransaction = ref(0); // To track total customers for pagination

const goToPreviousPagePreviousTransaction = () => {
    if (currentPagePreviousTransaction.value > 1) {
        currentPagePreviousTransaction.value--;
        fetchTransactionItem();
    }
};

const goToNextPagePreviousTransaction = () => {
    const totalPagesPreviousTransaction = Math.ceil(totalTodaysPreviousTransaction.value / perPagePreviousTransaction.value); // Calculate total pages
    if (currentPagePreviousTransaction.value < totalPagesPreviousTransaction) {
        currentPagePreviousTransaction.value++;
        fetchTransactionItem(); // Fetch users for the updated page
    }
};

onMounted(() => {
    fetchStockDataToPos();
    fetchPosUsers();
    fetchCustomerData();
    fetchProvinces();
    fetchTransactionItem();
    // // Set up polling every 5 seconds to update POS users
    // const interval = setInterval(fetchPosUsers, 5000);

    // // Clear the interval when the component is unmounted
    // onUnmounted(() => clearInterval(interval));
});


</script>
<template>
    <main
        :class="role === 'POS User' ? 'lg:w-[1300px] h-screen overflow-y-auto' : 'lg:w-[1200px] xl:w-[1310px]  h-screen overflow-y-auto'">
        <div class="flex fixed top ">
            <headerbar class="w-[220px] border-b " />
            <headerComponent />
        </div>

        <div class="flex justify-center ">
            <section
                :class="role === 'POS User' ? 'lg:w-[95%] xl:w-[96%] w-[90%] lg:mt-[88px] xl:mt-[88px]  border  h-full   rounded-md shadow-md' : 'lg:w-[95%] xl:w-[96%] w-[90%] border lg:mt-[88px] xl:mt-[88px] mt-[88px] h-full   rounded-md shadow-md '">

                <!-- start of monthly sales report header -->
                <div class="lg:ml-8 lg:flex mt-4 ml-6 flex items-center">
                    <div class="flex items-center">
                        <img class="w-[25px] h-7 mr-2" src="../assets/posicon.png" alt="">
                        <h1 class="font-bold leading-tight">POINT OF SALE</h1>
                    </div>

                    <!-- start of search button -->
                    <div class="ml-6  ">
                        <button @click="openSearchCustomerModal"
                            class="leading-tight bg-[#3462A5] text-sm text-white px-2 py-2  rounded flex items-center">
                            <img class="w-4 h-4 mr-2 mx-2" src="../assets/searchicon.png" alt="">
                            <span class="hidden xl:block lg:block">SEARCH CUSTOMER</span>
                            <!-- Hidden on small screens, shown on large screens -->
                        </button>
                    </div>
                    <!-- end of search button -->

                    <!-- start of add button -->
                    <div class="ml-3  ">
                        <button @click="openAddCustomerModal"
                            class="leading-tight bg-[#31ABD2] text-sm text-white lg:px-2 xl:px-2 px-2  py-2 rounded flex justify-center items-center">
                            <img class="w-4 h-4 mr-2 mx-2" src="../assets/addicon.png" alt="">
                            <span class="hidden xl:block lg:block">ADD CUSTOMER</span>
                            <!-- Hidden on small screens, shown on large screens -->
                        </button>
                    </div>
                    <!-- end of add button -->
                </div>

                <div class="mt-4 mx-3 mb-5">
                    <div class="border-b-2 border-gray-500 w-full"></div>
                </div>
                <!-- end of monthly sales report -->
                <form @submit.prevent="openConfirmPaymentModal" class="lg:flex  ">
                    <section
                        :class="role === 'POS User' ? 'xl:w-[950px] lg:w-[55%]  w-[95.5%] border mt-5 ml-3 h-[380px] mb-5 rounded-md shadow-md lg:flex' : 'xl:w-[650px] lg:w-[60%] w-[95.5%] border mt-5 ml-3  h-[380px] mb-5 rounded-md shadow-md lg:flex '">

                        <div class=" w-[95.5%] mx-3 mt-3  text-2xl font-bold  ">
                            <div class="lg:flex xl:flex   lg:w-full xl:w-full w-full  py-1">
                                <!-- Customer Selection Display -->

                                <div class=" w-full ">
                                    <div :class="{
                                        'text-lg font-bold justify-center text-[#3C61E4] cursor-pointer bg-white  flex flex-col items-center': true,
                                        'mt-[6px]': selectedCustomer,
                                        'mt-[5px]': !selectedCustomer
                                    }" @click="openSearchCustomerModal">
                                        <span v-if="!selectedCustomer" class="text-xl block   font-bold">
                                            <div class="py-5">
                                                &lt;&lt; SELECT CUSTOMER &gt;&gt;
                                            </div>
                                        </span>
                                        <span v-else class="text-xl uppercase font-bold">
                                            <i class="far fa-user mr-2"></i>
                                            <!-- 'far' is the regular outline version of the icon -->
                                            {{ selectedCustomer.firstname }} {{ selectedCustomer.lastname }}
                                        </span>


                                    </div>
                                    <div v-if="selectedCustomer"
                                        class=" mt-2 flex justify-center items-center space-x-4">
                                        <div class="flex items-center  ">
                                            <div class="h-5 w-6">
                                                <img class="h-full" src="../assets/aliasinfoIcon2.png" alt="">
                                            </div>
                                            <p
                                                class="lg:text-[8px] uppercase xl:text-[10px] text-[6px] font-medium text-gray-700">
                                                {{ selectedCustomer.alias
                                                }}
                                            </p>
                                        </div>
                                        <div class="flex items-center text-sm ">
                                            <div class=" h-5 w-6 ">
                                                <img class="h-full" src="../assets/addressinfoIcon.png" alt="">
                                            </div>
                                            <p
                                                class="lg:text-[8px] uppercase xl:text-[10px] text-[6px]  font-medium text-gray-700">
                                                {{
                                                    selectedCustomer.sitio
                                                }}, {{ selectedCustomer.barangay }}
                                            </p>
                                        </div>
                                    </div>
                                </div>


                                <!-- start of options -->
                                <div class=" lg:w-[50%] xl:w-[50%] w-full">
                                    <select id="select_service" v-model="selectedService"
                                        class="border border-black rounded text-sm px-6 py-1 font-medium w-full">
                                        <option value="Delivery">DELIVERY</option>
                                        <option value="Pick Up">PICK UP</option>

                                    </select>

                                    <div class="mt-1">
                                        <div
                                            class="border border-black rounded text-sm px-6 py-1 font-medium w-full bg-gray-100 text-black">
                                            {{ posusers.find(posuser => posuser.user_id === selectedPosUser)?.firstName
                                            }}
                                            {{ posusers.find(posuser => posuser.user_id === selectedPosUser)?.lastName
                                            }}
                                        </div>
                                    </div>

                                </div>
                                <!-- end of options -->
                            </div>
                            <div class="mx-1 ">
                                <div class="lg:w-full xl:w-full w-full  border-b-2 mt-2"></div>
                            </div>

                            <div class=" flex  mt-2">
                                <div class="border-l-2  border-b-2 border-gray-300 h-24 w-18 ">
                                    <div class="border-2 border-black p-2 py-[10px] w-full text-sm text-center">
                                        <h1>Gallon</h1>
                                    </div>
                                </div>


                                <div class="border-2 border-gray-300 w-full overflow-x-auto">
                                    <div class="font-[sans-serif]">
                                        <table class="w-full bg-[#4E95C9]">
                                            <thead class="whitespace-nowrap">
                                                <tr>
                                                    <th
                                                        class="px-1 py-1 text-left text-[0.5rem] font-semibold uppercase w-8">
                                                        #
                                                    </th>
                                                    <th
                                                        class="px-1 py-1 text-left text-[0.5rem] font-semibold uppercase w-32">
                                                        ITEM
                                                    </th>
                                                    <th
                                                        class="px-1  py-1 text-center text-[0.5rem] font-semibold uppercase w-16">
                                                        PRICE
                                                    </th>
                                                    <th
                                                        class="px-1 py-1 text-center text-[0.5rem] font-semibold uppercase w-14">
                                                        QUANTITY
                                                    </th>
                                                    <th
                                                        class="px-1 py-1 text-center text-[0.5rem] font-semibold uppercase w-14">
                                                        FREE
                                                    </th>
                                                    <th
                                                        class="px-2 py-1 text-center text-[0.5rem] font-semibold uppercase w-20">
                                                        TOTAL
                                                    </th>
                                                    <th
                                                        class="px-1 py-1 text-center text-[0.5rem] font-semibold uppercase w-14">
                                                        BUY
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody class="bg-white whitespace-nowrap">
                                                <tr v-for="(item, index) in items" :key="item.item_id">
                                                    <td class="px-1 py-1 text-[0.5rem] text-gray-800 text-center ">
                                                        {{
                                                            index + 1 }}</td>
                                                    <td class="flex items-center px-1 py-1 w-32">
                                                        <div class="h-8 w-8 mr-1 rounded-full overflow-hidden">
                                                            <img :src="`../src/assets/uploads/${item.image_item}`"
                                                                class="h-full w-full object-cover" alt="" />
                                                        </div>
                                                        <div class="text-[0.5rem] text-gray-800 ">
                                                            <span>{{ item.title }}</span>
                                                        </div>
                                                    </td>
                                                    <td class="px-1 py-1 text-[0.5rem] text-center">
                                                        {{ item.checked ? item.buy : (selectedService === 'Delivery'
                                                            ?
                                                            item.deliver : item.pick_up) }}
                                                    </td>
                                                    <td class="px-1 py-1 text-[0.5rem] text-center">
                                                        <input type="number" v-model.number="item.quantity"
                                                            class="border w-16 px-2 py-1 border-black rounded-md text-[0.5rem]"
                                                            placeholder="Qty" />
                                                    </td>
                                                    <td class="px-1 py-1 text-[0.5rem] text-center">
                                                        <input type="number" v-model.number="item.free"
                                                            class="border w-16 px-2 py-1 border-black rounded-md text-[0.5rem]"
                                                            placeholder="Free" @input="calculateTotal(item)" />
                                                    </td>
                                                    <td class="px-1 py-1 text-[0.5rem] text-center text-black">
                                                        {{ calculateTotal(item) }}
                                                    </td>

                                                    <!-- Checkbox to toggle the price display -->
                                                    <td class="px-1 py-1 text-center">
                                                        <input type="checkbox" v-model="item.checked"
                                                            class="border border-black rounded-md w-3 h-3" />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>


                            </div>



                        </div>

                    </section>

                    <section
                        :class="role==='POS User'?'lg:w-[42%] xl:w-[35%] w-[95.5%] border  border-gray-300 mt-5 ml-3 h-[380px] rounded-md shadow-md  p-4  xl:mr-3':'lg:w-[36.4%] xl:w-[35%] w-[95.5%] border  border-gray-300 mt-5 ml-3 h-[380px] rounded-md shadow-md  p-4  xl:mr-3'">
                        <div class="flex">
                            <div class="text-xs font-semibold  flex-1">
                                <h1>DATE</h1>
                            </div>

                            <div class="">
                                <p class="text-xs font-semibold">{{ formattedDate }}</p>
                            </div>

                        </div>

                        <div>

                            <div class="w-full border-t-2 mt-2 border-black"></div>

                            <div class="text-center">
                                <h1 class="mt-1 text-xs font-bold">ORDER ITEM SUMMARY</h1>
                            </div>

                        </div>

                        <div class="h-14 bg-white pb-[50px] ">
                            <table class=" block w-full bg-[#4E95C9]">
                                <thead class=" whitespace-nowrap">
                                    <tr class=" text-left text-xs font-medium   uppercase tracking-wider">
                                        <th class="py-1  w-1/2">
                                            ITEM
                                        </th>
                                        <th class=" text-center w-1/2">
                                            QTY
                                        </th>
                                        <th class="px-8 w-1/2">
                                            PRICE
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white whitespace-nowrap">

                                    <tr v-for="item in selectedItems" :key="item.item_id">
                                        <td class="flex items-center  px-1 py-1 w-full">
                                            <div class="h-8 w-8 mr-1 rounded-full overflow-hidden">
                                                <img :src="`../src/assets/uploads/${item.image_item}`"
                                                    class="h-full w-full object-cover" alt="" />
                                            </div>
                                            <div class="text-[0.7rem] text-gray-800 ">
                                                <span>{{ item.title }}</span>
                                            </div>
                                        </td>

                                        <td class="mx-auto w-full text-center">{{ item.quantity }}</td>
                                        <td class="text-center w-full">{{ calculateTotal(item) }}</td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                        <div class=" mt-14">
                            <div class="w-full border-t-2 border-black"></div>
                        </div>
                       <!-- Total Section -->
<table class="w-full">
     <tbody>
    <tr class="my-2">
        <!-- Total Label -->
        <td class="font-bold text-xl lg:pr-8 xl:pr-8 pr-[75px] lg:w-[130px] w-[120px]">
            TOTAL:
        </td>

        <!-- Total Quantity -->
        <td class="text-center font-semibold xl:mx-2 mx-8 xl:w-full text-[18px]">
            <span class="lg:mx-auto xl:mx-[45px] mx-auto">
                {{ totalQuantity > 0 ? totalQuantity : '' }}
            </span>
        </td>

        <!-- Total Amount -->
        <td class="text-center tracking-widest font-semibold text-[18px] w-[80px]">
            {{ totalAmount > 0 ? totalAmount.toFixed(2) : '' }}
        </td>
    </tr>
</tbody>
</table>


                        <div class=" mt-14">
                            <div class="w-full border-t-2  border-black"></div>


                            <div class="py-3 px-2 flex">
                                <h1 class="tracking-widest font-bold text-xl flex-1 "> SUB TOTAL:</h1>
                                <div class="">
                                    <h1 class="tracking-widest font-semibold text-xl flex-1 ">{{ subTotal }}</h1>
                                </div>
                            </div>

                            <div class=" mt-2">
                                <div class="w-full border-t-2 border-black"></div>
                            </div>
                            <div class="flex justify-center">
                                <div class="mt-2 ">
                                    <button type="submit"
                                        class="bg-[#82BADD] p-1 rounded font-semibold border-2 border-[#3C61E4] ">
                                        <h1 class="text-sm">CONFIRM PAYMENT</h1>
                                    </button>
                                </div>
                            </div>
                        </div>



                    </section>


                </form>

                <!-- START OF SEARCH CUSTOMER MODAL  -->
                <section v-if="showSearchCustomerModal" @click.self="closeSearchCustomerModal"
                    class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-20 ">
                    <div class="bg-white lg:w-[80%] xl:w-[80%]  w-full relative border py-2  rounded-lg">
                        <div class="flex pb-3 border-b  border-gray-300">
                            <h3 class="text-gray-800 mt-1  font-bold mx-3 flex-1">SEARCH CUSTOMER</h3>
                            <svg @click="closeSearchCustomerModal" xmlns="http://www.w3.org/2000/svg"
                                class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                                <path
                                    d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                                    data-original="#000000"></path>
                                <path
                                    d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                                    data-original="#000000"></path>
                            </svg>
                        </div>
                        <!-- Start of Search Input,dropdown of allbarangay and city and Button -->
                        <div class="xl:flex lg:flex justify-between  px-3 pb-4 mt-5">
                            <div
                                class="flex rounded-md  shadow-md border border-black overflow-hidden     font-[sans-serif]">
                                <input type="search" v-model="searchQuery" @input="fetchCustomerData"
                                    placeholder="Search ..."
                                    class="outline-none  w-full  bg-white text-gray-600 text-sm    px-2 py-2    " />
                                <button type='button'
                                    class="flex  items-center justify-center border-l border-black px-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="16px"
                                        class="fill-gray">
                                        <path
                                            d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                            <div class="mb-2"></div>

                            <div class=" lg:w-[30%] xl:w-[30%] w-full  ">
                                <select class="border border-black py-2 w-full px-1 flex-shrink-0 rounded-md shadow-md">
                                    <option value="">All Barangay</option>

                                </select>
                            </div>
                            <div class="mb-2"></div>
                            <div class=" lg:w-[30%] xl:w-[30%] w-full">
                                <select class="border border-black py-2 w-full px-1 flex-shrink-0 rounded-md shadow-md">
                                    <option value="">All City</option>

                                </select>
                            </div>

                        </div>
                        <!-- End of Search Input,dropdown of allbarangay and city and Button -->

                        <!--Start of Table -->
                        <section>
                            <div class=" w-full overflow-x-auto h-[400px]">
                                <div class="font-[sans-serif] border ">
                                    <table class=" w-full bg-[#4E95C9]">
                                        <thead class="whitespace-nowrap">
                                            <tr>
                                                <th
                                                    class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                                    #
                                                </th>
                                                <th
                                                    class="px-14 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th
                                                    class="px-12 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                                    Address
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white  whitespace-nowrap">
                                            <!-- Start of  Static Guest Row -->
                                            <tr class="border-b border-gray-300 hover:bg-gray-200"
                                                @click="selectGuestCustomer()">
                                                <td class="px-4 w-2 py-4 text-sm text-gray-800">1</td>
                                                <td class="w-[300px] py-4 text-gray-800">
                                                    <div class="flex ">
                                                        <div class="mr-2 h-4 w-6 ">
                                                            <img class="h-full" src="../assets/guestIcon.png" alt="">
                                                        </div>
                                                        <div class="text-sm mx-6 w-full">
                                                            <span class="mr-1">Guest</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-11 w-[180px] py-2 text-sm text-gray-800">

                                                    Use this account for pick-up only
                                                </td>
                                            </tr>
                                            <!-- End of  Static Guest Row -->

                                            <tr v-for="(customer, index) in customers" :key="customer.customer_id"
                                                class="border-b border-gray-300 cursor-pointer hover:bg-gray-200"
                                                @click="selectCustomer(customer)">
                                                <td class="px-4 w-2 py-2 text-sm text-gray-800">
                                                    {{ index + 2 }}
                                                </td>
                                                <td class=" px-4 w-[180px] py-2 text-gray-800">
                                                    <div class="flex">
                                                        <div class=" mr-2 h-4 w-6 ">
                                                            <img class="h-full" src="../assets/customerIcon3.png"
                                                                alt="">
                                                        </div>
                                                        <div class="text-sm mx-2  w-full">
                                                            <span class="mr-1">{{ customer.firstname }}</span>
                                                            <span>{{ customer.lastname }}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class=" px-4  w-[180px] py-2 text-gray-800">
                                                    <div class="flex">
                                                        <div class=" h-5 w-6 ">
                                                            <img class="h-full" src="../assets/addressinfoIcon.png"
                                                                alt="">
                                                        </div>


                                                        <div class="text-sm mx-2  w-full">

                                                            <span class="mr-1">{{ customer.sitio }},</span>
                                                            <span class="mr-1">{{ customer.barangay }}</span>
                                                            <span>{{ customer.city }}</span>,
                                                            <span>{{ customer.province }}</span>


                                                        </div>
                                                    </div>
                                                    <div class="flex">
                                                        <div class="h-5 w-6">
                                                            <img class="h-full" src="../assets/aliasinfoIcon2.png"
                                                                alt="">
                                                        </div>
                                                        <div class="text-sm mx-2 w-full">
                                                            <span>{{ customer.alias }}</span>
                                                        </div>
                                                    </div>

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                            <!-- Start of Pages -->
                            <div class=" flex justify-center lg:mb-5 xl:mb-5 mb-5  relative  mt-3   ">
                                <!-- Start Of Previous Page -->
                                <svg @click="goToPreviousPage"
                                    class="bg-gray-200 border-l rounded-l-full cursor-pointer" width="40" height="30"
                                    viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M11.707 7.05451C11.8945 7.24203 11.9998 7.49634 11.9998 7.76151C11.9998 8.02667 11.8945 8.28098 11.707 8.4685L7.414 12.7615L11.707 17.0545C11.8892 17.2431 11.99 17.4957 11.9877 17.7579C11.9854 18.0201 11.8802 18.2709 11.6948 18.4563C11.5094 18.6417 11.2586 18.7469 10.9964 18.7492C10.7342 18.7515 10.4816 18.6507 10.293 18.4685L5.293 13.4685C5.10553 13.281 5.00021 13.0267 5.00021 12.7615C5.00021 12.4963 5.10553 12.242 5.293 12.0545L10.293 7.05451C10.4805 6.86703 10.7348 6.76172 11 6.76172C11.2652 6.76172 11.5195 6.86703 11.707 7.05451ZM17.707 7.05451C17.8945 7.24203 17.9998 7.49634 17.9998 7.76151C17.9998 8.02667 17.8945 8.28098 17.707 8.4685L13.414 12.7615L17.707 17.0545C17.8892 17.2431 17.99 17.4957 17.9877 17.7579C17.9854 18.0201 17.8802 18.2709 17.6948 18.4563C17.5094 18.6417 17.2586 18.7469 16.9964 18.7492C16.7342 18.7515 16.4816 18.6507 16.293 18.4685L11.293 13.4685C11.1055 13.281 11.0002 13.0267 11.0002 12.7615C11.0002 12.4963 11.1055 12.242 11.293 12.0545L16.293 7.05451C16.4805 6.86703 16.7348 6.76172 17 6.76172C17.2652 6.76172 17.5195 6.86703 17.707 7.05451Z"
                                        fill="#555555" />
                                </svg>
                                <!-- End of Previous -->

                                <!-- Start of Current Page -->
                                <span class="bg-[#4E95C9] px-3 pt-1 ">{{ currentPage }}</span>
                                <!-- End of Current Page -->

                                <!-- Start of Next Page -->
                                <svg @click="goToNextPage" class="bg-gray-200 border-r rounded-r-full cursor-pointer"
                                    width="40" height="30" viewBox="0 0 26 25" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M13.2024 18.473C13.0179 18.2825 12.9166 18.0265 12.9208 17.7614C12.9251 17.4963 13.0344 17.2437 13.2248 17.0591L17.5854 12.8348L13.361 8.47422C13.1818 8.28275 13.0851 8.02858 13.0915 7.76645C13.0979 7.50432 13.2071 7.25521 13.3954 7.07277C13.5837 6.89032 13.8362 6.78914 14.0984 6.79102C14.3606 6.7929 14.6115 6.89769 14.7972 7.08282L19.7173 12.1615C19.9018 12.352 20.003 12.6079 19.9988 12.873C19.9946 13.1382 19.8853 13.3908 19.6949 13.5753L14.6162 18.4954C14.4257 18.6799 14.1698 18.7811 13.9047 18.7769C13.6395 18.7727 13.3869 18.6634 13.2024 18.473ZM7.20314 18.3778C7.01867 18.1873 6.9174 17.9314 6.9216 17.6662C6.92581 17.4011 7.03514 17.1485 7.22557 16.964L11.5861 12.7396L7.36173 8.37906C7.18259 8.1876 7.08581 7.93343 7.09225 7.6713C7.09868 7.40917 7.20782 7.16006 7.39614 6.97761C7.58447 6.79517 7.83692 6.69399 8.09912 6.69587C8.36132 6.69775 8.61229 6.80254 8.79798 6.98766L13.7181 12.0663C13.9025 12.2568 14.0038 12.5128 13.9996 12.7779C13.9954 13.043 13.8861 13.2956 13.6956 13.4802L8.61696 18.4002C8.42649 18.5847 8.17054 18.686 7.90541 18.6818C7.64028 18.6776 7.38767 18.5682 7.20314 18.3778Z"
                                        fill="#555555" />
                                </svg>
                                <!--End of Next Page  -->
                            </div>
                            <!-- End of Pages -->
                        </section>
                        <!--End of Table -->

                    </div>
                </section>
                <!-- END OF SEARCH CUSTOMER MODAL -->

                <!-- Start Of Add Customer Modal -->
                <section v-if="showAddCustomerModal" @click.self="closeAddCustomerModal"
                    class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-20 ">
                    <div class="bg-white lg:w-[70%] xl:w-[70%]  w-full relative border py-2  rounded-lg">
                        <div class="flex pb-3 border-b  border-gray-500">
                            <h3 class="text-gray-800 mt-1  font-bold mx-3  flex-1">ADD CUSTOMER</h3>
                            <svg @click="closeAddCustomerModal" xmlns="http://www.w3.org/2000/svg"
                                class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                                <path
                                    d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                                    data-original="#000000"></path>
                                <path
                                    d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                                    data-original="#000000"></path>
                            </svg>
                        </div>
                        <form @submit.prevent="send()" class="mx-3 mt-3">
                            <div class="lg:flex xl:flex justify-center mb-2">
                                <div class="w-full mr-10">
                                    <label>Firstname</label>
                                    <input v-model="customerData.firstname"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="text">
                                </div>
                                <div class="w-full mr-10">
                                    <label>Lastname</label>
                                    <input v-model="customerData.lastname"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="text">
                                </div>
                                <div class="w-full ">
                                    <label>Gender</label>
                                    <select v-model="customerData.gender" name="gender" id="gender"
                                        class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-lg ">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div class="lg:flex xl:flex justify-center">
                                <div class="w-full mr-10">
                                    <label>Alias/comment</label>
                                    <input v-model="customerData.alias"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="text">
                                </div>
                                <div class="lg:w-[46%] xl:w-[46%]">
                                    <label>Email</label>
                                    <input v-model="customerData.email"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="email">
                                </div>
                            </div>
                            <div class="lg:flex xl:flex justify-center mb-2">
                                <div class="w-full mr-10">
                                    <label>Date of Birth</label>
                                    <input v-model="customerData.date_of_birth"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="date">
                                </div>
                                <div class="w-full mr-10">
                                    <label>Mobile 1</label>
                                    <input v-model="customerData.mobile1"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="tel">
                                </div>
                                <div class="w-full">
                                    <label>Mobile 2</label>
                                    <input v-model="customerData.mobile2"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="tel">
                                </div>
                            </div>
                            <div class="lg:flex xl:flex justify-center mb-2">
                                <div class="w-full mr-10">
                                    <label>House Number</label>
                                    <input v-model="customerData.house_number"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="number">
                                </div>
                                <div class="w-full mr-10">
                                    <label>Purok/Sitio</label>
                                    <input v-model="customerData.sitio"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="text">
                                </div>
                                <div class="w-full">
                                    <label>Barangay</label>
                                    <input v-model="customerData.barangay"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="text">
                                </div>
                            </div>
                            <div class="lg:flex xl:flex justify-center mb-2">
                                <div class="w-full mr-10">
                                    <label>City</label>
                                    <input v-model="customerData.city"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                        type="text">
                                </div>
                                <div class="w-full">
                                    <label>Province</label>
                                    <select v-model="customerData.province" name="province" id="province"
                                        class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-lg ">
                                        <option v-for="province in provinces" :key="province.name"
                                            :value="province.name">
                                            {{ province.name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="mt-2 w-full flex justify-end">
                                <button type="submit"
                                    class="lg:w-[20%]  xl:w-[20%] mr-2 w-full bg-[#4E95C9] p-1 rounded-md">{{
                                        save }}</button>
                            </div>
                        </form>
                    </div>
                </section>
                <!-- End Of Add Customer Modal -->

                <!-- Start Of Confirm Payment Modal -->
                <section v-if="showConfirmPaymentModal" @click.self="closeConfirmPaymentModal"
                    class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-20 ">
                    <div class="bg-white lg:w-[50%] xl:w-[50%]  w-full relative border py-2  rounded-lg">
                        <div class="flex pb-3 border-b  border-gray-500">
                            <h3 class="text-gray-800 mt-1  font-bold text-center  flex-1">CONFIRM PAYMENT</h3>
                            <svg @click="closeConfirmPaymentModal" xmlns="http://www.w3.org/2000/svg"
                                class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                                <path
                                    d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                                    data-original="#000000"></path>
                                <path
                                    d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                                    data-original="#000000"></path>
                            </svg>
                        </div>
                        <form @submit.prevent="confirmPayment">
                            <div class="flex justify-center ">
                                <div class="border border-black mt-5 py-5 w-[70%]">
                                    <div class="flex mx-3">
                                        <h1 class="font-bold flex-1">SUB TOTAL:</h1>
                                        <div v-if="subTotal > 0">P {{ subTotal }}</div>
                                    </div>
                                    <div class="flex mx-3 mt-2 ">
                                        <label class="px-12">DISCOUNT:</label>

                                        <input type="number" v-model.number="discountPercentage"
                                            class="border shadow-md rounded-sm p-1 border-gray-500 w-full block ">

                                    </div>
                                </div>

                            </div>
                            <div class="flex justify-center ">
                                <div class="border border-black mt-5 py-5 mb-5 w-[70%]">
                                    <div class="flex mx-3">
                                        <h1 class="font-bold flex-1"> TOTAL DUE:</h1>
                                        <div v-if="totalDue > 0">P {{ totalDue }}</div>
                                    </div>
                                    <div class="flex mx-3 mt-2 ">
                                        <label class="px-12  lg:w-[60%] xl:w-[60%] w-full">CASH:</label>

                                        <input type="number" v-model.number="cash"
                                            class="border shadow-md rounded-sm p-1 border-gray-500 w-full block ">

                                    </div>
                                    <div class="flex mx-3 mt-2 ">
                                        <label class="px-12  lg:w-[60%] xl:w-[60%] w-full">CHANGE:</label>

                                        <input type="number" :value="change_amount"
                                            class="border shadow-md rounded-sm p-1 border-gray-500 w-full block"
                                            readonly>

                                    </div>
                                </div>

                            </div>
                            <div class="flex justify-center ">
                                <div class="  mb-5 w-[70%]">

                                    <span class="text-[12px]">Reasons why client has a discount,balance or credit
                                        ?</span>
                                    <textarea v-model="notes"
                                        class="w-full border  border-black shadow-md px-2 py-1 rounded-md block "
                                        rows="2"></textarea>


                                </div>

                            </div>

                            <div class="border-b border-gray-500"></div>

                            <div class="flex justify-center ">
                                <div class="w-[70%] flex justify-end mt-2">
                                    <button type="submit"
                                        class="bg-[#82BADD] p-1  rounded font-semibold border-2 border-[#3C61E4] ">
                                        <h1 class="text-sm">CONFIRM PAYMENT</h1>
                                    </button>
                                </div>

                            </div>
                        </form>
                    </div>
                </section>
                <!-- End Of Confirm Payment Modal -->





            </section>
        </div>
        <todayspreviousComponent
    v-if="transactions.length"
    :transactions="transactions"
    :totalTodaysPreviousTransaction="totalTodaysPreviousTransaction"
    :currentPage="currentPagePreviousTransaction"
    :perPage="perPagePreviousTransaction"
    :goToPreviousPage="goToPreviousPagePreviousTransaction"
    :goToNextPage="goToNextPagePreviousTransaction"
    class="mt-5"
/>

        <footerComponent class="mt-3" />

    </main>
</template>