<template>
  <div class="backdrop-blur-lg bg-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 border border-white/20">
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Upload PDF Document</h2>
    
    <!-- Upload Area -->
    <div class="group">
      <label class="relative block w-full h-64 cursor-pointer overflow-hidden rounded-xl border-3 border-dashed border-indigo-300 hover:border-indigo-500 transition-all duration-300 bg-linear-to-b from-white/50 to-white/30"
        :class="{ 'border-indigo-500 bg-indigo-50/20': isDragging }"
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div class="absolute inset-0 bg-linear-to-b from-transparent via-indigo-50/10 to-indigo-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="absolute inset-0 flex flex-col items-center justify-center p-6">
          <!-- Upload Icon Container -->
          <div class="p-6 rounded-full bg-linear-to-r from-indigo-100 to-purple-100 shadow-xl mb-4 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
            <svg class="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <!-- File Name Display -->
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">
              {{ selectedFile ? selectedFile.name : 'Drop your file here' }}
            </h3>
            <div class="flex items-center justify-center space-x-2">
              <span class="px-4 py-2 bg-white/80 rounded-full text-sm font-medium text-indigo-600 shadow-sm group-hover:bg-white group-hover:shadow transition-all duration-300">
                Browse Files
              </span>
              <span class="text-sm text-gray-500">or drag and drop</span>
            </div>
            <p class="mt-2 text-sm text-gray-500">Supports PDF files</p>
          </div>

          <!-- Upload Progress -->
          <div v-if="processing" class="absolute bottom-4 left-4 right-4">
            <div class="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div class="bg-indigo-500 h-1.5 rounded-full transition-all duration-300 animate-pulse" style="width: 100%"></div>
            </div>
          </div>
        </div>
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          accept=".pdf"
          class="hidden"
        >
      </label>
    </div>

    <!-- AI Model Selection and Action Buttons -->
    <div v-if="selectedFile" class="mt-6 space-y-4">
      <!-- AI Model Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Select AI Model</label>
        <select 
          v-model="selectedAiModel"
          @change="$emit('update:aiModel', selectedAiModel)"
          class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
        >
          <option value="gemini">Gemini AI</option>
          <option value="claude">Claude 3.7 Sonnet</option>
          <option value="gpt-4">GPT-4</option>
        </select>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex gap-4">
        <button 
          @click="$emit('process-file')"
          :disabled="processing"
          class="flex-1 relative px-6 py-4 text-base font-medium text-white transition-all rounded-xl
                 disabled:opacity-50 disabled:cursor-not-allowed
                 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                 shadow-lg hover:shadow-xl"
        >
          <span class="relative z-10 flex items-center justify-center space-x-2">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{{ processing ? 'Processing...' : 'Process PDF' }}</span>
          </span>
          <div class="absolute inset-0 rounded-xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
        </button>

        <button 
          @click="resetForm"
          :disabled="!selectedFile"
          class="relative px-6 py-4 text-base font-medium transition-all rounded-xl
                 disabled:opacity-50 disabled:cursor-not-allowed
                 text-gray-700 bg-gray-100 hover:bg-gray-200
                 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                 shadow-lg hover:shadow-xl"
        >
          <span class="relative z-10 flex items-center justify-center space-x-2">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </span>
          <div class="absolute inset-0 rounded-xl bg-black/5 opacity-0 hover:opacity-100 transition-opacity"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileUploader',
  props: {
    processing: {
      type: Boolean,
      default: false
    },
    aiModel: {
      type: String,
      default: 'gemini'
    }
  },
  emits: ['update:aiModel', 'file-selected', 'process-file'],
  data() {
    return {
      selectedFile: null,
      isDragging: false,
      selectedAiModel: this.aiModel
    }
  },
  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file && file.type === 'application/pdf') {
        this.selectedFile = file;
        this.$emit('file-selected', file);
      } else {
        alert('Please select a PDF file');
      }
    },
    handleDrop(event) {
      this.isDragging = false;
      const file = event.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        this.selectedFile = file;
        this.$emit('file-selected', file);
      } else {
        alert('Please drop a PDF file');
      }
    },
    resetForm() {
      this.selectedFile = null;
      this.selectedAiModel = 'gemini';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
      this.$emit('file-selected', null);
      this.$emit('update:aiModel', 'gemini');
    }
  },
  watch: {
    aiModel(newValue) {
      this.selectedAiModel = newValue;
    }
  }
}
</script>