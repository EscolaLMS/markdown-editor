const SSR = typeof window === 'undefined';
const isMac = !SSR && window.navigator.platform === 'MacIntel';

export default function isModKey(event: KeyboardEvent): boolean {
  return isMac ? event.metaKey : event.ctrlKey;
}
