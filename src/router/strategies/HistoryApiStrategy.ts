import type { RouterStrategy } from './RouterStrategy';

export class HistoryApiStrategy implements RouterStrategy {

  private _paused = false;

  private _currentURL: string;

  private _triggerChange: boolean = true;

  private _changeListeners: ((url: string) => void)[] = [];

  constructor() {

    this._currentURL = window.location.pathname.substr(1);

    window.addEventListener("popstate", (ev) => {
      this.urlChangedHandler();
      ev.preventDefault();
    });
  }

  private urlChangedHandler() {
    if (this._paused) return;
    let newURL = window.location.pathname.substr(1);

    this._currentURL = newURL;

    if (this._triggerChange) {
      this.callChangeListeners(newURL);
    } else {
      console.debug("URL changed but 'triggerChange' prevented router from calling change listeners!");
    }
  }

  callChangeListeners(url?: string) {
    this._changeListeners.forEach(
      (listener) => listener(url ?? this.currentURL()),
    );
  }

  offURLChange(fn: (newURL: string) => void): void {
    this._changeListeners = this._changeListeners.filter((f) => f !== fn);
  }

  onURLChange(fn: (newURL: string) => void, once?: boolean): void {
    if (once === true) {
      let onceListener = (newURL: string) => {
        fn(newURL);
        this.offURLChange(onceListener);
      };
      this._changeListeners.push((onceListener));
    } else {
      this._changeListeners.push(fn);
    }
  }

  currentURL(): string {
    return this._currentURL;
  }

  changeURL(url: string, triggerURLChange?: boolean): void {
    this._triggerChange = triggerURLChange ?? true;
    window.history.pushState({}, '', url);
    this.urlChangedHandler();
    this._triggerChange = true;
  }

  pause(): void {
    this._paused = true;
  }

  resume(): void {
    this._paused = false;
  }

  setPausedState(paused: boolean): void {
    this._paused = paused;
  }

}