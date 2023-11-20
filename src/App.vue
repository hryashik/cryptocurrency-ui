<script lang="ts">
export default {};
</script>

<template>
   <div class="p-2">
      <div class="w-82">
         <form @submit.prevent="" class="flex flex-col items-start">
            <label for="ticker-input mb-2">Ticker</label>
            <input
               id="ticker-input"
               type="text"
               class="w-64 rounded-md border-indigo-300 px-2 shadow-xl focus:border-b-2 focus:outline-none"
            />
            <input
               type="submit"
               value="+  Add"
               class="rounded-full bg-gray-500 px-4 py-2"
            />
         </form>
      </div>
   </div>
</template>
