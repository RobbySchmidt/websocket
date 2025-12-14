<template>
  <div class="max-w-3xl mx-auto p-4">
    <button
      class="bg-red-500 rounded-md px-3 py-1 text-white hover:cursor-pointer hover:bg-red-400 duration-300 ease-in-out ml-auto block"
      @click="doLogout">
      Logout
    </button>
    <form 
      @submit.prevent="createInput"
      class="flex gap-6 my-4">

      <input
        v-model="userInput"
        type="text"
        class="border border-gray-300 rounded-md w-full">

        <button 
          type="submit"
          class="bg-green-500 flex-none rounded-md px-3 py-1 text-white hover:cursor-pointer hover:bg-green-400 duration-300 ease-in-out">
          add to list
        </button>
    </form>

    <ul v-for="item in tasks">
      <li class="flex justify-between space-y-1">
        <span
          :class="{'line-through' : item.done}">
          {{ item.task }}
        </span> 
        <div class="flex justify-between gap-1">
          <button
            @click="updateTask(item)" 
            class="cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" 
              fill="white" 
              viewBox="0 0 24 24" 
              stroke-width="1.5" 
              :stroke="item.done ? '#22c55e' : '#eab308'" 
              class="size-6">
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>

          </button>

          <button
            @click="deleteInput(item.id)" 
            class="cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ef4444" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
        </div>
      </li>
    </ul>
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
  const newInput = ref('')

  const { getItems, createItems, deleteItems, updateItem } = useDirectusItems();

  const tasks = ref([])

  tasks.value = await getItems({
    collection: "tasks",
    params: { fields: ['*'] }
  })

  
  const createInput = async () => {
    if (!userInput.value) return
    
    try {
      await createItems({ 
        collection: "tasks", 
        items: {
          task: userInput.value,
        }
      });

      userInput.value = ''
      

    } catch (e) {}
  };

  const updateTask = async (item) => {
    item.done = !item.done

    try {
      await updateItem({
        collection: "tasks",
        id: item.id,
        item: { 
          done: item.done 
        }
      })
    } catch (e) {}
  }

  const deleteInput = async (id) => {
    try {
      await deleteItems({ 
        collection: "tasks", 
        items: [ id ]
      });
    } catch (e) {}
  };

  const url = import.meta.env.VITE_WEBSOCKET_URL
  const access_token = import.meta.env.VITE_DIRECTUS_API_TOKEN

  const connection = new WebSocket(url)

  connection.addEventListener('open', () => {
    console.log("WS opened, authenticating...")

    connection.send(JSON.stringify({
      type: "auth",
      access_token
    }))
  })

  connection.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)
    console.log("WS message:", data)

    if (data.type === "auth" && data.status === "ok") {
      console.log("Authenticated! Now subscribing...")

      connection.send(JSON.stringify({
        type: "subscribe",
        collection: "tasks",
        uid: "items-subscription"
      }))
    }

    if (data.type === "subscription") {

      if (data.event === "create") {
        tasks.value.push(data.data[0])
      }

      if (data.event === "update") {
        const index = tasks.value.findIndex(i => i.id === data.data[0].id)
        if (index !== -1) {
          tasks.value[index] = data.data[0]
        }
      }

      if (data.event === "delete") {
        tasks.value = tasks.value.filter(i => i.id !== data.data[0])
      }
    }
  }) 
</script>

<style scoped>

</style>