<script setup>
  import { ref } from 'vue'
  import PlayerManager from './components/PlayerManager.vue'
  import Pairings from './components/Pairings.vue'
  const playerManager = ref(null)
  const refreshPlayers = () => {
  if (playerManager.value) {
    playerManager.value.fetchPlayers() // Call the fetchPlayers method of PlayerManager
  }
}
</script>

<template>
  <div>
    <div class="p-4">
      <div>
        <img src="./assets/wze-gr.png"/>
      </div>
      <div>
        <PlayerManager ref="playerManager"/>
      </div>
    </div>
    <div>
      <Pairings @refreshPlayers="refreshPlayers"/>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
img {
  height: 300px;
}
</style>
