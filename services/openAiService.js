const OpenAI = require('openai');
const TelegramService = require('./telegramService');

class OpenAiService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }
        this.client = new OpenAI({
            apiKey: this.apiKey
        });
        this.telegramService = new TelegramService();
    }

    async extractFinancialData(ocrText) {
        const startTime = Date.now();
        console.log('Starting financial data extraction with OpenAI');

        try {
            const response = await this.client.responses.create({
                //https://platform.openai.com/docs/pricing
                model: "gpt-4.1-mini-2025-04-14",
                input: [
                    {
                        role: "system",
                        content: `You are a financial analyst specializing in quarterly financial statements. 
Your primary task is to extract and structure financial metrics from company documents.
You must be precise and methodical in your analysis.
You understand financial reporting standards and number notation (lakhs, crores).`
                    },
                    {
                        role: "user",
                        content: `You are analyzing a company's quarterly financial statement. Extract both the current quarter and its year-over-year comparison data.

Extract financial metrics for both the latest quarter and its year-over-year (YoY) comparison from the provided text.
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
   - Set to null if value not found

Text to analyze:
${ocrText}`
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

            // Send the extracted data to Telegram
            try {
                const chatId = process.env.TELEGRAM_CHAT_ID;
                await this.telegramService.sendFinancialData(chatId, {
                    currentQuarter: {
                        revenueFromOps: structuredData.currentQuarter.revenueFromOps,
                        depreciation: structuredData.currentQuarter.depreciation,
                        financeCosts: structuredData.currentQuarter.financeCosts,
                        otherIncome: structuredData.currentQuarter.otherIncome,
                        profitLossBeforeExceptionalItemsAndTax: structuredData.currentQuarter.profitLossBeforeExceptionalItemsAndTax,
                        profitLossBeforeTax: structuredData.currentQuarter.profitLossBeforeTax,
                        profitLossAfterTaxFromOrdinaryActivities: structuredData.currentQuarter.profitLossAfterTaxFromOrdinaryActivities,
                        profitLossForThePeriod: structuredData.currentQuarter.profitLossForThePeriod,
                        period: structuredData.currentQuarter.period,
                        exceptionalItems: structuredData.currentQuarter.exceptionalItems,
                        shareOfPLOfAssociates: structuredData.currentQuarter.shareOfPLOfAssociates,
                        extraOrdinaryItems: structuredData.currentQuarter.extraOrdinaryItems
                    },
                    previousYearQuarter: {
                        revenueFromOps: structuredData.previousYearQuarter.revenueFromOps,
                        depreciation: structuredData.previousYearQuarter.depreciation,
                        financeCosts: structuredData.previousYearQuarter.financeCosts,
                        otherIncome: structuredData.previousYearQuarter.otherIncome,
                        profitLossBeforeExceptionalItemsAndTax: structuredData.previousYearQuarter.profitLossBeforeExceptionalItemsAndTax,
                        profitLossBeforeTax: structuredData.previousYearQuarter.profitLossBeforeTax,
                        profitLossAfterTaxFromOrdinaryActivities: structuredData.previousYearQuarter.profitLossAfterTaxFromOrdinaryActivities,
                        profitLossForThePeriod: structuredData.previousYearQuarter.profitLossForThePeriod,
                        period: structuredData.previousYearQuarter.period,
                        exceptionalItems: structuredData.previousYearQuarter.exceptionalItems,
                        shareOfPLOfAssociates: structuredData.previousYearQuarter.shareOfPLOfAssociates,
                        extraOrdinaryItems: structuredData.previousYearQuarter.extraOrdinaryItems
                    },
                    "Revenue-Format": structuredData.revenueFormat,
                    processingTime: processingTime
                });
                console.log('Financial data sent to Telegram successfully');
            } catch (telegramError) {
                console.error('Error sending data to Telegram:', telegramError);
                // Don't throw the error as we still want to return the extracted data
            }

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

module.exports = new OpenAiService(); 