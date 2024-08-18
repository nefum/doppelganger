declare module "array.prototype.toreversed/auto";

declare module "array.prototype.toreversed/polyfill" {
  function getPolyfill(): Array.prototype.toReversed;
  export = getPolyfill;
}

declare module "array.prototype.toreversed/shim" {
  function shim(): void;
  export = shim;
}
