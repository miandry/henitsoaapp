<template>
  <div class="panel chart-panel">
    <h2 class="panel__title">Garçons / Filles</h2>
    <div class="chart-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { createDoughnutChart } from './useChart.js'

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
  if (!canvasRef.value) return
  const filtered = props.items.filter((r) => r.count > 0)
  if (!filtered.length) return
  chart = createDoughnutChart(
    canvasRef.value,
    filtered.map((r) => r.label),
    filtered.map((r) => r.count)
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
