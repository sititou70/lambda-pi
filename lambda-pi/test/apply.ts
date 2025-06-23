import { TermCheckable, TermInferable } from "../types";

export const makeApplyExpr = (
  operator: TermInferable,
  ...operands: TermCheckable[]
): TermCheckable => [
  "Inf",
  operands.reduce(
    (termInferable, operand) => [termInferable, ":@:", operand],
    operator
  ),
];
