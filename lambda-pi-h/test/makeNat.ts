import { TermCheckable, Value } from "../types";

export const makeNat = (n: number): TermCheckable => {
  if (n === 0) return ["Inf", ["Zero"]];
  return ["Inf", ["Succ", makeNat(n - 1)]];
};

export const makeVNat = (n: number): Value => {
  if (n === 0) return ["VZero"];
  return ["VSucc", makeVNat(n - 1)];
};
