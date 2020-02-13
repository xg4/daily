import CONFIG from '../config'
import Bot from './bot'

export const bot = new Bot(CONFIG.DINGTALK_WEBHOOK, CONFIG.DINGTALK_SECRET)
