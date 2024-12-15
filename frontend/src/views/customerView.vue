<script setup>
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import { useAuthStore } from '../stores/store';
import Swal from 'sweetalert2';
import { useToast } from "vue-toastification";
import axios from '../../axios';
import { format } from 'date-fns'; // Import date-fns for date formatting
import { decodeJWT } from '../stores/jwt';
import { ref, onMounted, onUnmounted} from 'vue';


const firstname = ref();
const lastname = ref();
const gender = ref();
const alias = ref();
const email = ref();
const date_of_birth = ref();
const mobile1 = ref();
const mobile2 = ref('');
const house_number = ref('');
const sitio = ref('');
const barangay = ref('');
const city = ref('');
const province = ref('');
const toast = useToast();
const status = ref('Active');
const role = ref('');
const token = ref(localStorage.getItem('token'));




// Fetch and filter POS Users
const posusers= ref([]);
const selectedPosUser = ref(null); // Set to null initially
const fetchPosUsers = async () => {
    try {
        const response = await axios.get(`/posuser?page=${currentPageUser.value}&limit=${perPageUser}`, {
            headers: { Authorization: `Bearer ${store.token}` }
        });
        
        posusers.value = (role.value === 'POS User')
            ? response.data.Users.filter(user => user.accountType === 'POS User')
            : response.data.Users.filter(user => user.accountType !== 'POS User');
            console.log(posusers.value);
    } catch (error) {
        console.error('Error fetching POS users:', error);
    }
}

const currentPageUser = ref(1);
const perPageUser = 1;

const resetForm = () => {
    firstname.value = '',
        lastname.value = '',
        gender.value = '',
        alias.value = '',
        email.value = '',
        date_of_birth.value = '',
        mobile1.value = '',
        mobile2.value = '',
        house_number.value = '',
        sitio.value = '',
        barangay.value = '',
        city.value = '',
        province.value = ''
}

const showAddCustomerModal = ref(false);

const openAddCustomerModal = () => {
    showAddCustomerModal.value = !showAddCustomerModal.value;
}

const closeAddCustomerModal = () => {
    showAddCustomerModal.value = !showAddCustomerModal.value;
    resetForm();
}

let save = ref('Save');
const send = async () => {

    save.value = 'Saving';

    const customerData = {
        firstname: firstname.value,
        lastname: lastname.value,
        gender: gender.value,
        alias: alias.value,
        email: email.value,
        date_of_birth: date_of_birth.value,
        mobile1: mobile1.value,
        mobile2: mobile2.value,
        house_number: house_number.value,
        sitio: sitio.value,
        barangay: barangay.value,
        city: city.value,
        province: province.value,
        status: status.value,
        selectedPosUser: selectedPosUser.value // Include selected POS user
    };

    const response = await axios.post('/customer', customerData);
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

const store = useAuthStore();
const customers = ref([]);

const fetchCustomerData = async () => {
    await axios.get(`/customer?page=${currentPage.value}&limit=${perPage}&search=${searchQuery.value}`, {
        headers: {
            Authorization: `Bearer ${store.token}`
        }
    }).then((response) => {
        // Ensure response.data.customers is an array
        customers.value = Array.isArray(response.data.customers) ? response.data.customers : [];
        totalCustomers.value = response.data.totalCustomers;
        currentPage.value = response.data.currentPage;
        perPage.value = response.data.perPage;
        console.log(response.data);
        // After fetching data, check if the current page is empty
        if (customers.value.length === 0 && currentPage.value > 1) {
            // If the page is empty, go to the previous page
            currentPage.value--;
            fetchCustomerData(); // Fetch users for the updated page
        }
    });

}

//Pages
const currentPage = ref(0);
const perPage = ref(0); // Number of customers per page
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
    const totalPages = Math.ceil(totalCustomers.value / perPage.value); // Calculate total pages
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchCustomerData(); // Fetch users for the updated page
    }
};


const showOptionCustomerModal = ref(false);
const selectedCustomerId = ref(false);

const openOptionCustomerModal = (customerId) => {
    if (showOptionCustomerModal.value && selectedCustomerId.value === customerId) {
       closeOptionCustomerModal();
    } else {
        showOptionCustomerModal.value = true;
        selectedCustomerId.value = customerId;
        document.addEventListener("mousedown", handleClickOutside);

    }
}

// Function to close the modal and clean up event listeners
const closeOptionCustomerModal = () => {
  showOptionCustomerModal.value = false;
  document.removeEventListener("mousedown", handleClickOutside);
};

// Handle clicks outside the modal
const handleClickOutside = (event) => {
  const modal = document.querySelector(".modal-content"); // Class of your modal content div
  if (modal && !modal.contains(event.target)) {
    closeOptionCustomerModal();
  }
};

// Clean up event listener when component unmounts
onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});


const showEditCustomerModal = ref(false);

const openEditCustomerModal = (customerId) => {
    showEditCustomerModal.value = !showEditCustomerModal.value;

    // Fetch the customer data to populate the form fields
    const customer = customers.value.find(customer => customer.customer_id === customerId);
    if (customer) {
        firstname.value = customer.firstname;
        lastname.value = customer.lastname;
        gender.value = customer.gender;
        alias.value = customer.alias;
        email.value = customer.email;
        // Convert date_of_birth to yyyy-MM-dd format using date-fns
        date_of_birth.value = customer.date_of_birth ? format(new Date(customer.date_of_birth), 'yyyy-MM-dd') : '';
        mobile1.value = customer.mobile1;
        mobile2.value = customer.mobile2;
        house_number.value = customer.house_number;
        mobile2.value = customer.mobile2;
        sitio.value = customer.sitio;
        barangay.value = customer.barangay;
        city.value = customer.city;
        province.value = customer.province


    }
}


const closeEditCustomerModal = () => {
    showEditCustomerModal.value = !showEditCustomerModal.value;
    resetForm();
}

const edit = async () => {
    alert(selectedCustomerId.value);
    save.value = 'Sending';
    const customerData = {
        firstname: firstname.value,
        lastname: lastname.value,
        gender: gender.value,
        alias: alias.value,
        email: email.value,
        date_of_birth: date_of_birth.value,
        mobile1: mobile1.value,
        mobile2: mobile2.value,
        house_number: house_number.value,
        sitio: sitio.value,
        barangay: barangay.value,
        city: city.value,
        province: province.value,
        status:status.value

    };

    const response = await axios.put(`/customer/${selectedCustomerId.value}`, customerData);
    console.log(response.data);
    setTimeout(() => {
        save.value = 'Save'
        if (response.data.success) {
            console.log(response.data.message);
            Swal.fire('Success!', response.data.message, 'success');
            closeEditCustomerModal();
            fetchCustomerData();
        } else {
            toast.error(response.data.errors[0].msg);
        }
    }, 2000);
}



const deleteCustomer = async (customerId) => {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {

            axios.delete(`/customer/${customerId}`).then((response) => {
                if (response.data.success) {
                    Swal.fire('Success!', response.data.message, 'success');
                    fetchCustomerData();
                } else {
                    Swal.fire('Error!', response.data.message, 'error');
                }

            })
        }
    });
}
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



onMounted(() => {
    fetchPosUsers();
    fetchCustomerData();
    fetchProvinces();


    // Decode token to get user role
    if (token.value) {
        try {
            const decoded = decodeJWT(token.value);
            role.value = decoded.accountType;
            selectedPosUser.value = decoded.user_id;
        } catch (error) {
            console.error('Error decoding token:', error.message);
        }
    }
});
</script>

<template>
    <main class="lg:w-[1200px] xl:w-[1310px] lg:h-screen xl:h-screen h-[680px] overflow-y-auto">
        <headerComponent/>

        <div class="flex justify-center w-full ">
            <section class="lg:w-[95%] xl:w-[96%]  w-[90%] border rounded-md mt-7 h-[774px] lg:h-[732px] xl:h-[732px]  shadow-md mb-5 ">
                <div class="flex  mt-2 mx-7">
                    <img class="w-[25px] h-7 mt-2  mr-2" src="../assets/itemlisticon1.png" alt="">
                    <span class="mt-3 font-bold">ADD CUSTOMER</span>
                </div>
                <div class="mt-5 mx-3 mb-5">
                    <div class="border-b  w-full"></div>
                </div>

                <div class="mx-3 lg:flex xl:flex pb-4">
                    <!-- Start Of Add Customer Button -->
                    <div>
                        <button @click="openAddCustomerModal"
                            class="bg-[rgb(78,149,201)] border shadow-md mr-7 h-10 mt-1   hover:text-white font-semibold px-4 py-1  rounded-md"><i
                                class="fas fa-plus mr-2 "></i><span>Add Customer</span></button>
                    </div>
                    <!-- End of Add Customer Button -->



                    <!-- Start of Search Input and Button -->
                    <div class="xl:flex lg:flex md:block pt-1 ml-auto  relative">
                        <div class="flex rounded-md  shadow-md border border-black overflow-hidden      font-[sans-serif]">
                            <input v-model="searchQuery" @input="fetchCustomerData" type="search" placeholder="Search ..."
                                class="outline-none  w-full  bg-white text-gray-600 text-sm    px-2 py-2" />
                            <button type='button'
                                class="flex  items-center justify-center border-black border-l px-5">
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
                </div>

                <!--Start of Table -->
                <section>
                    <div class="w-full ">
                        <div class="font-[sans-serif] overflow-x-auto overflow-y-hidden pb-[54px] h-[532px]">
                            <table class=" w-full bg-[#4E95C9]">
                                <thead class="whitespace-nowrap">
                                    <tr>
                                        <th class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            #
                                        </th>
                                        
                                        <th
                                            class="px-[52px] py-3 text-left text-xs font-semibold  uppercase tracking-wider">
                                            <div class="flex ">
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
                                            <div class="flex">
                                                ADDRESS
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
                                            class="px-[60px] py-3 text-left text-xs font-semibold  uppercase tracking-wider">
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
                                        <th
                                            class="px-[15px] py-3 text-left text-xs font-semibold  uppercase tracking-wider">
                                            <div class="flex justify-center items-center ">
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
                                            class="px-[15px] py-3 text-left text-xs font-semibold  uppercase tracking-wider">
                                            <div class="flex 
                                            items-center ">
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
                                    <tr class="border-b" v-if="customers.length > 0" v-for="(customer, index) in customers"
                                        :key="customer.customer_id">
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ (currentPage - 1) * perPage + (index + 1) }}
                                        </td>
                                        
                                        <td class=" px-4  w-full py-4  text-gray-800">
                                            <div class="flex">
                                                <div class=" mr-2 h-5 w-7 mt-2">
                                                    <img class="h-full" src="../assets/customerIcon2.png" alt="">
                                                </div>
                                                <div class="text-sm mx-2 lg:mt-2.5 xl:mt-2.6 mt-[6%] w-full">
                                                    <span class="mr-1">{{ customer.firstname }}</span>
                                                    <span>{{ customer.lastname }}</span>
                                                </div>
                                            </div>
                                            <div class="flex">
                                                <div class=" mr-2 h-5 w-7">
                                                    <img class="h-full" src="../assets/aliasinfoIcon.png" alt="">
                                                </div>
                                                <div class="text-sm mx-2 w-full">
                                                    <span>{{ customer.alias }}</span>
                                                </div>
                                            </div>

                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            <span class="mr-1">{{ customer.barangay }}</span>
                                            <span class="mr-1">{{ customer.sitio }}</span>
                                            <span>{{ customer.city }}</span>,
                                            <span>{{ customer.province }}</span>


                                        </td>
                                        <td class="px-[70px] w-2 py-4 text-sm text-gray-800">
                                            {{ customer.total }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            <p
                                                class="bg-[rgb(78,149,201)] px-3 py-1 w-[75%] rounded-full">
                                                {{ customer.status }}
                                            </p>
                                        </td>
                                        <td class="px-5 py-4">
                                            <!--Start Of Option Customer Icon -->
                                            <svg @click="openOptionCustomerModal(customer.customer_id)" class="mx-[35%]"
                                                width="24" height="40" viewBox="0 0 24 25" fill="none"
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
                                            <!--End Of Option Customer Icon -->

                                            <!-- Start Of Edit and Delete Option Customer Modal  -->
                                            <section v-show="customer.customer_id == selectedCustomerId"
                                                :class="showOptionCustomerModal && customer.customer_id == selectedCustomerId?'modal-content relative font-[sans-serif] right-[45px]':'hidden' ">
                                                <div v-for="(customer, index) in customers"
                                                    :key="customer.customer_id"
                                                    v-show="customer.customer_id == selectedCustomerId"
                                                    class="max-w-sm rounded h-[75px]  lg:w-[100px] xl:w-[100px] bg-[#4E95C9]  border shadow-md absolute">
                                                    <div class="flex flex-wrap">

                                                        <div class="mx-5 flex justify-center items-center mt-2 pb-1">
                                                            <svg class="mr-2" width="17" height="24" viewBox="0 0 21 21"
                                                                fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path
                                                                    d="M13.125 5.76228L15.75 8.26228M11.375 17.4289H18.375M4.375 14.0956L3.5 17.4289L7 16.5956L17.1378 6.94061C17.4658 6.62807 17.6501 6.20422 17.6501 5.76228C17.6501 5.32034 17.4658 4.89649 17.1378 4.58395L16.9872 4.44061C16.6591 4.12816 16.214 3.95264 15.75 3.95264C15.286 3.95264 14.8409 4.12816 14.5128 4.44061L4.375 14.0956Z"
                                                                    stroke="#555555" stroke-width="2.5"
                                                                    stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                            <span class="text-[13px] cursor-pointer hover:text-white "
                                                                @click="openEditCustomerModal(customer.customer_id)">Edit</span>
                                                        </div>
                                                        <!-- border buttom -->
                                                        <div class="border-b w-full"></div>

                                                        <div class="mx-4  flex justify-center items-center mt-1 ">
                                                            <svg class="ml-1 mr-2" width="17" height="28"
                                                                viewBox="0 0 24 25" fill="none"
                                                                xmlns="http://www.w3.org/2000/svg">
                                                                <path
                                                                    d="M7 21.7622C6.45 21.7622 5.97933 21.5665 5.588 21.1752C5.19667 20.7839 5.00067 20.3129 5 19.7622V6.76221H4V4.76221H9V3.76221H15V4.76221H20V6.76221H19V19.7622C19 20.3122 18.8043 20.7832 18.413 21.1752C18.0217 21.5672 17.5507 21.7629 17 21.7622H7ZM17 6.76221H7V19.7622H17V6.76221ZM9 17.7622H11V8.76221H9V17.7622ZM13 17.7622H15V8.76221H13V17.7622Z"
                                                                    fill="#F00D0D" />
                                                            </svg>

                                                            <span @click="deleteCustomer(customer.customer_id)"
                                                                class="text-[13px] hover:text-white  cursor-pointer">Delete</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                            <!-- End Of Edit and Delete Option Customer Modal  -->

                                        </td>
                                    </tr>
                                      <!-- Display message if no customers are found -->
                                      <tr v-else>
                                        <td colspan="7" class="py-4 text-center text-gray-500 text-xl font-semibold">
                                            No customers found.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                          <!-- Start of Pages -->
                <div
                    class=" flex justify-center  mt-3">
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
        
        <!-- Start Of Add Customer Modal -->
        <section v-if="showAddCustomerModal" @click.self="closeAddCustomerModal"
            class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-10 ">
            <div class="bg-white lg:w-[70%] xl:w-[70%]  w-full relative border py-2  rounded-lg">
                <div class="flex pb-3 border-b mx-3 border-gray-300">
                    <h3 class="text-gray-800 mt-1  font-bold  flex-1">ADD CUSTOMER</h3>
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
                <form novalidate @submit.prevent="send()" class="mx-3 mt-3">
                    <div class="lg:flex xl:flex justify-center mb-2">
                        <div class="w-full mr-10">
                            <label>Firstname</label>
                            <input v-model="firstname" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="w-full mr-10">
                            <label>Lastname</label>
                            <input v-model="lastname" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="w-full ">
                            <label>Gender</label>
                            <select v-model="gender" name="gender" id="gender"
                                class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-lg ">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                    <div class="lg:flex xl:flex justify-center">
                        <div class="w-full mr-10">
                            <label>Alias/comment</label>
                            <input v-model="alias" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="lg:w-[46%] xl:w-[46%]">
                            <label>Email</label>
                            <input v-model="email" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="email">
                        </div>
                    </div>
                    <div class="lg:flex xl:flex justify-center mb-2">
                        <div class="w-full mr-10">
                            <label>Date of Birth</label>
                            <input v-model="date_of_birth"
                                class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="date">
                        </div>
                        <div class="w-full mr-10">
                            <label>Mobile 1</label>
                            <input v-model="mobile1" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="tel">
                        </div>
                        <div class="w-full">
                            <label>Mobile 2</label>
                            <input v-model="mobile2" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="tel">
                        </div>
                    </div>
                    <div class="lg:flex xl:flex justify-center mb-2">
                        <div class="w-full mr-10">
                            <label>House Number</label>
                            <input v-model="house_number"
                                class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="number">
                        </div>
                        <div class="w-full mr-10">
                            <label>Purok/Sitio</label>
                            <input v-model="sitio" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="w-full">
                            <label>Barangay</label>
                            <input v-model="barangay" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                    </div>
                    <div class="lg:flex xl:flex justify-center mb-2">
                        <div class="w-full mr-10">
                            <label>City</label>
                            <input v-model="city" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="w-full">
                            <label>Province</label>
                            <select v-model="province" name="province" id="province"
                                class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-lg ">
                                <option v-for="province in provinces" :key="province.name" :value="province.name">
                                    {{ province.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="mt-1 w-full flex justify-end">
                        <button type="submit" class="lg:w-[20%]  xl:w-[20%] mr-2 w-full bg-[#4E95C9] p-1 rounded-md">{{
                            save }}</button>
                    </div>
                </form>
            </div>
        </section>
        <!-- End Of Add Customer Modal -->


        <!-- Start Of Edit Customer Modal -->
        <section v-if="showEditCustomerModal" @click.self="closeEditCustomerModal"
            class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-10 ">
            <div class="bg-white lg:w-[70%] xl:w-[70%]  w-full relative border py-2  rounded-lg">
                <div class="flex pb-3 border-b mx-3 border-gray-300">
                    <h3 class="text-gray-800 mt-1  font-bold  flex-1">EDIT CUSTOMER</h3>
                    <svg @click="closeEditCustomerModal" xmlns="http://www.w3.org/2000/svg"
                        class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>
                </div>
                <form @submit.prevent="edit()" class="mx-3 mt-3">
                    <div class="lg:flex xl:flex justify-center mb-2">
                        <div class="w-full mr-10">
                            <label>Firstname</label>
                            <input v-model="firstname" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="w-full mr-10">
                            <label>Lastname</label>
                            <input v-model="lastname" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="w-full ">
                            <label>Gender</label>
                            <select v-model="gender" name="gender" id="gender"
                                class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-lg ">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                    <div class="lg:flex xl:flex justify-center">
                        <div class="w-full mr-10">
                            <label>Alias/comment</label>
                            <input v-model="alias" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="lg:w-[46%] xl:w-[46%]">
                            <label>Email</label>
                            <input v-model="email" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="email">
                        </div>
                    </div>
                    <div class="lg:flex xl:flex justify-center mb-2">
                        <div class="w-full mr-10">
                            <label>Date of Birth</label>
                            <input v-model="date_of_birth"
                                class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="date">
                        </div>
                        <div class="w-full mr-10">
                            <label>Mobile 1</label>
                            <input v-model="mobile1" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="tel">
                        </div>
                        <div class="w-full">
                            <label>Mobile 2</label>
                            <input v-model="mobile2" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="tel">
                        </div>
                    </div>
                    <div class="lg:flex xl:flex justify-center mb-2">
                        <div class="w-full mr-10">
                            <label>House Number</label>
                            <input v-model="house_number"
                                class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="number">
                        </div>
                        <div class="w-full mr-10">
                            <label>Purok/Sitio</label>
                            <input v-model="sitio" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="w-full">
                            <label>Barangay</label>
                            <input v-model="barangay" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                    </div>
                    <div class="lg:flex xl:flex justify-center mb-2">
                        <div class="w-full mr-10">
                            <label>City</label>
                            <input v-model="city" class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="w-full">
                            <label>Province</label>
                            <select v-model="province" name="province" id="province"
                                class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-lg ">
                                <option v-for="province in provinces" :key="province.name" :value="province.name">
                                    {{ province.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="mt-2 w-full flex justify-end">
                        <button type="submit" class="lg:w-[20%]  xl:w-[20%] mr-2 w-full bg-[#4E95C9] p-1 rounded-md">{{
                            save }}</button>
                    </div>
                </form>
            </div>
        </section>
        <!-- End Of Edit Customer Modal -->

        <footerComponent/>

    </main>
</template>