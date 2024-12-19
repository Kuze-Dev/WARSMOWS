<template>
    <div class="flex flex-col items-center justify-center min-h-screen w-full bg-red-100">
      <h1 class="text-3xl font-bold text-red-600 mb-3">403 - Unauthorized Access</h1>
      <p class="text-lg text-gray-700 mb-5">You do not have permission to view this page.</p>
      <router-link to="/">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Login
        </button>
      </router-link>
    </div>
  </template>
  
  <script setup>
  </script>
  