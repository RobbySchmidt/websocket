<template>
  <div class="max-w-5xl mx-auto p-4 space-y-4">
    <button
      class="bg-red-500 rounded-md px-3 py-1 text-white hover:cursor-pointer hover:bg-red-400 duration-300 ease-in-out ml-auto block"
      @click="doLogout">
      Logout
    </button>
    <div
      ref="messagesContainer"  
      class="h-128 border border-gray-300 rounded-md p-1 space-y-1 overflow-y-auto">
      <div v-for="message in messages">
        <p 
          class="p-1 rounded-md flex justify-between"
          :class="message.name === user.first_name ? 'bg-blue-300' : 'bg-red-100'">
          <span>{{ message.name }}: {{ message.content }}</span>
          <span>{{ message.date_created }}</span>
        </p>
      </div>
    </div>

    <form 
      @submit.prevent="sendMessage"
      class="flex gap-6">

      <input
        v-model="userInput"
        type="text"
        class="border border-gray-300 rounded-md w-full">

        <button 
          type="submit"
          class="bg-green-500 rounded-md px-3 py-1 text-white hover:cursor-pointer hover:bg-green-400 duration-300 ease-in-out">
          Send
        </button>
    </form>
  </div>
</template>

<script setup>
  definePageMeta({
    middleware: 'auth',
  });

  const { logout } = useDirectusAuth();

  const doLogout = async () => {  
    logout();
    navigateTo('/login')
  };

  const userInput = ref('')
  const messages = ref([])
  const messagesContainer = ref(null)
  const user = useDirectusUser();

  console.log(messages.value)

  const { getItems, createItems } = useDirectusItems();

  const fetchMessages = async () => {
  try {
    const latest = messages.value[messages.value.length - 1];
    const newerMessages = await getItems({
      collection: "messages",
      params: {
        fields: ['*'],
        filter: latest ? { 
          date_created: { 
            _gt: latest.date_created } 
          } : {},
        sort: ['date_created'],
      }
    });

    console.log(messages.value)

    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })

    if (newerMessages.length > 0) {
      messages.value.push(...newerMessages);
    }

    console.log(newerMessages)
  } catch (e) {}
};
  
  const sendMessage = async () => {
    if (!userInput.value) return
    
    try {
      await createItems({ 
        collection: "messages", 
        items: {
          name: user.value.first_name,
          content: userInput.value,
        }
      });

      userInput.value = ''
      await fetchMessages()
      

    } catch (e) {}
  };

  const startPolling = () => {
    setInterval(fetchMessages, 1000);
  };

  onMounted(() => {
    fetchMessages();
    startPolling();
  });
</script>

<style scoped>

</style>