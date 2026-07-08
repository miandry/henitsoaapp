<template>
  <div class="panel chart-panel">
    <h2 class="panel__title">Évolution des inscriptions</h2>
    <div class="chart-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { createLineChart } from './useChart.js'

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const canvasRef = ref(null)
let chart = null

function render() {
  if (chart) {
    chart.destroy()
    chart = null
  }
  if (!canvasRef.value || props.items.length < 2) return
  chart = createLineChart(
    canvasRef.value,
    props.items.map((r) => r.annee),
    [{
      label: 'Inscriptions',
      data: props.items.map((r) => r.count),
      backgroundColor: '#b0242c',
      borderRadius: 6
    }]
  )
}

watch(() => props.items, render, { deep: true })
onMounted(render)
onBeforeUnmount(() => chart?.destroy())
</script>

<style scoped>
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 14px 16px;
}

.panel__title {
  margin: 0 0 12px;
  font-size: 15px;
}

.chart-wrap {
  height: 220px;
  position: relative;
}
</style>
