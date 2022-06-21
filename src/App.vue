<script setup>
import Board from "./views/Board.vue";
</script>

<template>
  <Board />
</template>

<style>
#app {
  background-color: rgba(34, 101, 241, 0.08);
  width: 100vw;
  height: 100vh;
  position: fixed;
  overflow-y: scroll;
  overflow-x: hidden;
  left: 0px;
  margin: 0;
  padding: 170px 0;
}

@media screen and (max-width: 1060px) {
  #app {
    padding: 25px 0;
  }
}
</style>
