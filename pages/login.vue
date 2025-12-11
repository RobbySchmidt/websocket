<template>
  <div class="max-w-sm mx-auto mt-8 p-4">
    <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

    <form @submit.prevent="onSubmit">
      <div class="mb-4 space-y-1">
        <label for="email" class="block text-sm font-medium">Email Address</label>
        <input
          v-model="email"
          type="email"
          id="email"
          class="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
          placeholder="Your email"
        />
      </div>

      <div class="mb-6 space-y-1">
        <label for="password" class="block text-sm font-medium">Password</label>
        <input
          v-model="password"
          type="password"
          id="password"
          class="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
          placeholder="Your password"
        />
      </div>

      <div v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</div>

      <div class="flex justify-center">
        <button 
          :disabled="loading" 
          type="submit" 
          class="bg-purple-500 hover:bg-purple-600 text-white rounded-md px-4 py-2 w-full cursor-pointer duration-300 ease-in-out"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Login</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  const { login } = useDirectusAuth(); 
  
  const email = ref(""); 
  const password = ref(""); 
  const errorMessage = ref('');
  const loading = ref(false);

  const onSubmit = async () => {
    if (loading.value) return; // prevent multiple submissions
    loading.value = true;

    try {
      const logdata = await login({ email: email.value, password: password.value });
      if (logdata?.user) {
        // Redirect to homepage or dashboard after login success
        navigateTo('/');
      }
    } catch (e) {
      console.error(e);
      errorMessage.value = 'Incorrect email or password. Please try again.';
      setTimeout(() => {
        errorMessage.value = '';
      }, 3000);
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped>
  
</style>
