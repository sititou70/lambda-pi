import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeEqExpr, makeExpr, VariableMap } from "./makeExpr";
import { makeApplyExpr } from "./apply";
import { eqIndRAnn } from "./eqIndR.test";

// forall (n: nat),
// n * (S O) = n

const mulOneRType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // x :: Nat
    ["Inf", ["Nat"]],
    makeEqExpr(
      [["n", "*", 1], "=", "n"],
      new Map([["n", ["Inf", ["Bound", 0]]]])
    ),
  ],
];

const checkExp = (
  exp: TermCheckable,
  expectEqExpr: Parameters<typeof makeEqExpr>[0]
): void => {
  const type: TermCheckable = [
    "Inf",
    [
      "Pi",
      // n :: Nat
      ["Inf", ["Nat"]],
      [
        "Inf",
        [
          "Pi",
          // IHn :: n + 1 = n
          makeEqExpr(
            [["n", "*", 1], "=", "n"],
            new Map([["n", ["Inf", ["Bound", 0]]]])
          ),
          makeEqExpr(expectEqExpr, mulOneRProofExpVariableMap),
        ],
      ],
    ],
  ];
  const proof: TermCheckable = [
    "Lam", // arg: n
    [
      "Lam", // arg: IHn
      exp,
    ],
  ];
  typeInferable(0)([])(["Ann", proof, type]);
};

const mulOneRProofExpVariableMap: VariableMap = new Map([
  ["n", ["Inf", ["Bound", 1]]],
  ["IHn", ["Inf", ["Bound", 0]]],
]);
const mulOneRProofExpVariableMapWithTarget: VariableMap = new Map([
  ["target", ["Inf", ["Bound", 0]]],
  ["n", ["Inf", ["Bound", 2]]],
  ["IHn", ["Inf", ["Bound", 1]]],
]);

const mulOneRProofExp1: TermCheckable = [
  "Refl",
  ["Inf", ["Nat"]],
  makeExpr(["S", "n"], mulOneRProofExpVariableMap),
];
test("check mulOneRProofExp1", () => {
  checkExp(mulOneRProofExp1, [["S", "n"], "=", ["S", "n"]]);
});

const mulOneRProofExp2: TermCheckable = mulOneRProofExp1;
test("check mulOneRProofExp2", () => {
  checkExp(mulOneRProofExp2, [[1, "+", "n"], "=", ["S", "n"]]);
});

const mulOneRProofExp3: TermCheckable = makeApplyExpr(
  eqIndRAnn,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [[1, "+", "target"], "=", ["S", "n"]],
      mulOneRProofExpVariableMapWithTarget
    ),
  ],
  makeExpr("n", mulOneRProofExpVariableMap),
  makeExpr(["n", "*", 1], mulOneRProofExpVariableMap),
  mulOneRProofExp2,
  makeExpr("IHn", mulOneRProofExpVariableMap)
);
test("check mulOneRProofExp3", () => {
  checkExp(mulOneRProofExp3, [[1, "+", ["n", "*", 1]], "=", ["S", "n"]]);
});

const mulOneRProofExp4: TermCheckable = mulOneRProofExp3;
test("check mulOneRProofExp4", () => {
  checkExp(mulOneRProofExp4, [[["S", "n"], "*", 1], "=", ["S", "n"]]);
});

const mulOneRProof: TermCheckable = [
  "Lam", // arg: n
  [
    "Inf",
    [
      "NatElim",
      // NatElim_prop
      [
        "Lam", // arg: n
        makeEqExpr(
          [["n", "*", 1], "=", "n"],
          new Map([["n", ["Inf", ["Bound", 0]]]])
        ),
      ],
      // NatElim_propZero
      ["Refl", ["Inf", ["Nat"]], ["Inf", ["Zero"]]],
      // NatElim_propSucc
      [
        "Lam", // arg: n
        [
          "Lam", // arg: n * 1 = n
          mulOneRProofExp4,
        ],
      ],
      // NatElim_nat
      ["Inf", ["Bound", 0]], // n
    ],
  ],
];
export const mulOneRAnn: TermInferable = ["Ann", mulOneRProof, mulOneRType];
test("check mulOneR", () => {
  typeInferable(0)([])(mulOneRAnn);
});
