<template>
  <div class="max-w-5xl mx-auto p-4 space-y-4">
   <form 
      @submit.prevent="createInput"
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

    <div v-for="item in items">
      <p 
        class="p-1 rounded-md space-y-1">
        <div class="flex justify-between">
          <span>{{ item.item }}</span> 
          <div class="flex justify-between gap-4">
            <input
              v-model="newInput"
              type="text"
              class="border border-gray-300 rounded-md w-full">

            <button
              @click="updateInput(item.id)" 
              class="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 duration-300 easy-in-out cursor-pointer">
              update
            </button>

            <button
              @click="deleteInput(item.id)" 
              class="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 duration-300 easy-in-out cursor-pointer">
              delete
            </button>
          </div>
        </div>
      </p>
    </div>
  </div>
</template>

<script setup>
  const userInput = ref('')
  const newInput = ref('')

  const { getItems, createItems, deleteItems, updateItem } = useDirectusItems();

  const items = ref([])

  items.value = await getItems({
    collection: "items",
    params: { fields: ['*'] }
  })

  
  const createInput = async () => {
    if (!userInput.value) return
    
    try {
      await createItems({ 
        collection: "items", 
        items: {
          item: userInput.value,
        }
      });

      userInput.value = ''
      

    } catch (e) {}
  };

  const updateInput = async (id) => {
    if (!newInput.value) return

    try {
      await updateItem({ 
        collection: "items", 
        id: id,
        item: {
          item: newInput.value,
        }
      });

      newInput.value = ''
      

    } catch (e) {}
  };

  const deleteInput = async (id) => {
    try {
      await deleteItems({ 
        collection: "items", 
        items: [ id ]
      });
    } catch (e) {}
  };

  const url = 'wss://directuscon.axtlust.de/websocket'
  const access_token = 'ru4op27nGb8llU2civENYgnJmeNU7Asu'

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
        collection: "items",
        uid: "items-subscription"
      }))
    }

    if (data.type === "subscription") {

      if (data.event === "create") {
        items.value.push(data.data[0])
      }

      if (data.event === "update") {
        const index = items.value.findIndex(i => i.id === data.data[0].id)
        if (index !== -1) {
          items.value[index] = data.data[0]
        }
      }

      if (data.event === "delete") {
        items.value = items.value.filter(i => i.id !== data.data[0])
      }
    }
  })



 
</script>

<style scoped>

</style>