<script lang="ts">
export default {};
</script>

<template>
   <div class="p-2">
      <div class="w-82 mb-6">
         <form @submit.prevent="" class="flex flex-col items-start">
            <label for="ticker-input">Тикер</label>
            <input
               id="ticker-input"
               type="text"
               class="mb-4 mt-3 w-64 rounded-md border-b-2 border-indigo-300 border-opacity-0 px-2 shadow-xl focus:border-b-2 focus:border-opacity-100 focus:outline-none"
            />
            <input
               type="submit"
               value="+  Добавить"
               class="rounded-full bg-gray-500 px-4 py-2 text-white hover:cursor-pointer active:bg-gray-600"
            />
         </form>
      </div>
      <hr />
   </div>
</template>
