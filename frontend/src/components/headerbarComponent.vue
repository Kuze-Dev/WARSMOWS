<script setup>
import { ref, onMounted } from 'vue';
import { decodeJWT } from '../stores/jwt'; 

const token = ref(localStorage.getItem('token'));
const role = ref('');

// Decode the token and extract the accountType (role)
onMounted(() => {
  if (token.value) {
    try {
      const decoded = decodeJWT(token.value);
      role.value = decoded.accountType;
      console.log('User Role:', role.value);
    } catch (error) {
      console.error('Error', error.message);
     
    }
  }
});
</script>


<template>
    <div v-if="role === 'POS User' || role === 'Delivery Boy'" class=" border-b border-r border-t w-[400px] h-[61px] lg:block xl:block hidden ">
      <div class="flex mr-auto mx-2 bg-white h-[60px] ">
        <img class="w-[57px] mx-2 mt-1" src="../assets/logowarsmows.png" alt="">
        <img class="w-[100px] h-[25px] mt-5" src="../assets/textwarsmows.png" alt="">
      </div>
    </div>
  </template>