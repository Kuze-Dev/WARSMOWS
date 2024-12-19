<script setup>
import axios from '../../axios';
import { ref, onMounted } from 'vue';

// Declare the reactive variable for holding customer data
const totalCustomers = ref([]);

// Define the function to fetch customer data
const fetchTotalCustomers = async () => {
  try {
    const response = await axios.get('/customer');
    totalCustomers.value = response.data.totalCustomers;
    console.log('Customers:', totalCustomers.value);
  } catch (err) {
    console.error('Error Fetching Customers:', err);
  }
};

const deliveryCount = ref([]);
const pickUpCount = ref([]);

const fetchTotalSelectedService =async()=>{
  try {
    const response = await axios.get('/countDeliverAndPickUp');
    deliveryCount.value = response.data.deliveryCount;
    pickUpCount.value = response.data.pickUpCount;



  } catch (err) {
    console.error('Error Count Selected Service:', err);
  }
}

const totalallunpaid = ref([]);

const fetchTotalAllUnpaid = async () => {
  try {
    const response = await axios.get('/totalAllUnpaid');
    totalallunpaid.value = response.data.totalUnpaid;
    // alert(totalallunpaid.value);
    console.log('Total of All Unpaid:', totalallunpaid.value);
  } catch (err) {
    console.error('Error Fetching Total of All Unpaid :', err);
  }
};

const totalallsales = ref([]);

const fetchTotalAllSales = async () => {
  try {
    const response = await axios.get('/totalAllSales');
    totalallsales.value = response.data.totalSales;
    // alert(totalallsales.value);
    console.log('Total of All Sales:', totalallsales.value);
  } catch (err) {
    console.error('Error Fetching Total of All Sales :', err);
  }
};


const getOverAllExpenses = ref([]);

const fetchAllExpenses = async () => {
  try {
    const response = await axios.get('/getExpense');
    getOverAllExpenses.value = response.data.overallYearlyTotal;
    // alert(getOverAllExpenses.value);
    console.log('Total of Expenses:', getOverAllExpenses.value);
  } catch (err) {
    console.error('Error Fetching Total of Expenses:', err);
  }
};


// Call the function when the component is mounted
onMounted(()=>{
  fetchTotalCustomers();
  fetchTotalSelectedService();
  fetchTotalAllUnpaid();
  fetchTotalAllSales();
  fetchAllExpenses();
});
</script>

<template>
    
    <div class="  mx-4 grid grid-cols-2 lg:grid-cols-6  pb-3">
      <!-- box1 -->
      <div class="border rounded-md h-[110px] flex justify-center items-center mx-1 mt-5"
        style="background: linear-gradient(0deg, #41B6FF 0%, #41B6FF 69%, #6597B6 100%);">
        <div>
          <div class="h-[60px] flex justify-center items-end text-xl">{{ totalallsales||0 }}</div>
          <div class="flex justify-center items-end text-xl h-[30px] mt-3">
            <img class="h-8 mr-2" src="../assets/sales.png" alt="">
            <span class="poppins-regular text-sm">SALES</span>
          </div>
        </div>
      </div>
  
      <!-- box2 -->
      <div class="border rounded-md h-[110px] flex justify-center items-center mx-1 mt-5"
        style="background: linear-gradient(0deg, #41B6FF 0%, #41B6FF 69%, #6597B6 100%);">
        <div>
          <div class="h-[60px] flex justify-center items-end text-xl">{{ deliveryCount||0 }}</div>
          <div class="flex justify-center items-end text-xl h-[30px] mt-3">
            <img class="h-8 mr-2" src="../assets/delivery.png" alt="">
            <span class="poppins-regular text-sm">DELIVER</span>
          </div>
        </div>
      </div>
  
      <!-- box3 -->
      <div class="border rounded-md h-[110px] flex justify-center items-center mx-1 mt-5"
        style="background: linear-gradient(0deg, #41B6FF 0%, #41B6FF 69%, #6597B6 100%);">
        <div>
          <div class="h-[60px] flex justify-center items-end text-xl">{{ pickUpCount||0}}</div>
          <div class="flex justify-center items-end text-xl h-[30px] mt-3">
            <img class="h-8 mr-2" src="../assets/pickup.png" alt="">
            <span class="poppins-regular text-sm">PICK UP</span>
          </div>
        </div>
      </div>
  
      <!-- box4 -->
      <div class="border rounded-md h-[110px] flex justify-center items-center mx-1 mt-5"
        style="background: linear-gradient(0deg, #41B6FF 0%, #41B6FF 69%, #6597B6 100%);">
        <div>
          <div class="h-[60px] flex justify-center items-end text-xl">{{totalallunpaid||0}}</div>
          <div class="flex justify-center items-end text-xl h-[30px] mt-3">
            <img class="h-8 mr-2" src="../assets/unpaid.png" alt="">
            <span class="poppins-regular text-sm">UNPAID</span>
          </div>
        </div>
      </div>
  
      <!-- box5 -->
      <div class="border rounded-md h-[110px] flex justify-center items-center mx-1 mt-5"
        style="background: linear-gradient(0deg, #41B6FF 0%, #41B6FF 69%, #6597B6 100%);">
        <div>
          <div  class="h-[60px] flex justify-center items-end text-xl">{{totalCustomers||0}}</div>
          <div class="flex justify-center items-end text-xl h-[30px] mt-3">
            <img class="h-8 mr-2" src="../assets/customers.png" alt="">
            <span class="poppins-regular text-sm">CUSTOMERS</span>
          </div>
        </div>
      </div>
  
      <!-- box6 -->
      <div class="border rounded-md h-[110px] flex justify-center items-center mx-1 mt-5"
        style="background: linear-gradient(0deg, #41B6FF 0%, #41B6FF 69%, #6597B6 100%);">
        <div>
          <div class="h-[60px] flex justify-center items-end text-xl">  {{ parseFloat(getOverAllExpenses).toFixed(2)||0}}</div>
          <div class="flex justify-center items-end text-xl h-[30px] mt-3">
            <img class="h-8 mr-2" src="../assets/expense.png" alt="">
            <span class="poppins-regular text-sm">EXPENSE</span>
          </div>
        </div>
      </div>

    </div>
  </template>
  <style>
  #background{
    background-color: green;
  }
</style>