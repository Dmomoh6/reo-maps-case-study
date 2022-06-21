<template>
  <div class="coordinates">
    <div class="points" v-for="group in groups" :key="group.id">
      <button @click="changeGroupColor(group.id)" class="group">
        <div class="tag" :style="`background-color: ${group.color}`"></div>
        Group
      </button>
      <div class="point" v-for="point in points" :key="point.id">
        <template v-if="group.points.includes(point.id)">
          <button @click="changeName(point.id)" class="nameButton">
            {{ point.name }}</button
          ><span class="latlng">
            {{ approx(point.lat) }}; {{ approx(point.lng) }};
          </span>
        </template>
      </div>
    </div>
    <div class="points">
      <div class="ungrouped">{{ ungrouped > 0 ? "Ungrouped" : "" }}</div>
      <div class="point" v-for="point in points" :key="point.id">
        <template v-if="point.group === 'ungrouped'">
          <button @click="changeName(point.id)" class="nameButton">
            {{ point.name }}</button
          ><span class="latlng">
            {{ approx(point.lat) }}; {{ approx(point.lng) }};
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from "vue";

const props = defineProps(["points"]);

const groups = inject("groups");

// approximate toe lng and lat to 3 decimal places
function approx(number) {
  return number.toFixed(3);
}

let ungrouped = computed(() => {
  let a = 0;
  if (props.points.length > 0) {
    a = props.points.filter((point) => point.group === "ungrouped").length;
  }
  return a;
});

const changeName = inject("changeName");
const changeGroupColor = inject("changeGroupColor");
</script>

<style>
.tag {
  width: 12.5px;
  height: 12.5px;
  margin-top: 3.5px;
  margin-right: 6.5px;
}

.coordinates {
  font-weight: 600;
}

.points {
  margin-bottom: 15px;
}

.latlng {
  color: #767676;
  margin-left: 3px;
  font-weight: normal;
}

.nameButton:hover {
  background-color: #f3f3f3;
}

.group:hover {
  background-color: #f3f3f3;
}

.group {
  @apply flex;
  border-radius: 5px;
}
</style>
