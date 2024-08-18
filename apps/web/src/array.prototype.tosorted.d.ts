declare module "array.prototype.tosorted/auto";

declare module "array.prototype.tosorted/polyfill" {
  function getPolyfill(): Array.prototype.toSorted;
  export = getPolyfill;
}

declare module "array.prototype.tosorted/shim" {
  function shim(): void;
  export = shim;
}
