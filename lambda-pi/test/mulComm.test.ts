import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeEqExpr, makeExpr, VariableMap } from "./makeExpr";
import { makeApplyExpr } from "./apply";
import { mulZeroRAnn } from "./mulZeroR.test";
import { eqIndRAnn } from "./eqIndR.test";
import { eqSymAnn } from "./eqSym.test";
import { mulOneRAnn } from "./mulOneR.test";
import { mulDistAnn } from "./mulDist.test";

// forall (x y: nat),
// x * y = y * x

const mulCommType: TermCheckable = [
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
          [["x", "*", "y"], "=", ["y", "*", "x"]],
          new Map([
            ["x", ["Inf", ["Bound", 1]]],
            ["y", ["Inf", ["Bound", 0]]],
          ])
        ),
      ],
    ],
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
              // y :: Nat
              ["Inf", ["Nat"]],
              [
                "Inf",
                [
                  "Pi",
                  // IHy :: x * y = y * x
                  makeEqExpr(
                    [["x", "*", "y"], "=", ["y", "*", "x"]],
                    new Map([
                      ["x", ["Inf", ["Bound", 2]]],
                      ["y", ["Inf", ["Bound", 0]]],
                    ])
                  ),
                  makeEqExpr(expectEqExpr, mulCommProofExpVariableMap),
                ],
              ],
            ],
          ],
        ],
      ],
    ],
  ];
  const proof: TermCheckable = [
    "Lam", // arg: x
    [
      "Lam", // arg: y
      [
        "Lam", // arg: y
        [
          "Lam", // arg: IHx
          exp,
        ],
      ],
    ],
  ];
  typeInferable(0)([])(["Ann", proof, type]);
};

const mulCommProofExpVariableMap: VariableMap = new Map([
  ["x", ["Inf", ["Bound", 3]]],
  ["y", ["Inf", ["Bound", 1]]],
  ["IHy", ["Inf", ["Bound", 0]]],
]);
const mulCommProofExpVariableMapWithTarget: VariableMap = new Map([
  ["target", ["Inf", ["Bound", 0]]],
  ["x", ["Inf", ["Bound", 4]]],
  ["y", ["Inf", ["Bound", 2]]],
  ["IHy", ["Inf", ["Bound", 1]]],
]);

const mulCommProofExp1: TermCheckable = [
  "Inf",
  [
    "Refl",
    ["Inf", ["Nat"]],
    makeExpr(["x", "+", ["x", "*", "y"]], mulCommProofExpVariableMap),
  ],
];
test("check mulCommProofExp1", () => {
  checkExp(mulCommProofExp1, [
    ["x", "+", ["x", "*", "y"]],
    "=",
    ["x", "+", ["x", "*", "y"]],
  ]);
});

const mulCommProofExp2: TermCheckable = makeApplyExpr(
  eqIndRAnn,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [["x", "+", ["x", "*", "y"]], "=", ["x", "+", "target"]],
      mulCommProofExpVariableMapWithTarget
    ),
  ],
  makeExpr(["x", "*", "y"], mulCommProofExpVariableMap),
  makeExpr(["y", "*", "x"], mulCommProofExpVariableMap),
  mulCommProofExp1,
  makeApplyExpr(
    eqSymAnn,
    ["Inf", ["Nat"]],
    makeExpr(["x", "*", "y"], mulCommProofExpVariableMap),
    makeExpr(["y", "*", "x"], mulCommProofExpVariableMap),
    makeExpr("IHy", mulCommProofExpVariableMap)
  )
);
test("check mulCommProofExp2", () => {
  checkExp(mulCommProofExp2, [
    ["x", "+", ["x", "*", "y"]],
    "=",
    ["x", "+", ["y", "*", "x"]],
  ]);
});

const mulCommProofExp3: TermCheckable = makeApplyExpr(
  eqIndRAnn,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [["target", "+", ["x", "*", "y"]], "=", ["x", "+", ["y", "*", "x"]]],
      mulCommProofExpVariableMapWithTarget
    ),
  ],
  makeExpr("x", mulCommProofExpVariableMap),
  makeExpr(["x", "*", 1], mulCommProofExpVariableMap),
  mulCommProofExp2,
  makeApplyExpr(mulOneRAnn, makeExpr("x", mulCommProofExpVariableMap))
);
test("check mulCommProofExp3", () => {
  checkExp(mulCommProofExp3, [
    [["x", "*", 1], "+", ["x", "*", "y"]],
    "=",
    ["x", "+", ["y", "*", "x"]],
  ]);
});

const mulCommProofExp4: TermCheckable = makeApplyExpr(
  eqIndRAnn,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      ["target", "=", ["x", "+", ["y", "*", "x"]]],
      mulCommProofExpVariableMapWithTarget
    ),
  ],
  makeExpr([["x", "*", 1], "+", ["x", "*", "y"]], mulCommProofExpVariableMap),
  makeExpr(["x", "*", [1, "+", "y"]], mulCommProofExpVariableMap),
  mulCommProofExp3,
  makeApplyExpr(
    mulDistAnn,
    makeExpr("x", mulCommProofExpVariableMap),
    makeExpr(1, mulCommProofExpVariableMap),
    makeExpr("y", mulCommProofExpVariableMap)
  )
);
test("check mulCommProofExp4", () => {
  checkExp(mulCommProofExp4, [
    ["x", "*", [1, "+", "y"]],
    "=",
    ["x", "+", ["y", "*", "x"]],
  ]);
});

const mulCommProofExp5: TermCheckable = mulCommProofExp4;
test("check mulCommProofExp5", () => {
  checkExp(mulCommProofExp5, [
    ["x", "*", ["S", "y"]],
    "=",
    [["S", "y"], "*", "x"],
  ]);
});

const mulCommProof: TermCheckable = [
  "Lam", // arg: x
  [
    "Lam", // arg: y
    [
      "Inf",
      [
        "NatElim",
        // NatElim_prop
        [
          "Lam", // arg: y
          makeEqExpr(
            [["x", "*", "y"], "=", ["y", "*", "x"]],
            new Map([
              ["x", ["Inf", ["Bound", 2]]],
              ["y", ["Inf", ["Bound", 0]]],
            ])
          ),
        ],
        // NatElim_propZero
        makeApplyExpr(
          mulZeroRAnn,
          ["Inf", ["Bound", 1]] // x
        ),
        // NatElim_propSucc
        [
          "Lam", // arg: y
          [
            "Lam", // arg: x * y = y * x
            mulCommProofExp5,
          ],
        ],
        // NatElim_nat
        ["Inf", ["Bound", 0]], // y
      ],
    ],
  ],
];
export const mulCommAnn: TermInferable = ["Ann", mulCommProof, mulCommType];
test.skip("check mulComm", () => {
  typeInferable(0)([])(mulCommAnn);
});
