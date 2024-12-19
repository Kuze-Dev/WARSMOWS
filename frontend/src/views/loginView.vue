<script setup>
import { ref } from 'vue';
import axios from '../../axios';

const email = ref();
const password = ref('');
const btn = ref('log In');
const validateError = ref('');
const showPassword = ref(false);

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};


const login = () => {
  btn.value = 'logging';
  const data = {
    email: email.value,
    password: password.value
  };



  axios.post('/login', data).then((response) => {

    setTimeout(() => {
      btn.value = 'log In';
      if (response.data.error) {
        validateError.value = response.data.error;
        return
      }
      if (response.data.success) {
        validateError.value = '';
        console.log(response.data.token);
        localStorage.setItem('token', response.data.token);
        location.reload();

      } else {
        validateError.value = response.data.errors[0].msg;
      }
    }, 2000);
  });

}
</script>

<template>
  <main class="fixed flex justify-center items-center mx-auto h-full w-full">
    <!-- Video Background -->
    <video autoplay muted loop class="absolute top-0 left-0 w-full h-full object-cover z-[-1]">
      <source src="../assets/waterrising.mp4" type="video/mp4">
    </video>

    <div
      class="border bg-white lg:w-[55%] xl:w-[55%] w-[90%] rounded-lg shadow-lg flex justify-center h-[500px] relative">
      <img src="../assets/image.png" class="w-[50%] rounded-lg lg:block xl:block hidden" />
      <section class="w-[90%] lg:w-full xl:w-1/2 py-12">
        <div class="lg:w-[80%] xl:w-[80%] w-full  mx-auto">
          <div class="flex justify-center lg:hidden xl:hidden ">
            <img class="h-16" src="../assets/logowarsmows.png" alt="">
          </div>
          <h1 class="font-bold lg:text-3xl text-center mb-4 custom-shadow">
            <div>
              Welcome to <span class="text-blue-500">RR WaterRefilling</span> System
            </div>
            <div class="flex justify-center">
              <div class="w-[50%]"></div>
              <div class="w-[100%] border-b-2 py-1"></div>
              <div class="w-[50%]"></div>
            </div>
          </h1>

          <div class="h-5">
            <small class="text-red-500 flex justify-center">
              {{ validateError === 'Internal server error!' ? validateError : validateError === 'Invalid credentials!' ?
                validateError : validateError === 'User not found!' ? validateError : '' }}
            </small>
          </div>
          <form novalidate class="py-8  w-[85%] mx-auto" @submit.prevent="login">
            <input type="email" placeholder="Email" v-model="email" autocomplete="username"
              class="font-sans border-b-[2px] w-full text-xl placeholder: outline-none focus:border-blue-500 transition duration-300">
            <small class="text-red-500 w-full">{{ validateError === 'Email is required.' ? validateError : validateError
                === 'Invalid email format' ? validateError : '' }}</small>
            <div class="relative inline-block w-full">
              <input :type="showPassword ? 'text' : 'password'" placeholder="Password" v-model="password"
                autocomplete="current-password"
                class="border-b-2 mt-10 w-full text-xl placeholder: outline-none pr-9 focus:border-blue-500 transition duration-300">
              <i v-if="password.length > 0" :class="showPassword ? 'fa fa-eye' : 'fa fa-eye-slash'"
                class="absolute top-12 right-2 cursor-pointer text-gray-700" @click="toggleShowPassword"></i>
            </div>
            <small class="text-red-500 w-full">{{ validateError === 'Password is required.' ? 'Password is required.' :
              '' }}</small>
            <button type="submit"
              class="mt-12 border w-full rounded-full py-2 bg-blue-600 text-white text-1xl font-bold focus:ring-4 focus:ring-blue-300 hover:bg-blue-700 transition duration-300">{{
              btn }}</button>
          </form>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.custom-shadow {
  filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.2));
}

/* For Microsoft Edge */
input::-ms-reveal {
  display: none;
}
</style>


