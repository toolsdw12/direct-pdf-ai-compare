<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-center mb-12">
        Financial Data Extractor
        </h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Side: File Upload Section -->
        <div class="backdrop-blur-lg bg-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 border border-white/20">
          <h2 class="text-2xl font-semibold mb-6 text-gray-800">Upload Financial Document</h2>
          
          <!-- Upload Area -->
          <div class="group">
            <label class="relative block w-full h-64 cursor-pointer overflow-hidden rounded-xl border-3 border-dashed border-indigo-300 hover:border-indigo-500 transition-all duration-300 bg-gradient-to-b from-white/50 to-white/30"
              :class="{ 'border-indigo-500 bg-indigo-50/20': isDragging }"
            @dragenter.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
              <div class="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/10 to-indigo-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="absolute inset-0 flex flex-col items-center justify-center p-6">
                <!-- Upload Icon Container -->
                <div class="p-6 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 shadow-xl mb-4 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
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

          <!-- Service Selection and Action Buttons -->
          <div v-if="selectedFile" class="mt-6 space-y-4">
              <!-- OCR Service Selection -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Select OCR Service</label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    @click="selectedService = 'textract'"
                    class="py-3 px-4 rounded-lg border-2 transition-all duration-300"
                    :class="selectedService === 'textract' ? 
                    'border-indigo-500 bg-indigo-50 text-indigo-700' : 
                      'border-gray-200 hover:border-gray-300 text-gray-600'"
                  >
                    <div class="flex items-center justify-center space-x-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>AWS Textract</span>
                    </div>
                  </button>
                  <button 
                    @click="selectedService = 'documentai'"
                    class="py-3 px-4 rounded-lg border-2 transition-all duration-300"
                    :class="selectedService === 'documentai' ? 
                    'border-green-500 bg-green-50 text-green-700' : 
                      'border-gray-200 hover:border-gray-300 text-gray-600'"
                  >
                    <div class="flex items-center justify-center space-x-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Document AI</span>
                    </div>
                  </button>
                  <button 
                    @click="selectedService = 'azure'"
                    class="py-3 px-4 rounded-lg border-2 transition-all duration-300"
                    :class="selectedService === 'azure' ? 
                    'border-blue-500 bg-blue-50 text-blue-700' : 
                      'border-gray-200 hover:border-gray-300 text-gray-600'"
                  >
                    <div class="flex items-center justify-center space-x-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span>Azure Read</span>
                    </div>
                  </button>
                  <button 
                    @click="selectedService = 'azureFormRecognizer'"
                    class="py-3 px-4 rounded-lg border-2 transition-all duration-300"
                    :class="selectedService === 'azureFormRecognizer' ? 
                    'border-blue-500 bg-blue-50 text-blue-700' : 
                      'border-gray-200 hover:border-gray-300 text-gray-600'"
                  >
                    <div class="flex items-center justify-center space-x-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Azure Form</span>
                    </div>
                  </button>
                  <button 
                    @click="selectedService = 'mistral'"
                    class="py-3 px-4 rounded-lg border-2 transition-all duration-300"
                    :class="selectedService === 'mistral' ? 
                    'border-purple-500 bg-purple-50 text-purple-700' : 
                      'border-gray-200 hover:border-gray-300 text-gray-600'"
                  >
                    <div class="flex items-center justify-center space-x-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Mistral AI</span>
                    </div>
                  </button>
                </div>
              </div>
              
            <!-- Action Buttons -->
            <div class="flex gap-4">
              <button 
                @click="processFile"
                :disabled="processing"
                class="flex-1 relative px-6 py-4 text-base font-medium text-white transition-all rounded-xl
                       disabled:opacity-50 disabled:cursor-not-allowed
                       bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
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

        <!-- Right Side: Extracted Data Section -->
        <div class="backdrop-blur-lg bg-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 border border-white/20">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center space-x-3">
              <h2 class="text-2xl font-semibold text-gray-800">Extracted Data</h2>
              <!-- Unit Converter Dropdown -->
              <div class="relative inline-block text-left" v-if="extractedData" v-click-outside="closeDropdown">
                <button 
                  @click="toggleDropdown"
                  type="button"
                  class="flex items-center space-x-1 px-2 py-1 text-sm bg-white/80 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
                >
                  <span class="text-gray-600">{{ selectedUnit === 'original' ? 'Original' : selectedUnit.toUpperCase() }}</span>
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <!-- Dropdown Menu -->
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div v-show="showUnitDropdown" 
                       class="absolute right-0 z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 w-32 origin-top-right"
                  >
                    <button 
                      v-for="unit in units" 
                      :key="unit.value"
                      @click="selectUnit(unit.value)"
                      class="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 transition-colors"
                      :class="{'text-indigo-600 font-medium': selectedUnit === unit.value, 'text-gray-700': selectedUnit !== unit.value}"
                    >
                      {{ unit.label }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>
            
            <!-- Timing Metrics Card -->
            <div v-if="timings?.ocrTime" class="flex items-center space-x-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="relative has-tooltip">
                <div class="tooltip bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-8">
                  OCR processing duration using {{ selectedService }}
                </div>
                <span class="text-gray-500">Processing Time: </span>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-medium">{{ timings.ocrTime }}ms</span>
              </div>
                  </div>
                </div>
                
          <div v-if="extractedData" class="grid grid-cols-2 gap-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
            <!-- Majority Decimal Count Card -->
            <div class="col-span-2 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 shadow-sm">
              <div class="flex flex-col space-y-0.5">
                <span class="text-xs font-medium text-indigo-600">Majority Decimal Count</span>
                <span class="text-sm font-semibold text-indigo-900">{{ majorityDecimalCount || 'Not found' }}</span>
              </div>
            </div>
            
            <!-- Existing Data Cards -->
            <div v-for="(value, key) in displayedData" 
                 :key="key" 
                 class="group p-4 bg-gradient-to-r from-white/40 to-white/60 rounded-lg border border-white/40 shadow-sm
                        hover:shadow-md hover:scale-[1.01] transition-all duration-300">
              <div class="flex flex-col space-y-0.5">
                <span class="text-xs font-medium text-gray-500">{{ key }}</span>
                <span class="text-sm font-semibold text-gray-900">{{ value || 'Not found' }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="flex flex-col items-center justify-center h-64 text-center">
            <div class="p-4 rounded-full bg-gray-50 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">No Data Yet</h3>
            <p class="text-sm text-gray-500">Upload a file and click "Process PDF" to begin</p>
          </div>
        </div>
      </div>

      <!-- Full Text Section (Full Width) -->
      <div v-if="extractedText" class="mt-8 backdrop-blur-lg bg-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 border border-white/20">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-2xl font-semibold text-gray-800">Full Text</h2>
          <button 
            @click="copyFullText"
            class="group relative flex items-center space-x-1 px-3 py-1.5 text-sm bg-white/80 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
            :class="{ 'border-green-300 bg-green-50': copied }"
          >
            <span class="text-gray-600 group-hover:text-indigo-600" :class="{ 'text-green-600': copied }">
              {{ copied ? 'Copied!' : 'Copy' }}
            </span>
            <svg 
              v-if="!copied"
              class="w-4 h-4 text-gray-500 group-hover:text-indigo-500 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <svg 
              v-else
              class="w-4 h-4 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
        <div class="bg-white/60 rounded-xl p-6 max-h-[32rem] overflow-y-auto custom-scrollbar">
          <HighlightedText :text="extractedText" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { marked } from 'marked';
import HighlightedText from './components/HighlightedText.vue';

export default {
  name: 'App',
  components: {
    HighlightedText
  },
  data() {
    return {
      isDragging: false,
      selectedFile: null,
      processing: false,
      extractedText: null,
      extractedData: null,
      majorityDecimalCount: null,
      timings: null,
      selectedService: 'textract',
      documentInfo: null,
      showUnitDropdown: false,
      selectedUnit: 'original',
      copied: false,
      units: [
        { value: 'original', label: 'Original' },
        { value: 'lakh', label: 'From Lakhs' },
        { value: 'million', label: 'From Millions' }
      ]
    };
  },
  computed: {
    renderedMarkdown() {
      return this.extractedText ? marked(this.extractedText) : '';
    },
    displayedData() {
      if (!this.extractedData || this.selectedUnit === 'original') {
        return this.extractedData;
      }

      const converted = {};
      for (const [key, value] of Object.entries(this.extractedData)) {
        if (!value || value === 'Not found') {
          converted[key] = value;
          continue;
        }

        // Extract numeric value
        const numericValue = parseFloat(value.replace(/,/g, ''));
        if (isNaN(numericValue)) {
          converted[key] = value;
          continue;
        }

        // Convert to crores
        let valueInCr;
        switch (this.selectedUnit) {
          case 'million':
            valueInCr = numericValue / 10; // 1 million = 0.1 crores (10 million = 1 crore)
            break;
          case 'lakh':
            valueInCr = numericValue / 100; // 1 crore = 100 lakhs
            break;
        }

        // Format with commas and add unit
        converted[key] = this.formatNumber(valueInCr) + ' Cr';
      }
      return converted;
    }
  },
  methods: {
    detectFinancialUnit(text) {
      const unitPatterns = {
        lakh: /\b(lakhs?|lacs?)\b/i,
        million: /\b(millions?|million)\b/i,
        crore: /\b(crores?)\b/i
      };

      for (const [unit, pattern] of Object.entries(unitPatterns)) {
        if (pattern.test(text)) {
          return unit;
        }
      }
      return 'original';
    },
    handleDrop(e) {
      this.isDragging = false;
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        this.selectedFile = file;
      }
    },
    handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) {
        this.selectedFile = file;
      }
    },
    async processFile() {
      if (!this.selectedFile) {
        alert('Please select a file first');
        return;
      }

      this.processing = true;
      this.extractedText = '';
      this.extractedData = null;
      this.documentInfo = null;
      this.timings = null;

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      console.log('=== Frontend Processing Start ===');
      console.log('File details:', {
        name: this.selectedFile.name,
        type: this.selectedFile.type,
        size: this.selectedFile.size,
        lastModified: new Date(this.selectedFile.lastModified).toISOString()
      });
      console.log('Selected service:', this.selectedService);

      try {
        const requestStartTime = Date.now();
        console.log('Starting request at:', new Date(requestStartTime).toISOString());
        
        const response = await axios.post(`http://localhost:3000/upload?service=${this.selectedService}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const responseEndTime = Date.now();
        console.log('Response received at:', new Date(responseEndTime).toISOString());
        console.log('Full response:', JSON.stringify(response.data, null, 2));

        // Validate response
        if (!response.data || !response.data.result) {
          console.error('Invalid response format:', response.data);
          throw new Error('Invalid response format: Missing result data');
        }

        // Handle text content
        this.extractedText = response.data.result;
        this.extractedData = response.data.extractedData;
        this.majorityDecimalCount = response.data.majorityDecimalCount;
        
        // Detect and set financial unit
        const detectedUnit = this.detectFinancialUnit(this.extractedText);
        console.log('Detected financial unit:', detectedUnit);
        this.selectedUnit = detectedUnit;
        
        console.log('Text content length:', this.extractedText.length);
        console.log('First 100 chars of text:', this.extractedText.substring(0, 100));

        // Handle metadata for Mistral
        if (this.selectedService === 'mistral' && response.data.metadata) {
          console.log('Mistral metadata received:', response.data.metadata);
          this.documentInfo = response.data.metadata.documentInfo;
          console.log('Document info set to:', this.documentInfo);
        } else {
          console.log('No metadata available (using Textract or metadata missing)');
          this.documentInfo = null;
        }

        // Calculate timings
        const headers = response.headers;
        const ocrTime = Number(headers['x-ocr-time']);

        // Set timing
        this.timings = {
          ocrTime: ocrTime
        };

        console.log('Processing timing:', this.timings);

        // Scroll to results
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.resultsSection) {
              console.log('Scrolling to results section');
              this.$refs.resultsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              console.warn('Results section ref not found');
            }
          }, 100);
        });

      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        let errorMessage = 'Failed to process the file.';
        if (error.response?.data?.error) {
          errorMessage += ` ${error.response.data.error}`;
        } else if (error.message) {
          errorMessage += ` ${error.message}`;
        }
        alert(errorMessage);
      } finally {
        this.processing = false;
        console.log('=== Frontend Processing Complete ===\n');
      }
    },
    resetForm() {
      this.selectedFile = null;
      this.extractedText = null;
      this.extractedData = null;
      this.processing = false;
      this.timings = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    getProgressWidth(value) {
      // Calculate relative to the maximum time (Textract time in most cases)
      const maxTime = Math.max(
        this.timings.uploadTime,
        this.timings.serverTime,
        this.timings.ocrTime,
        this.timings.downloadTime
      );
      // Use a minimum width of 5% for visibility of small values
      const minWidth = 5;
      const percentage = Math.max(minWidth, (value / maxTime) * 100);
      return `${percentage}%`;
    },
    formatBytes(bytes) {
      if (!bytes) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    toggleDropdown() {
      this.showUnitDropdown = !this.showUnitDropdown;
    },
    closeDropdown() {
      this.showUnitDropdown = false;
    },
    selectUnit(unit) {
      this.selectedUnit = unit;
      this.closeDropdown();
    },
    formatNumber(num) {
      return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      }).format(num);
    },
    async copyFullText() {
      if (this.extractedText) {
        try {
          await navigator.clipboard.writeText(this.extractedText);
          this.copied = true;
          setTimeout(() => {
            this.copied = false;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
      }
    }
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el._clickOutside = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.addEventListener('click', el._clickOutside);
      },
      unmounted(el) {
        document.removeEventListener('click', el._clickOutside);
      }
    }
  }
};
</script>

<style>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E0 #EDF2F7;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #EDF2F7;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #CBD5E0;
  border-radius: 4px;
  border: 2px solid #EDF2F7;
}

/* Progress bar animations */
.progress-bar-enter-active {
  transition: width 1s ease-out;
}

.progress-bar-enter-from {
  width: 0;
}

/* Tooltip styles */
.tooltip {
  visibility: hidden;
  position: absolute;
  z-index: 1;
  width: 200px;
  left: 50%;
  transform: translateX(-50%);
}

.has-tooltip:hover .tooltip {
  visibility: visible;
}

.timing-card {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.progress-bar {
  width: var(--target-width);
  transition: width 1s ease-out;
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Markdown Styles */
.prose {
  @apply text-gray-900;
}

.prose h1 {
  @apply text-3xl font-bold mb-4 text-gray-900;
}

.prose h2 {
  @apply text-2xl font-bold mb-3 text-gray-800;
}

.prose h3 {
  @apply text-xl font-bold mb-2 text-gray-800;
}

.prose p {
  @apply mb-4 text-gray-700 break-words;
}

.prose table {
  @apply w-full border-collapse mb-4;
}

.prose th {
  @apply bg-gray-100 border border-gray-300 px-4 py-2 text-left font-semibold;
}

.prose td {
  @apply border border-gray-300 px-4 py-2;
}

.prose ul {
  @apply list-disc pl-5 mb-4;
}

.prose ol {
  @apply list-decimal pl-5 mb-4;
}

.prose code {
  @apply bg-gray-100 rounded px-1 py-0.5 text-sm font-mono;
}

.prose pre {
  @apply bg-gray-100 rounded p-4 overflow-x-auto mb-4;
}

.prose blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic my-4;
}

.prose img {
  @apply max-w-full h-auto rounded-lg shadow-md my-4;
}

/* Additional styles for new design */
.border-3 {
  border-width: 3px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 