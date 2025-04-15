const extractionPatterns = [
  {
    name: 'Revenue from operations',
    regex: /rev(?:enue|nu|neu|enu|nue|eneu)?\.?\s*from\s+operat[i1]ons(?:\[\d+\]|\s*\(.*?\))?[\s\W\n_]*([\d,]+\.\d{2}|[\d,]+)/gi
  },
  {
    name: 'Other Income',
    regex: /other\s+income(?:\[\d+\]|\s*\(.*?\))?[\s\W\n_]*([\d,]+\.\d{2}|[\d,]+)/gi
  },
  {
    name: 'Finance Costs',
    regex:  /\bfin\w*\s*c\w*[stz](?:s|is)?(?:\[\d+\]|\s*\(.*?\))?[\s\W\n_]*([\d,]+\.\d{2}|[\d,]+)/gi
  },
  {
    name: 'Depreciation',
    regex: /depreciation(?:\s*(?:,|and|&)?\s*amort\w*)?(?:\s*(?:,|and)?\s*impair\w*)?\s+expe\w*\s*(?:\s*\[.*?\]|\s*\(.*?\))?\s*[-\s]*\(?([\d,]+\.\d{2}|[\d,]+)\)?/gi
  },
  {
    name: 'Profit before tax',
    regex: /(?:[^\d\w\s-]*[\dIVXLCDM\w-]+\)?\s*-\s*)?(?:\(\s*loss\s*\)\s*\/\s*)?prof\w*(?:\s*\/?\s*\(\s*loss\s*\))?\s*(?:before|befor|b4|pre)\s*tax(?:ation|es)?(?:\s*\(.*?\))?\s*(?:\([^)]*\)\s*)*.*?\s*([\d,]+\.\d+|[\d,]+)$/im
  },
  {
    name: 'Profit after tax',
    regex: /(?:[^\d\w\s-]*[\dIVXLCDM\w-]+\)?\s*-\s*)?(?:\(\s*loss\s*\)\s*\/\s*)?(?:net\s*)?prof\w*(?:\s*\/?\s*\(\s*loss\s*\))?(?!.*\b(?:before|associate|discontinued|joint\s*venture)\b)(?:\s*(?:for|after|from)?\s*)?(?:\s*the\s*)?(?=.*\b(?:periods?|tax|taxes|taxation)\b)(?:period|year|tax|taxes|taxation|operations)?(?:\s*\([^)]*\))?(?:\([^)]*\)\s*)*.*?\s*([\d,]+\.\d+|[\d,]+)$/im
  },
  {
    name: 'Financial Units',
    regex: /\b(lakhs?|lacs?|millions?|million|crores?)\b/i
  }
];

export { extractionPatterns }; 