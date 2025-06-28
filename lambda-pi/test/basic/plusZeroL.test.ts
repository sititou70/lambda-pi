import { test } from "vitest";
import { TermCheckable, TermInferable } from "../../types";
import { typeInferable } from "../../checker";
import { makeEqExpr } from "../makeExpr";
import { annotatedPlus } from "../plus.test";

// forall (n: nat),
// O + n = O

const plusZeroLType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // n :: Nat
    ["Inf", ["Nat"]],
    [
      "Inf",
      [
        "Eq",
        ["Inf", ["Nat"]],
        [
          "Inf",
          [
            [
              annotatedPlus,
              ":@:",
              ["Inf", ["Zero"]], // 0
            ],
            ":@:",
            ["Inf", ["Bound", 0]], // n
          ],
        ],
        ["Inf", ["Bound", 0]], // n
      ],
    ],
    // makeEqExpr(
    //   [[0, "+", "n"], "=", "n"],
    //   new Map([["n", ["Inf", ["Bound", 0]]]])
    // ),
  ],
];
const plusZeroLProof: TermCheckable = [
  "Lam", // arg: n
  ["Refl", ["Inf", ["Nat"]], ["Inf", ["Bound", 0]]],
];
export const plusZeroLCheck: TermInferable = [
  "Ann",
  plusZeroLProof,
  plusZeroLType,
];
test("check plusZeroL", () => {
  typeInferable(0)([])(plusZeroLCheck);
});
