<script setup>
import { ref, onMounted, inject, computed, unref, watch, provide } from "vue";

import Coordinates from "../components/Coordinates.vue";

//injected from ../plugins/maps.js
const showMap = inject("showMap");
const clearMarkers = inject("clearMarkers");
const allPoints = inject("marks");

const map = ref(null);

//to render the map when the board is mounted
onMounted(() => {
  showMap(map.value);
  return { map };
});

//calling the clearMarkers function from the map.js plugin if there are points on the board(allPoints.vallue.length > 0)
function clearPoints() {
  if (allPoints.value.length > 0) {
    clearMarkers();
  }
}
</script>

<template>
  <!-- notifications appearing on the bottom right corner -->
  <notifications
    group="notification"
    position="bottom right"
    :speed="500"
    :duration="500"
  />
  <div id="board">
    <div class="content">
      <div id="groups">
        <h1>Groups</h1>
        <Coordinates :points="allPoints" />
      </div>
      <div class="clearButton" @click="clearPoints">Clear points</div>
    </div>
    <div ref="map" id="map"></div>
  </div>
</template>

<style scoped>
#board {
  @apply flex;
  background: #fff;
  border-radius: 25px;
  padding: 20px;
  margin: 0 auto;
  width: 70vw;
  height: 90vh;
  min-height: 721px;
  min-width: 1040px;
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.12);
  max-height: 1000px;
  max-width: 1500px;
}

#map {
  width: 72.5%;
  height: 100%;
  background: #f3f3f3;
  border-radius: 25px;
}

.content {
  @apply flex flex-col justify-between;
  width: 27.5%;
  height: 100%;
}

#groups {
  max-height: calc(100% - 50px);
  overflow-y: scroll;
  padding: 5px;
  margin-right: 10px;
}

h1 {
  font-size: 20px;
  margin-bottom: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.clearButton {
  @apply pt-2 pb-1 text-center;
  width: 120px;
  cursor: pointer;
  color: #2265f1;
  font-weight: 600;
  border-radius: 4px;
  background-color: rgba(34, 101, 241, 0.08);
}

@media screen and (max-width: 1060px) {
  #board {
    @apply flex flex-col-reverse justify-between;
    height: unset;
    padding: 10px;
    margin: 0 auto;
    width: 95vw;
    min-width: unset;
  }
  #map {
    width: 100%;
    height: 50vh;
    min-height: unset;
  }
  .content {
    width: 100%;
    min-height: unset;
    padding-top: 20px;
    height: 50vh;
    margin: 0px 10px 10px 10px;
  }
}
</style>
