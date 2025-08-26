<template>
  <div
    class="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-8"
  >
    <div class="max-w-7xl mx-auto">
      <AppHeader />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FileUploader
          :processing="processing"
          v-model:ai-model="selectedAiModel"
          @file-selected="handleFileSelected"
          @process-file="processFile"
        />

        <ProcessingResults :processing="processing" :result="result" />
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from "./components/AppHeader.vue";
import FileUploader from "./components/FileUploader.vue";
import ProcessingResults from "./components/ProcessingResults.vue";

export default {
  name: "App",
  components: {
    AppHeader,
    FileUploader,
    ProcessingResults,
  },
  data() {
    return {
      selectedFile: null,
      processing: false,
      selectedAiModel: "gemini",
      result: null,
    };
  },
  methods: {
    handleFileSelected(file) {
      this.selectedFile = file;
      if (!file) {
        this.result = null;
      }
    },
    async processFile() {
      if (!this.selectedFile) return;

      this.processing = true;
      this.result = null;
      const formData = new FormData();
      formData.append("file", this.selectedFile);
      formData.append("aiModel", this.selectedAiModel);

      try {
        const response = await fetch("http://localhost:3001/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        this.result = data;
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Error processing file. Please try again.");
      } finally {
        this.processing = false;
      }
    },
  },
};
</script>
