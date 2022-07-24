import { Browser, Page } from 'puppeteer'
import Application from '../helpers/application'

export type TaskHandler = (page: Page) => Promise<string>

export interface Ctx {
  app: Application
  browser: Browser
}
