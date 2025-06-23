import { TermCheckable } from "../types";
import { makeNat } from "./makeNat";
import { annotatedMul } from "./mul.test";
import { annotatedPlus } from "./plus.test";
import { annotatedSum } from "./sum.test";

type VarExpr = string;
type NatExpr = number;
type SuccExpr = ["S", Expr];
type PlusExpr = [Expr, "+", Expr];
type MulExpr = [Expr, "*", Expr];
type SumExpr = ["sum", Expr];
type Expr = VarExpr | NatExpr | SuccExpr | PlusExpr | MulExpr | SumExpr;
export type VariableMap = Map<VarExpr, TermCheckable>;
export const makeExpr = (
  expr: Expr,
  variableMap: VariableMap
): TermCheckable => {
  if (typeof expr === "string") {
    const value = variableMap.get(expr);
    if (value === undefined) throw "unknown variable";
    return value;
  }

  if (typeof expr === "number") {
    return makeNat(expr);
  }

  if (expr.length === 2 && expr[0] === "S") {
    return ["Inf", ["Succ", makeExpr(expr[1], variableMap)]];
  }

  if (expr.length === 2 && expr[0] === "sum") {
    return ["Inf", [annotatedSum, ":@:", makeExpr(expr[1], variableMap)]];
  }

  if (expr[1] === "+") {
    return [
      "Inf",
      [
        [annotatedPlus, ":@:", makeExpr(expr[0], variableMap)],
        ":@:",
        makeExpr(expr[2], variableMap),
      ],
    ];
  }

  if (expr[1] === "*") {
    return [
      "Inf",
      [
        [annotatedMul, ":@:", makeExpr(expr[0], variableMap)],
        ":@:",
        makeExpr(expr[2], variableMap),
      ],
    ];
  }

  return expr satisfies never;
};

export const makeEqExpr = (
  expr: [Expr, "=", Expr],
  variableMap: Map<VarExpr, TermCheckable>,
  type: TermCheckable = ["Inf", ["Nat"]]
): TermCheckable => {
  return [
    "Inf",
    [
      "Eq",
      type,
      makeExpr(expr[0], variableMap),
      makeExpr(expr[2], variableMap),
    ],
  ];
};
