<script setup>
import { inject } from 'vue';

// Injecting provided properties
const modalData = inject('modalData');

</script>


<template>
 <!-- Start of Add New Modal -->
 <section v-if="modalData.showAddModal"
            class="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full  before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]  z-10">
            <div class="w-[1000px]  bg-white rounded-lg py-2 relative lg:pb-2 xl:pb-2 pb-4 ">

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
                    <form novalidate id="form" name="form" @submit.prevent="modalData.send()" class="w-full">
                        <div class="px-2 w-full lg:flex xl:flex md:block">
                            <div class="w-full ">
                                <div class="lg:flex xl:flex md:block mt-3 justify-center w-full">

                                    <div class="w-full mr-1">
                                        <label>FIRSTNAME</label>
                                        <input v-model="modalData.firstName"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="text">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>MIDDLE NAME</label>
                                        <input v-model="modalData.middleName"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="text">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>LAST NAME</label>
                                        <input v-model="modalData.lastName"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="text">
                                    </div>
                                </div>
                                <div class="lg:flex xl:flex md:block mt-3   justify-center">
                                    <div class="w-full mr-1">
                                        <label>CONTACT NO.</label>
                                        <input v-model="modalData.contact"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2" type="tel">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>EMAIL</label>
                                        <input v-model="modalData.email"
                                            class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                            type="email">
                                    </div>
                                    <div class="w-full mr-1">
                                        <label>GENDER</label>
                                        <select name="gender" id="gender" v-model="modalData.gender"
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
                                        <select name="accounType" id="accountType" v-model="modalData.accountType"
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
                                        <input v-model="modalData.address"
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
                                            <img v-if="modalData.previewUrl" :src="modalData.previewUrl"
                                                class="lg:h-full xl:h-full h-[100%] lg:w-full xl:w-full w-full   "
                                                alt="">
                                        </div>
                                    </div>
                                    <!-- End of Browse Profile -->

                                    <!-- Start of Browse Button -->
                                    <div class="flex justify-center mt-2 mb-3">
                                        <input @change="modalData.handleProfile" name="file" type="file" id='file'
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
                                <input v-model="modalData.username"
                                    class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2"
                                    autocomplete="username" type="text">
                            </div>
                            <div class="w-full mr-1">
                                <label>Password</label>
                                <div class="relative">
                                    <input v-model="modalData.password" :type="modalData.showPassword ? 'text' : 'password'"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2 pr-8"
                                        autocomplete="new-password" type="password">
                                    <i v-if="password.length > 0"
                                        :class="showPassword ? 'fa fa-eye' : 'fa fa-eye-slash'"
                                        class="absolute right-2 top-2 cursor-pointer" @click="modalData.toggleShowPassword"></i>
                                </div>
                            </div>
                            <div class="w-full mr-1">
                                <label>Re-type Password</label>
                                <div class="relative">
                                    <input v-model="modalData.retypePassword" :type="showRetypePassword ? 'text' : 'password'"
                                        class="border border-black block w-full px-2 py-1 shadow-md rounded-md mb-2 pr-8"
                                        autocomplete="new-password" type="password">
                                    <i v-if="retypePassword.length > 0"
                                        :class="showRetypePassword ? 'fa fa-eye' : 'fa fa-eye-slash'"
                                        class="absolute top-2 right-2 cursor-pointer"
                                        @click="modalData.toggleShowRetypePassword"></i>
                                </div>
                            </div>
                            <div class="w-full flex items-center  mt-4">
                                <button type="submit" class="w-full  bg-[#4E95C9] border  shadow-md rounded-md lg:mx-2 xl:mx-2 py-1"><i
                                        class="fas fa-check mr-1"></i>{{
                                            modalData.save }}</button>
                            </div>
                        </div>
                    </form>
                    <!-- End of Form -->
                </section>
            </div>
        </section>
        <!-- End of Add Modal -->


</template>