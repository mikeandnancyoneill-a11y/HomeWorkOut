export function nextWeight(
  current: number,
  avgRPE: number,
  type: string,
  pain: boolean
) {
  if (avgRPE > 8) return current;
  let inc = type === 'lower' ? 10 : 5;
  if (pain) inc = 2.5;
  return current + inc;
}
