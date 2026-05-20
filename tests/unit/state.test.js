import { describe, it, expect, beforeEach } from 'vitest';
import { store, setState, subscribe } from '../../js/state.js';

// state.js uses module-level singletons. Reset before each test to keep
// tests independent.
function resetStore() {
  setState({
    img: null,
    points: [],
    zoom: 1,
    showGrid: false,
    lang: 'ar',
    isDragging: false,
  });
}

describe('store', () => {
  beforeEach(resetStore);

  it('exposes sensible initial values', () => {
    expect(store.points).toEqual([]);
    expect(store.zoom).toBe(1);
    expect(store.lang).toBe('ar');
    expect(store.showGrid).toBe(false);
    expect(store.isDragging).toBe(false);
    expect(store.img).toBeNull();
  });
});

describe('setState', () => {
  beforeEach(resetStore);

  it('patches a single field without touching the others', () => {
    setState({ zoom: 2 });
    expect(store.zoom).toBe(2);
    expect(store.lang).toBe('ar');
    expect(store.points).toEqual([]);
  });

  it('patches multiple fields at once', () => {
    setState({ zoom: 3, lang: 'en', showGrid: true });
    expect(store.zoom).toBe(3);
    expect(store.lang).toBe('en');
    expect(store.showGrid).toBe(true);
  });

  it('overwrites array references atomically', () => {
    const newPoints = [{ x: 1, y: 2, color: '#fff' }];
    setState({ points: newPoints });
    expect(store.points).toBe(newPoints);
  });
});

describe('subscribe', () => {
  beforeEach(resetStore);

  it('invokes the subscriber on every setState call', () => {
    let calls = 0;
    subscribe(() => calls++);
    setState({ zoom: 2 });
    setState({ zoom: 3 });
    expect(calls).toBe(2);
  });

  it('passes the current store to the subscriber', () => {
    /** @type {import('../../js/types.d.ts').Store | undefined} */
    let received;
    subscribe((s) => {
      received = s;
    });
    setState({ zoom: 5 });
    expect(received?.zoom).toBe(5);
  });

  it('returns an unsubscribe function that detaches the listener', () => {
    let calls = 0;
    const unsubscribe = subscribe(() => calls++);
    setState({ zoom: 2 });
    expect(calls).toBe(1);

    unsubscribe();
    setState({ zoom: 3 });
    expect(calls).toBe(1);
  });

  it('supports multiple independent subscribers', () => {
    let aCalls = 0;
    let bCalls = 0;
    subscribe(() => aCalls++);
    subscribe(() => bCalls++);
    setState({ zoom: 2 });
    expect(aCalls).toBe(1);
    expect(bCalls).toBe(1);
  });
});
