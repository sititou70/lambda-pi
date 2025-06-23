import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeEqExpr, makeExpr, VariableMap } from "./makeExpr";
import { makeApplyExpr } from "./apply";
import { eqIndRCheck } from "./eqIndR.test";
import { eqSymCheck } from "./eqSym.test";
import { plusAssocCheck } from "./plusAssoc.test";
import { plusCommCheck } from "./plusComm.test";

// forall (x y z: nat),
// x * (y + z) = (x * y) + (x * z)

const mulDistType: TermCheckable = [
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
              [
                ["x", "*", ["y", "+", "z"]],
                "=",
                [["x", "*", "y"], "+", ["x", "*", "z"]],
              ],
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

const checkExp = (
  exp: TermCheckable,
  expectEqExpr: Parameters<typeof makeEqExpr>[0]
): void => {
  const type: TermCheckable = [
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
          [
            "Inf",
            [
              "Pi",
              // x :: Nat
              ["Inf", ["Nat"]],
              [
                "Inf",
                [
                  "Pi",
                  // IHx :: x * (y + z) = (x * y) + (x * z)
                  makeEqExpr(
                    [
                      ["x", "*", ["y", "+", "z"]],
                      "=",
                      [["x", "*", "y"], "+", ["x", "*", "z"]],
                    ],
                    new Map([
                      ["x", ["Inf", ["Bound", 0]]],
                      ["y", ["Inf", ["Bound", 2]]],
                      ["z", ["Inf", ["Bound", 1]]],
                    ])
                  ),
                  makeEqExpr(expectEqExpr, mulDistProofExpVariableMap),
                ],
              ],
            ],
          ],
        ],
      ],
    ],
  ];
  const proof: TermCheckable = [
    "Lam", // arg: y
    [
      "Lam", // arg: z
      [
        "Lam", // arg: x
        [
          "Lam", // arg: IHx
          exp,
        ],
      ],
    ],
  ];
  typeInferable(0)([])(["Ann", proof, type]);
};

const mulDistProofExpVariableMap: VariableMap = new Map([
  ["x", ["Inf", ["Bound", 1]]],
  ["y", ["Inf", ["Bound", 3]]],
  ["z", ["Inf", ["Bound", 2]]],
  ["IHx", ["Inf", ["Bound", 0]]],
]);
const mulDistProofExpVariableMapWithTarget: VariableMap = new Map([
  ["target", ["Inf", ["Bound", 0]]],
  ["x", ["Inf", ["Bound", 2]]],
  ["y", ["Inf", ["Bound", 4]]],
  ["z", ["Inf", ["Bound", 3]]],
  ["IHx", ["Inf", ["Bound", 1]]],
]);

const mulDistProofExp1: TermCheckable = [
  "Refl",
  ["Inf", ["Nat"]],
  makeExpr(
    [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
    mulDistProofExpVariableMap
  ),
];
test("check mulDistProofExp1", () => {
  checkExp(mulDistProofExp1, [
    [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
    "=",
    [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
  ]);
});

const mulDistProofExp2: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [
        "target",
        "=",
        [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
      ],
      mulDistProofExpVariableMapWithTarget
    ),
  ],
  makeExpr(
    [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
    mulDistProofExpVariableMap
  ),
  makeExpr(
    [[["y", "+", ["x", "*", "y"]], "+", "z"], "+", ["x", "*", "z"]],
    mulDistProofExpVariableMap
  ),
  mulDistProofExp1,
  makeApplyExpr(
    plusAssocCheck,
    makeExpr(["y", "+", ["x", "*", "y"]], mulDistProofExpVariableMap),
    makeExpr("z", mulDistProofExpVariableMap),
    makeExpr(["x", "*", "z"], mulDistProofExpVariableMap)
  )
);
test("check mulDistProofExp2", () => {
  checkExp(mulDistProofExp2, [
    [[["y", "+", ["x", "*", "y"]], "+", "z"], "+", ["x", "*", "z"]],
    "=",
    [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
  ]);
});

const mulDistProofExp3: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [
        ["target", "+", ["x", "*", "z"]],
        "=",
        [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
      ],
      mulDistProofExpVariableMapWithTarget
    ),
  ],
  makeExpr([["y", "+", ["x", "*", "y"]], "+", "z"], mulDistProofExpVariableMap),
  makeExpr(["y", "+", [["x", "*", "y"], "+", "z"]], mulDistProofExpVariableMap),
  mulDistProofExp2,
  makeApplyExpr(
    eqSymCheck,
    ["Inf", ["Nat"]],
    makeExpr(
      [["y", "+", ["x", "*", "y"]], "+", "z"],
      mulDistProofExpVariableMap
    ),
    makeExpr(
      ["y", "+", [["x", "*", "y"], "+", "z"]],
      mulDistProofExpVariableMap
    ),
    makeApplyExpr(
      plusAssocCheck,
      makeExpr("y", mulDistProofExpVariableMap),
      makeExpr(["x", "*", "y"], mulDistProofExpVariableMap),
      makeExpr("z", mulDistProofExpVariableMap)
    )
  )
);
test("check mulDistProofExp3", () => {
  checkExp(mulDistProofExp3, [
    [["y", "+", [["x", "*", "y"], "+", "z"]], "+", ["x", "*", "z"]],
    "=",
    [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
  ]);
});

const mulDistProofExp4: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [
        [["y", "+", "target"], "+", ["x", "*", "z"]],
        "=",
        [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
      ],
      mulDistProofExpVariableMapWithTarget
    ),
  ],
  makeExpr([["x", "*", "y"], "+", "z"], mulDistProofExpVariableMap),
  makeExpr(["z", "+", ["x", "*", "y"]], mulDistProofExpVariableMap),
  mulDistProofExp3,
  makeApplyExpr(
    eqSymCheck,
    ["Inf", ["Nat"]],
    makeExpr([["x", "*", "y"], "+", "z"], mulDistProofExpVariableMap),
    makeExpr(["z", "+", ["x", "*", "y"]], mulDistProofExpVariableMap),
    makeApplyExpr(
      plusCommCheck,
      makeExpr(["x", "*", "y"], mulDistProofExpVariableMap),
      makeExpr("z", mulDistProofExpVariableMap)
    )
  )
);
test("check mulDistProofExp4", () => {
  checkExp(mulDistProofExp4, [
    [["y", "+", ["z", "+", ["x", "*", "y"]]], "+", ["x", "*", "z"]],
    "=",
    [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
  ]);
});

const mulDistProofExp5: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [
        ["target", "+", ["x", "*", "z"]],
        "=",
        [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
      ],
      mulDistProofExpVariableMapWithTarget
    ),
  ],
  makeExpr(["y", "+", ["z", "+", ["x", "*", "y"]]], mulDistProofExpVariableMap),
  makeExpr([["y", "+", "z"], "+", ["x", "*", "y"]], mulDistProofExpVariableMap),
  mulDistProofExp4,
  makeApplyExpr(
    plusAssocCheck,
    makeExpr("y", mulDistProofExpVariableMap),
    makeExpr("z", mulDistProofExpVariableMap),
    makeExpr(["x", "*", "y"], mulDistProofExpVariableMap)
  )
);
test("check mulDistProofExp5", () => {
  checkExp(mulDistProofExp5, [
    [[["y", "+", "z"], "+", ["x", "*", "y"]], "+", ["x", "*", "z"]],
    "=",
    [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
  ]);
});

const mulDistProofExp6: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [
        "target",
        "=",
        [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
      ],
      mulDistProofExpVariableMapWithTarget
    ),
  ],
  makeExpr(
    [[["y", "+", "z"], "+", ["x", "*", "y"]], "+", ["x", "*", "z"]],
    mulDistProofExpVariableMap
  ),
  makeExpr(
    [["y", "+", "z"], "+", [["x", "*", "y"], "+", ["x", "*", "z"]]],
    mulDistProofExpVariableMap
  ),
  mulDistProofExp5,
  makeApplyExpr(
    eqSymCheck,
    ["Inf", ["Nat"]],
    makeExpr(
      [[["y", "+", "z"], "+", ["x", "*", "y"]], "+", ["x", "*", "z"]],
      mulDistProofExpVariableMap
    ),
    makeExpr(
      [["y", "+", "z"], "+", [["x", "*", "y"], "+", ["x", "*", "z"]]],
      mulDistProofExpVariableMap
    ),
    makeApplyExpr(
      plusAssocCheck,
      makeExpr(["y", "+", "z"], mulDistProofExpVariableMap),
      makeExpr(["x", "*", "y"], mulDistProofExpVariableMap),
      makeExpr(["x", "*", "z"], mulDistProofExpVariableMap)
    )
  )
);
test("check mulDistProofExp6", () => {
  checkExp(mulDistProofExp6, [
    [["y", "+", "z"], "+", [["x", "*", "y"], "+", ["x", "*", "z"]]],
    "=",
    [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
  ]);
});

const mulDistProofExp7: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [
        [["y", "+", "z"], "+", "target"],
        "=",
        [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
      ],
      mulDistProofExpVariableMapWithTarget
    ),
  ],
  makeExpr([["x", "*", "y"], "+", ["x", "*", "z"]], mulDistProofExpVariableMap),
  makeExpr(["x", "*", ["y", "+", "z"]], mulDistProofExpVariableMap),
  mulDistProofExp6,
  makeExpr("IHx", mulDistProofExpVariableMap)
);
test("check mulDistProofExp7", () => {
  checkExp(mulDistProofExp7, [
    [["y", "+", "z"], "+", ["x", "*", ["y", "+", "z"]]],
    "=",
    [["y", "+", ["x", "*", "y"]], "+", ["z", "+", ["x", "*", "z"]]],
  ]);
});

const mulDistProofExp8: TermCheckable = mulDistProofExp7;
test("check mulDistProofExp8", () => {
  checkExp(mulDistProofExp8, [
    [["S", "x"], "*", ["y", "+", "z"]],
    "=",
    [[["S", "x"], "*", "y"], "+", [["S", "x"], "*", "z"]],
  ]);
});

const mulDistProof: TermCheckable = [
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
              [
                ["x", "*", ["y", "+", "z"]],
                "=",
                [["x", "*", "y"], "+", ["x", "*", "z"]],
              ],
              new Map([
                ["x", ["Inf", ["Bound", 0]]],
                ["y", ["Inf", ["Bound", 2]]],
                ["z", ["Inf", ["Bound", 1]]],
              ])
            ),
          ],
          // NatElim_propZero
          ["Refl", ["Inf", ["Nat"]], ["Inf", ["Zero"]]],
          // NatElim_propSucc
          [
            "Lam", // arg: x
            [
              "Lam", // arg: x * (y + z) = (x * y) + (x * z)
              mulDistProofExp8,
            ],
          ],
          // NatElim_nat
          ["Inf", ["Bound", 2]], // x
        ],
      ],
    ],
  ],
];
export const mulDistCheck: TermInferable = ["Ann", mulDistProof, mulDistType];
test("check mulDist", () => {
  typeInferable(0)([])(mulDistCheck);
});
