import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeEqExpr, makeExpr, VariableMap } from "./makeExpr";
import { makeApplyExpr } from "./apply";
import { eqIndRCheck } from "./eqIndR.test";
import { eqSymCheck } from "./eqSym.test";
import { mulDistCheck } from "./mulDist.test";
import { mulCommCheck } from "./mulComm.test";

// forall (n: mynat),
// 2 * (sum n) = n * (S n)

const mainType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // n :: Nat
    ["Inf", ["Nat"]],
    makeEqExpr(
      [[2, "*", ["sum", "n"]], "=", ["n", "*", ["S", "n"]]],
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
          // IHy :: s * sum n = n * (S n)
          makeEqExpr(
            [[2, "*", ["sum", "n"]], "=", ["n", "*", ["S", "n"]]],
            new Map([["n", ["Inf", ["Bound", 0]]]])
          ),
          makeEqExpr(expectEqExpr, mainProofExpVariableMap),
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

const mainProofExpVariableMap: VariableMap = new Map([
  ["n", ["Inf", ["Bound", 1]]],
  ["IHn", ["Inf", ["Bound", 0]]],
]);
const mainProofExpVariableMapWithTarget: VariableMap = new Map([
  ["target", ["Inf", ["Bound", 0]]],
  ["n", ["Inf", ["Bound", 2]]],
  ["IHn", ["Inf", ["Bound", 1]]],
]);

const mainProofExp1: TermCheckable = [
  "Refl",
  ["Inf", ["Nat"]],
  makeExpr([["S", "n"], "*", ["S", ["S", "n"]]], mainProofExpVariableMap),
];
test("check mainProofExp1", () => {
  checkExp(mainProofExp1, [
    [["S", "n"], "*", ["S", ["S", "n"]]],
    "=",
    [["S", "n"], "*", ["S", ["S", "n"]]],
  ]);
});

const mainProofExp2: TermCheckable = mainProofExp1;
test("check mainProofExp2", () => {
  checkExp(mainProofExp2, [
    [["S", "n"], "*", [2, "+", "n"]],
    "=",
    [["S", "n"], "*", ["S", ["S", "n"]]],
  ]);
});

const mainProofExp3: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      ["target", "=", [["S", "n"], "*", ["S", ["S", "n"]]]],
      mainProofExpVariableMapWithTarget
    ),
  ],
  makeExpr([["S", "n"], "*", [2, "+", "n"]], mainProofExpVariableMap),
  makeExpr(
    [[["S", "n"], "*", 2], "+", [["S", "n"], "*", "n"]],
    mainProofExpVariableMap
  ),
  mainProofExp1,
  makeApplyExpr(
    eqSymCheck,
    ["Inf", ["Nat"]],
    makeExpr([["S", "n"], "*", [2, "+", "n"]], mainProofExpVariableMap),
    makeExpr(
      [[["S", "n"], "*", 2], "+", [["S", "n"], "*", "n"]],
      mainProofExpVariableMap
    ),
    makeApplyExpr(
      mulDistCheck,
      makeExpr(["S", "n"], mainProofExpVariableMap),
      makeExpr(2, mainProofExpVariableMap),
      makeExpr("n", mainProofExpVariableMap)
    )
  )
);
test("check mainProofExp3", () => {
  checkExp(mainProofExp3, [
    [[["S", "n"], "*", 2], "+", [["S", "n"], "*", "n"]],
    "=",
    [["S", "n"], "*", ["S", ["S", "n"]]],
  ]);
});

const mainProofExp4: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [
        ["target", "+", [["S", "n"], "*", "n"]],
        "=",
        [["S", "n"], "*", ["S", ["S", "n"]]],
      ],
      mainProofExpVariableMapWithTarget
    ),
  ],
  makeExpr([["S", "n"], "*", 2], mainProofExpVariableMap),
  makeExpr([2, "*", ["S", "n"]], mainProofExpVariableMap),
  mainProofExp3,
  makeApplyExpr(
    eqSymCheck,
    ["Inf", ["Nat"]],
    makeExpr([["S", "n"], "*", 2], mainProofExpVariableMap),
    makeExpr([2, "*", ["S", "n"]], mainProofExpVariableMap),
    makeApplyExpr(
      mulCommCheck,
      makeExpr(["S", "n"], mainProofExpVariableMap),
      makeExpr(2, mainProofExpVariableMap)
    )
  )
);
test("check mainProofExp4", () => {
  checkExp(mainProofExp4, [
    [[2, "*", ["S", "n"]], "+", [["S", "n"], "*", "n"]],
    "=",
    [["S", "n"], "*", ["S", ["S", "n"]]],
  ]);
});

const mainProofExp5: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [
        [[2, "*", ["S", "n"]], "+", "target"],
        "=",
        [["S", "n"], "*", ["S", ["S", "n"]]],
      ],
      mainProofExpVariableMapWithTarget
    ),
  ],
  makeExpr([["S", "n"], "*", "n"], mainProofExpVariableMap),
  makeExpr(["n", "*", ["S", "n"]], mainProofExpVariableMap),
  mainProofExp4,
  makeApplyExpr(
    eqSymCheck,
    ["Inf", ["Nat"]],
    makeExpr([["S", "n"], "*", "n"], mainProofExpVariableMap),
    makeExpr(["n", "*", ["S", "n"]], mainProofExpVariableMap),
    makeApplyExpr(
      mulCommCheck,
      makeExpr(["S", "n"], mainProofExpVariableMap),
      makeExpr("n", mainProofExpVariableMap)
    )
  )
);
test("check mainProofExp5", () => {
  checkExp(mainProofExp5, [
    [[2, "*", ["S", "n"]], "+", ["n", "*", ["S", "n"]]],
    "=",
    [["S", "n"], "*", ["S", ["S", "n"]]],
  ]);
});

const mainProofExp6: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      [
        [[2, "*", ["S", "n"]], "+", "target"],
        "=",
        [["S", "n"], "*", ["S", ["S", "n"]]],
      ],
      mainProofExpVariableMapWithTarget
    ),
  ],
  makeExpr(["n", "*", ["S", "n"]], mainProofExpVariableMap),
  makeExpr([2, "*", ["sum", "n"]], mainProofExpVariableMap),
  mainProofExp5,
  makeExpr("IHn", mainProofExpVariableMap)
);
test("check mainProofExp6", () => {
  checkExp(mainProofExp6, [
    [[2, "*", ["S", "n"]], "+", [2, "*", ["sum", "n"]]],
    "=",
    [["S", "n"], "*", ["S", ["S", "n"]]],
  ]);
});

const mainProofExp7: TermCheckable = makeApplyExpr(
  eqIndRCheck,
  ["Inf", ["Nat"]],
  [
    "Lam", // arg: target
    makeEqExpr(
      ["target", "=", [["S", "n"], "*", ["S", ["S", "n"]]]],
      mainProofExpVariableMapWithTarget
    ),
  ],
  makeExpr(
    [[2, "*", ["S", "n"]], "+", [2, "*", ["sum", "n"]]],
    mainProofExpVariableMap
  ),
  makeExpr([2, "*", [["S", "n"], "+", ["sum", "n"]]], mainProofExpVariableMap),
  mainProofExp6,
  makeApplyExpr(
    mulDistCheck,
    makeExpr(2, mainProofExpVariableMap),
    makeExpr(["S", "n"], mainProofExpVariableMap),
    makeExpr(["sum", "n"], mainProofExpVariableMap)
  )
);
test("check mainProofExp7", () => {
  checkExp(mainProofExp7, [
    [2, "*", [["S", "n"], "+", ["sum", "n"]]],
    "=",
    [["S", "n"], "*", ["S", ["S", "n"]]],
  ]);
});

const mainProofExp8: TermCheckable = mainProofExp7;
test("check mainProofExp8", () => {
  checkExp(mainProofExp8, [
    [2, "*", ["sum", ["S", "n"]]],
    "=",
    [["S", "n"], "*", ["S", ["S", "n"]]],
  ]);
});

const mainProof: TermCheckable = [
  "Lam", // arg: n
  [
    "Inf",
    [
      "NatElim",
      // NatElim_prop
      [
        "Lam", // arg: n
        makeEqExpr(
          [[2, "*", ["sum", "n"]], "=", ["n", "*", ["S", "n"]]],
          new Map([["n", ["Inf", ["Bound", 0]]]])
        ),
      ],
      // NatElim_propZero
      ["Refl", ["Inf", ["Nat"]], ["Inf", ["Zero"]]],
      // NatElim_propSucc
      [
        "Lam", // arg: n
        [
          "Lam", // arg: 2 * (sum n) = n * (S n)
          mainProofExp8,
        ],
      ],
      // NatElim_nat
      ["Inf", ["Bound", 0]], // n
    ],
  ],
];
export const mainCheck: TermInferable = ["Ann", mainProof, mainType];
test("check main", () => {
  typeInferable(0)([])(mainCheck);
});
