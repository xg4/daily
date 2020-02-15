import Bot from '@xg4/dingtalk-bot'
import CONFIG from './config'

export const bot = new Bot(CONFIG.DINGTALK_WEBHOOK, CONFIG.DINGTALK_SECRET)
