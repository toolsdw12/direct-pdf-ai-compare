<template>
  <div class="backdrop-blur-lg bg-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 border border-white/20">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Processed Results</h2>
      <div
        v-if="result"
        class="text-sm my-1 p-1 border border-indigo-100 bg-linear-to-r from-indigo-100 to-purple-100 shadow-sm transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-2xl rounded-md"
      >
        <span class="font-medium text-indigo-700">Processing Time:</span>
        {{ (result.timing.duration / 1000).toFixed(2) }}s
      </div>
    </div>
    
    <div v-if="processing" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
    
    <div v-else-if="result" class="space-y-4">
      <div class="p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 shadow-sm">
        <h3 class="text-lg font-semibold text-indigo-900 mb-2">Raw Data</h3>
        <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(result.data, null, 2) }}</pre>
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-64 text-gray-500">
      Upload and process a PDF to see results
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProcessingResults',
  props: {
    processing: {
      type: Boolean,
      default: false
    },
    result: {
      type: Object,
      default: null
    }
  }
}
</script>