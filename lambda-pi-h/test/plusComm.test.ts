import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeApplyExpr, makeEqExpr, makeExpr, VariableMap } from "./makeExpr";
import { eqIndRAnn } from "./eqIndR.test";
import { eqSymAnn } from "./eqSym.test";
import { plusZeroRAnn } from "./plusZeroR.test";
import { plusSuccMoveAnn } from "./plusSuccMove.test";

// forall (x y: nat),
// x + y = y + x

const plusCommBaseType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // y :: Nat
    ["Nat"],
    makeEqExpr(
      [[0, "+", "y"], "=", ["y", "+", 0]],
      new Map([["y", ["Inf", ["Bound", 0]]]])
    ),
  ],
];
const plusCommBaseProof: TermCheckable = [
  "Lam", // arg: y
  [
    "Inf",
    [
      "NatElim",
      // NatElim_prop
      [
        "Lam", // arg: y
        [
          "Inf",
          makeEqExpr(
            [[0, "+", "y"], "=", ["y", "+", 0]],
            new Map([["y", ["Inf", ["Bound", 0]]]])
          ),
        ],
      ],
      // NatElim_propZero
      ["Inf", ["Refl", ["Inf", ["Nat"]], ["Inf", ["Zero"]]]],
      // NatElim_propSucc
      [
        "Lam", // arg: y
        [
          "Lam", // arg: 0 + y = y + 0
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
                    [[0, "+", ["S", "y"]], "=", ["S", "target"]],
                    new Map([
                      ["target", ["Inf", ["Bound", 0]]],
                      ["y", ["Inf", ["Bound", 2]]],
                    ])
                  ),
                ],
              ],
              makeExpr([0, "+", "y"], new Map([["y", ["Inf", ["Bound", 1]]]])),
              makeExpr(["y", "+", 0], new Map([["y", ["Inf", ["Bound", 1]]]])),
              [
                "Inf",
                [
                  "Refl",
                  ["Inf", ["Nat"]],
                  makeExpr(["S", "y"], new Map([["y", ["Inf", ["Bound", 1]]]])),
                ],
              ],
              // y + 0 = 0 + y
              [
                "Inf",
                makeApplyExpr(
                  eqSymAnn,
                  ["Inf", ["Nat"]],
                  makeExpr(
                    [0, "+", "y"],
                    new Map([["y", ["Inf", ["Bound", 1]]]])
                  ),
                  makeExpr(
                    ["y", "+", 0],
                    new Map([["y", ["Inf", ["Bound", 1]]]])
                  ),
                  ["Inf", ["Bound", 0]] // 0 + y = y + 0
                ),
              ]
            ),
          ],
        ],
      ],
      // NatElim_nat
      ["Inf", ["Bound", 0]], // y
    ],
  ],
];
const plusCommBaseAnn: TermInferable = [
  "Ann",
  plusCommBaseProof,
  plusCommBaseType,
];
test("check plusCommBase", () => {
  typeInferable(0)([])(plusCommBaseAnn);
});

const plusCommInductionType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // x :: Nat
    ["Nat"],
    [
      "Pi",
      // y :: Nat
      ["Nat"],
      [
        "Pi",
        // IHx :: x + y = y + x
        makeEqExpr(
          [["x", "+", "y"], "=", ["y", "+", "x"]],
          new Map([
            ["x", ["Inf", ["Bound", 1]]],
            ["y", ["Inf", ["Bound", 0]]],
          ])
        ),
        makeEqExpr(
          [[["S", "x"], "+", "y"], "=", ["y", "+", ["S", "x"]]],
          new Map([
            ["x", ["Inf", ["Bound", 2]]],
            ["y", ["Inf", ["Bound", 1]]],
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
      ["Nat"],
      [
        "Pi",
        // y :: Nat
        ["Nat"],
        [
          "Pi",
          // eqxy :: x + y = y + x
          makeEqExpr(
            [["x", "+", "y"], "=", ["y", "+", "x"]],
            new Map([
              ["x", ["Inf", ["Bound", 1]]],
              ["y", ["Inf", ["Bound", 0]]],
            ])
          ),
          [
            "Pi",
            // y :: Nat
            ["Nat"],
            [
              "Pi",
              // IHy :: (S x) + y = y + (S x)
              makeEqExpr(
                [[["S", "x"], "+", "y"], "=", ["y", "+", ["S", "x"]]],
                new Map([
                  ["x", ["Inf", ["Bound", 3]]],
                  ["y", ["Inf", ["Bound", 0]]],
                ])
              ),
              makeEqExpr(expectEqExpr, plusCommInductionExpVariableMap),
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
        "Lam", // arg: eqxy
        [
          "Lam", // arg: y
          [
            "Lam", // arg: IHy
            exp,
          ],
        ],
      ],
    ],
  ];
  typeInferable(0)([])(["Ann", proof, type]);
};

const plusCommInductionExpVariableMap: VariableMap = new Map([
  ["x", ["Inf", ["Bound", 4]]],
  ["y", ["Inf", ["Bound", 1]]],
  ["IHy", ["Inf", ["Bound", 0]]],
]);
const plusCommInductionExpVariableMapWithTarget: VariableMap = new Map([
  ["target", ["Inf", ["Bound", 0]]],
  ["x", ["Inf", ["Bound", 5]]],
  ["y", ["Inf", ["Bound", 2]]],
  ["IHy", ["Inf", ["Bound", 1]]],
]);

const plusCommInductionExp1: TermCheckable = [
  "Inf",
  [
    "Refl",
    ["Inf", ["Nat"]],
    makeExpr(["S", [["S", "x"], "+", "y"]], plusCommInductionExpVariableMap),
  ],
];
test("check plusCommInductionExp1", () => {
  checkExp(plusCommInductionExp1, [
    ["S", [["S", "x"], "+", "y"]],
    "=",
    ["S", [["S", "x"], "+", "y"]],
  ]);
});

const plusCommInductionExp2: TermCheckable = [
  "Inf",
  makeApplyExpr(
    eqIndRAnn,
    ["Inf", ["Nat"]],
    [
      "Lam", // arg: target
      [
        "Inf",
        makeEqExpr(
          [["S", "target"], "=", ["S", [["S", "x"], "+", "y"]]],
          plusCommInductionExpVariableMapWithTarget
        ),
      ],
    ],
    makeExpr([["S", "x"], "+", "y"], plusCommInductionExpVariableMap),
    makeExpr(["x", "+", ["S", "y"]], plusCommInductionExpVariableMap),
    plusCommInductionExp1,
    [
      "Inf",
      makeApplyExpr(
        eqSymAnn,
        ["Inf", ["Nat"]],
        makeExpr([["S", "x"], "+", "y"], plusCommInductionExpVariableMap),
        makeExpr(["x", "+", ["S", "y"]], plusCommInductionExpVariableMap),
        [
          "Inf",
          makeApplyExpr(
            plusSuccMoveAnn,
            makeExpr("x", plusCommInductionExpVariableMap),
            makeExpr("y", plusCommInductionExpVariableMap)
          ),
        ]
      ),
    ]
  ),
];
test("check plusCommInductionExp2", () => {
  checkExp(plusCommInductionExp2, [
    ["S", ["x", "+", ["S", "y"]]],
    "=",
    ["S", [["S", "x"], "+", "y"]],
  ]);
});

const plusCommInductionExp3: TermInferable = makeApplyExpr(
  eqIndRAnn,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    [
      "Inf",
      makeEqExpr(
        [["S", ["x", "+", ["S", "y"]]], "=", ["S", "target"]],
        plusCommInductionExpVariableMapWithTarget
      ),
    ],
  ],
  makeExpr([["S", "x"], "+", "y"], plusCommInductionExpVariableMap),
  makeExpr(["y", "+", ["S", "x"]], plusCommInductionExpVariableMap),
  plusCommInductionExp2,
  [
    "Inf",
    makeApplyExpr(
      eqSymAnn,
      ["Inf", ["Nat"]],
      makeExpr([["S", "x"], "+", "y"], plusCommInductionExpVariableMap),
      makeExpr(["y", "+", ["S", "x"]], plusCommInductionExpVariableMap),
      makeExpr("IHy", plusCommInductionExpVariableMap)
    ),
  ]
);
test("check plusCommInductionExp3", () => {
  checkExp(
    ["Inf", plusCommInductionExp3],
    [["S", ["x", "+", ["S", "y"]]], "=", ["S", ["y", "+", ["S", "x"]]]]
  );
});

const plusCommInductionExp4: TermInferable = plusCommInductionExp3;
test("check plusCommInductionExp4", () => {
  checkExp(
    ["Inf", plusCommInductionExp4],
    [[["S", "x"], "+", ["S", "y"]], "=", [["S", "y"], "+", ["S", "x"]]]
  );
});

const plusCommInductionProof: TermCheckable = [
  "Lam", // arg: x
  [
    "Lam", // arg: y
    [
      "Lam", // arg: x + y = y + x
      [
        "Inf",
        [
          "NatElim",
          // NatElim_prop
          [
            "Lam", // arg: y
            [
              "Inf",
              makeEqExpr(
                [[["S", "x"], "+", "y"], "=", ["y", "+", ["S", "x"]]],
                new Map([
                  ["x", ["Inf", ["Bound", 3]]],
                  ["y", ["Inf", ["Bound", 0]]],
                ])
              ),
            ],
          ],
          // NatElim_propZero
          [
            "Inf",
            makeApplyExpr(
              plusZeroRAnn,
              makeExpr(["S", "x"], new Map([["x", ["Inf", ["Bound", 2]]]]))
            ),
          ],
          // NatElim_propSucc
          [
            "Lam", // arg: y
            [
              "Lam", // arg: (S x) + y = y + (S x)
              ["Inf", plusCommInductionExp4],
            ],
          ],
          // NatElim_nat
          ["Inf", ["Bound", 1]], // y
        ],
      ],
    ],
  ],
];
const plusCommInductionAnn: TermInferable = [
  "Ann",
  plusCommInductionProof,
  plusCommInductionType,
];
test("check plusCommInduction", () => {
  typeInferable(0)([])(plusCommInductionAnn);
});

const plusCommType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // x :: Nat
    ["Nat"],
    [
      "Pi",
      // y :: Nat
      ["Nat"],
      makeEqExpr(
        [["x", "+", "y"], "=", ["y", "+", "x"]],
        new Map([
          ["x", ["Inf", ["Bound", 1]]],
          ["y", ["Inf", ["Bound", 0]]],
        ])
      ),
    ],
  ],
];
const plusCommProof: TermCheckable = [
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
          [
            "Inf",
            makeEqExpr(
              [["x", "+", "y"], "=", ["y", "+", "x"]],
              new Map([
                ["x", ["Inf", ["Bound", 0]]],
                ["y", ["Inf", ["Bound", 1]]],
              ])
            ),
          ],
        ],
        // NatElim_propZero
        [
          "Inf",
          makeApplyExpr(
            plusCommBaseAnn,
            ["Inf", ["Bound", 0]] // y
          ),
        ],
        // NatElim_propSucc
        [
          "Lam", // arg: x
          [
            "Lam", // arg: x + y = y + x
            [
              "Inf",
              makeApplyExpr(
                plusCommInductionAnn,
                ["Inf", ["Bound", 1]], // x
                ["Inf", ["Bound", 2]], // y
                ["Inf", ["Bound", 0]] // x + y = y + x
              ),
            ],
          ],
        ],
        // NatElim_nat
        ["Inf", ["Bound", 1]], // x
      ],
    ],
  ],
];
export const plusCommAnn: TermInferable = ["Ann", plusCommProof, plusCommType];
test("check plusComm", () => {
  typeInferable(0)([])(plusCommAnn);
});
