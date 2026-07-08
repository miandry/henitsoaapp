<template>
  <div class="panel chart-panel">
    <h2 class="panel__title">Effectifs par classe</h2>
    <div class="chart-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>
    <p v-if="!items.length" class="panel__empty">Aucune inscription pour cette année.</p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { createBarChart } from './useChart.js'

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
  if (!canvasRef.value || !props.items.length) return
  const top = props.items.slice(0, 10)
  chart = createBarChart(
    canvasRef.value,
    top.map((r) => r.classe),
    top.map((r) => r.count)
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

.panel__empty {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
