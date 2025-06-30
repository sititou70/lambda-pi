import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeEqExpr, makeExpr } from "./makeExpr";
import { makeApplyExpr } from "./apply";
import { eqIndRAnn } from "./eqIndR.test";

// forall (x y: nat),
// (S x) + y = x + (S y)

const plusSuccMoveType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // x :: Nat
    ["Inf", ["Nat"]],
    [
      "Inf",
      [
        "Pi",
        // y :: Nat
        ["Inf", ["Nat"]],
        makeEqExpr(
          [[["S", "x"], "+", "y"], "=", ["x", "+", ["S", "y"]]],
          new Map([
            ["x", ["Inf", ["Bound", 1]]],
            ["y", ["Inf", ["Bound", 0]]],
          ])
        ),
      ],
    ],
  ],
];
const plusSuccMoveProof: TermCheckable = [
  "Lam", // arg: x
  [
    "Lam", // arg: y
    [
      "Inf",
      [
        "NatElim",
        // NatElim_prop
        [
          "Lam", // arg: x
          makeEqExpr(
            [[["S", "x"], "+", "y"], "=", ["x", "+", ["S", "y"]]],
            new Map([
              ["x", ["Inf", ["Bound", 0]]],
              ["y", ["Inf", ["Bound", 1]]],
            ])
          ),
        ],
        // NatElim_propZero
        [
          "Inf",
          [
            "Refl",
            ["Inf", ["Nat"]],
            [
              "Inf",
              [
                "Succ",
                ["Inf", ["Bound", 0]], // y
              ],
            ],
          ],
        ],
        // NatElim_propSucc
        [
          "Lam", // arg: x
          [
            "Lam", // arg: (Succ x) + y = x + (Succ y)
            makeApplyExpr(
              eqIndRAnn,
              ["Inf", ["Nat"]],
              [
                "Lam", // arg: target
                makeEqExpr(
                  [["S", "target"], "=", [["S", "x"], "+", ["S", "y"]]],
                  new Map([
                    ["target", ["Inf", ["Bound", 0]]],
                    ["x", ["Inf", ["Bound", 2]]],
                    ["y", ["Inf", ["Bound", 3]]],
                  ])
                ),
              ],
              makeExpr(
                ["x", "+", ["S", "y"]],
                new Map([
                  ["x", ["Inf", ["Bound", 1]]],
                  ["y", ["Inf", ["Bound", 2]]],
                ])
              ),
              makeExpr(
                [["S", "x"], "+", "y"],
                new Map([
                  ["x", ["Inf", ["Bound", 1]]],
                  ["y", ["Inf", ["Bound", 2]]],
                ])
              ),
              [
                "Inf",
                [
                  "Refl",
                  ["Inf", ["Nat"]],
                  makeExpr(
                    [["S", "x"], "+", ["S", "y"]],
                    new Map([
                      ["x", ["Inf", ["Bound", 1]]],
                      ["y", ["Inf", ["Bound", 2]]],
                    ])
                  ),
                ],
              ],
              ["Inf", ["Bound", 0]] // (Succ x) + y = x + (Succ y)
            ),
          ],
        ],
        // NatElim_nat
        ["Inf", ["Bound", 1]], // x
      ],
    ],
  ],
];
export const plusSuccMoveAnn: TermInferable = [
  "Ann",
  plusSuccMoveProof,
  plusSuccMoveType,
];
test("check plusSuccMove", () => {
  typeInferable(0)([])(plusSuccMoveAnn);
});
