export const delay = (min: number, max: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));
