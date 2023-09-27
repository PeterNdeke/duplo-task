import { EventEmitter } from 'events';

export class CustomEventEmitter<T> {
  private eventName: string;
  private myEvent = new EventEmitter();

  constructor(eventName: string) {
    this.eventName = eventName;
  }

  onDataRecieved(fn: (data: T) => void) {
    return this.myEvent.on(this.eventName, fn);
  }

  sendData(data: T) {
    return this.myEvent.emit(this.eventName, data);
  }
}
