import { ref, watch, onBeforeUnmount } from 'vue'

/**
 * Infinite-scroll list loader. Fetches page 0 via reload(), then appends
 * further pages via loadMore() as the sentinel element (attached to
 * `sentinelRef`) enters the app's internal scroll viewport (.shell__content
 * — see App.vue, which owns the only scrollable region in the app shell).
 *
 * @param {(params: object) => Promise<{items: any[], total: number}>} fetchPage
 * @param {{limit?: number, getParams?: () => object}} options
 */
export function useInfiniteList(fetchPage, options = {}) {
  const limit = options.limit || 25

  const items = ref([])
  const total = ref(0)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref('')
  const sentinelRef = ref(null)

  let currentPage = 0
  let observer = null

  async function fetchAndSet(pageNum, append) {
    const params = { page: pageNum, limit, ...(options.getParams ? options.getParams() : {}) }
    const data = await fetchPage(params)
    items.value = append ? items.value.concat(data.items || []) : (data.items || [])
    total.value = data.total || 0
    currentPage = pageNum
  }

  async function reload() {
    loading.value = true
    error.value = ''
    try {
      await fetchAndSet(0, false)
    } catch (e) {
      error.value = e.response?.data?.message || e.message
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (loadingMore.value || loading.value) return
    if (items.value.length >= total.value) return
    loadingMore.value = true
    try {
      await fetchAndSet(currentPage + 1, true)
    } catch (e) {
      error.value = e.response?.data?.message || e.message
    } finally {
      loadingMore.value = false
    }
  }

  function attachObserver(el) {
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore()
          }
        },
        { root: document.querySelector('.shell__content'), rootMargin: '200px' }
      )
    }
    observer.observe(el);
  }

  watch(sentinelRef, (el, oldEl) => {
    if (oldEl && observer) observer.unobserve(oldEl)
    if (el) attachObserver(el)
  })

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
  })

  return { items, total, loading, loadingMore, error, sentinelRef, reload, loadMore }
}
