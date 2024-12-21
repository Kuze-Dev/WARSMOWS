<script setup>
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import headerbar from '../components/headerbarComponent.vue'
import { RouterLink, RouterView } from 'vue-router';
import { decodeJWT } from '../stores/jwt';
import axios from '../../axios';
import Swal from 'sweetalert2';

import { useToast } from "vue-toastification";
import { format } from 'date-fns'; // Import date-fns for date formatting
import { ref, onMounted,computed} from 'vue';

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
const searchQuery = ref('');

const deliveries = ref([]);
const fetchAllDelivery = async () => {
    try {
        const response = await axios.get('/getDelivery', {
            params: {
                page: currentPage.value,
                limit: perPage.value,
                search: searchQuery.value,
            },
        });
        deliveries.value = response.data.Results.map(delivery => {
            return {
                ...delivery,
                items: JSON.parse(`[${delivery.items}]`)
            };
        });
        console.log('Delivery', deliveries.value);


        totalDeliveries.value = response.data.TotalDeliveries;
        currentPage.value = response.data.currentPage;
        perPage.value = response.data.perPage;

        // Handle empty results when not on the first page
        if (deliveries.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
            fetchAllDelivery(); // Fetch updated page data
        }
    } catch (err) {
        console.error('Error All Delivery:', err);
    }
};

//Pages
const currentPage = ref(0);
const perPage = ref(0); // Number of customers per page
const totalDeliveries = ref(0); // To track total customers for pagination

const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        fetchAllDelivery();
    }
};

const goToNextPage = () => {
    const totalPages = Math.ceil(totalDeliveries.value / perPage.value); // Calculate total pages
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchAllDelivery(); // Fetch users for the updated page
    }
};



const showOptionModal = ref(false);
const selectedDeliveryId = ref(false);

const openOptionModal = (deliveryId) => {
    if (showOptionModal.value && selectedDeliveryId.value === deliveryId) {
        closeOptionModal();
    } else {
        showOptionModal.value = true;
        selectedDeliveryId.value = deliveryId;
        // alert(selectedDeliveryId.value);
        selectedUserId.value = ''; // Reset the selected user when a new delivery is clicked

        document.addEventListener("mousedown", handleClickOutside);

    }
}

// Function to close the modal and clean up event listeners kevinsadasdasd
const closeOptionModal = () => {
    showOptionModal.value = false;
    document.removeEventListener("mousedown", handleClickOutside);
};

// Handle clicks outside the modal
const handleClickOutside = (event) => {
    const modal = document.querySelector(".modal-content"); // Class of your modal content div
    if (modal && !modal.contains(event.target)) {
        closeOptionModal();
    }
};

const deliveryusers = ref([]);
const selectedUserId = ref(''); // To track the selected user
const loggedInUserId =ref(false);
const fetchdeliveryuser = async () => {
  try {
    const response = await axios.get('/getalldeliveryuser'); // Fetch all delivery users
    loggedInUserId.value = decodeJWT(token.value).user_id; // Decode the logged-in user's ID

    console.log("Logged-in User ID:", loggedInUserId.value);
    console.log("All Users from API:", response.data.results);

    if (role.value === 'Admin') {
      // Admin sees all delivery boys except themselves
      deliveryusers.value = response.data.results.filter(
        (user) => user.user_id !== loggedInUserId.value
      );
    } else {
      // Non-admin (e.g., Delivery Boy) sees only their own account
      deliveryusers.value = response.data.results.filter(
        (user) => user.user_id === loggedInUserId.value
      );
    }

    console.log("Filtered Delivery Users:", deliveryusers.value);
  } catch (err) {
    console.error("Error Fetching Delivery Users:", err);
  }
};







// // Reset selection to show placeholder again
// const resetSelection = () => {
//     selectedUserId.value = ''; // Reset to empty string to show placeholder
// };



// Handle assigning a delivery user to an order
const handleDeliverNow = async () => {
  try {
    const response = await axios.put(`/assignDeliveryUser/${selectedDeliveryId.value}`, {
      userId: selectedUserId.value,
    });

    if (response.data.success === 'true') {
      console.log('Delivery user assigned and order status updated');
      
      
      fetchAllDelivery(); // Refresh delivery data
      // Keep the selected user visible
    } else {
      console.error('Failed to assign delivery user or update order status');
    }
  } catch (error) {
    console.error('Error in handleDeliverNow:', error);
  }
};


const previewProofUrl = ref(defaultImageUrl); // For image preview
const defaultImageUrl = '../src/assets/default-image.png';



const showproofModal = ref(false);
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

const openproofModal = (deliveryId) => {
    showproofModal.value = true;
// alert(deliveryId);
    selectedDeliveryId.value=deliveryId;

    // Fetch the item data to populate the form fields
    const delivery = deliveries.value.find(delivery => delivery.delivery_id === deliveryId);
    if (delivery) {
        customer_firstname.value = delivery.customer_firstname;
        customer_lastname.value = delivery.customer_lastname;
        alias.value = delivery.alias;
        sitio.value = delivery.sitio;
        barangay.value = delivery.barangay;
        city.value = delivery.city;
        mobile1.value = delivery.mobile1;
        transaction_date.value = delivery.transaction_date;
        user_firstname.value = delivery.user_firstname;
        user_lastname.value = delivery.user_lastname;
        user_contact.value =delivery.user_contact;
        deliveredAt.value =new Date();
    }
}

const closeproofModal = () => {
    showproofModal.value = false;
    resetForm();
}

const resetForm = () => {
   
    proof_image.value = '';
    previewProofUrl.value=defaultImageUrl;

}


const proof_image = ref(null); // Use null to indicate no file selected
const deliveredAt = ref(''); // To hold the delivery timestamp

const handleProofImage = (event) => {
    const file = event.target.files[0];
    if (file) {
        proof_image.value = file;
        previewProofUrl.value = URL.createObjectURL(file); // Show image preview
    } else {
        proof_image.value = null;
    }
};
const save = ref('Save');

const submitDeliver = async () => {
    // // Validate proof_image before proceeding
    // if (!proof_image.value) {
    //     toast.error('Proof of delivery image is required.');
    //     return;
    // }
    save.value = 'Sending';

    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('proof_image', proof_image.value);
        // Format the deliveredAt date properly
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;
        deliveredAt.value = formattedDate;
        formData.append('delivered_at', deliveredAt.value);
        // console.log('Delivered At:', deliveredAt.value);


        // Send PUT request
        const response = await axios.put(`/submitDelivery/${selectedDeliveryId.value}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        setTimeout(() => {
            save.value = 'Save';
            // if (response.data.msg) {
            //     toast.error(response.data.msg);
            //     return
            // }
            if (response.data.success) {
                Swal.fire('Success!', 'Delivery Submitted Successfully!', 'success');
                closeproofModal(); // Close modal
                fetchAllDelivery(); // Refresh delivery list
            }else {
                toast.error(response.data.errors[0].msg);
            }
        }, 2000);

    } catch (error) {
        console.error('Error submitting proof of delivery:', error);
        toast.error(response.data.errors[0].msg); // Display the first error
        save.value = 'Save';
    }
};



onMounted(() => {
    fetchAllDelivery();
    fetchdeliveryuser();
});
</script>

<template>
    <main
        :class="role === 'Delivery Boy' ? 'lg:w-[1300px] h-screen overflow-y-auto' : 'lg:w-[1200px] xl:w-[1310px] h-screen overflow-y-auto'">
        <div class="flex fixed top z-10">
            <headerbar class="w-[220px] border-b " />
            <headerComponent />
        </div>
        <div class="flex justify-center">
            <section
                class="lg:w-[95%] xl:w-[95%] w-[90%] border rounded-md mt-[88px]  lg:h-[622px] xl:h-[622px] h-[643px]  shadow-md">
                <div class="flex mx-3 ">
                    <div class=" mt-2 ">
                        <RouterLink to="/delivery" class="flex">
                            <img class="w-[25px] h-7 mt-2  mr-2" src="../assets/deliveryicon.png" alt="">
                            <span class="mt-3 font-bold  leading-tight ">DELIVERY STATUS</span>
                        </RouterLink>

                        <div class="relative top-5">
                            <div class="border-b-2 border-black"></div>
                        </div>
                    </div>
                    <div class="mt-2 ml-7">
                        <RouterLink  to="/successfuldelivery" class="flex">
                            <img class="w-[25px] h-7 mt-2  mr-2" src="../assets/succesfuldelivery.png" alt="">
                            <span class="mt-3 ">SUCCESSFUL DELIVERY</span>
                        </RouterLink>

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
                        <input type="search" v-model="searchQuery" @input="fetchAllDelivery" placeholder="Search ..."
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
                        <div class="font-[sans-serif] overflow-x-auto border h-[430px]">
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
                                    <tr class="border-b border-gray-300" v-if="deliveries.length > 0" v-for="(delivery, index) in deliveries"
                                        :key="delivery.delivery_id">
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ (currentPage - 1) * perPage + (index + 1) }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            <div class="flex">
                                                <div class=" h-4 w-6">
                                                    <img class="h-full" src="../assets/customerIcon3.png" alt="">
                                                </div>
                                                <div class="text-[15px] font-bold">{{ delivery.customer_firstname }} {{
                                                    delivery.customer_lastname }}</div>
                                            </div>
                                            <div class="flex">
                                                <div class="h-5 w-6">
                                                    <img class="h-full" src="../assets/aliasinfoIcon2.png" alt="">
                                                </div>
                                                <div>{{ delivery.alias }}</div>
                                            </div>
                                            <div class="flex">
                                                <div class=" h-5 w-[25px]   ">
                                                    <img class="h-full pr-1 " src="../assets/addressinfoIcon.png"
                                                        alt="">
                                                </div>
                                                <div class="text-center">{{ delivery.sitio }}, {{ delivery.barangay }}
                                                </div>
                                            </div>
                                        </td>

                                        <td class=" w-2 py-3 text-sm  text-gray-800">
                                            <table class=" font-[sans-serif]  bg-[#4E95C9]">
                                                <thead class="whitespace-nowrap">

                                                </thead>
                                                <tbody class="bg-white whitespace-nowrap">
                                                    <tr v-for="(item, index) in delivery.items" :key="item.item_id"
                                                        class=" border-gray-300">
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
                                                {{ delivery.selectedService }}
                                            </span>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center  text-sm text-gray-800">
                                            {{ delivery.unpaid }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                            <table class="font-[sans-serif] w-full">
                                                <tbody class="bg-white whitespace-nowrap">
                                                    <!-- Loop through transaction items -->
                                                    <tr v-for="(item, index) in delivery.items" :key="item.item_id"
                                                        class="border-b border-gray-300">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ item.quantity }}
                                                        </td>
                                                    </tr>
                                                    <!-- Totals Row -->
                                                    <tr v-if="delivery.items" class="bg-gray-100 font-semibold">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ delivery.totalQuantity }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                            <table class="font-[sans-serif] w-full">
                                                <tbody class="bg-white whitespace-nowrap">
                                                    <!-- Loop through transaction items -->
                                                    <tr v-for="(item, index) in delivery.items" :key="item.item_id"
                                                        class="border-b border-gray-300">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ item.free }}
                                                        </td>
                                                    </tr>
                                                    <!-- Totals Row -->
                                                    <tr v-if="delivery.items" class="bg-gray-100 font-semibold">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ delivery.totalFree || 0 }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                            <table class="font-[sans-serif] w-full">
                                                <tbody class="bg-white whitespace-nowrap">
                                                    <!-- Loop through transaction items -->
                                                    <tr v-for="(item, index) in delivery.items" :key="item.item_id"
                                                        class="border-b border-gray-300">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ item.total }}
                                                        </td>
                                                    </tr>
                                                    <!-- Totals Row -->
                                                    <tr v-if="delivery.items" class="bg-gray-100 font-semibold">

                                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                                            {{ delivery.totalDue }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ format(new Date(delivery.transaction_date), 'MMMM dd, yyyy') }}
                                        </td>

                                        <td class="px-4 w-2 py-4 text-center text-sm text-gray-800">
                                            <span
                                                :class="delivery.orderStatus === 'Pending' ? 'bg-[#4E95C9]' : 'bg-green-500'"
                                                class=" rounded-full px-5 p-2">
                                                {{ delivery.orderStatus }}
                                            </span>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm  text-gray-800">

                                            <!--Start Of Option Item Icon -->
                                            <svg @click="openOptionModal(delivery.delivery_id)"
                                                class="mx-auto cursor-pointer" width="24" height="40"
                                                viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M10.325 5.07921C10.751 3.32321 13.249 3.32321 13.675 5.07921C13.7389 5.34301 13.8642 5.58799 14.0407 5.79421C14.2172 6.00043 14.4399 6.16206 14.6907 6.26595C14.9414 6.36984 15.2132 6.41306 15.4838 6.39208C15.7544 6.37109 16.0162 6.28651 16.248 6.14521C17.791 5.20521 19.558 6.97121 18.618 8.51521C18.4769 8.74686 18.3924 9.00854 18.3715 9.27898C18.3506 9.54942 18.3938 9.82098 18.4975 10.0716C18.6013 10.3222 18.7627 10.5448 18.9687 10.7213C19.1747 10.8977 19.4194 11.0231 19.683 11.0872C21.439 11.5132 21.439 14.0112 19.683 14.4372C19.4192 14.5011 19.1742 14.6264 18.968 14.8029C18.7618 14.9794 18.6001 15.2021 18.4963 15.4529C18.3924 15.7036 18.3491 15.9754 18.3701 16.246C18.3911 16.5166 18.4757 16.7785 18.617 17.0102C19.557 18.5532 17.791 20.3202 16.247 19.3802C16.0153 19.2391 15.7537 19.1547 15.4832 19.1337C15.2128 19.1128 14.9412 19.156 14.6906 19.2597C14.44 19.3635 14.2174 19.5249 14.0409 19.7309C13.8645 19.9369 13.7391 20.1816 13.675 20.4452C13.249 22.2012 10.751 22.2012 10.325 20.4452C10.2611 20.1814 10.1358 19.9364 9.95929 19.7302C9.7828 19.524 9.56011 19.3624 9.30935 19.2585C9.05859 19.1546 8.78683 19.1114 8.51621 19.1323C8.24559 19.1533 7.98375 19.2379 7.752 19.3792C6.209 20.3192 4.442 18.5532 5.382 17.0092C5.5231 16.7776 5.60755 16.5159 5.62848 16.2454C5.64942 15.975 5.60624 15.7034 5.50247 15.4528C5.3987 15.2022 5.23726 14.9796 5.03127 14.8032C4.82529 14.6267 4.58056 14.5013 4.317 14.4372C2.561 14.0112 2.561 11.5132 4.317 11.0872C4.5808 11.0233 4.82578 10.898 5.032 10.7215C5.23822 10.545 5.39985 10.3223 5.50375 10.0716C5.60764 9.82079 5.65085 9.54904 5.62987 9.27842C5.60889 9.0078 5.5243 8.74596 5.383 8.51421C4.443 6.97121 6.209 5.20421 7.753 6.14421C8.753 6.75221 10.049 6.21421 10.325 5.07921Z"
                                                    stroke="black" stroke-width="2" stroke-linecap="round"
                                                    stroke-linejoin="round" />
                                                <path
                                                    d="M9 12.7622C9 13.5579 9.31607 14.3209 9.87868 14.8835C10.4413 15.4461 11.2044 15.7622 12 15.7622C12.7956 15.7622 13.5587 15.4461 14.1213 14.8835C14.6839 14.3209 15 13.5579 15 12.7622C15 11.9666 14.6839 11.2035 14.1213 10.6409C13.5587 10.0783 12.7956 9.76221 12 9.76221C11.2044 9.76221 10.4413 10.0783 9.87868 10.6409C9.31607 11.2035 9 11.9666 9 12.7622Z"
                                                    stroke="black" stroke-width="2" stroke-linecap="round"
                                                    stroke-linejoin="round" />
                                            </svg>
                                            <!--End Of Option Item Icon -->

                                            <!-- Start Of Selecting Delivery User -->
                                            <section
  :class="showOptionModal && delivery.delivery_id === selectedDeliveryId ? 'modal-content relative mx-2 right-[120px]' : 'hidden'"
  v-show="delivery.delivery_id === selectedDeliveryId"
  class="fixed z-50"
>
  <div
   
    v-for="(delivery, index) in deliveries"
    :key="delivery.delivery_id"
    v-show="delivery.delivery_id === selectedDeliveryId"
    class="w-[200px] max-w-sm rounded-lg bg-white border border-gray-200 shadow-lg p-4 absolute"
  >
  <div class="flex flex-col space-y-4">
  <!-- Dropdown for Selecting Delivery User -->
  <div v-if="!delivery.user_id">
    <select
      v-model="selectedUserId"
      @change="handleDeliverNow"
      class="w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="" disabled selected>Select Delivery Boy</option>
      <option v-for="user in deliveryusers" :key="user.user_id" :value="user.user_id">
        {{ user.firstName }}
      </option>
    </select>
  </div>

  <!-- Display Selected Delivery User -->
  <div v-else-if="role === 'Admin'" class="flex justify-center">
    <div>
      <div>Selected Delivery Boy:</div>
      <div class="font-semibold uppercase">
        {{ deliveryusers.find(user => user.user_id === delivery.user_id)?.firstName || 'None' }}
        {{ deliveryusers.find(user => user.user_id === delivery.user_id)?.lastName || '' }}
      </div>
    </div>
  </div>

   <!-- "Deliver Now" Button -->
   <div
    v-if="(role === 'Delivery Boy' && loggedInUserId === delivery.user_id) ||
           (role !== 'Admin' && delivery.user_id)"
    class="flex items-center justify-between space-x-3"
  >
    <button
      @click="openproofModal(delivery.delivery_id)"
      @click.self="closeOptionModal"
      class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Deliver Now
    </button>
  </div>
</div>
  </div>
</section>


                                            <!-- End Of Selecting Delivery User -->
                                        </td>
                                    </tr>
                                      <!-- Display message if no delivery are found -->
                                      <tr v-else>
                                        <td colspan="11" class="py-4 text-center text-gray-500 text-xl font-semibold">
                                            No deliveries available.
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
  <section v-if="showproofModal" @click.self="closeproofModal"
            class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-10 ">
            <div class="bg-white lg:w-[50%] xl:w-[50%]  w-full relative border py-2  rounded-lg">
                <div class="flex pb-3 border-b mx-3 border-gray-300">
                    <h3 class="text-gray-800 mt-1  font-bold  flex-1">DELIVER</h3>
                    <svg @click="closeproofModal" xmlns="http://www.w3.org/2000/svg"
                        class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>
                </div>
                <form @submit.prevent="submitDeliver"  class="mx-3 mt-3">
                 <div class="flex justify-center">
                    <div class="w-full">
                     <h2 class="uppercase font-semibold text-[15px]">Customer Details:</h2>
                     <h2 class="font-semibold lg:text-[15px] xl:text-[15px] text-[12px] uppercase" >{{customer_firstname}} {{customer_lastname}}</h2>
                     <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ alias }}</div>
                     <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ sitio }}, {{ barangay }}, {{ city }}</div>
                     <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ mobile1 }}</div>
                     <h2 class="uppercase font-semibold text-[15px] mt-2">Time & Date Ordered:</h2>
                     <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ format(new Date(transaction_date), 'MMMM dd, yyyy hh:mm:ss a') }}

                    </div>


                    </div>
                    <div class="w-full text-center">
                        <h2 class="uppercase font-semibold text-[15px]">Delivered By:</h2>
                        <h2 class="font-semibold lg:text-[15px] xl:text-[15px] text-[12px] uppercase" >{{user_firstname}} {{user_lastname}}</h2>
                        <div class="lg:text-[15px] xl:text-[15px] text-[12px] uppercase">{{ user_contact }}</div>
                    
                    <h2 class="uppercase font-semibold text-[15px] lg:mt-[55px] xl:mt-[53px] mt-[60px]">Time & Date Delivered:</h2>
                     <div>{{ format(new Date(deliveredAt), 'MMMM dd, yyyy hh:mm:ss a') }}</div>
                    </div>

                 </div>
                 <h2 class="uppercase font-semibold text-[15px] mt-2">Proof Of Delivery:</h2>
                 <div class=" w-full">
                    <div class="flex justify-center lg:px-[25%] xl:px-[25%] px-[15%] py-2 ">
                            <div
                                class="bg-white shadow-md text-gray-500 font-semibold text-base rounded w-full h-[175px] flex flex-col items-center justify-center  border-2  border-gray-300    font-[sans-serif]">
                                <img v-if="previewProofUrl" :src="previewProofUrl"
                                    class="lg:h-full xl:h-full h-[100%] lg:w-full xl:w-full w-full   " alt="">
                            </div>
                        </div>
                        <!-- Start Of Browse Button  -->
                        <div class="flex justify-center mt-2 mb-3">
                            <input @change="handleProofImage" name="file" type="file" id='file' accept="image/*"  capture="camera" 
                                class="hidden" />

                            <label for="file" name="file"
                                class="block px-6 py-2.5 rounded-full   tracking-wider font-semibold border  outline-none cursor-pointer  bg-[#4E95C9]">Browse
                            </label>
                        </div>
                        <!-- Start Of Browse Button  -->

                        <!-- Start Of Save Button -->
                        <div class="flex justify-center px-2">
                            <button type="submit" class="lg:w-[40%] xl:w-[40%] w-full bg-[#4E95C9] p-1 shadow-md rounded-md border "><i
                                    class="fas fa-check mr-1"></i>
                                {{ save }}</button>
                        </div>
                        <!-- End Of Save Button -->
                 </div>
                </form>
            </div>
        </section>
        <!-- End Of Proof Modal -->







        <RouterView />
        <footerComponent class="mt-3" />

    </main>
</template>