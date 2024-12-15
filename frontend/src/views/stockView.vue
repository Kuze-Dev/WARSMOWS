<script setup>
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from '../stores/store';
import axios from '../../axios';
import { formatDate } from '../utils/dateFormatter';
import Swal from 'sweetalert2';
import { useToast } from "vue-toastification";
import { ref, onMounted,onUnmounted,computed } from 'vue';


const title = ref('');          //Item
const image_item = ref('');     //Item

const quantity_in = ref('');     //Stock In
const price = ref('');          // Stock In
const date_stockIn = ref('');  //  Stock In
const comments_in = ref('');   //   Stock In

const quantity_out = ref('');     //Stock Out
const stock_status = ref('');    // Stock Out
const date_stockOut = ref('');  //  Stock Out
const comments_out = ref('');   //   Stock Out


const toast = useToast(); //toast notification


const resetStockInForm = () => {
    quantity_in.value = '',
        price.value = '',
        comments_in.value = ''
}

const resetStockOutForm = () => {
    quantity_out.value = '',
        stock_status.value = '',
        comments_out.value = ''
}



const showOptionStockModal = ref(false);
const selectedStockId = ref(false);

const openOptionStockModal = (id) => {
    if (showOptionStockModal.value && selectedStockId.value === id) {
       closeOptionStockModal();
    } else {
        showOptionStockModal.value = true;
        selectedStockId.value = id;
        document.addEventListener("mousedown", handleClickOutside);

    }
}

// Function to close the modal and clean up event listeners
const closeOptionStockModal = () => {
  showOptionStockModal.value = false;
//   selectedStockId.value = null;

  document.removeEventListener("mousedown", handleClickOutside);
};

// Handle clicks outside the modal
const handleClickOutside = (event) => {
  const modal = document.querySelector(".modal-content"); // Class of your modal content div
  if (modal && !modal.contains(event.target)) {
    closeOptionStockModal();
  }
};

// Clean up event listener when component unmounts
onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});


const store = useAuthStore();
const stocks = ref([]);

const fetchStockData = async () => {
    try {
        const response = await axios.get(`/item?page=${currentPage.value}&limit=${perPage}&search=${searchQuery.value}`, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        stocks.value = Array.isArray(response.data.Items) ? response.data.Items : [];
        Totalitems.value = response.data.Totalitems;
        currentPage.value = response.data.currentPage;
        perPage.value = response.data.perPage;
        date_stockIn.value = new Date().toISOString().slice(0, 10);
        date_stockOut.value = new Date().toISOString().slice(0, 10);
        fetchStockHistory();
    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

//Pages
const currentPage = ref(0);
const perPage = ref(0); // Number of stocks per page
const Totalitems = ref(0);

//Search
const searchQuery = ref('');



const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        fetchStockData();
    }
};

const goToNextPage = () => {
    const totalPages = Math.ceil(Totalitems.value / perPage.value);
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchStockData();
    }
};

const showStockInModal = ref(false);

const openStockInModal = (id) => {
    showStockInModal.value = !showStockInModal.value;
    // alert(id);
    const stock = stocks.value.find(stock => stock.stock_id === id);
    if (stock) {
        title.value = stock.title;
        image_item.value = `../src/assets/uploads/${stock.image_item}`;
        // console.log(image_item.value);
        // console.log(title.value);

    }

}

const closeStockInModal = () => {
    showStockInModal.value = !showStockInModal.value;
    resetStockInForm();
}

const showStockOutModal = ref(false);

const openStockOutModal = (id) => {
    // alert(id);
    showStockOutModal.value = !showStockOutModal.value;
    const stock = stocks.value.find(stock => stock.stock_id === id);
    if (stock) {
        title.value = stock.title;
        image_item.value = `../src/assets/uploads/${stock.image_item}`;
        // console.log(image_item.value);
        // console.log(title.value);

    }
    // alert(id);

}

const closeStockOutModal = () => {
    showStockOutModal.value = !showStockOutModal.value;
    resetStockOutForm();
}

let save = ref('Save');
const sendStockIn = async () => {
    // alert(selectedStockId.value);
    save.value = 'Sending';


    const stockInData = {
        quantity_in: quantity_in.value,
        price: price.value,
        date_stockIn: date_stockIn.value,
        comments_in: comments_in.value,
        stockIn_flow: 'In'

    };

    const response = await axios.put(`/stockIn/${selectedStockId.value}`, stockInData, {
        headers: {
            'Authorization': `Bearer ${store.token}`
        }
    });
    console.log(response.data);
    setTimeout(() => {
        save.value = 'Save'
        if (response.data.msg) {
            toast.error(response.data.msg);
            return
        }
        if (response.data.success) {
            console.log(response.data.message);
            Swal.fire('Success!', response.data.message, 'success');
            closeStockInModal();
            fetchStockData();
        } else {
            toast.error(response.data.errors[0].msg);

        }
    }, 2000);

}

const sendStockOut = async () => {
    // alert(selectedStockId.value);
    save.value = 'Sending';

    const stockOutData = {
        quantity_out: quantity_out.value,
        stock_status: stock_status.value,
        date_stockOut: date_stockOut.value,
        comments_out: comments_out.value,
        stockOut_flow: 'Out'
    };

    const response = await axios.put(`/stockOut/${selectedStockId.value}`, stockOutData, {
        headers: {
            'Authorization': `Bearer ${store.token}`
        }
    });
    console.log(response.data);
    setTimeout(() => {
        save.value = 'Save'
        if (response.data.msg) {
            toast.error(response.data.msg);
            return
        }
        if (response.data.success) {
            console.log(response.data.message);
            Swal.fire('Success!', response.data.message, 'success');
            closeStockOutModal();
            fetchStockData();
        } else {
            toast.error(response.data.errors[0].msg);
        }
    }, 2000);
}


const showStockHistoryModal = ref(false);

const openStockHistoryModal = (id) => {
    showStockHistoryModal.value = !showStockHistoryModal.value;
    // alert(id);
    const stock = stocks.value.find(stock => stock.stock_id === id);
    if (stock) {
        title.value = stock.title;
        image_item.value = `../src/assets/uploads/${stock.image_item}`;

    }
}

const closeStockHistoryModal = () => {
    showStockHistoryModal.value = !showStockHistoryModal.value;
}

const stockHistories = ref([]);




const fetchStockHistory = async () => {
    try {
        const response = await axios.get(`/stockHistory?page=${currentPageHistory.value}&limit=${perPageHistory}`,)
        stockHistories.value = response.data.Results;
        totalStockHistories.value = response.data.Totalhistories;
        currentPageHistory.value =response.data.currentPage;
        perPageHistory.value = response.data.perPage;
         if (stockHistories.value.length === 0 && currentPageHistory.value > 1) {
            // If the page is empty, go to the previous page
            currentPageHistory.value--;
            fetchStockHistory(); 
        }
    } catch (error) {
        console.error('Failed to fetch stock history:', error); // handle error
    }
};

const deleteStockHistory = async (historyId) => {
    // Check if historyId is valid
    // alert(historyId);
    // if (!historyId) {
    //     alert('No stock history selected for deletion.');
    //     return;
    // }
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

          axios.delete(`/stockHistory/${historyId}`).then((response)=>{
        if (response.data.success) {
            Swal.fire('Success!', response.data.msg, 'success');            
            fetchStockHistory(); // Call your fetch function to update the list
        } else {
            Swal.fire('Error!', response.data.msg, 'error');

        }
    })
}
});
};

//Pages
const currentPageHistory = ref(0);
const perPageHistory = ref(0); 
const totalStockHistories = ref(0);




const goToPreviousPageHistory = () => {
    
    if (currentPageHistory.value > 1) {
        currentPageHistory.value--;
        fetchStockHistory();
    }
};

const goToNextPageHistory = () => {
    
    const totalHistoryPages = Math.ceil(totalStockHistories.value / perPageHistory.value);
    if (currentPageHistory.value< totalHistoryPages) {
        currentPageHistory.value++;
        fetchStockHistory();
    }
};


// // Computed property for filtered stockHistories
// const filteredStockHistories = computed(() =>
//   stockHistories.value.filter(
//     (stockHistory) => stockHistory.stock_id === selectedStockId.value
//   )
// );



onMounted(() => {
    fetchStockData(); // Call fetchStockData function
    fetchStockHistory(); // Call fetchStockHistory function
});


</script>

<template>
    <main class="lg:w-[1200px] xl:w-[1310px] w-full lg:h-screen xl:h-screen h-[680px] overflow-y-auto">
        <headerComponent />
        <div class="flex justify-center w-full">
            <section class="lg:w-[95%] xl:w-[96%] w-[90%] border rounded-md mt-7 h-[733px] lg:h-[732px] xl:h-[732px] shadow-md">
                <div class="flex mx-6 ">
                    <div class=" mt-2 lg:w-[17%] xl:w-[17%] w-[35%] ">
                        <RouterLink to="/stock" class="flex">
                            <img class="w-[25px] h-7 mt-2  mr-2" src="../assets/itemlisticon1.png" alt="">
                            <span class="mt-3 font-bold">STOCK</span>
                        </RouterLink>
                        <div class="relative top-5 right-3 ">
                            <div class="border-b-2 border-black"></div>
                        </div>
                    </div>
                    <div class="mt-2">
                        <RouterLink to="/expenses" class="flex">
                            <img class="w-[25px] h-7 mt-2  mr-2" src="../assets/expensesIcon.png" alt="">
                            <span class="mt-3">EXPENSES</span>
                        </RouterLink>

                    </div>
                </div>
                <div>

                    <div class="mt-5 mx-3 mb-5">
                        <div class="border-b w-full"></div>
                    </div>
                </div>

                <!-- Start of Search Input and Button -->
                <div class="xl:flex lg:flex  px-3 pb-4 pt-1">
                    <div class="flex rounded-md  shadow-md border border-black overflow-hidden     font-[sans-serif]">
                        <input type="search" v-model="searchQuery" @input="fetchStockData" placeholder="Search ..."
                            class="outline-none  w-full  bg-white text-gray-600 text-sm    px-2 py-2    " />
                        <button type='button' class="flex  items-center justify-center border-l border-black px-5">
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
                    <div class="w-full">
                        <div class="font-[sans-serif] overflow-x-auto overflow-y-hidden border pb-[85px] h-[532px]">
                            <table class=" w-full bg-[#4E95C9]">
                                <thead class="whitespace-nowrap">
                                    <tr>
                                        <th class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            #
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
                                                TYPE
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
                                                IN
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
                                                OUT
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
                                                ON HAND
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
                                                PRICE
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
                                                TOTAL WORTH
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
                                    <tr class="border-b border-gray-300" v-if="stocks.length > 0"
                                        v-for="(stock, index) in stocks" :key="stock.stock_id">
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ (currentPage - 1) * perPage + (index + 1) }}
                                        </td>
                                        <td class="flex w-full justify-center items-center">
                                            <div class="h-12 w-[30%] mt-2 mr-2 mx-6 rounded-full overflow-hidden">
                                                <img :src="`../src/assets/uploads/${stock.image_item}`"
                                                    class="h-full w-full object-cover" alt="">
                                            </div>
                                            <div class="mx-2 text-sm mt-[6%] text-gray-800 w-full">
                                                <span class="mr-1">{{ stock.title }}</span>
                                            </div>
                                        </td>
                                        <td class="px-4 py-6 mt-[6%] text-sm text-blue-500">
                                            <div class="bg-blue-100 px-2 py-1 rounded-full text-center">
                                                {{ stock.type }}
                                            </div>
                                        </td>
                                        <td class="px-4 py-4 text-sm text-green-600">
                                            <span v-if="stock.quantity_in == 0">
                                                {{ stock.quantity_in === 0 ? null : '' }}
                                            </span>
                                            <span v-else>
                                                {{ stock.quantity_in }}
                                            </span>
                                        </td>
                                        <td class="px-4 py-4 text-sm text-red-600">
                                            {{ stock.quantity_out === 0 ? null : stock.quantity_out }}
                                        </td>
                                        <td class="px-4 py-4 text-sm text-yellow-600">
                                            {{ stock.onhand === 0 ? null : stock.onhand }}
                                        </td>
                                        <td class="px-4 py-4 text-sm text-gray-800">
                                            <span v-if="stock.price == 0">
                                                {{ stock.price === 0 ? null : '' }}
                                            </span>
                                            <span v-else>
                                                &#8369;{{ stock.price }}
                                            </span>
                                        </td>
                                        <td class="px-4 py-4 text-sm text-blue-600">
                                            <span v-if="stock.totalworth == 0">
                                                {{ stock.totalworth === 0 ? null : '' }}
                                            </span>
                                            <span v-else>
                                                &#8369;{{ stock.totalworth }}
                                            </span>

                                        </td>
                                        <td class="px-4 py-4">
                                            <!--Start Of Option Item Icon -->
                                            <svg @click="openOptionStockModal(stock.stock_id)"
                                                class="mx-3 cursor-pointer" width="24" height="40" viewBox="0 0 24 25"
                                                fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                            <section 
                                                :class="showOptionStockModal && stock.stock_id === selectedStockId ?'modal-content relative  font-[sans-serif] right-14':'hidden'" v-show="stock.stock_id === selectedStockId">
                                                <div v-for="(stock, index) in stocks" :key="stock.stock_id"
                                                    v-show="stock.stock_id === selectedStockId"
                                                    class="max-w-sm rounded h-[100px] w-[120px]   bg-[#4E95C9]  border shadow-md absolute">
                                                    <div class="flex flex-wrap">

                                                        <div class="mx-5 flex justify-center items-center mt-2 pb-1">
                                                            <svg class="mr-2" width="21" height="24" viewBox="0 0 24 22"
                                                                fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path
                                                                    d="M11 9.9165H5V11.6665H11V16.9165H13V11.6665H19V9.9165H13V4.6665H11V9.9165Z"
                                                                    fill="#555555" />
                                                            </svg>

                                                            <span @click="openStockInModal(stock.stock_id)"
                                                                class="text-[13px] hover:text-white font-[sans-serif] cursor-pointer ">Stock
                                                                In</span>
                                                        </div>
                                                        <!-- border buttom -->
                                                        <div class="border-b w-full"></div>

                                                        <div class="mx-4  flex justify-center items-center mt-1 ">
                                                            <svg class="mx-1" width="22" height="24" viewBox="0 0 24 24"
                                                                fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <g clip-path="url(#clip0_70_1299)">
                                                                    <path d="M19 10.7231H5V8.72314H19V10.7231Z"
                                                                        fill="#555555" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_70_1299">
                                                                        <rect width="24" height="24" fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                            <span @click="openStockOutModal(stock.stock_id)"
                                                                class="mx-1 text-[13px] hover:text-white cursor-pointer ">Stock
                                                                Out</span>
                                                        </div>
                                                        <!-- border buttom -->
                                                        <div class="border-b w-full"></div>

                                                        <div class="mx-4  flex justify-center items-center mt-2 ">
                                                            <svg class="mx-2" width="16" height="17" viewBox="0 0 16 17"
                                                                fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path
                                                                    d="M7.932 16.2915C5.90067 16.2915 4.13033 15.6282 2.621 14.3015C1.11167 12.9748 0.238 11.3048 0 9.2915H1.011C1.283 11.0115 2.06667 12.4415 3.362 13.5815C4.65733 14.7215 6.18067 15.2915 7.932 15.2915C9.882 15.2915 11.536 14.6125 12.894 13.2545C14.252 11.8965 14.9313 10.2422 14.932 8.2915C14.9327 6.34084 14.2533 4.6865 12.894 3.3285C11.5347 1.9705 9.88067 1.2915 7.932 1.2915C6.89733 1.2915 5.92467 1.51017 5.014 1.9475C4.10333 2.38484 3.3 2.98684 2.604 3.7535H5.085V4.7535H0.932V0.599504H1.932V2.9875C2.70533 2.13884 3.61133 1.4775 4.65 1.0035C5.68867 0.529504 6.78267 0.292171 7.932 0.291504C9.04067 0.291504 10.08 0.50017 11.05 0.917504C12.02 1.33484 12.8673 1.90584 13.592 2.6305C14.3167 3.35517 14.888 4.20284 15.306 5.1735C15.724 6.14417 15.9327 7.1835 15.932 8.2915C15.9313 9.3995 15.7227 10.4388 15.306 11.4095C14.8893 12.3802 14.318 13.2278 13.592 13.9525C12.866 14.6772 12.0187 15.2482 11.05 15.6655C10.0813 16.0828 9.042 16.2915 7.932 16.2915ZM11.135 12.1455L7.489 8.4995V3.2915H8.489V8.0835L11.843 11.4375L11.135 12.1455Z"
                                                                    fill="#555555" />
                                                            </svg>

                                                            <span @click="openStockHistoryModal(stock.stock_id)"
                                                                class="mx-1 text-[13px] hover:text-white cursor-pointer">History</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                            <!-- End Of Edit and Delete Option Item Modal  -->

                                        </td>
                                    </tr>
                                    <!-- Display message if no stocks are found -->
                                    <tr v-else>
                                        <td colspan="10" class="py-4 text-center text-gray-500 text-xl font-semibold">
                                            No stock data available.
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>

                         <!-- Start of Pages -->
                <div class=" flex justify-center mt-3">
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

                    </div>
                </section>
               

            </section>
        </div>
        <!-- Start Of Stock In Modal -->
        <section v-if="showStockInModal" @click.self="closeStockInModal"
            class="fixed before:fixed inset-0 p-4 efore:inset-0 flex flex-wrap justify-center items-center top-0 h-full w-full before:w-full before:h-full left-0 before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif] z-10 ">
            <div class="lg:w-[80%] xl:w-[80%]  w-full bg-white border py-2 relative rounded-lg pb-4">
                <div class="flex pb-3 border-b  mx-3 border-black">
                    <h3 class="text-gray-800 mt-1  font-bold  flex-1">STOCK IN</h3>
                    <svg @click="closeStockInModal" xmlns="http://www.w3.org/2000/svg"
                        class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>
                </div>
                <form @submit.prevent="sendStockIn()" class="mx-3 mt-3 ">
                    <div class="lg:flex xl:flex justify-center w-full">
                        <div class="w-full">
                            <div class="lg:flex xl:flex justify-center w-full mb-2">
                                <div class="w-full mr-5">
                                    <label class="text-[14px]">QUANTITY</label>
                                    <input v-model="quantity_in"
                                        class="w-full border border-black shadow-md px-2 py-1 rounded-md block"
                                        type="number">
                                </div>

                                <div class="w-full mr-5">
                                    <label class="text-[14px]">PRICE</label>
                                    <input v-model="price"
                                        class="w-full border border-black shadow-md px-2 py-1 rounded-md block"
                                        type="number">
                                </div>

                                <div class="w-full">
                                    <label class="text-[14px]">DATE</label>
                                    <input v-model="date_stockIn"
                                        class="w-full border border-black shadow-md px-2 py-1 rounded-md block"
                                        type="date">
                                </div>
                            </div>
                            <div class="w-full">
                                <label class="text-[14px]">COMMENTS</label>
                                <textarea v-model="comments_in"
                                    class="w-full border border-black shadow-md px-2 py-1 rounded-md block "
                                    rows="4"></textarea>
                            </div>
                        </div>

                        <div class="lg:w-[80%] xl:w-[80%]">
                            <span class="block text-center text-[17px]">{{ title }}</span>
                            <div class="flex justify-center px-[20%] ">
                                <div
                                    class="bg-white shadow-md w-full  rounded  h-[175px]  items-center justify-center  border-2  border-gray-300">
                                    <img :src="image_item"
                                        class="lg:h-full xl:h-full h-[100%] lg:w-full xl:w-full w-full   " alt="">
                                </div>
                            </div>

                            <!-- Start Of Save Button -->
                            <div class="flex justify-center px-2 mt-2">
                                <button type="submit"
                                    class="lg:w-[40%] xl:w-[40%] w-full bg-[#4E95C9] p-1 border shadow-md rounded-md  "><i
                                        class="fas fa-check mr-1"></i>
                                    {{ save }}</button>
                            </div>
                            <!-- End Of Save Button -->

                        </div>
                    </div>

                </form>
            </div>
        </section>
        <!-- End Of Stock In Modal -->

        <!-- Start Of Stock Out Modal -->
        <section v-if="showStockOutModal" @click.self="closeStockOutModal"
            class="fixed before:fixed inset-0 p-4 efore:inset-0 flex flex-wrap justify-center items-center top-0 h-full w-full before:w-full before:h-full left-0 before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif] z-10 ">
            <div class="lg:w-[80%] xl:w-[80%]  w-full bg-white border py-2 relative rounded-lg pb-4">
                <div class="flex pb-3 border-b  mx-3 border-black">
                    <h3 class="text-gray-800 mt-1  font-bold  flex-1">STOCK OUT</h3>
                    <svg @click="closeStockOutModal" xmlns="http://www.w3.org/2000/svg"
                        class="w-3 mx-3 ml-2 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>
                </div>
                <form @submit.prevent="sendStockOut()" class="mx-3 mt-3">
                    <div class="lg:flex xl:flex justify-center w-full">
                        <div class="w-full">
                            <div class="lg:flex xl:flex justify-center w-full mb-2">
                                <div class="w-full mr-5">
                                    <label class="text-[14px]">QUANTITY</label>
                                    <input v-model="quantity_out"
                                        class="w-full border border-black shadow-md px-2 py-1 rounded-md block"
                                        type="number">
                                </div>

                                <div class="w-full mr-5">
                                    <label class="text-[14px]">STATUS</label>
                                    <select v-model="stock_status"
                                        class="flex border border-black w-full rounded-md shadow-md py-1 h-[34px]">
                                        <option value="" disabled>Select Status</option>
                                        <option value="Consume">Consume</option>
                                        <option value="Damage">Damage</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div class="w-full">
                                    <label class="text-[14px]">DATE</label>
                                    <input v-model="date_stockOut"
                                        class="w-full border border-black shadow-md px-2 py-1 rounded-md block"
                                        type="date">
                                </div>
                            </div>
                            <div class="w-full">
                                <label class="text-[14px]">COMMENTS</label>
                                <textarea v-model="comments_out"
                                    class="w-full border border-black shadow-md px-2 py-1 rounded-md block "
                                    rows="4"></textarea>
                            </div>
                        </div>

                        <div class="lg:w-[80%] xl:w-[80%]">
                            <span class="block text-center text-[17px]">{{ title }}</span>
                            <div class="flex justify-center px-[20%] ">
                                <div
                                    class="bg-white shadow-md w-full  rounded  h-[175px]  items-center justify-center  border-2  border-gray-300">
                                    <img :src="image_item"
                                        class="lg:h-full xl:h-full h-[100%] lg:w-full xl:w-full w-full   " alt="">
                                </div>
                            </div>

                            <!-- Start Of Save Button -->
                            <div class="flex justify-center px-2 mt-2">
                                <button type="submit"
                                    class="lg:w-[40%] xl:w-[40%] w-full bg-[#4E95C9] shadow-md p-1 rounded-md  "><i
                                        class="fas fa-check mr-1"></i>
                                    {{ save }}</button>
                            </div>
                            <!-- End Of Save Button -->

                        </div>
                    </div>

                </form>
            </div>
        </section>
        <!-- End Of Stock Out Modal -->

        <!-- Start of Stock History Modal -->
        <section v-if="showStockHistoryModal" @click.self="closeStockHistoryModal"
            class="fixed before:fixed inset-0 p-4 before:inset-0 flex flex-wrap justify-center items-center top-0 h-full w-full before:w-full before:h-full left-0 before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif] z-10 ">
            <div class="lg:w-[75%] xl:w-[75%]  w-full  border bg-white py-2 relative rounded-lg pb-4">
                <div class="flex pb-3 border-b  mx-3 border-black">
                    <div class=" flex flex-1">
                        <svg class=" mt-2" width="30" height="17" viewBox="0 0 16 17" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M7.932 16.2915C5.90067 16.2915 4.13033 15.6282 2.621 14.3015C1.11167 12.9748 0.238 11.3048 0 9.2915H1.011C1.283 11.0115 2.06667 12.4415 3.362 13.5815C4.65733 14.7215 6.18067 15.2915 7.932 15.2915C9.882 15.2915 11.536 14.6125 12.894 13.2545C14.252 11.8965 14.9313 10.2422 14.932 8.2915C14.9327 6.34084 14.2533 4.6865 12.894 3.3285C11.5347 1.9705 9.88067 1.2915 7.932 1.2915C6.89733 1.2915 5.92467 1.51017 5.014 1.9475C4.10333 2.38484 3.3 2.98684 2.604 3.7535H5.085V4.7535H0.932V0.599504H1.932V2.9875C2.70533 2.13884 3.61133 1.4775 4.65 1.0035C5.68867 0.529504 6.78267 0.292171 7.932 0.291504C9.04067 0.291504 10.08 0.50017 11.05 0.917504C12.02 1.33484 12.8673 1.90584 13.592 2.6305C14.3167 3.35517 14.888 4.20284 15.306 5.1735C15.724 6.14417 15.9327 7.1835 15.932 8.2915C15.9313 9.3995 15.7227 10.4388 15.306 11.4095C14.8893 12.3802 14.318 13.2278 13.592 13.9525C12.866 14.6772 12.0187 15.2482 11.05 15.6655C10.0813 16.0828 9.042 16.2915 7.932 16.2915ZM11.135 12.1455L7.489 8.4995V3.2915H8.489V8.0835L11.843 11.4375L11.135 12.1455Z"
                                fill="#555555" />
                        </svg>
                        <h3 class="text-gray-800 mt-1  font-bold">STOCK HISTORY</h3>
                    </div>

                    <svg @click="closeStockHistoryModal" xmlns="http://www.w3.org/2000/svg"
                        class="w-3 mx-3 ml-2 mt-1 cursor-pointer shrink-0  " viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>
                </div>
                <!-- Start of Image and Title -->
                <div class="mx-3 mt-3">
                    <div class="flex justify-start ">
                        <div class="bg-white lg:w-[10%] xl:w-[10%] w-[30%]    h-[85px]  items-center justify-center ">
                            <img :src="image_item" class="lg:h-full xl:h-full h-[100%] lg:w-full xl:w-full w-full   "
                                alt="">
                        </div>
                        <div class="mx-1" ></div>
                        <div>
                            <h4 class="mt-10  text-[19px] text-gray-800 font-bold">{{ title }}</h4>
                        </div>
                    </div>
                </div>
                <!-- End of Image and Title -->

                <section class="mx-3">
                    <div class="w-full py-3">
                        <div class="font-[sans-serif] overflow-x-auto h-[611px]  border ">
                            <table class=" w-full bg-[#4E95C9]">
                                <thead class="whitespace-nowrap">
                                    <tr>
                                        <th class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            #
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
                                                TOTAL SALES
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
                                                COMMENTS
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
                                                TRANSACTION
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
                                <tbody class="bg-white whitespace-nowrap">
                                    <tr v-if="stockHistories.length === 0 || !stockHistories.some(stockHistory => stockHistory.stock_id === selectedStockId)">
        <td colspan="8" class="py-4 text-center text-gray-500 text-xl font-semibold">
            No stock history found
        </td>
    </tr>
                                    <tr class="border-b border-gray-300"
                                    v-for="(stockHistory, index) in stockHistories.filter(stock => stock.stock_id === selectedStockId)"
                                        :key="stockHistory.stockhistory_id"
                                        v-show="stockHistory.stock_id === selectedStockId">

                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                        {{ index+1}}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ stockHistory.quantity_in || '' }}
                                            {{ stockHistory.quantity_out || '' }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ parseFloat(stockHistory.total_worth_stockin) === 0.00 ? '' :
                                                stockHistory.total_worth_stockin }}
                                            {{ parseFloat(stockHistory.total_worth_stockout) === 0.00 ? '' :
                                                stockHistory.total_worth_stockout }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ stockHistory.comments_in ? stockHistory.comments_in : '' }}
                                            {{ stockHistory.comments_out ? stockHistory.comments_out : '' }}
                                        </td>
                                        <td class="px-4  w-2 py-4 text-sm text-gray-800">
                                            <div class="mx-5">
                                            {{ stockHistory.stockIn_flow }}
                                            {{ stockHistory.stockOut_flow }}
                                        </div>
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ stockHistory.stock_status }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ stockHistory.date_stockIn ? formatDate(stockHistory.date_stockIn) : '' }}
                                            {{ stockHistory.date_stockOut ? formatDate(stockHistory.date_stockOut) : ''
                                            }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            <div class="mx-4">
                                                <svg @click="deleteStockHistory(stockHistory.stockhistory_id)"
                                                    class="cursor-pointer" width="25" height="23" viewBox="0 0 25 23"
                                                    fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M8.17871 3.54355V1.19824C8.17871 0.991042 8.26761 0.792328 8.42584 0.645815C8.58407 0.499302 8.79868 0.416992 9.02246 0.416992H15.7725C15.9962 0.416992 16.2108 0.499302 16.3691 0.645815C16.5273 0.792328 16.6162 0.991042 16.6162 1.19824V3.54355H23.3662C23.59 3.54355 23.8046 3.62586 23.9628 3.77238C24.1211 3.91889 24.21 4.1176 24.21 4.3248C24.21 4.532 24.1211 4.73072 23.9628 4.87723C23.8046 5.02374 23.59 5.10605 23.3662 5.10605H1.42871C1.20493 5.10605 0.990323 5.02374 0.83209 4.87723C0.673856 4.73072 0.584961 4.532 0.584961 4.3248C0.584961 4.1176 0.673856 3.91889 0.83209 3.77238C0.990323 3.62586 1.20493 3.54355 1.42871 3.54355H8.17871ZM9.86621 3.54355H14.9287V1.98105H9.86621V3.54355ZM3.95996 22.2936C3.73618 22.2936 3.52157 22.2112 3.36334 22.0647C3.20511 21.9182 3.11621 21.7195 3.11621 21.5123V5.10605H21.6787V21.5123C21.6787 21.7195 21.5898 21.9182 21.4316 22.0647C21.2733 22.2112 21.0587 22.2936 20.835 22.2936H3.95996ZM9.86621 17.6061C10.09 17.6061 10.3046 17.5237 10.4628 17.3772C10.6211 17.2307 10.71 17.032 10.71 16.8248V9.0123C10.71 8.8051 10.6211 8.60639 10.4628 8.45988C10.3046 8.31336 10.09 8.23105 9.86621 8.23105C9.64243 8.23105 9.42782 8.31336 9.26959 8.45988C9.11136 8.60639 9.02246 8.8051 9.02246 9.0123V16.8248C9.02246 17.032 9.11136 17.2307 9.26959 17.3772C9.42782 17.5237 9.64243 17.6061 9.86621 17.6061ZM14.9287 17.6061C15.1525 17.6061 15.3671 17.5237 15.5253 17.3772C15.6836 17.2307 15.7725 17.032 15.7725 16.8248V9.0123C15.7725 8.8051 15.6836 8.60639 15.5253 8.45988C15.3671 8.31336 15.1525 8.23105 14.9287 8.23105C14.7049 8.23105 14.4903 8.31336 14.3321 8.45988C14.1739 8.60639 14.085 8.8051 14.085 9.0123V16.8248C14.085 17.032 14.1739 17.2307 14.3321 17.3772C14.4903 17.5237 14.7049 17.6061 14.9287 17.6061Z"
                                                        fill="#EA0606" />
                                                </svg>
                                            </div>
                                        </td>
                                    </tr>
                                     
                                </tbody>

                            </table>
                        </div>
                    </div>
                    <!-- Start of Pages -->
                    <div
                        class=" flex justify-center   relative   ">
                        <!-- Start Of Previous Page -->
                        <svg @click="goToPreviousPageHistory" class="bg-gray-200 border-l rounded-l-full cursor-pointer" width="40" height="30"
                            viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M11.707 7.05451C11.8945 7.24203 11.9998 7.49634 11.9998 7.76151C11.9998 8.02667 11.8945 8.28098 11.707 8.4685L7.414 12.7615L11.707 17.0545C11.8892 17.2431 11.99 17.4957 11.9877 17.7579C11.9854 18.0201 11.8802 18.2709 11.6948 18.4563C11.5094 18.6417 11.2586 18.7469 10.9964 18.7492C10.7342 18.7515 10.4816 18.6507 10.293 18.4685L5.293 13.4685C5.10553 13.281 5.00021 13.0267 5.00021 12.7615C5.00021 12.4963 5.10553 12.242 5.293 12.0545L10.293 7.05451C10.4805 6.86703 10.7348 6.76172 11 6.76172C11.2652 6.76172 11.5195 6.86703 11.707 7.05451ZM17.707 7.05451C17.8945 7.24203 17.9998 7.49634 17.9998 7.76151C17.9998 8.02667 17.8945 8.28098 17.707 8.4685L13.414 12.7615L17.707 17.0545C17.8892 17.2431 17.99 17.4957 17.9877 17.7579C17.9854 18.0201 17.8802 18.2709 17.6948 18.4563C17.5094 18.6417 17.2586 18.7469 16.9964 18.7492C16.7342 18.7515 16.4816 18.6507 16.293 18.4685L11.293 13.4685C11.1055 13.281 11.0002 13.0267 11.0002 12.7615C11.0002 12.4963 11.1055 12.242 11.293 12.0545L16.293 7.05451C16.4805 6.86703 16.7348 6.76172 17 6.76172C17.2652 6.76172 17.5195 6.86703 17.707 7.05451Z"
                                fill="#555555" />
                        </svg>
                        <!-- End of Previous -->

                        <!-- Start of Current Page -->
                        <span class="bg-[#4E95C9] px-3 pt-1 ">{{currentPageHistory}}</span>
                        <!-- End of Current Page -->

                        <!-- Start of Next Page -->
                        <svg @click="goToNextPageHistory" class="bg-gray-200 border-r rounded-r-full cursor-pointer" width="40"
                            height="30" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M13.2024 18.473C13.0179 18.2825 12.9166 18.0265 12.9208 17.7614C12.9251 17.4963 13.0344 17.2437 13.2248 17.0591L17.5854 12.8348L13.361 8.47422C13.1818 8.28275 13.0851 8.02858 13.0915 7.76645C13.0979 7.50432 13.2071 7.25521 13.3954 7.07277C13.5837 6.89032 13.8362 6.78914 14.0984 6.79102C14.3606 6.7929 14.6115 6.89769 14.7972 7.08282L19.7173 12.1615C19.9018 12.352 20.003 12.6079 19.9988 12.873C19.9946 13.1382 19.8853 13.3908 19.6949 13.5753L14.6162 18.4954C14.4257 18.6799 14.1698 18.7811 13.9047 18.7769C13.6395 18.7727 13.3869 18.6634 13.2024 18.473ZM7.20314 18.3778C7.01867 18.1873 6.9174 17.9314 6.9216 17.6662C6.92581 17.4011 7.03514 17.1485 7.22557 16.964L11.5861 12.7396L7.36173 8.37906C7.18259 8.1876 7.08581 7.93343 7.09225 7.6713C7.09868 7.40917 7.20782 7.16006 7.39614 6.97761C7.58447 6.79517 7.83692 6.69399 8.09912 6.69587C8.36132 6.69775 8.61229 6.80254 8.79798 6.98766L13.7181 12.0663C13.9025 12.2568 14.0038 12.5128 13.9996 12.7779C13.9954 13.043 13.8861 13.2956 13.6956 13.4802L8.61696 18.4002C8.42649 18.5847 8.17054 18.686 7.90541 18.6818C7.64028 18.6776 7.38767 18.5682 7.20314 18.3778Z"
                                fill="#555555" />
                        </svg>
                        <!--End of Next Page  -->
                    </div>
                    <!-- End of Pages -->
                </section>

            </div>
        </section>
        <!-- End of Stock History Modal -->

        <RouterView />
        <footerComponent class="mt-3" />

    </main>
</template>