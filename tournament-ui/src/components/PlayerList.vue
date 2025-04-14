<template>
    <div>
      <h2 class="text-xl font-bold">Players</h2>
      <ul>
        <li v-for="player in players" :key="player.name">
          {{ player.name }} - TP: {{ player.tournamentPoints }} VP: {{ player.victoryPoints }}
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const players = ref([])
  
  onMounted(async () => {
    const res = await axios.get('http://localhost:3000/players')
    players.value = res.data
  })
  </script>
  