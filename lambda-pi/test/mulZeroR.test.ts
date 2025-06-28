import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeEqExpr } from "./makeExpr";

// forall (n: nat),
// n * O = O

const mulZeroRType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // n :: Nat
    ["Inf", ["Nat"]],
    makeEqExpr(
      [["n", "*", 0], "=", 0],
      new Map([["n", ["Inf", ["Bound", 0]]]])
    ),
  ],
];
const mulZeroRProof: TermCheckable = [
  "Lam", // arg: n
  [
    "Inf",
    [
      "NatElim",
      // NatElim_prop
      [
        "Lam", // arg: n
        makeEqExpr(
          [["n", "*", 0], "=", 0],
          new Map([["n", ["Inf", ["Bound", 0]]]])
        ),
      ],
      // NatElim_propZero
      ["Refl", ["Inf", ["Nat"]], ["Inf", ["Zero"]]],
      // NatElim_propSucc
      [
        "Lam", // arg: n
        [
          "Lam", // arg: n * 0 = 0
          ["Inf", ["Bound", 0]],
        ],
      ],
      // NatElim_nat
      ["Inf", ["Bound", 0]], // n
    ],
  ],
];
export const mulZeroRAnn: TermInferable = ["Ann", mulZeroRProof, mulZeroRType];
test("check mulZeroR", () => {
  typeInferable(0)([])(mulZeroRAnn);
});
