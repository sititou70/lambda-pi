import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeEqExpr, makeExpr } from "./makeExpr";
import { makeApplyExpr } from "./apply";
import { eqIndRAnn } from "./eqIndR.test";

// forall (x y z: mynat),
// (x + y) + z = x + (y + z)

const plusAssocType: TermCheckable = [
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
        [
          "Inf",
          [
            "Pi",
            // z :: Nat
            ["Inf", ["Nat"]],
            makeEqExpr(
              [[["x", "+", "y"], "+", "z"], "=", ["x", "+", ["y", "+", "z"]]],
              new Map([
                ["x", ["Inf", ["Bound", 2]]],
                ["y", ["Inf", ["Bound", 1]]],
                ["z", ["Inf", ["Bound", 0]]],
              ])
            ),
          ],
        ],
      ],
    ],
  ],
];
const plusAssocProof: TermCheckable = [
  "Lam", // arg: x
  [
    "Lam", // arg: y
    [
      "Lam", // arg: z
      [
        "Inf",
        [
          "NatElim",
          // NatElim_prop
          [
            "Lam", // arg: x
            makeEqExpr(
              [[["x", "+", "y"], "+", "z"], "=", ["x", "+", ["y", "+", "z"]]],
              new Map([
                ["x", ["Inf", ["Bound", 0]]],
                ["y", ["Inf", ["Bound", 2]]],
                ["z", ["Inf", ["Bound", 1]]],
              ])
            ),
          ],
          // NatElim_propZero
          [
            "Inf",
            [
              "Refl",
              ["Inf", ["Nat"]],
              makeExpr(
                ["y", "+", "z"],
                new Map([
                  ["y", ["Inf", ["Bound", 1]]],
                  ["z", ["Inf", ["Bound", 0]]],
                ])
              ),
            ],
          ],
          // NatElim_propSucc
          [
            "Lam", // arg: x
            [
              "Lam", // arg: (x + y) + z = x + (y + z)
              makeApplyExpr(
                eqIndRAnn,
                ["Inf", ["Nat"]],
                [
                  "Lam", // arg: target
                  makeEqExpr(
                    [["S", "target"], "=", [["S", "x"], "+", ["y", "+", "z"]]],
                    new Map([
                      ["target", ["Inf", ["Bound", 0]]],
                      ["x", ["Inf", ["Bound", 2]]],
                      ["y", ["Inf", ["Bound", 4]]],
                      ["z", ["Inf", ["Bound", 3]]],
                    ])
                  ),
                ],
                makeExpr(
                  ["x", "+", ["y", "+", "z"]],
                  new Map([
                    ["x", ["Inf", ["Bound", 1]]],
                    ["y", ["Inf", ["Bound", 3]]],
                    ["z", ["Inf", ["Bound", 2]]],
                  ])
                ),
                makeExpr(
                  [["x", "+", "y"], "+", "z"],
                  new Map([
                    ["x", ["Inf", ["Bound", 1]]],
                    ["y", ["Inf", ["Bound", 3]]],
                    ["z", ["Inf", ["Bound", 2]]],
                  ])
                ),
                [
                  "Inf",
                  [
                    "Refl",
                    ["Inf", ["Nat"]],
                    makeExpr(
                      ["S", ["x", "+", ["y", "+", "z"]]],
                      new Map([
                        ["x", ["Inf", ["Bound", 1]]],
                        ["y", ["Inf", ["Bound", 3]]],
                        ["z", ["Inf", ["Bound", 2]]],
                      ])
                    ),
                  ],
                ],
                ["Inf", ["Bound", 0]] // (x + y) + z = x + (y + z)
              ),
            ],
          ],
          // NatElim_nat
          ["Inf", ["Bound", 2]], // x
        ],
      ],
    ],
  ],
];
export const plusAssocAnn: TermInferable = [
  "Ann",
  plusAssocProof,
  plusAssocType,
];
test("check plusAssoc", () => {
  typeInferable(0)([])(plusAssocAnn);
});
