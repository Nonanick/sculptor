declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
      onouterclick?: (event: CustomEvent<any> & { target: EventTarget & T }) => any;
      onvisibilitychange?: (event: CustomEvent<{isVisible : boolean}> & { target: EventTarget & T }) => any;
  }
  interface HTMLProps<T> {
    onouterclick?: (event: CustomEvent<any> & { target: EventTarget & T }) => any;
    onvisibilitychange?: (event: CustomEvent<{isVisible : boolean}> & { target: EventTarget & T }) => any;

  }
}