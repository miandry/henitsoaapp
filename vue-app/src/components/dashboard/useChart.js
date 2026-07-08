import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const colors = {
  primary: '#b0242c',
  accent: '#e8ac3a',
  primaryLight: '#fbeaea',
  muted: '#94a3b8'
}

export function createBarChart(canvas, labels, data, label = 'Effectif') {
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: colors.primary,
        borderRadius: 6,
        maxBarThickness: 36
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
        x: { ticks: { maxRotation: 45, minRotation: 0, font: { size: 11 } } }
      }
    }
  })
}

export function createDoughnutChart(canvas, labels, data) {
  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [colors.primary, colors.accent, colors.muted],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } } }
    }
  })
}

export function createLineChart(canvas, labels, datasets) {
  return new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  })
}
