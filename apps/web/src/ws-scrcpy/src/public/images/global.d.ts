declare module '*.png' {
  export const src: string;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
