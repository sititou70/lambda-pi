import { TermCheckable } from "../types";

export const makeNat = (n: number): TermCheckable => {
  if (n === 0) return ["Inf", ["Zero"]];
  return ["Inf", ["Succ", makeNat(n - 1)]];
};
