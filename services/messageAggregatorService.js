class MessageAggregatorService {
    constructor() {}

    formatFinancialData(financialData) {
        // Helper function to calculate growth percentage
        const calculateGrowth = (current, previous) => {
            if (!previous || previous === 0) return "N/A";
            return ((current - previous) / previous * 100).toFixed(2);
        };

        // Helper function to format numbers with commas and convert to crores
        const formatNumber = (num) => {
            if (num === null || num === undefined) return "N/A";
            
            // Convert to crores based on the Revenue-Format
            let valueInCrores = num;
            if (financialData["Revenue-Format"] === "Lakhs") {
                valueInCrores = num / 100; // 1 crore = 100 lakhs
            } else if (financialData["Revenue-Format"] === "Millions") {
                valueInCrores = num / 10; // 1 crore = 10 million (approximately)
            }
            
            return valueInCrores.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
        };

        // Calculate growth rates
        const growthData = {
            revenueFromOps: calculateGrowth(
                financialData.currentQuarter.revenueFromOps,
                financialData.previousYearQuarter.revenueFromOps
            ),
            depreciation: calculateGrowth(
                financialData.currentQuarter.depreciation,
                financialData.previousYearQuarter.depreciation
            ),
            financeCosts: calculateGrowth(
                financialData.currentQuarter.financeCosts,
                financialData.previousYearQuarter.financeCosts
            ),
            otherIncome: calculateGrowth(
                financialData.currentQuarter.otherIncome,
                financialData.previousYearQuarter.otherIncome
            ),
            profitLossBeforeExceptionalItemsAndTax: calculateGrowth(
                financialData.currentQuarter.profitLossBeforeExceptionalItemsAndTax,
                financialData.previousYearQuarter.profitLossBeforeExceptionalItemsAndTax
            ),
            profitLossBeforeTax: calculateGrowth(
                financialData.currentQuarter.profitLossBeforeTax,
                financialData.previousYearQuarter.profitLossBeforeTax
            ),
            profitLossAfterTaxFromOrdinaryActivities: calculateGrowth(
                financialData.currentQuarter.profitLossAfterTaxFromOrdinaryActivities,
                financialData.previousYearQuarter.profitLossAfterTaxFromOrdinaryActivities
            ),
            profitLossForThePeriod: calculateGrowth(
                financialData.currentQuarter.profitLossForThePeriod,
                financialData.previousYearQuarter.profitLossForThePeriod
            )
        };

        // Check if Other Income has subcategories
        const hasOtherIncomeSubcategories = 
            financialData.currentQuarter.exceptionalItems !== null || 
            financialData.currentQuarter.shareOfPLOfAssociates !== null ||
            financialData.currentQuarter.extraOrdinaryItems !== null;

        // Create the formatted output with improved visual design
        let outputLines = [
            `🏢 *Quarterly Financial Results*\n`,
            `📅 *Period:* ${financialData.currentQuarter.period}\n`,
            ``,
            `📊 *Revenue & Income*`,
            `Revenue: ${formatNumber(financialData.currentQuarter.revenueFromOps)} Cr (↑ ${growthData.revenueFromOps}%)`
        ];

        // Handle Other Income based on whether it has subcategories
        if (hasOtherIncomeSubcategories) {
            // Case 2: When Other Income has subcategories
            outputLines.push(``);
            outputLines.push(`📊 *Other Income*`);
            
            if (financialData.currentQuarter.otherIncome !== null) {
                outputLines.push(`Other Income: ${formatNumber(financialData.currentQuarter.otherIncome)} Cr`);
            }
            
            if (financialData.currentQuarter.exceptionalItems !== null) {
                outputLines.push(`Exceptional Items: ${formatNumber(financialData.currentQuarter.exceptionalItems)} Cr`);
            }
            
            if (financialData.currentQuarter.shareOfPLOfAssociates !== null) {
                outputLines.push(`Share of P&L of Associates: ${formatNumber(financialData.currentQuarter.shareOfPLOfAssociates)} Cr`);
            }
            
            if (financialData.currentQuarter.extraOrdinaryItems !== null) {
                outputLines.push(`Extraordinary Items: ${formatNumber(financialData.currentQuarter.extraOrdinaryItems)} Cr`);
            }
            
            // Calculate total other income
            const totalOtherIncome = 
                (financialData.currentQuarter.otherIncome || 0) + 
                (financialData.currentQuarter.exceptionalItems || 0) + 
                (financialData.currentQuarter.shareOfPLOfAssociates || 0) +
                (financialData.currentQuarter.extraOrdinaryItems || 0);
            
            outputLines.push(`💰 *Total Other Income:* ${formatNumber(totalOtherIncome)} Cr 💰`);
        } else {
            // Case 1: When only normal Other Income is present
            outputLines.push(`Other Income: ${formatNumber(financialData.currentQuarter.otherIncome)} Cr (↑ ${growthData.otherIncome}%)`);
        }

        outputLines.push(``);
        outputLines.push(`📉 *Expenses*`);
        outputLines.push(`Fin Costs: ${formatNumber(financialData.currentQuarter.financeCosts)} Cr (↑ ${growthData.financeCosts}%)`);
        outputLines.push(`Dep: ${formatNumber(financialData.currentQuarter.depreciation)} Cr (↑ ${growthData.depreciation}%)`);
        outputLines.push(``);
        outputLines.push(`📈 *Profitability*`);
        outputLines.push(`PBT: ${formatNumber(financialData.currentQuarter.profitLossBeforeTax)} Cr (↑ ${growthData.profitLossBeforeTax}%)`);
        outputLines.push(`PAT: ${formatNumber(financialData.currentQuarter.profitLossForThePeriod)} Cr (↑ ${growthData.profitLossForThePeriod}%)`);
        outputLines.push(``);
        outputLines.push(`⏱️ *Processing Time:* ${(financialData.processingTime / 1000).toFixed(2)}s`);

        return outputLines.join('\n');
    }
}

module.exports = new MessageAggregatorService(); 