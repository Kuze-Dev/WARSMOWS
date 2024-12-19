<script setup>
import footerComponent from '../components/footerComponent.vue';
import headerComponent from '../components/headerComponent.vue';
import { useAuthStore } from '../stores/store';
import Swal from 'sweetalert2';
import { useToast } from "vue-toastification";
import axios from '../../axios';
import { ref, onMounted, watch,onUnmounted } from 'vue';

const firstName = ref('');
const middleName = ref('');
const lastName = ref('');
const contact = ref('');
const email = ref('');
const gender = ref('')
const accountType = ref('');
const address = ref('');
const username = ref('');
const password = ref('');
const profile = ref('');
const retypePassword = ref('');
const status = ref('Active');

const toast = useToast();



// Toggle For Show and Hide Password
const showPassword = ref(false);
const showRetypePassword = ref(false);

// Method to toggle the password visibility
const toggleShowPassword = () => {
    showPassword.value = !showPassword.value;
};

// Method to toggle the retype password visibility
const toggleShowRetypePassword = () => {
    showRetypePassword.value = !showRetypePassword.value;
};



const previewUrl = ref(defaultImageUrl); // For image preview
const defaultImageUrl = '../src/assets/default-image.png';


// For Add Modal
const showAddModal = ref(false);

const openAddModal = () => {
    showAddModal.value = !showAddModal.value;
}

const closeAddModal = () => {
    showAddModal.value = !showAddModal.value;
    resetForm();
}



// Function to reset all form fields and preview URL - it will reset when I close the modal
const resetForm = () => {
    firstName.value = '';
    middleName.value = '';
    lastName.value = '';
    contact.value = '';
    email.value = '';
    gender.value = '';
    accountType.value = '';
    address.value = '';
    username.value = '';
    password.value = '';
    profile.value = '';
    previewUrl.value = defaultImageUrl;
    retypePassword.value = '';
}



const store = useAuthStore();
const users = ref([]);
// const filteredUsers = ref([]);


const fetchData = async () => {
    // console.log(store.token);
    // console.log(users.value);
    // console.log(response);
    await axios.get(`/user?page=${currentPage.value}&limit=${perPage}&search=${searchQuery.value}`, {
        headers: {
            Authorization: `Bearer ${store.token}`
        }
    }).then((response) => {
        users.value = Array.isArray(response.data.Users) ? response.data.Users : [];
        Totalusers.value = response.data.Totalusers;
        currentPage.value = response.data.currentPage;
        perPage.value = response.data.perPage;


        // After fetching data, check if the current page is empty
        if (users.value.length === 0 && currentPage.value > 1) {
            // If the page is empty, go to the previous page
            currentPage.value--;
            fetchData(); // Fetch users for the updated page
        }


    }).catch((err) => {
        console.log("error", err);
    });

}




const handleProfile = (event) => {
    profile.value = event.target.files[0];
    if (profile.value) {

        // Create a temporary URL for the file to display it in the preview
        previewUrl.value = URL.createObjectURL(profile.value);
    }

}

const handleProfileChange = (event) => {
    profile.value = event.target.files[0];
    if (profile.value) {

        // Create a temporary URL for the file to display it in the preview
        previewUrl.value = URL.createObjectURL(profile.value);
    }

}

let save = ref('Save');

const send = async () => {
    save.value = 'Sending';
    const userData = {
        firstName: firstName.value,
        middleName: middleName.value,
        lastName: lastName.value,
        contact: contact.value,
        email: email.value,
        gender: gender.value,
        accountType: accountType.value,
        address: address.value,
        username: username.value,
        password: password.value,
        retypePassword: retypePassword.value,
        profile: profile.value,
        status:status.value,
    }
   
    try {
        const response = await axios.post('/user', userData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'Authorization': `Bearer ${store.token}`  // Add the Bearer token here
            }
        });
        setTimeout(() => {
            save.value = 'Save';
            console.log(response.data)
            if (response.data.msg) {
                toast.error(response.data.msg);
                return
            }
            if (response.data.success) {
                console.log(response.data.message);
                Swal.fire('Success!', response.data.message, 'success');
                closeAddModal();
                fetchData();
            } else {

                toast.error(response.data.errors[0].msg);
            }
        }, 2000);
    } catch (error) {
        alert(error.response.data.errors[0].msg); // Log the error response
        save.value = 'Save';

    }
}


const currentPage = ref(0);
const perPage = ref(0)
const Totalusers = ref(0); // To track total customers for pagination
const searchQuery = ref('');



const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        fetchData();
    }
};

const goToNextPage = () => {
    const totalPages = Math.ceil(Totalusers.value / perPage.value);
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchData();
    }
};






const showOptionModal = ref(false);
const selectedId = ref(false); // Initialize with null or undefined to keep it consistent

// Function to open or close the modal
const openOptionModal = (id) => {
  if (showOptionModal.value && selectedId.value === id) {
    closeOptionModal(); // Close if clicked again
  } else {
    showOptionModal.value = true;
    selectedId.value = id;
    document.addEventListener("mousedown", handleClickOutside);
  }
};

// Function to close the modal and clean up event listeners
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

// Clean up event listener when component unmounts
onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});


// Edit Modal

const showEditModal = ref(false);

const openEditModal = async (id) => {
    showEditModal.value = !showEditModal.value;
    selectedId.value = id;
    // alert(id);

    // Fetch the user data to populate the form fields
    const user = users.value.find(user => user.user_id === id);
    if (user) {
        firstName.value = user.firstName;
        middleName.value = user.middleName;
        lastName.value = user.lastName;
        contact.value = user.contact;
        email.value = user.email;
        gender.value = user.gender;
        accountType.value = user.accountType;
        address.value = user.address;
        username.value = user.username;
    }
};

const closeEditModal = () => {
    showEditModal.value = !showEditModal.value;
    resetForm();
}



const edit = async () => {

    const userId = selectedId.value;
    // alert(userId);  

    save.value = 'Sending';

    const userData = {
        firstName: firstName.value,
        middleName: middleName.value,
        lastName: lastName.value,
        contact: contact.value,
        email: email.value,
        gender: gender.value,
        accountType: accountType.value,
        address: address.value,
        username: username.value,
        password: password.value,
        retypePassword: retypePassword.value,
        profile: profile.value
    }
   
    try {
        const response = await axios.put(`/user/${userId}`, userData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'Authorization': `Bearer ${store.token}`  // Add the Bearer token here
            }
        });
        setTimeout(() => {
            save.value = 'Save';
            if (response.data.msg) {
                toast.error(response.data.msg);
                return
            }
            if (response.data.success) {
                Swal.fire('Success!', response.data.message, 'success');
                closeEditModal();
                fetchData();

                // alert(userId);
            } else {
                toast.error(response.data.errors[0].msg);

            }
        }, 2000);
    } catch (error) {
        console.error(error);
        save.value = 'Save';
        msg.value = 'An error occurred while updating the user.';
    }
}


//Status
const statusResponse = ref();
const btnStatus1 = (id) => {

    const data = {
        status: 'Active'
    };

    axios.put(`/user/status/${id}`, data, {
        headers: {
            'Authorization': `Bearer ${store.token}`
        }
    }).then((response) => {
        if (statusResponse.value = response.data.success) {
            console.log(statusResponse.value);
            fetchData();
        } else {
            statusResponse.value = response.data.failed;
            console.log(statusResponse.value)
        }
    })


}

const btnStatus2 = (id) => {
    const data = {
        status: 'Inactive'
    }
    axios.put(`/user/status/${id}`, data, {
        headers: {
            'Authorization': `Bearer ${store.token}`
        }
    }).then((response) => {
        if (statusResponse.value = response.data.success) {
            console.log(statusResponse.value);
            fetchData();
        } else {
            statusResponse.value = response.data.failed;
            console.log(statusResponse.value)
        }
    })

}

//Delete
const deleteUser = (id) => {
// alert(id);
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
            axios.delete(`/user/${id}`, {
                headers: {
                    'Authorization': `Bearer ${store.token}` // Include the Bearer token in headers
                }
            }).then((response) => {
                if (response.data.success) {
                    // console.log(response.data.message);
                    Swal.fire(
                        'Deleted!',
                        response.data.message,
                        'success'
                    );
                    fetchData();
                } else {
                    // alert(response.data.failed)
                    Swal.fire(
                        'Failed!',
                        response.data.failed,
                        'error'
                    );
                }
            });
        }
    });
}

onMounted(fetchData);

</script>

<template>
    <main class="lg:w-[1200px] xl:w-[1310px] w-full lg:h-screen   xl:h-screen h-[680px]  overflow-y-auto">
        <headerComponent />
        <div class=" flex justify-center w-full ">
            <section class="border  lg:w-[95%] xl:w-[96%] w-[90%] h-[775px] lg:h-[732px] xl:h-[733px] shadow-md mt-7 rounded-md">
                <div class="flex mt-2 mx-7">
                    <img class="w-[25px] h-7 mt-2  mr-2" src="../assets/manageaccounticon.png" alt="">
                    <span class="mt-3 font-bold">MANAGE ACCOUNT</span>
                </div>
                <div class="mt-5 mx-3 mb-5">
                    <div class="border-b   w-full"></div>
                </div>

                <div class="mx-3  lg:flex xl:flex pb-4">
                    <!-- Start Of Add New Button -->
                    <div>
                        <button @click="openAddModal"
                            class="bg-[rgb(78,149,201)] border  shadow-md mr-7 h-10 mt-1   hover:text-white font-semibold px-4 py-1  rounded-md"><i
                                class="fas fa-plus mr-2 "></i><span>Add New</span></button>
                    </div>
                    <!-- End of Add New Button -->

                    <!-- Start of Search Input and Button -->
                    <div class="xl:flex lg:flex md:block pt-1  relative ml-auto ">
                        <div class="flex rounded-md  shadow-md border border-black overflow-hidden      font-[sans-serif]">
                            <input v-model="searchQuery" @input="fetchData" type="search" placeholder="Search ..."
                                class="outline-none  w-full  bg-white text-gray-600 text-sm    px-2 py-2    " />
                            <button type='button' class="flex  items-center justify-center border-black  border-l px-5">
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
                    <div class="w-full  h-[270px]">
                        <div class="font-[sans-serif] overflow-x-auto border pb-[88px] h-[532px]">
                            <table class=" w-full border-t border-gray-300  bg-[#4E95C9]">
                                <thead class="whitespace-nowrap border-gray-300 border-b">
                                    <tr>
                                        <th class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            #
                                        </th>
                                        <th
                                            class="px-[100px] py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th class="px-4 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            USERNAME
                                        </th>
                                        <th class="px-4 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            EMAIL
                                        </th>
                                        <th class="px-4 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            CONTACT
                                        </th>
                                        <th class="px-4 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            ADDRESS
                                        </th>
                                        <th
                                            class="px-4 py-4 text-center text-xs font-semibold  uppercase tracking-wider">
                                            ROLE
                                        </th>
                                        <th
                                            class="px-4 py-4 text-center text-xs font-semibold  uppercase tracking-wider">
                                            STATUS
                                        </th>
                                        <th
                                            class="px-14  py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            ACTION
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white  whitespace-nowrap">
                                    <tr class="border-b border-gray-300" v-if="users.length > 0" v-for="(user, index) in users"
                                        :key="user.user_id">
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ (currentPage - 1) * perPage + (index + 1) }}
                                        </td>
                                        <td class="flex w-full mx-9  justify-center items-center">
                                            <div class="h-12 w-[30%] mt-2 mr-2 rounded-full overflow-hidden">
                                                <img :src="`../src/assets/uploads/${user.profile}`"
                                                    class="h-full w-full object-cover" alt="">
                                            </div>
                                            <div class="mx-2 text-sm mt-[6%] text-gray-800 w-full">
                                                <span class="mr-1">{{ user.firstName }}</span>
                                                <span>{{ user.lastName }}</span>
                                            </div>

                                        </td>
                                        <td class="px-4 py-4 text-sm text-gray-800">
                                            {{ user.username }}
                                        </td>
                                        <td class="px-4 py-4 text-sm text-gray-800">
                                            {{ user.email }}
                                        </td>
                                        <td class="px-4 py-4 text-sm text-gray-800">
                                            {{ user.contact }}
                                        </td>
                                        <td class="px-4 py-4 text-sm text-gray-800">
                                            {{ user.address }} </td>
                                        <td class="px-4 py-4 ">
                                            <span
                                                :class="user.accountType == 'Admin' ? 'text-sm font-[sans-serif] bg-blue-600 block text-white text-center  px-4 py-2 rounded-full' : user.accountType == 'POS User' ? 'text-sm block text-center bg-green-600 text-white px-4 py-2 rounded-full' : user.accountType == 'Delivery Boy' ? 'text-sm block text-center bg-orange-600 text-white px-4 py-2 rounded-full' : ''">
                                                {{ user.accountType }}
                                            </span>
                                            </td>
                                          <td class="px-4 py-4 text-sm text-gray-800">
    <span
        :class="user.status === 'Inactive' ? 'bg-red-500 text-white font-[sans-serif] text-sm rounded-full px-6 py-2 min-w-[80px] inline-block text-center' : 'bg-green-500 text-white font-[sans-serif] text-sm rounded-full px-7 py-2 min-w-[80px] inline-block text-center'">
        {{ user.status }}
    </span>
</td>



                                        <td class="px-4 py-4 text-sm text-gray-800  ">

                                            <!--Start Of Option Icon -->
                                            <svg  class="mx-auto cursor-pointer" @click="openOptionModal(user.user_id)"
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
                                            <!-- End of Option Icon -->

                                            <!-- Modal for Edit, Status, and Delete Option Modal -->
  <section
    :class="showOptionModal && selectedId === user.user_id?'modal-content relative font-[sans-serif] mx-2 right-[21px]':''"
    v-show="selectedId === user.user_id">
    <div
      v-for="(user, index) in users"
      :key="user.user_id"
      v-show="selectedId === user.user_id" 
      class="w-[116px] max-w-sm rounded h-[100px] bg-[#4E95C9] border shadow-md absolute"
    >
      <div class="flex flex-wrap">
        <div class="mx-5 flex justify-center items-center mt-2 pb-1">
          <svg class="mr-2" width="17" height="24" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13.125 5.76228L15.75 8.26228M11.375 17.4289H18.375M4.375 14.0956L3.5 17.4289L7 16.5956L17.1378 6.94061C17.4658 6.62807 17.6501 6.20422 17.6501 5.76228C17.6501 5.32034 17.4658 4.89649 17.1378 4.58395L16.9872 4.44061C16.6591 4.12816 16.214 3.95264 15.75 3.95264C15.286 3.95264 14.8409 4.12816 14.5128 4.44061L4.375 14.0956Z"
              stroke="#555555"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="text-[13px] hover:text-white cursor-pointer" @click="openEditModal(user.user_id)">Edit</span>
        </div>

        <!-- Border bottom -->
        <div class="border-b w-full"></div>

        <div class="mx-4 flex justify-center items-center mt-1 mb-1">
          <i v-show="user.status == 'Active'" class="fas fa-circle text-red-500 text-sm px-1 mr-2"></i>
          <i v-show="user.status != 'Active'" class="fas fa-circle text-green-500 text-sm px-1 mr-2"></i>

          <span
            v-show="user.status != 'Active'"
            @click="btnStatus1(user.user_id)"
            class="text-[13px] hover:text-white cursor-pointer"
            >Activate</span
          >
          <span
            v-show="user.status == 'Active'"
            @click="btnStatus2(user.user_id)"
            class="text-[13px] hover:text-white cursor-pointer"
            >Deactivate</span
          >
        </div>
        <!-- Border bottom -->
        <div class="border-b w-full"></div>

        <div class="mx-4 flex justify-center items-center mt-1">
          <svg
            class="ml-1 mr-2"
            width="17"
            height="28"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 21.7622C6.45 21.7622 5.97933 21.5665 5.588 21.1752C5.19667 20.7839 5.00067 20.3129 5 19.7622V6.76221H4V4.76221H9V3.76221H15V4.76221H20V6.76221H19V19.7622C19 20.3122 18.8043 20.7832 18.413 21.1752C18.0217 21.5672 17.5507 21.7629 17 21.7622H7ZM17 6.76221H7V19.7622H17V6.76221ZM9 17.7622H11V8.76221H9V17.7622ZM13 17.7622H15V8.76221H13V17.7622Z"
              fill="#F00D0D"
            />
          </svg>
          <span @click="deleteUser(user.user_id)" class="text-[13px] hover:text-white cursor-pointer">Delete</span>
        </div>
      </div>
    </div>
  </section>
  <!-- End of Option Modal -->
                                        </td>
                                    </tr>
                                    <!-- Display message if no users are found -->
                                    <tr v-else>
                                        <td colspan="12" class="py-4 text-center text-gray-500 text-xl font-semibold">
                                            No users data found.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                         <!-- Start of Pages -->
                <div class=" flex justify-center mt-3">
                    <!-- Start Of Previous Page -->
                    <svg @click="goToPreviousPage" class="bg-gray-200 border-l rounded-l-full cursor-pointer" width="40" height="30"
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
                    <svg @click="goToNextPage" class="bg-gray-200 border-r rounded-r-full cursor-pointer" width="40" height="30"
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
                <!-- End of The Table -->


               
            </section>
        </div>


        <!-- Start of Add New Modal -->
        <section v-if="showAddModal" @click.self="closeAddModal"
            class="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full  before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]  z-10">
            <div class="lg:w-[70%] xl:w-[70%]  w-full  bg-white rounded-lg py-2 relative lg:pb-2 xl:pb-2 pb-4 ">

                <div class="flex pb-3 border-b border-black  ">
                    <h3 class="text-gray-800 mt-1  font-bold mx-3 flex-1">ADD NEW USER</h3>
                    <svg @click="closeAddModal" xmlns="http://www.w3.org/2000/svg"
                        class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>
                </div>

                <section class="w-full flex justify-center ">
                    <!-- Start of Form -->
                    <form novalidate id="form" name="form" @submit.prevent="send()" class="w-full">
                        <div class="px-2 w-full lg:flex xl:flex md:block">
                            <div class="w-full ">
                                <div class="lg:flex xl:flex md:block mt-3 justify-center w-full">

                                    <div class="w-full mr-1">
                                        <label>FIRSTNAME</label>
                                        <input v-model="firstName"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="text">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>MIDDLE NAME</label>
                                        <input v-model="middleName"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="text">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>LAST NAME</label>
                                        <input v-model="lastName"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="text">
                                    </div>
                                </div>
                                <div class="lg:flex xl:flex md:block mt-3   justify-center">
                                    <div class="w-full mr-1">
                                        <label>CONTACT NO.</label>
                                        <input v-model="contact"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="tel">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>EMAIL</label>
                                        <input v-model="email"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                            type="email">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>GENDER</label>
                                        <select name="gender" id="gender" v-model="gender"
                                            class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-lg ">
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="lg:flex xl:flex md:block mt-3  justify-center">
                                    <div class="w-full lg:w-1/2 mr-1 mb-2">
                                        <label>ACCOUNT TYPE</label>
                                        <select name="accounType" id="accountType" v-model="accountType"
                                            class="w-full bg-white  border  border-black py-2 px-3 h-[34px] shadow-md rounded-lg outline-none ">
                                            <option value="" disabled>Select Account Type</option>
                                            <option value="Admin">Admin</option>
                                            <option value="POS User">POS User</option>
                                            <option value="Delivery Boy">Delivery Boy</option>
                                        </select>


                                    </div>
                                    <div class="w-full mr-1">
                                        <label>ADDRESS (<span
                                                class="text-sm">No.,Purok,Street,Barangay,City</span>)</label>
                                        <input v-model="address"
                                            class="border border-black block w-full  px-2 py-1 shadow-md rounded-md mb-2"
                                            type="location">
                                    </div>
                                </div>
                            </div>

                            <div class=" md:w-1/3  mt-3  flex justify-center">
                                <div class="lg:w-full xl:w-full w-[80%]  ">
                                    <h1 class="text-center">PREVIEW</h1>
                                    <div class=" py-2 mx-3  ">
                                        <!-- Browse Profile -->
                                        <div
                                            class="bg-white shadow-md  text-gray-500 font-semibold text-base rounded max-w-md h-[150px] flex flex-col items-center justify-center  border-2  border-gray-300    font-[sans-serif]">
                                            <img v-if="previewUrl" :src="previewUrl"
                                                class="lg:h-full xl:h-full h-[100%] lg:w-full xl:w-full w-full   "
                                                alt="">
                                        </div>
                                    </div>
                                    <!-- End of Browse Profile -->

                                    <!-- Start of Browse Button -->
                                    <div class="flex justify-center mt-2 mb-3">
                                        <input @change="handleProfile" name="file" type="file" id='file'
                                            accept="image/*" class="hidden" />

                                        <label for="file" name="file"
                                            class="block px-6 py-2.5 rounded-full   tracking-wider font-semibold border outline-none cursor-pointer  bg-[#4E95C9]">Browse
                                        </label>
                                    </div>
                                    <!-- End of Browse Button -->

                                </div>


                            </div>
                        </div>

                        <div class="border-b border-black">

                        </div>
                        <div class="mx-3 mt-2 lg:flex xl:flex md:block justify-center">
                            <div class=" w-full mr-1">
                                <label>Username</label>
                                <input v-model="username"
                                    class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                    autocomplete="username" type="text">
                            </div>
                            <div class="w-full mr-1">
                                <label>Password</label>
                                <div class="relative">
                                    <input v-model="password" :type="showPassword ? 'text' : 'password'"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2 pr-8"
                                        autocomplete="new-password" type="password">
                                    <i v-if="password.length > 0"
                                        :class="showPassword ? 'fa fa-eye' : 'fa fa-eye-slash'"
                                        class="absolute right-2 top-2 cursor-pointer" @click="toggleShowPassword"></i>
                                </div>
                            </div>
                            <div class="w-full mr-1">
                                <label>Re-type Password</label>
                                <div class="relative">
                                    <input v-model="retypePassword" :type="showRetypePassword ? 'text' : 'password'"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2 pr-8"
                                        autocomplete="new-password" type="password">
                                    <i v-if="retypePassword.length > 0"
                                        :class="showRetypePassword ? 'fa fa-eye' : 'fa fa-eye-slash'"
                                        class="absolute top-2 right-2 cursor-pointer"
                                        @click="toggleShowRetypePassword"></i>
                                </div>
                            </div>
                            <div class="w-full flex items-center  mt-4">
                                <button type="submit" class="w-full  bg-[#4E95C9] border  shadow-md rounded-md lg:mx-2 xl:mx-2 py-1"><i
                                        class="fas fa-check mr-1"></i>{{
                                            save }}</button>
                            </div>
                        </div>
                    </form>
                    <!-- End of Form -->
                </section>
            </div>
        </section>
        <!-- End of Add Modal -->

        <!-- Start of Edit Modal -->
        <section v-if="showEditModal" @click.self="closeEditModal"
            class="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full  before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]  z-10">
            <div class="w-[1000px] bg-white shadow-lg rounded-lg py-2 lg:pb-2 xl:pb-2 pb-4  relative ">
                <div class="flex pb-3 border-b border-black">
                    <h3 class="text-gray-800 mt-1  font-bold mx-3 flex-1">EDIT NEW USER</h3>
                    <svg @click="closeEditModal" xmlns="http://www.w3.org/2000/svg"
                        class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>
                </div>

                <section class="w-full flex justify-center ">
                    <!-- Start of Form -->
                    <form @submit.prevent="edit()" class="w-full">
                        <div class="px-2 w-full lg:flex xl:flex md:block">
                            <div class="w-full ">
                                <div class="lg:flex xl:flex md:block mt-3 justify-center w-full">

                                    <div class="w-full mr-1">
                                        <label>FIRSTNAME</label>
                                        <input v-model="firstName"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="text">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>MIDDLE NAME</label>
                                        <input v-model="middleName"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="text">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>LAST NAME</label>
                                        <input v-model="lastName"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="text">
                                    </div>
                                </div>
                                <div class="lg:flex xl:flex md:block mt-3   justify-center">
                                    <div class="w-full mr-1">
                                        <label>CONTACT NO.</label>
                                        <input v-model="contact"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="tel">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>EMAIL</label>
                                        <input v-model="email"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                            type="email">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>GENDER</label>
                                        <select name="gender" id="gender" v-model="gender"
                                            class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-lg ">
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="lg:flex xl:flex md:block mt-3  justify-center">
                                    <div class="w-full lg:w-1/2 mr-1 mb-2">
                                        <label>ACCOUNT TYPE</label>
                                        <select name="accounType" id="accountType" v-model="accountType"
                                            class="w-full bg-white  border border-black  py-2 px-3 h-[34px] shadow-md rounded-lg outline-none ">
                                            <option value="" disabled>Select Account Type</option>
                                            <option value="Admin">Admin</option>
                                            <option value="POS User">POS User</option>
                                            <option value="Delivery Boy">Delivery Boy</option>
                                        </select>
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>ADDRESS (<span
                                                class="text-sm">No.,Purok,Street,Barangay,City</span>)</label>
                                        <input v-model="address"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                            type="location">
                                    </div>
                                </div>
                            </div>

                            <div class=" md:w-1/3  mt-3   flex justify-center">
                                <div class="lg:w-full xl:w-full w-[80%]  ">
                                    <h1 class="text-center">PREVIEW</h1>
                                    <div class=" py-2 mx-3  ">
                                        <!-- Browse Profile -->
                                        <div
                                            class="bg-white shadow-md text-gray-500 font-semibold  text-base rounded max-w-md h-[150px] flex flex-col items-center justify-center  border-2  border-gray-300    font-[sans-serif]">
                                            <img v-if="previewUrl" :src="previewUrl"
                                                class="lg:h-full xl:h-full h-[100%] lg:w-full xl:w-full w-full   "
                                                alt="">
                                        </div>
                                    </div>
                                    <!-- End of Browse Profile -->

                                    <!-- Start of Browse Button -->
                                    <div class="flex justify-center mt-2 mb-3 ">
                                        <input @change="handleProfileChange" name="file" type="file" id='file'
                                            accept="image/*" class="hidden" />

                                        <label for="file" name="file"
                                            class="block px-6 py-2.5 rounded-full   tracking-wider font-semibold border shadow-md outline-none cursor-pointer  bg-[#4E95C9]">Browse
                                        </label>
                                    </div>
                                    <!-- End of Browse Button -->

                                </div>


                            </div>
                        </div>

                        <div class="border-b border-black">
                            <span class="font-semibold  block w-full mx-2 mb-2">CHANGE PASSWORD</span>
                        </div>
                        <div class="mx-3 mt-2 lg:flex xl:flex md:block justify-center">
                            <div class=" w-full mr-1">
                                <label>Username</label>
                                <input v-model="username"
                                    class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                    autocomplete="username" type="text">

                            </div>
                            <div class="w-full mr-1">
                                <label>New Password</label>
                                <div class="relative">
                                    <input v-model="password" :type="showPassword ? 'text' : 'password'"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2 pr-9"
                                        autocomplete="new-password" type="password">
                                    <i v-if="password.length > 0"
                                        :class="showPassword ? 'fa fa-eye' : 'fa fa-eye-slash'"
                                        class="absolute right-2 top-2 cursor-pointer" @click="toggleShowPassword"></i>
                                </div>
                            </div>
                            <div class="w-full mr-1">
                                <label>Re-type Password</label>
                                <div class="relative">
                                    <input v-model="retypePassword" :type="showRetypePassword ? 'text' : 'password'"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2 pr-9"
                                        autocomplete="new-password" type="password">
                                    <i v-if="retypePassword.length > 0"
                                        :class="showRetypePassword ? 'fa fa-eye' : 'fa fa-eye-slash'"
                                        class="absolute top-2 right-2 cursor-pointer"
                                        @click="toggleShowRetypePassword"></i>
                                </div>
                            </div>
                            <div class="w-full flex items-center  mt-4">
                                <button type="submit" class="w-full  bg-[#4E95C9] border shadow-md  rounded-md lg:mx-2 xl:mx-2 py-1"><i
                                        class="fas fa-check mr-1"></i>{{
                                            save }}</button>
                            </div>
                        </div>
                    </form>
                    <!-- End of Form -->
                </section>
            </div>
        </section>
        <!-- End of Edit Modal -->

        <footerComponent class="mt-3" />

    </main>
</template>