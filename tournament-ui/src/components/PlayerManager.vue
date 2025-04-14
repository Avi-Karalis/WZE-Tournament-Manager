<template>
  <div class="p-4 border rounded shadow mb-6">
    <h2 class="text-xl font-bold mb-2">Player Manager</h2>

    <form @submit.prevent="registerPlayer" class="flex items-center gap-2 mb-4">
      <input v-model="newPlayer.name" placeholder="Enter player name" class="border p-2 rounded flex-1" />
      <input v-model="newPlayer.faction" placeholder="Enter faction" class="border p-2 rounded flex-1" />
      <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Add</button>
    </form>

    <ul class="space-y-2">
      <li
        v-for="player in players"
        :key="player.name"
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 p-2 rounded"
      >
        <div v-if="editedPlayer !== player.name" class="flex-1">
          <span class="font-medium">{{ player.name }}</span> — TP: {{ player.tournamentPoints }}, VP: {{ player.victoryPoints }} — Faction: {{ player.faction }}
        </div>

        <div v-else class="flex flex-col sm:flex-row gap-2 flex-1">
          <input v-model="editForm.name" class="border p-1 rounded" />
          <input v-model="editForm.faction" class="border p-1 rounded" />
        </div>

        <div class="mt-2 sm:mt-0 flex gap-2">
          <button
            v-if="editedPlayer !== player.name"
            @click="startEdit(player)"
            class="bg-yellow-400 text-white px-2 py-1 rounded text-sm"
          >Edit</button>
          <button
            v-else
            @click="saveEdit(player.name)"
            class="bg-blue-500 text-white px-2 py-1 rounded text-sm"
          >Save</button>
          <button
            @click="removePlayer(player.name)"
            class="bg-red-500 text-white px-2 py-1 rounded text-sm"
          >Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const newPlayer = ref({ name: '', faction: '' })
const players = ref([])

const editedPlayer = ref(null)
const editForm = ref({ name: '', faction: '' })
defineExpose({
  fetchPlayers
})
async function fetchPlayers() {
  const res = await axios.get('http://localhost:3000/players')
  players.value = res.data
}

async function registerPlayer() {
  if (!newPlayer.value.name.trim()) return
  await axios.post('http://localhost:3000/register', {
    name: newPlayer.value.name.trim(),
    faction: newPlayer.value.faction.trim(),
  })
  newPlayer.value = { name: '', faction: '' }
  fetchPlayers()
}

async function removePlayer(name) {
  if (!confirm(`Delete player "${name}"?`)) return
  await axios.delete(`http://localhost:3000/player/${encodeURIComponent(name)}`)
  fetchPlayers()
}

function startEdit(player) {
  editedPlayer.value = player.name
  editForm.value = { name: player.name, faction: player.faction }
}

async function saveEdit(originalName) {
  await axios.put(`http://localhost:3000/player/${encodeURIComponent(originalName)}`, {
    name: editForm.value.name.trim(),
    faction: editForm.value.faction.trim(),
  })
  editedPlayer.value = null
  fetchPlayers()
}

onMounted(fetchPlayers)
</script>
