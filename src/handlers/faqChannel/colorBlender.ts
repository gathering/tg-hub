/* eslint-disable no-bitwise */
export default function colorBlender(color1: number, color2: number, steps: number): [number, ...number[], number] {
  const blendedColors: number[] = [color1];
  for (let i = 1; i < steps - 1; i += 1) {
    const ratio = i / (steps - 1);
    const rColor = Math.round((color1 >> 16 & 0xff) * (1 - ratio) + (color2 >> 16 & 0xff) * ratio);
    const gColor = Math.round((color1 >> 8 & 0xff) * (1 - ratio) + (color2 >> 8 & 0xff) * ratio);
    const bColor = Math.round((color1 & 0xff) * (1 - ratio) + (color2 & 0xff) * ratio);
    blendedColors.push(rColor << 16 | gColor << 8 | bColor);
  }
  blendedColors.push(color2);
  return blendedColors as ReturnType<typeof colorBlender>;
}
