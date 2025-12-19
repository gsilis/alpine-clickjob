import type { Loopable, LoopRegistrant } from "./loopable";

export class Loop implements Loopable {
  private running: boolean = false;
  private lastRun: number = 0;
  private listeners: LoopRegistrant[] = [];

  get isRunning(): boolean {
    return this.running;
  }

  add(registrant: LoopRegistrant) {
    this.listeners.push(registrant);
  }

  remove(registrant: LoopRegistrant) {
    this.listeners = this.listeners.filter(l => l !== registrant);
  }

  start() {
    this.running = true;
    this.request();
  }

  stop() {
    this.running = false;
    this.lastRun = 0;
  }

  onFrame(time: number) {
    if (!this.isRunning) {
      return;
    }

    if (this.lastRun === 0) {
      // First frame of the loop, wait for the next one!
      this.lastRun = time;
      this.request();
      return;
    }

    const diff = time - this.lastRun;
    this.lastRun = time;
    this.listeners.forEach((listener) => {
      try {
        // Expect the passed functions to this object to already be bound
        listener.call(undefined, diff);
      } catch (e) {}
    });

    if (this.isRunning) this.request();
  }

  private request() {
    requestAnimationFrame(this.onFrame.bind(this));
  }
}