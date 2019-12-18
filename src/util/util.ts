import classnames from 'classnames';
import * as lodash from 'lodash';

function noop() { }

export const util = {
  classnames,
  ensureFunction(fn: any) {
    return typeof fn === 'function' ? fn : noop;
  },
  ensureArray(arr: any) {
    return Array.isArray(arr) ? arr : [];
  },
  cloneDeep(value: any): any {
    return lodash.cloneDeep(value);
  },
  pick(obj: object, props: string[]) {
    return lodash.pick(obj, props);
  },
  getValue(obj: object, path: string) {
    return lodash.get(obj, path);
  },
  isEqual(value: any, other: any) {
    return lodash.isEqual(value, other);
  },
  isEmpty(value: any) {
    return lodash.isEmpty(value);
  },
  debounce(fn: (...args: any) => any, wait: number) {
    return lodash.debounce(fn, wait);
  },
};