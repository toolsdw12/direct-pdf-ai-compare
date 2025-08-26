import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

class OpenAiService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }
        this.client = new OpenAI({
            apiKey: this.apiKey
        });
    }

    async extractFinancialData(pdfBase64) {
        const startTime = Date.now();
        console.log('Starting financial data extraction with OpenAI');

        try {
            const response = await this.client.responses.create({
                //https://platform.openai.com/docs/pricing
                model: "gpt-4.1-mini-2025-04-14",
                input: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "input_file",
                                filename: "financial_statement.pdf",
                                file_data: `data:application/pdf;base64,${pdfBase64}`,
                            },
                            {
                                type: "input_text",
                                text: `Extract financial metrics for both the latest quarter and its year-over-year (YoY) comparison from the provided PDF.
If any information is not found, return null for that field.

Follow these extraction rules:
1. Period identification:
   - Look for month ranges (Jan-Mar, January-March, etc.)
   - Look for date ranges (1st Jan - 31st Mar, 01/01/2024 - 31/03/2024)
   - Three month period references
   - Identify both current and previous year periods

2. Value extraction:
   - Extract numbers in lakhs, crores, or millions notation
   - Handle numbers with commas and decimals
   - Use negative numbers for losses
   - Set to null if value not found`
                            }
                        ]
                    }
                ],
                text: {
                    format: {
                        type: "json_schema",
                        name: "financial_data",
                        "strict": true,
                        schema: {
                            type: "object",
                            properties: {
                                currentQuarter: {
                                    type: "object",
                                    additionalProperties: false,
                                    properties: {
                                        revenueFromOps: { type: ["number", "null"] },
                                        depreciation: { type: ["number", "null"] },
                                        financeCosts: { type: ["number", "null"] },
                                        otherIncome: { type: ["number", "null"] },
                                        profitLossBeforeExceptionalItemsAndTax: { type: ["number", "null"] },
                                        exceptionalItems: { type: ["number", "null"] },
                                        shareOfPLOfAssociates: { type: ["number", "null"] },
                                        profitLossBeforeTax: { type: ["number", "null"] },
                                        profitLossAfterTaxFromOrdinaryActivities: { type: ["number", "null"] },
                                        priorYearAdjustments: { type: ["number", "null"] },
                                        extraOrdinaryItems: { type: ["number", "null"] },
                                        profitLossForThePeriod: { type: ["number", "null"] },
                                        period: { type: "string" }
                                    },
                                    required: ["revenueFromOps", "depreciation", "financeCosts", "otherIncome", 
                                             "profitLossBeforeExceptionalItemsAndTax", "exceptionalItems", 
                                             "shareOfPLOfAssociates", "profitLossBeforeTax", "profitLossAfterTaxFromOrdinaryActivities", 
                                             "priorYearAdjustments", "extraOrdinaryItems", "profitLossForThePeriod", 
                                             "period"]
                                },
                                previousYearQuarter: {
                                    type: "object",
                                    additionalProperties: false,
                                    properties: {
                                        revenueFromOps: { type: ["number", "null"] },
                                        depreciation: { type: ["number", "null"] },
                                        financeCosts: { type: ["number", "null"] },
                                        otherIncome: { type: ["number", "null"] },
                                        profitLossBeforeExceptionalItemsAndTax: { type: ["number", "null"] },
                                        exceptionalItems: { type: ["number", "null"] },
                                        shareOfPLOfAssociates: { type: ["number", "null"] },
                                        profitLossBeforeTax: { type: ["number", "null"] },
                                        profitLossAfterTaxFromOrdinaryActivities: { type: ["number", "null"] },
                                        priorYearAdjustments: { type: ["number", "null"] },
                                        extraOrdinaryItems: { type: ["number", "null"] },
                                        profitLossForThePeriod: { type: ["number", "null"] },
                                        period: { type: "string" }
                                    },
                                    required: ["revenueFromOps", "depreciation", "financeCosts", "otherIncome", 
                                             "profitLossBeforeExceptionalItemsAndTax", "exceptionalItems", 
                                             "shareOfPLOfAssociates", "profitLossBeforeTax", "profitLossAfterTaxFromOrdinaryActivities", 
                                             "priorYearAdjustments", "extraOrdinaryItems", "profitLossForThePeriod", 
                                             "period"]
                                },
                                revenueFormat: {
                                    type: "string",
                                    enum: ["Lakhs", "Crores", "Millions"]
                                }
                            },
                            required: ["currentQuarter", "previousYearQuarter", "revenueFormat"],
                            additionalProperties: false
                        }
                    }
                }
            });

            const endTime = Date.now();
            const processingTime = endTime - startTime;
            console.log('OpenAI processing completed');

            // Parse the response
            const structuredData = JSON.parse(response.output_text);

            return {
                data: structuredData,
                timing: {
                    start: startTime,
                    end: endTime,
                    duration: processingTime
                }
            };
        } catch (error) {
            console.error('Error in OpenAI Service:', error);
            throw error;
        }
    }
}

export default OpenAiService; 