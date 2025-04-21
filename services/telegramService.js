const TelegramBot = require('node-telegram-bot-api');
const messageAggregatorService = require('./messageAggregatorService');

class TelegramService {
    constructor() {
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    }

    async sendFinancialData(chatId, financialData) {
        try {
            const formattedMessage = messageAggregatorService.formatFinancialData(financialData);
            await this.bot.sendMessage(chatId, formattedMessage, { parse_mode: 'Markdown' });
            return { success: true, message: 'Financial data sent successfully to Telegram' };
        } catch (error) {
            console.error('Error sending financial data to Telegram:', error);
            throw error;
        }
    }
}

module.exports = TelegramService; 