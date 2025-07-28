import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeNat } from "./makeNat";
import { makeApplyExpr, makeEqExpr, makeExpr } from "./makeExpr";
import { eqIndRAnn } from "./eqIndR.test";

// forall (n: mynat),
// n + MO = n

const plusZeroRType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // n :: nat
    ["Nat"],
    makeEqExpr(
      [["n", "+", 0], "=", "n"],
      new Map([["n", ["Inf", ["Bound", 0]]]])
    ),
  ],
];
const plusZeroRProof: TermCheckable = [
  "Lam", // arg: n
  [
    "Inf",
    [
      "NatElim",
      // NatElim_prop :: forall (n: Nat), n + Zero = n
      [
        "Lam", // arg: n
        [
          "Inf",
          makeEqExpr(
            [["n", "+", 0], "=", "n"],
            new Map([["n", ["Inf", ["Bound", 0]]]])
          ),
        ],
      ],
      // NatElim_propZero
      ["Inf", ["Refl", ["Inf", ["Nat"]], makeNat(0)]],
      // NatElim_propSucc
      [
        "Lam", // arg: n
        [
          "Lam", // arg: n + 0 = n
          [
            "Inf",
            makeApplyExpr(
              eqIndRAnn,
              ["Inf", ["Nat"]],
              [
                "Lam", // arg: target
                [
                  "Inf",
                  makeEqExpr(
                    [["S", "target"], "=", ["S", "n"]],
                    new Map([
                      ["target", ["Inf", ["Bound", 0]]],
                      ["n", ["Inf", ["Bound", 2]]],
                    ])
                  ),
                ],
              ],
              ["Inf", ["Bound", 1]],
              makeExpr(["n", "+", 0], new Map([["n", ["Inf", ["Bound", 1]]]])),
              [
                "Inf",
                [
                  "Refl",
                  ["Inf", ["Nat"]],
                  makeExpr(["S", "n"], new Map([["n", ["Inf", ["Bound", 1]]]])),
                ],
              ],
              ["Inf", ["Bound", 0]] // n + 0 = n
            ),
          ],
        ],
      ],
      // NatElim_nat
      ["Inf", ["Bound", 0]],
    ],
  ],
];
export const plusZeroRAnn: TermInferable = [
  "Ann",
  plusZeroRProof,
  plusZeroRType,
];
test("check plusZeroR", () => {
  typeInferable(0)([])(plusZeroRAnn);
});
