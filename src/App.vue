<script lang="ts">
export default {};
</script>

<template>
   <div class="px-8 py-4">
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
      <hr class="bg-rose-600" />
      <div class="mb-4 mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
         <div
            class="active-coin flex flex-col items-center rounded-md p-4 hover:cursor-pointer"
         >
            <p class="text-gray-400">WTF - USD</p>
            <h3 class="mb-4 text-2xl mt-2">1.11</h3>
            <button
               class="flex rounded-lg px-4 py-2 transition-colors hover:bg-gray-200"
            >
               <img src="assets/delete-icon.png" class="w-5" alt="" />
               Удалить
            </button>
         </div>
         <div
            class="flex flex-col items-center rounded-md p-4 hover:cursor-pointer"
         >
            <p class="text-gray-400">WTF - USD</p>
            <h3 class="mb-4 text-2xl mt-2">1.11</h3>
            <button
               class="flex rounded-lg px-4 py-2 transition-colors hover:bg-gray-200"
            >
               <img src="assets/delete-icon.png" class="w-5" alt="" />
               Удалить
            </button>
         </div>
      </div>
      <hr />
   </div>
</template>

<style scoped>
.active-coin {
   border: 3px solid rgb(95, 43, 226);
}
</style>
