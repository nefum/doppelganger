declare module "bluebird" {
  interface Bluebird<T> extends Promise<T> {}
}
