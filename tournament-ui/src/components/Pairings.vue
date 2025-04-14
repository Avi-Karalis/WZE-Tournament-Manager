<template>
  <div>
    <button @click="getPairings" :disabled="round > 3" class="bg-blue-500 text-white p-2 rounded">
      Pair Next Round
    </button>
    <div>
      <h2 class="text-xl mt-4">Round {{ round }}</h2>
    </div>
    <div v-if="round > 3">
      <h2 class="text-xl mt-4">Tournament Over</h2>
      <p>Thank you for participating!</p>
      <button @click="resetTournament" class="mt-4 bg-red-500 text-white px-4 py-2 rounded">Reset Tournament</button>
    </div>

    <div v-if="pairings.length && round <= 3">
      <h2 class="text-xl mt-4">Pairings</h2>
      <div v-for="pair in pairings" :key="pair.p1 + (pair.p2 || 'bye')" class="my-2">
        <div>
          {{ pair.p1 }} vs {{ pair.p2 || 'BYE' }}
        </div>
        <div v-if="pair.p2" class="flex gap-2">
          <input type="number" v-model.number="results[pair.p1]" :placeholder="`VP ${pair.p1}`" class="border p-1 rounded" />
          <input type="number" v-model.number="results[pair.p2]" :placeholder="`VP ${pair.p2}`" class="border p-1 rounded" />
        </div>
      </div>

      <button @click="submitAll" class="mt-4 bg-green-500 text-white px-4 py-2 rounded">Submit All</button>
    </div>
  </div>
</template>

<script setup>
import { ref , defineEmits } from 'vue'
import axios from 'axios'
const round = ref(0)
const pairings = ref([])
const results = ref({})
const emit = defineEmits(['refreshPlayers'])
// Fetch pairings for the current round
async function getPairings() {
  const res = await axios.post('http://localhost:3000/pairings')
  pairings.value = res.data
  results.value = {} // Clear old results
  round.value++
}

// Submit all results at once
async function submitAll() {
  for (const pair of pairings.value) {
    const payload = {
      p1: pair.p1,
      p2: pair.p2,
      vp1: results.value[pair.p1] || 0,
      vp2: pair.p2 ? results.value[pair.p2] || 0 : 0,
    }

    // Send match results to the server
    await axios.post('http://localhost:3000/match', payload)
  }

  await axios.post('http://localhost:3000/round', {fromFront: round.value+1})
  pairings.value={};
  emit('refreshPlayers');
}
async function resetTournament() {
  await axios.post('http://localhost:3000/reset')
  pairings.value={};
  emit('refreshPlayers');
}
</script>
