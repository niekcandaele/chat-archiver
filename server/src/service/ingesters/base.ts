import { config } from '../../config';
import { IDocument } from '../../types/Document';

export abstract class Ingester {
  interval: NodeJS.Timer | null = null;

  protected abstract init(): Promise<void>
  abstract intervalFunction(): Promise<void>;

  protected async writeDocument(document: IDocument) {
    throw new Error('Not implemented')
  }

  async start() {
    console.log('Starting ingester')
    await this.init();
    this.interval = setInterval(this.intervalFunction.bind(this), config.get('collectInterval'));
    await this.intervalFunction()
  }

  async stop() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

}