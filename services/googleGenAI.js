import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config();

class GoogleGenAIService {
  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async extractFinancialData(pdfBase64, modelName = 'gemini-2.0-flash') {
    const startTime = Date.now();
    console.log(`Starting financial data extraction with Google ${modelName}`);

    try {
      const systemInstruction = `You are a specialized financial data extraction expert, trained to analyze quarterly financial statements with precision. Your purpose is to transform unstructured financial text into structured, machine-readable data.
                                Your capabilities include:
                                1. Identifying and distinguishing between current quarter and year-over-year comparison data
                                2. Recognizing financial metrics across different terminology variations and formats
                                3. Handling complex numerical notations (lakhs, crores, millions) and negative value representations
                                4. Understanding the contextual relationships between financial line items
                                5. Extracting period information from various date formats and references
                                Extract data with accounting-level accuracy, maintaining the integrity of financial relationships. When information is genuinely missing, return null rather than attempting to derive values.
                                <note>
                                    1) if Profit/Loss for the Period not explicitly stated, calculate as: Profit/Loss After Tax from Ordinary Activities + Extraordinary Items (if any)
                                    2) Extra Ordinary Items include discontinued operations after tax
                                </note>
                                <task>
                                    Extract these financial metrics from the PDF for both current quarter and year-over-year comparison:

                                    1. Revenue from Operations
                                    2. Other Income
                                    3. Depreciation
                                    4. Finance Costs
                                    5. Total Expenses
                                    6. Profit/Loss Before Exceptional Items and Tax
                                    7. Exceptional Items (check postive and negative values by checking Profit/Loss Before Exceptional Items and Tax and Profit/Loss After Tax from Ordinary Activities)
                                    8. Share of Profit/Loss of Associates
                                    9. Profit/Loss Before Tax
                                    10. Profit/Loss After Tax from Ordinary Activities
                                    11. Prior Year Adjustments (not related to tax)
                                    12. Extra Ordinary Items
                                    13. Profit/Loss for the Period
                                    14. Period Information (e.g., "Jan-Mar 2024")
                                </task>`;
      const prompt = `<context>
                             You are analyzing a company's quarterly financial statement. Extract both the current quarter and its year-over-year comparison data.
                           </context>`;

      const response = await this.client.models.generateContent({
        model: modelName,
        //contents: prompt,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
              {
                inlineData: {
                  data: pdfBase64,
                  mimeType: "application/pdf",
                },
              },
            ],
          },
        ],
        config: {
          maxOutputTokens: 4000,
          temperature: 0,
          topP: 0.2,
          systemInstruction: {
            parts: [
              {
                text: systemInstruction,
              },
            ],
          },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              currentQuarter: {
                type: Type.OBJECT,
                properties: {
                  revenueFromOps: { type: Type.NUMBER, nullable: true },
                  otherIncome: { type: Type.NUMBER, nullable: true },
                  depreciation: { type: Type.NUMBER, nullable: true },
                  financeCosts: { type: Type.NUMBER, nullable: true },
                  totalExpenses: { type: Type.NUMBER, nullable: true },
                  profitLossBeforeExceptionalItemsAndTax: {
                    type: Type.NUMBER,
                    nullable: true,
                  },
                  exceptionalItems: { type: Type.NUMBER, nullable: true },
                  shareOfPLOfAssociates: { type: Type.NUMBER, nullable: true },
                  profitLossBeforeTax: { type: Type.NUMBER, nullable: true },
                  profitLossAfterTaxFromOrdinaryActivities: {
                    type: Type.NUMBER,
                    nullable: true,
                  },
                  priorYearAdjustments: { type: Type.NUMBER, nullable: true },
                  extraOrdinaryItems: { type: Type.NUMBER, nullable: true },
                  profitLossForThePeriod: { type: Type.NUMBER, nullable: true },
                  period: { type: Type.STRING, nullable: false },
                },
                required: [
                  "revenueFromOps",
                  "otherIncome",
                  "depreciation",
                  "financeCosts",
                  "totalExpenses",
                  "profitLossBeforeExceptionalItemsAndTax",
                  "exceptionalItems",
                  "shareOfPLOfAssociates",
                  "profitLossBeforeTax",
                  "profitLossAfterTaxFromOrdinaryActivities",
                  "priorYearAdjustments",
                  "extraOrdinaryItems",
                  "profitLossForThePeriod",
                  "period",
                ],
                propertyOrdering: [
                  "revenueFromOps",
                  "otherIncome",
                  "depreciation",
                  "financeCosts",
                  "totalExpenses",
                  "profitLossBeforeExceptionalItemsAndTax",
                  "exceptionalItems",
                  "shareOfPLOfAssociates",
                  "profitLossBeforeTax",
                  "profitLossAfterTaxFromOrdinaryActivities",
                  "priorYearAdjustments",
                  "extraOrdinaryItems",
                  "profitLossForThePeriod",
                  "period",
                ],
              },
              previousYearQuarter: {
                type: Type.OBJECT,
                properties: {
                  revenueFromOps: { type: Type.NUMBER, nullable: true },
                  otherIncome: { type: Type.NUMBER, nullable: true },
                  depreciation: { type: Type.NUMBER, nullable: true },
                  financeCosts: { type: Type.NUMBER, nullable: true },
                  totalExpenses: { type: Type.NUMBER, nullable: true },
                  profitLossBeforeExceptionalItemsAndTax: {
                    type: Type.NUMBER,
                    nullable: true,
                  },
                  exceptionalItems: { type: Type.NUMBER, nullable: true },
                  shareOfPLOfAssociates: { type: Type.NUMBER, nullable: true },
                  profitLossBeforeTax: { type: Type.NUMBER, nullable: true },
                  profitLossAfterTaxFromOrdinaryActivities: {
                    type: Type.NUMBER,
                    nullable: true,
                  },
                  priorYearAdjustments: { type: Type.NUMBER, nullable: true },
                  extraOrdinaryItems: { type: Type.NUMBER, nullable: true },
                  profitLossForThePeriod: { type: Type.NUMBER, nullable: true },
                  period: { type: Type.STRING, nullable: false },
                },
                required: [
                  "revenueFromOps",
                  "otherIncome",
                  "depreciation",
                  "financeCosts",
                  "totalExpenses",
                  "profitLossBeforeExceptionalItemsAndTax",
                  "exceptionalItems",
                  "shareOfPLOfAssociates",
                  "profitLossBeforeTax",
                  "profitLossAfterTaxFromOrdinaryActivities",
                  "priorYearAdjustments",
                  "extraOrdinaryItems",
                  "profitLossForThePeriod",
                  "period",
                ],
                propertyOrdering: [
                  "revenueFromOps",
                  "otherIncome",
                  "depreciation",
                  "financeCosts",
                  "totalExpenses",
                  "profitLossBeforeExceptionalItemsAndTax",
                  "exceptionalItems",
                  "shareOfPLOfAssociates",
                  "profitLossBeforeTax",
                  "profitLossAfterTaxFromOrdinaryActivities",
                  "priorYearAdjustments",
                  "extraOrdinaryItems",
                  "profitLossForThePeriod",
                  "period",
                ],
              },
            },
            required: ["currentQuarter", "previousYearQuarter"],
            propertyOrdering: ["currentQuarter", "previousYearQuarter"],
          },
        },
      });

      if (!response) {
        console.error(`[${modelName}] No response received from API`);
        throw new Error(`Failed to extract financial metrics: No response from ${modelName}`);
      }
      
      let responseText;
      try {
        responseText = response.text;
      } catch (textError) {
        console.error(`[${modelName}] Error accessing response text:`, textError);
        console.error(`[${modelName}] Full response object:`, response);
        throw new Error(`Failed to extract financial metrics: Cannot access text from ${modelName} response`);
      }
      
      if (!responseText) {
        console.error(`[${modelName}] Response received but no text content. Response:`, response);
        console.error(`[${modelName}] Finish reason:`, response.candidates?.[0]?.finishReason);
        console.error(`[${modelName}] Usage metadata:`, response.usageMetadata);
        throw new Error(`Failed to extract financial metrics: Empty text content in response from ${modelName}`);
      }
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      console.log(`Google ${modelName} processing completed`);

      // Log raw response for debugging
      console.log(`[${modelName}] Raw response:`, responseText);

      // Parse the JSON response
      let structuredData;
      try {
        structuredData = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`[${modelName}] JSON Parse Error:`, parseError.message);
        console.error(`[${modelName}] Raw response that failed to parse:`, responseText);
        throw new Error(`Failed to parse JSON response from ${modelName}: ${parseError.message}`);
      }

      return {
        data: structuredData,
        timing: {
          start: startTime,
          end: endTime,
          duration: processingTime,
        },
      };
    } catch (error) {
      console.error("Error extracting financial metrics:", error);
      throw error;
    }
  }
}

export default GoogleGenAIService;
