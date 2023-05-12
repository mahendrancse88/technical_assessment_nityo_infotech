const FAKE_FETCH_DELAY_MIN = 1500;
const FAKE_FETCH_DELAY_MAX = 2000;

export function delay<T>(result: T, ms = undefined) {

  if (!ms) {
    ms = Math.random() * (FAKE_FETCH_DELAY_MAX - FAKE_FETCH_DELAY_MIN) + FAKE_FETCH_DELAY_MIN;
  }

  return new Promise<T>(resolve => setTimeout(resolve, ms, result));
}