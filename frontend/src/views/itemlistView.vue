<script setup>
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import { ref, onMounted, watch,onUnmounted } from 'vue';
import { useAuthStore } from '../stores/store';
import Swal from 'sweetalert2';
import { useToast } from "vue-toastification";
import axios from '../../axios';
import { format } from 'date-fns'; // Import fjhhfjdhgd date-fns for date formatting ghfhfh


const title = ref();
const type = ref('');
const pos_item = ref('');
const reorder = ref('');
const deliver = ref('');
const pick_up = ref('');
const buy = ref();
const image_item = ref();
const toast = useToast();


// Disable Deliver, Pick_up if Selected you Selected this ["Seal", "Filter", "Packaging", "Equipment"]
const isDisabled = ref(false);
// Disable POS ITEM Yes if Selected on this type ["Seal", "Filter", "Packaging", "Equipment"] 
const disablePosItem = ref(false);
const disableBuy = ref(false); // Disable Buy field

let count = 0;
watch(type, (newValue) => {
    const typesToDisable = ["Seal", "Filter", "Packaging", "Equipment"];
    const resettableTypes = ["Bottle", "Container"];

    if (typesToDisable.includes(newValue)) {
        isDisabled.value = true;
        disablePosItem.value = true;
        disableBuy.value = true; // Disable Buy field
        pos_item.value = 'No';
        deliver.value = ''; // Set deliver to 0 when disabled
        pick_up.value = ''; // Set pick_up to 0 when disabled
        buy.value = ''; // Set buy to 0 
    } else {
        isDisabled.value = false;
        disablePosItem.value = false;
        disableBuy.value = false; // Enable Buy field

        // Reset deliver, pick_up, and buy values if "Bottle" or "Container" is selected
        if (resettableTypes.includes(newValue)) {
            if (showAddItemModal.value) {
                deliver.value = ''; // Reset deliver value
                pick_up.value = ''; // Reset pick_up value
                buy.value = ''; // Reset buy value
            } else {
                count++;
            }
            if (count > 1) {
                deliver.value = ''; // Ensure reset happens only once
                pick_up.value = '';
                buy.value = '';
            }
        }
    }
});


const previewItemUrl = ref(defaultImageUrl); // For image preview
const defaultImageUrl = '../src/assets/default-image.png';

const resetForm = () => {
    title.value = '';
    type.value = '';
    pos_item.value = '';
    reorder.value = '';
    deliver.value = '';
    pick_up.value = '';
    buy.value = '';
    image_item.value = '';
    previewItemUrl.value = defaultImageUrl;

}

//Add New Item Modal
const showAddItemModal = ref(false);

const openAddItemModal = () => {
    showAddItemModal.value = !showAddItemModal.value;
}
const closeAddItemModal = () => {
    showAddItemModal.value = !showAddItemModal.value;
    resetForm();
}

const handleItemImage = (event) => {
    image_item.value = event.target.files[0];
    if (image_item.value) {

        // Create a temporary URL for the file to display it in the preview
        previewItemUrl.value = URL.createObjectURL(image_item.value);
    }
}

const save = ref('Save');

const sendItem = async () => {
    save.value = 'Sending';


    // Prepare item data
    const itemData = {
        title: title.value,
        type: type.value,
        pos_item: pos_item.value,
        reorder: reorder.value,
        deliver: isDisabled.value ? 0 : deliver.value, // Automatically set deliver
        pick_up: isDisabled.value ? 0 : pick_up.value, // Automatically set pick_up
        buy: disableBuy.value ? 0 : buy.value, // Automatically set buy
        image_item: image_item.value,
        isDisabled: isDisabled.value, // Add this line to include isDisabled
        disableBuy: disableBuy.value, // Add this line to include disableBuy
    };



    try {
        const response = await axios.post('/item', itemData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        });

        console.log(response.data);

        setTimeout(() => {
            save.value = 'Save';
            if (response.data.msg) {
                toast.error(response.data.msg);
                return
            }
            if (response.data.success) {
                Swal.fire('Success!', response.data.message, 'success');
                closeAddItemModal();
                fetchItemData();
            } else {
                toast.error(response.data.errors[0].msg);
            }
        }, 2000);
    } catch (error) {
        toast.error('An error occurred. Please try again.');
        save.value = 'Save';
    }
}


const store = useAuthStore();
const items = ref([]);

const fetchItemData = async () => {

    await axios.get(`/item?page=${currentPage.value}&limit=${perPage}&search=${searchQuery.value}`, {
        headers: {
            Authorization: `Bearer ${store.token}`
        }
    }).then((response) => {
        items.value = Array.isArray(response.data.Items) ? response.data.Items : [];
        Totalitems.value = response.data.Totalitems;
        currentPage.value = response.data.currentPage;
        perPage.value = response.data.perPage;

        // After fetching data, check if the current page is empty
        if (items.value.length === 0 && currentPage.value > 1) {
            // If the page is empty, go to the previous page
            currentPage.value--;
            fetchItemData(); // Fetch users for the updated page
        }


    })

}

//Pages
const currentPage = ref(0);
const perPage = ref(0); // Number of items per page
const Totalitems = ref(0);
//Search
const searchQuery = ref('');





const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        fetchItemData();
    }
};

const goToNextPage = () => {
    const totalPages = Math.ceil(Totalitems.value / perPage.value);
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchItemData();
    }
};

const showOptionItemModal = ref(false);
const selectedItemId = ref(false);
const openOptionItemModal = (id) => {
    if (showOptionItemModal.value && selectedItemId.value === id) {
    closeOptionItemModal(); // Close if clicked again
  } else {
    showOptionItemModal.value = true;
    selectedItemId.value = id;
    document.addEventListener("mousedown", handleClickOutside);
  }

}
// Function to close the modal and clean up event listeners
const closeOptionItemModal = () => {
  showOptionItemModal.value = false;
  document.removeEventListener("mousedown", handleClickOutside);
};

// Handle clicks outside the modal
const handleClickOutside = (event) => {
  const modal = document.querySelector(".modal-content"); // Class of your modal content div
  if (modal && !modal.contains(event.target)) {
    closeOptionItemModal();
  }
};



// Clean up event listener when component unmounts
onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});




const showEditItemModal = ref(false);
const openEditItemModal = (id) => {
    showEditItemModal.value = !showEditItemModal.value;
    selectedItemId.value = id;

    // Fetch the item data to populate the form fields
    const item = items.value.find(item => item.item_id === id);
    if (item) {
        title.value = item.title;
        type.value = item.type;
        pos_item.value = item.pos_item;
        reorder.value = item.reorder;

        deliver.value = item.deliver;
        pick_up.value = item.pick_up;
        // console.log(deliver.value)
        buy.value = item.buy;
        // image_item.value = item.image_item;

    }
}



const closeEditItemModal = () => {
    count = 0;
    showEditItemModal.value = !showEditItemModal.value;
    resetForm();

}

const handleChangeItemImage = (event) => {
    image_item.value = event.target.files[0];
    const file = image_item.value;
    if (file) {

        // Create a temporary URL for the file to display it in the preview
        previewItemUrl.value = URL.createObjectURL(file);
    }
}

const editItem = async () => {
    const itemId = selectedItemId.value;
    save.value = 'Sending';
    // alert(itemId);

    // Prepare item data
    const itemData = {
        title: title.value,
        type: type.value,
        pos_item: pos_item.value,
        reorder: reorder.value,
        deliver: isDisabled.value ? 0 : deliver.value, // Automatically set deliver
        pick_up: isDisabled.value ? 0 : pick_up.value, // Automatically set pick_up
        buy: disableBuy.value ? 0 : buy.value, // Automatically set buy
        image_item: image_item.value,
        isDisabled: isDisabled.value, // Add this line to include isDisabled
        disableBuy: disableBuy.value, // Add this line to include disableBuy
    };
    console.log(itemData);
    try {
        const response = await axios.put(`/item/${itemId}`, itemData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        });
        console.log(response.data);
        setTimeout(() => {
            save.value = 'Save';
            if (response.data.msg) {
                toast.error(response.data.msg);
                return
            }
            if (response.data.success) {
                Swal.fire('Success!', response.data.message, 'success');
                closeEditItemModal();
                fetchItemData();
            } else {
                toast.error(response.data.errors[0].msg);
            }
        }, 2000);
    } catch (error) {
        toast.error('An error occurred. Please try again.');
        save.value = 'Save';
    }
}

const deleteItem = (itemId) => {
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

            axios.delete(`/item/${itemId}`).then((response) => {
                if (response.data.success) {
                    Swal.fire('Success!', response.data.message, 'success');
                    fetchItemData();
                } else {
                    Swal.fire('Error!', response.data.message, 'error');
                }

            })
        }
    });
}


onMounted(fetchItemData);
</script>

<template>
    <main class="lg:w-[1200px] xl:w-[1310px] w-full lg:h-screen xl:h-screen h-[680px] overflow-y-auto">
        <headerComponent />
        <div class="flex justify-center w-full">
            <section class="border  lg:w-[95%] xl:w-[96%] w-[90%] h-[775px] lg:h-[732px] xl:h-[732px] shadow-md mt-7 rounded-md">
                <div class="flex  mt-2 mx-7">
                    <img class="w-[25px] h-7 mt-2  mr-2" src="../assets/itemlisticon1.png" alt="">
                    <span class="mt-3 font-bold">ITEM</span>
                </div>
                <div class="mt-5 mx-3 mb-5">
                    <div class="border-b  w-full"></div>
                </div>

                <div class="mx-3  lg:flex xl:flex pb-4 ">

                    <!-- Start Of Add Item Button -->
                    <div>
                        <button @click="openAddItemModal"
                            class="bg-[rgb(78,149,201)] border  shadow-md mr-7 h-10 mt-1   hover:text-white font-semibold px-4 py-1  rounded-md"><i
                                class="fas fa-plus mr-2 "></i><span>Add New Item</span></button>
                    </div>
                    <!-- End of Add Item Button -->

                    <!-- Start of Search Input and Button -->
                    <div class="xl:flex lg:flex md:block pt-1  relative ml-auto ">
                        <div class="flex rounded-md  shadow-md border border-black overflow-hidden      font-[sans-serif]">
                            <input type="search" @input="fetchItemData" v-model="searchQuery" placeholder="Search ..."
                                class="outline-none  w-full  bg-white text-gray-600 text-sm    px-2 py-2    " />
                            <button type='button' class="flex  items-center justify-center border-black border-l px-5">
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
                    <div class=" w-full  h-[270px]">
                        <div class="font-[sans-serif] overflow-x-auto overflow-y-hidden  border pb-[60px] h-[532px]">
                            <table class=" w-full bg-[#4E95C9]">
                                <thead class="whitespace-nowrap">
                                    <tr>
                                        <th class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            #
                                        </th>
                                        <th
                                            class="px-[100px] py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            ITEM
                                        </th>
                                        <th
                                            class="px-4  py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            <div class="text-center">TYPE</div>
                                        </th>
                                        <th class="px-4 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            POS ITEM
                                        </th>
                                        <th class="px-4 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            QUANTITY
                                        </th>
                                        <th class="px-4 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            DELIVER
                                        </th>
                                        <th class="px-4 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            PICK-UP
                                        </th>
                                        <th class="px-4 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            BUY
                                        </th>
                                        <th
                                            class="px-4 py-4 text-center text-xs font-semibold  uppercase tracking-wider">
                                            DATE
                                        </th>
                                        <th
                                            class="px-[45px] py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            ACTION
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white  whitespace-nowrap">
                                    <tr class="border-b border-gray-300" v-if="items.length > 0" v-for="(item, index) in items"
                                        :key="item.item_id">
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ (currentPage - 1) * perPage + (index + 1) }}                
                                                                    </td>
                                        <td class="flex w-full mx-9  justify-center items-center">
                                            <div class="h-12 w-[30%] mt-2 mr-2 rounded-full overflow-hidden">
                                                <img :src="`../src/assets/uploads/${item.image_item}`"
                                                    class="h-full w-full object-cover" alt="">
                                            </div>
                                            <div class="mx-2 text-sm mt-[6%] text-gray-800 w-full">
                                                <span class="mr-1">{{ item.title }}</span>
                                            </div>
                                        </td>
                                        <td class="px-4 py-6 mt-[6%] text-sm text-blue-500">
                                            <div class="bg-blue-100 px-3 py-1 rounded-full text-center">
                                                {{ item.type }}
                                            </div>
                                        </td>
                                        <td class="px-4 py-4 text-sm text-gray-800">
                                            <span
                                                :class="item.pos_item == 'Yes' ? ' text-green-800 bg-green-200 px-6 py-2 rounded-full' : 'text-red-800 bg-red-200 px-6 py-2 rounded-full'">{{
                                                    item.pos_item }}</span>

                                        </td>
                                        <td class="px-4 py-4 text-sm text-yellow-600">
                                            {{ item.reorder }}
                                        </td>
                                        <td class="px-4 py-4 text-sm text-green-600">
    <span :class="parseFloat(item.deliver) === 0 ? 'bg-gray-200 text-gray-800 px-6 py-2 rounded-full' : ''">
        {{ parseFloat(item.deliver) === 0 ? 'N/A' : `₱${parseFloat(item.deliver).toFixed(2)}` }}
    </span>
</td>

                                        <td class="px-4 py-4 text-sm text-blue-600">
    <span :class="parseFloat(item.pick_up) === 0 ? 'bg-gray-200 text-gray-800 px-6 py-2 rounded-full' : ''">
        {{ parseFloat(item.pick_up) === 0 ? 'N/A' : `₱${parseFloat(item.pick_up).toFixed(2)}` }}
    </span>
</td>

                                        <td class="px-4 py-4 text-sm text-green-800">
    <span :class="parseFloat(item.buy) === 0 ? 'bg-gray-200 text-gray-800 px-6 py-2 rounded-full' : ''">
        {{ parseFloat(item.buy) === 0 ? 'N/A' : `₱${parseFloat(item.buy).toFixed(2)}` }}
    </span>
</td>

                                       <td class="px-4 py-4 text-sm text-center">
                                       <span class="bg-orange-200 text-orange-800 px-2 py-2 rounded-full">
                                        {{ format(new Date(item.date_itemAdded), 'MMMM dd, yyyy') }}
                                        </span>
                                        </td>
                                        <td class="px-4 py-4">
                                            <!--Start Of Option Item Icon -->
                                            <svg @click="openOptionItemModal(item.item_id)"
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

                                            <!-- Start Of Edit and Delete Option Item Modal  -->
                                            <section  :class="showOptionItemModal && item.item_id === selectedItemId?'modal-content relative mx-2  font-[sans-serif] right-[14px]':'hidden' " v-show="item.item_id === selectedItemId"
                                               >
                                                <div v-for="(item, index) in items" :key="item.item_id"
                                                    v-show="item.item_id === selectedItemId"
                                                    class="w-[116px] max-w-sm rounded h-[75px]   bg-[#4E95C9]  border shadow-md absolute">
                                                    <div class="flex flex-wrap">

                                                        <div class="mx-5 flex justify-center items-center mt-2 pb-1">
                                                            <svg class="mr-2" width="17" height="24" viewBox="0 0 21 21"
                                                                fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path
                                                                    d="M13.125 5.76228L15.75 8.26228M11.375 17.4289H18.375M4.375 14.0956L3.5 17.4289L7 16.5956L17.1378 6.94061C17.4658 6.62807 17.6501 6.20422 17.6501 5.76228C17.6501 5.32034 17.4658 4.89649 17.1378 4.58395L16.9872 4.44061C16.6591 4.12816 16.214 3.95264 15.75 3.95264C15.286 3.95264 14.8409 4.12816 14.5128 4.44061L4.375 14.0956Z"
                                                                    stroke="#555555" stroke-width="2.5"
                                                                    stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                            <span class="text-[13px] hover:text-white cursor-pointer "
                                                                @click="openEditItemModal(item.item_id)">Edit</span>
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

                                                            <span @click="deleteItem(item.item_id)"
                                                                class="text-[13px] hover:text-white cursor-pointer">Delete</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                            <!-- End Of Edit and Delete Option Item Modal  -->

                                        </td>

                                    </tr>
                                    <!-- Display message if no items are found -->
                                    <tr v-else>
                                        <td colspan="12" class="py-4 text-center text-gray-500 text-xl font-semibold">
                                            No items available.
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                          <!-- Start of Pages -->
                <div class=" flex justify-center mt-3 ">
                    <!-- Start Of Previous Page -->
                    <svg @click="goToPreviousPage" class="bg-gray-200 border-l rounded-l-full cursor-pointer "
                        width="40" height="30" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M11.707 7.05451C11.8945 7.24203 11.9998 7.49634 11.9998 7.76151C11.9998 8.02667 11.8945 8.28098 11.707 8.4685L7.414 12.7615L11.707 17.0545C11.8892 17.2431 11.99 17.4957 11.9877 17.7579C11.9854 18.0201 11.8802 18.2709 11.6948 18.4563C11.5094 18.6417 11.2586 18.7469 10.9964 18.7492C10.7342 18.7515 10.4816 18.6507 10.293 18.4685L5.293 13.4685C5.10553 13.281 5.00021 13.0267 5.00021 12.7615C5.00021 12.4963 5.10553 12.242 5.293 12.0545L10.293 7.05451C10.4805 6.86703 10.7348 6.76172 11 6.76172C11.2652 6.76172 11.5195 6.86703 11.707 7.05451ZM17.707 7.05451C17.8945 7.24203 17.9998 7.49634 17.9998 7.76151C17.9998 8.02667 17.8945 8.28098 17.707 8.4685L13.414 12.7615L17.707 17.0545C17.8892 17.2431 17.99 17.4957 17.9877 17.7579C17.9854 18.0201 17.8802 18.2709 17.6948 18.4563C17.5094 18.6417 17.2586 18.7469 16.9964 18.7492C16.7342 18.7515 16.4816 18.6507 16.293 18.4685L11.293 13.4685C11.1055 13.281 11.0002 13.0267 11.0002 12.7615C11.0002 12.4963 11.1055 12.242 11.293 12.0545L16.293 7.05451C16.4805 6.86703 16.7348 6.76172 17 6.76172C17.2652 6.76172 17.5195 6.86703 17.707 7.05451Z"
                            fill="#555555" />
                    </svg>
                    <!-- End of Previous -->

                    <!-- Start of Current Page -->
                    <span class="bg-[#4E95C9] px-3 pt-1 hover:text-white">{{ currentPage }}</span>
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

                    </div>
                </section>

              
            </section>

        </div>
        <!-- Start Of Add New Item Modal -->
        <section v-if="showAddItemModal" @click.self="closeAddItemModal"
            class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-10 ">
            <div class="bg-white lg:w-[80%] xl:w-[80%]  w-full relative border py-2  rounded-lg">
                <div class="flex pb-3 border-b  border-black">
                    <h3 class="text-gray-800 mt-1  font-bold mx-3 flex-1">ADD ITEM</h3>
                    <svg @click="closeAddItemModal" xmlns="http://www.w3.org/2000/svg"
                        class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>
                </div>

                <form @submit.prevent="sendItem()" class="w-full lg:flex xl:flex justify-center py-3">
                    <div class="w-full px-2 ">
                        <div class="w-full ">
                            <label>TITLE</label>
                            <input v-model="title" class="border border-black  w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="lg:flex xl:flex justify-center lg:mt-2 xl:mt-2">
                            <div class="w-full mr-2">
                                <label class="text-[14px]">TYPE</label>
                                <select v-model="type"
                                    class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-md mb-2 ">
                                    <option value="" disabled>Select Item</option>
                                    <option value="Container">Container</option>
                                    <option value="Bottle">Bottle</option>
                                    <option value="Seal">Seal</option>
                                    <option value="Filter">Filter</option>
                                    <option value="Packaging">Packaging</option>
                                    <option value="Equipment">Equipment</option>


                                </select>
                            </div>
                            <div class="w-full mr-2">
                                <label class="text-[14px]">POS ITEM</label>
                                <select v-model="pos_item"
                                    class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-md mb-2 ">
                                      <option value="" disabled >Select Status</option>
                                    <option value="Yes" :disabled="disablePosItem">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div class="w-full ">
                                <label class="text-[14px]">QUANTITY</label>
                                <input v-model="reorder" type="number"
                                    class="w-full border border-black px-2 py-1 shadow-md rounded-md mb-2 ">
                            </div>
                        </div>

                        <div class="lg:flex xl:flex justify-center lg:mt-2 xl:mt-2">
                            <div class="w-full mr-2">
                                <label class="text-[14px]">DELIVER</label>
                                <input v-model="deliver" type="number" :disabled="isDisabled"
                                    class="w-full border border-black px-2 py-1 shadow-md rounded-md mb-2 ">

                            </div>
                            <div class="w-full mr-2">
                                <label class="text-[14px]">PICK UP</label>
                                <input v-model="pick_up" type="number" :disabled="isDisabled"
                                    class="w-full border border-black px-2 py-1 shadow-md rounded-md mb-2 ">
                            </div>
                            <div class="w-full">
                                <label class="text-[14px]">BUY</label>
                                <input v-model="buy" :disabled="disableBuy" type="number"
                                    class="w-full border border-black px-2 py-1 shadow-md rounded-md mb-2 ">
                            </div>

                        </div>
                    </div>
                    <div class="lg:w-[80%] xl:w-[80%]">
                        <span class="block text-center">PREVIEW</span>
                        <div class="flex justify-center px-[20%] ">
                            <div
                                class="bg-white shadow-md rounded w-full h-[175px] flex items-center justify-center  border-2  border-gray-300    font-[sans-serif]">
                                <img v-if="previewItemUrl" :src="previewItemUrl"
                                    class="lg:h-full xl:h-full h-[100%] lg:w-full xl:w-full w-full   " alt="">
                            </div>
                        </div>
                        <!-- Start Of Browse Button  -->
                        <div class="flex justify-center mt-2 mb-3">
                            <input @change="handleItemImage" name="file" type="file" id='file' accept="image/*"
                                class="hidden" />

                            <label for="file" name="file"
                                class="block px-6 py-2.5 rounded-full   tracking-wider font-semibold border shadow-md outline-none cursor-pointer  bg-[#4E95C9]">Browse
                            </label>
                        </div>
                        <!-- Start Of End Button  -->

                        <!-- Start Of Save Button -->
                        <div class="flex justify-center px-2">
                            <button type="submit" class="lg:w-[40%] xl:w-[40%] w-full bg-[#4E95C9] p-1 rounded-md border shadow-md  "><i
                                    class="fas fa-check mr-1"></i>
                                {{ save }}</button>
                        </div>
                        <!-- End Of Save Button -->

                    </div>
                </form>
            </div>
        </section>

        <!-- End Of Add New Item Modal -->

        <!-- Start Of Edit Item Modal -->
        <section v-if="showEditItemModal" @click.self="closeEditItemModal"
            class="fixed before:fixed inset-0  p-4 before:inset-0 w-full h-full flex flex-wrap  justify-center items-center top-0 left-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto  font-[sans-serif] z-10 ">
            <div class="bg-white lg:w-[80%] xl:w-[80%]  w-full relative border py-2  rounded-lg">
                <div class="flex pb-3 border-b  border-black">
                    <h3 class="text-gray-800 mt-1  font-bold mx-3 flex-1">EDIT ITEM</h3>
                    <svg @click="closeEditItemModal" xmlns="http://www.w3.org/2000/svg"
                        class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>
                </div>

                <form @submit.prevent="editItem()" class="w-full lg:flex xl:flex justify-center py-3">
                    <div class="w-full px-2 ">
                        <div class="w-full ">
                            <label>TITLE</label>
                            <input v-model="title" class="border border-black  w-full px-2 py-1 shadow-md rounded-md mb-2"
                                type="text">
                        </div>
                        <div class="lg:flex xl:flex justify-center lg:mt-2 xl:mt-2">
                            <div class="w-full mr-2">
                                <label class="text-[14px]">TYPE</label>
                                <select v-model="type"
                                    class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-md mb-2 ">
                                    <option value="" disabled>Select Item</option>
                                    <option value="Container">Container</option>
                                    <option value="Bottle">Bottle</option>
                                    <option value="Seal">Seal</option>
                                    <option value="Filter">Filter</option>
                                    <option value="Packaging">Packaging</option>
                                    <option value="Equipment">Equipment</option>


                                </select>
                            </div>
                            <div class="w-full mr-2">
                                <label class="text-[14px]">POS ITEM</label>
                                <select v-model="pos_item"
                                    class="w-full bg-white  border border-black py-2 h-[34px] shadow-md  px-3 rounded-md mb-2 ">
                                    <option value="" disabled>Select Status</option>
                                    <option value="Yes" :disabled="disablePosItem">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div class="w-full ">
                                <label class="text-[14px]">QUANTITY</label>
                                <input v-model="reorder" type="number"
                                    class="w-full border border-black px-2 py-1 shadow-md rounded-md mb-2">
                            </div>
                        </div>

                        <div class="lg:flex xl:flex justify-center lg:mt-2 xl:mt-2">
                            <div class="w-full mr-2">
                                <label class="text-[14px]">DELIVER</label>
                                <input v-model="deliver" type="number" :disabled="isDisabled"
                                    class="w-full border border-black px-2 py-1 shadow-md rounded-md mb-2 ">
                            </div>
                            <div class="w-full mr-2">
                                <label class="text-[14px]">PICK UP</label>
                                <input v-model="pick_up" type="number" :disabled="isDisabled"
                                    class="w-full border border-black px-2 py-1 shadow-md rounded-md mb-2 ">
                            </div>
                            <div class="w-full">
                                <label class="text-[14px]">BUY</label>
                                <input v-model="buy" :disabled="disableBuy" type="number"
                                    class="w-full border border-black px-2 py-1 shadow-md rounded-md mb-2 ">
                            </div>

                        </div>
                    </div>
                    <div class="lg:w-[80%] xl:w-[80%]">
                        <span class="block text-center">PREVIEW</span>
                        <div class="flex justify-center px-[20%] ">
                            <div
                                class="bg-white shadow-md text-gray-500 font-semibold text-base rounded w-full h-[175px] flex flex-col items-center justify-center  border-2  border-gray-300    font-[sans-serif]">
                                <img v-if="previewItemUrl" :src="previewItemUrl"
                                    class="lg:h-full xl:h-full h-[100%] lg:w-full xl:w-full w-full   " alt="">
                            </div>
                        </div>
                        <!-- Start Of Browse Button  -->
                        <div class="flex justify-center mt-2 mb-3">
                            <input @change="handleChangeItemImage" name="file" type="file" id='file' accept="image/*"
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
        <!-- End Of Edit Item Modal -->
        <footerComponent class="mt-3" />



    </main>
</template>


