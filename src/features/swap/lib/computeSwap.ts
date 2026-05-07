type ComputeSwapParams = {
  fromAmount: number;
  priceIn: number;
  priceOut: number;
};

export function computeSwap({ fromAmount, priceIn, priceOut }: ComputeSwapParams): number {
  return (fromAmount * priceIn) / priceOut;
}
