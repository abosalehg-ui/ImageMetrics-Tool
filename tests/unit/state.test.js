import { describe, it, expect, beforeEach } from 'vitest';
import { store, setState } from '../../js/state.js';

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
