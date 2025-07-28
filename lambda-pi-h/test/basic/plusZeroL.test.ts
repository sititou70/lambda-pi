import { test } from "vitest";
import { TermCheckable, TermInferable } from "../../types";
import { typeInferable } from "../../checker";
import { plusAnn } from "../plus.test";

// forall (n: nat),
// O + n = O

const plusZeroLType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // n :: Nat
    ["Nat"],
    [
      "Eq",
      ["Inf", ["Nat"]],
      [
        "Inf",
        [
          [
            plusAnn,
            ":@:",
            ["Inf", ["Zero"]], // 0
          ],
          ":@:",
          ["Inf", ["Bound", 0]], // n
        ],
      ],
      ["Inf", ["Bound", 0]], // n
    ],
    // makeEqExpr(
    //   [[0, "+", "n"], "=", "n"],
    //   new Map([["n", ["Inf", ["Bound", 0]]]])
    // ),
  ],
];
const plusZeroLProof: TermCheckable = [
  "Lam", // arg: n
  ["Inf", ["Refl", ["Inf", ["Nat"]], ["Inf", ["Bound", 0]]]],
];
export const plusZeroLAnn: TermInferable = [
  "Ann",
  plusZeroLProof,
  plusZeroLType,
];
test("check plusZeroL", () => {
  typeInferable(0)([])(plusZeroLAnn);
});
