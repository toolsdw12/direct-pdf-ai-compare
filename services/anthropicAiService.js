import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

class AnthropicAiService {
    constructor() {
        this.apiKey = process.env.ANTHROPIC_API_KEY;
        if (!this.apiKey) {
            throw new Error('Anthropic API key not configured');
        }
        this.client = new Anthropic({
            apiKey: this.apiKey
        });
    }

    async extractFinancialData(pdfBase64) {
        const startTime = Date.now();
        console.log('Starting financial data extraction with Anthropic AI');

        try {
            const systemPrompt = `You are a financial analyst specializing in quarterly financial statements. 
Your primary task is to extract and structure financial metrics from company documents.
You must be precise and methodical in your analysis.
You understand financial reporting standards and number notation (lakhs, crores).`;

            const response = await this.client.messages.create({
                model: "claude-3-7-sonnet-latest",
                max_tokens: 4000,
                system: systemPrompt,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "document",
                                source: {
                                    type: "base64",
                                    media_type: "application/pdf",
                                    data: pdfBase64
                                }
                            },
                            {
                                type: "text",
                                text: `Extract financial metrics for both the latest quarter and its year-over-year (YoY) comparison from the provided PDF.
If any information is not found, return null for that field.

<output_format>
{
    "currentQuarter": {
        "revenueFromOps": "number or null",
        "depreciation": "number or null",
        "financeCosts": "number or null",
        "otherIncome": "number or null",
        "profitLossBeforeExceptionalItemsAndTax": "number or null",
        "exceptionalItems": "number or null",
        "shareOfPLOfAssociates": "number or null",
        "profitLossBeforeTax": "number or null",
        "profitLossAfterTaxFromOrdinaryActivities": "number or null",
        "priorYearAdjustments(not related to tax)": "number or null",
        "extraOrdinaryItems (discontinued operations after tax also included)": "number or null",
        "profitLossForThePeriod": "number or null",
        "period": "string" (e.g., 'Jan-Mar 2024', '1st Jan - 31st Mar 2024', etc.)
    },
    "previousYearQuarter": {
        "revenueFromOps": "number or null",
        "depreciation": "number or null",
        "financeCosts": "number or null",
        "otherIncome": "number or null",
        "profitLossBeforeExceptionalItemsAndTax": "number or null",
        "exceptionalItems": "number or null",
        "shareOfPLOfAssociates": "number or null",
        "profitLossBeforeTax": "number or null",
        "profitLossAfterTaxFromOrdinaryActivities": "number or null",
        "priorYearAdjustments(not related to tax)": "number or null",
        "extraOrdinaryItems (discontinued operations after tax also included)": "number or null",
        "profitLossForThePeriod": "number or null",
        "period": "string" (e.g., 'Jan-Mar 2023', '1st Jan - 31st Mar 2023', etc.)
    },
    "Revenue-Format": "string" (e.g., 'Lakhs', 'Crores', 'Millions')
}
</output_format>

<extraction_rules>
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

3. Output requirements:
   - Return ONLY a valid JSON object
   - No additional text or explanations
   - No markdown formatting
   - Must be valid JSON that can be parsed directly
</extraction_rules>`
                            }
                        ]
                    }
                ],
                temperature: 1
            });

            const endTime = Date.now();
            const processingTime = endTime - startTime;
            console.log('Anthropic AI processing completed');

            // Clean the response text before parsing
            let responseText = response.content[0].text;
            // Remove any markdown code block syntax
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            // Remove any explanatory text before the JSON
            responseText = responseText.replace(/^[^{]*/, '');
            // Remove any trailing text after the JSON
            responseText = responseText.replace(/[^}]*$/, '');
            // Remove any leading/trailing whitespace
            responseText = responseText.trim();

            // Clean up number formatting (remove commas from numbers)
            responseText = responseText.replace(/"(\d{1,3}(?:,\d{3})*(?:\.\d+)?)"/g, (match, number) => {
                return `"${number.replace(/,/g, '')}"`;
            });

            // Parse the response content
            let structuredData;
            try {
                structuredData = JSON.parse(responseText);
            } catch (error) {
                console.error('Error parsing AI response:', error);
                console.error('Raw response text:', responseText);
                throw new Error('Failed to parse AI response as JSON');
            }

            // Send the extracted data to Telegram
            return {
                data: structuredData,
                timing: {
                    start: startTime,
                    end: endTime,
                    duration: processingTime
                }
            };
        } catch (error) {
            console.error('Error in Anthropic AI Service:', error);
            throw error;
        }
    }
}

export default AnthropicAiService; 