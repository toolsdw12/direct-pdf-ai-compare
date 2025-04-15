<template>
  <div class="relative">
    <div class="text-gray-700 whitespace-pre-wrap font-sans text-base">
      <template v-for="(segment, index) in processedText" :key="index">
        <span
          v-if="segment.type === 'match'"
          class="relative group cursor-help px-0.5 rounded"
          :class="{
            'bg-indigo-200 hover:bg-indigo-300 text-indigo-900': !segment.isGroup,
            'bg-purple-200 hover:bg-purple-300 text-purple-900': segment.isGroup
          }"
        >
          {{ segment.text }}
          <div class="tooltip opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10 shadow-lg">
            {{ segment.pattern }}
          </div>
        </span>
        <span v-else>{{ segment.text }}</span>
      </template>
    </div>
  </div>
</template>

<script>
import { extractionPatterns } from '../config.js';

export default {
  name: 'HighlightedText',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  computed: {
    processedText() {
      if (!this.text) return [{ type: 'text', text: '' }];
      
      console.log('Processing text:', this.text.substring(0, 100) + '...');
      console.log('Available patterns:', extractionPatterns.map(p => p.name));
      
      let result = [{ type: 'text', text: this.text }];
      
      // Process each pattern
      for (const pattern of extractionPatterns) {
        console.log(`Processing pattern: ${pattern.name}`);
        const flags = pattern.regex.flags;
        const regex = new RegExp(pattern.regex.source, flags);
        console.log(`Regex: ${regex}`);
        
        // Process each segment
        result = result.flatMap(segment => {
          if (segment.type === 'match') return [segment];
          
          const parts = [];
          let lastIndex = 0;
          let match;
          
          const text = segment.text;
          while ((match = regex.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
              parts.push({
                type: 'text',
                text: text.slice(lastIndex, match.index)
              });
            }
            
            // Handle capture groups
            if (match.length > 1 && match[1]) {
              const fullMatch = match[0];
              const captureGroup = match[1];
              const matchStart = match.index;
              const groupStart = text.indexOf(captureGroup, matchStart);
              
              // Add text before capture group
              if (groupStart > matchStart) {
                parts.push({
                  type: 'match',
                  text: text.slice(matchStart, groupStart),
                  pattern: pattern.name,
                  isGroup: false
                });
              }
              
              // Add capture group
              parts.push({
                type: 'match',
                text: captureGroup,
                pattern: `${pattern.name} (Value)`,
                isGroup: true
              });
              
              // Add text after capture group
              const groupEnd = groupStart + captureGroup.length;
              const matchEnd = matchStart + fullMatch.length;
              if (groupEnd < matchEnd) {
                parts.push({
                  type: 'match',
                  text: text.slice(groupEnd, matchEnd),
                  pattern: pattern.name,
                  isGroup: false
                });
              }
            } else {
              // Add full match if no capture groups
              parts.push({
                type: 'match',
                text: match[0],
                pattern: pattern.name,
                isGroup: false
              });
            }
            
            lastIndex = match.index + match[0].length;
            
            // Break if the regex doesn't have global flag
            if (!regex.global) break;
          }
          
          // Add remaining text
          if (lastIndex < text.length) {
            parts.push({
              type: 'text',
              text: text.slice(lastIndex)
            });
          }
          
          return parts;
        });
      }
      
      return result;
    }
  }
};
</script>

<style scoped>
.tooltip {
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #111827 transparent transparent transparent;
}

/* Prevent tooltip from being cut off at the top of the container */
.group:hover .tooltip {
  z-index: 50;
}

/* Add a subtle animation to the highlighted text */
.group {
  transition: background-color 0.2s ease-in-out;
}

/* Ensure text remains readable */
.text-indigo-900, .text-purple-900 {
  font-weight: 500;
}
</style> 