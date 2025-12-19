export type LoopRegistrant = (diff: number) => void;

export interface Loopable {
  get isRunning(): boolean
  add(registrant: LoopRegistrant): void
  remove(registrant: LoopRegistrant): void
  start(): void
  stop(): void
  onFrame(time: number): void
}