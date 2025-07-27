import { test } from "vitest";
import { TermCheckable, TermInferable } from "../../types";
import { typeInferable } from "../../checker";
import { makeApplyExpr, makeEqExpr } from "../makeExpr";
import { evalInferable } from "../../eval";

// see: https://github.com/sititou70/rocq-hurkens-paradox/blob/main/hurkens.v

const botTerm: TermCheckable = [
  "Inf",
  ["Pi", ["Inf", ["Star"]], ["Inf", ["Bound", 0]]],
];
const botType: TermCheckable = ["Inf", ["Star"]];
export const botAnn: TermInferable = ["Ann", botTerm, botType];
test("check bot", () => {
  typeInferable(0)([])(botAnn);
});

const notTerm: TermCheckable = [
  "Lam",
  ["Inf", ["Pi", ["Inf", ["Bound", 0]], ["Inf", botAnn]]],
];
const notType: TermCheckable = [
  "Inf",
  ["Pi", ["Inf", ["Star"]], ["Inf", ["Star"]]],
];
export const notAnn: TermInferable = ["Ann", notTerm, notType];
test("check not", () => {
  typeInferable(0)([])(notAnn);
});

const PTerm: TermCheckable = [
  "Lam",
  ["Inf", ["Pi", ["Inf", ["Bound", 0]], ["Inf", ["Star"]]]],
];
const PType: TermCheckable = [
  "Inf",
  ["Pi", ["Inf", ["Star"]], ["Inf", ["Star"]]],
];
export const PAnn: TermInferable = ["Ann", PTerm, PType];
test("check P", () => {
  typeInferable(0)([])(PAnn);
});

const UTerm: TermCheckable = [
  "Inf",
  [
    "Pi",
    // X :: Type
    ["Inf", ["Star"]],
    [
      "Inf",
      [
        "Pi",
        // _: (forall (_: P (P X)), X)
        [
          "Inf",
          [
            "Pi",
            // _: P (P X)
            makeApplyExpr(PAnn, makeApplyExpr(PAnn, ["Inf", ["Bound", 0]])),
            // X
            ["Inf", ["Bound", 1]],
          ],
        ],
        // P (P X)
        makeApplyExpr(PAnn, makeApplyExpr(PAnn, ["Inf", ["Bound", 1]])),
      ],
    ],
  ],
];
const UType: TermCheckable = ["Inf", ["Star"]];
export const UAnn: TermInferable = ["Ann", UTerm, UType];
test("check U", () => {
  typeInferable(0)([])(UAnn);
});

const tauTerm: TermCheckable = [
  "Lam",
  // arg: t: P (P U)
  [
    "Lam",
    // arg: X: Type
    [
      "Lam",
      // arg: f: forall (_: P (P X)), X
      [
        "Lam",
        // arg: p: P X
        // t (fun x => p (f (x X f)))
        makeApplyExpr(
          ["Bound", 3], // t
          // fun x => p (f (x X f))
          [
            "Lam",
            // arg: x
            makeApplyExpr(
              ["Bound", 1], // p
              makeApplyExpr(
                ["Bound", 2], // f
                makeApplyExpr(
                  ["Bound", 0], // x
                  ["Inf", ["Bound", 3]], // X
                  ["Inf", ["Bound", 2]] // f
                )
              )
            ),
          ]
        ),
      ],
    ],
  ],
];
const tauType: TermCheckable = [
  "Inf",
  [
    "Pi",
    makeApplyExpr(PAnn, makeApplyExpr(PAnn, ["Inf", UAnn])),
    ["Inf", UAnn],
  ],
];
export const tauAnn: TermInferable = ["Ann", tauTerm, tauType];
test("check tau", () => {
  typeInferable(0)([])(tauAnn);
});

const sigmaTerm: TermCheckable = [
  "Lam",
  // arg: s: U
  // s U (fun t => tau t)
  makeApplyExpr(
    ["Bound", 0], // s
    ["Inf", UAnn],
    // (fun t => tau t)
    [
      "Lam",
      // t
      makeApplyExpr(
        tauAnn, // tau
        ["Inf", ["Bound", 0]] // t
      ),
    ]
  ),
];
const sigmaType: TermCheckable = [
  "Inf",
  [
    "Pi",
    ["Inf", UAnn],
    makeApplyExpr(PAnn, makeApplyExpr(PAnn, ["Inf", UAnn])),
  ],
];
export const sigmaAnn: TermInferable = ["Ann", sigmaTerm, sigmaType];
test("check sigma", () => {
  typeInferable(0)([])(sigmaAnn);
});

const DeltaTerm: TermCheckable = [
  "Lam",
  // arg: y
  makeApplyExpr(notAnn, [
    "Inf",
    [
      "Pi",
      // p: P U
      makeApplyExpr(PAnn, ["Inf", UAnn]),
      [
        "Inf",
        [
          "Pi",
          // _: sigma y p
          makeApplyExpr(
            sigmaAnn,
            ["Inf", ["Bound", 1]], // y
            ["Inf", ["Bound", 0]] // p
          ),
          // p (tau (sigma y))
          makeApplyExpr(
            ["Bound", 1], // p
            makeApplyExpr(
              tauAnn,
              makeApplyExpr(
                sigmaAnn,
                ["Inf", ["Bound", 2]] // y
              )
            )
          ),
        ],
      ],
    ],
  ]),
];
const DeltaType: TermCheckable = makeApplyExpr(PAnn, ["Inf", UAnn]);
export const DeltaAnn: TermInferable = ["Ann", DeltaTerm, DeltaType];
test("check Delta", () => {
  typeInferable(0)([])(DeltaAnn);
});

const OmegaTerm: TermCheckable = makeApplyExpr(tauAnn, [
  "Lam",
  // arg: p
  // forall (x : U), forall (_: sigma x p), p x
  [
    "Inf",
    [
      "Pi",
      // x: U
      ["Inf", UAnn],
      // forall (_: sigma x p), p x
      [
        "Inf",
        [
          "Pi",
          // sigma x p
          makeApplyExpr(
            sigmaAnn,
            ["Inf", ["Bound", 0]], // x
            ["Inf", ["Bound", 1]] // p
          ),
          // p x
          makeApplyExpr(
            ["Bound", 2], // p
            ["Inf", ["Bound", 1]] // x
          ),
        ],
      ],
    ],
  ],
]);
const OmegaType: TermCheckable = ["Inf", UAnn];
export const OmegaAnn: TermInferable = ["Ann", OmegaTerm, OmegaType];
test("check Omega", () => {
  typeInferable(0)([])(OmegaAnn);
});

const DTerm: TermCheckable = [
  "Inf",
  [
    "Pi",
    // p: P U
    makeApplyExpr(PAnn, ["Inf", UAnn]),
    // forall (_: sigma Omega p), p (tau (sigma Omega))
    [
      "Inf",
      [
        "Pi",
        // _: sigma Omega p
        makeApplyExpr(
          sigmaAnn,
          ["Inf", OmegaAnn], // Omega
          ["Inf", ["Bound", 0]] // p,
        ),
        // p (tau (sigma Omega))
        makeApplyExpr(
          ["Bound", 1], // p
          makeApplyExpr(
            tauAnn,
            makeApplyExpr(
              sigmaAnn,
              ["Inf", OmegaAnn] // Omega
            )
          )
        ),
      ],
    ],
  ],
];
const DType: TermCheckable = ["Inf", ["Star"]];
export const DAnn: TermInferable = ["Ann", DTerm, DType];
test("check D", () => {
  typeInferable(0)([])(DAnn);
});

const lem1Term: TermCheckable = [
  "Lam",
  // arg: p: P U
  [
    "Lam",
    // arg: H1: forall (x : U), forall (_: sigma x p), p x
    makeApplyExpr(
      ["Bound", 0], // H1
      ["Inf", OmegaAnn],
      [
        "Lam",
        // arg: x
        // H1 (tau (sigma x))
        makeApplyExpr(
          ["Bound", 1], // H1
          makeApplyExpr(
            tauAnn,
            makeApplyExpr(
              sigmaAnn,
              ["Inf", ["Bound", 0]] // x
            )
          )
        ),
      ]
    ),
  ],
];
const lem1Type: TermCheckable = [
  "Inf",
  [
    "Pi",
    // p: P U
    makeApplyExpr(PAnn, ["Inf", UAnn]),
    [
      "Inf",
      [
        "Pi",
        // H1: forall (x : U), forall (_: sigma x p), p x
        [
          "Inf",
          [
            "Pi",
            // x: U
            ["Inf", UAnn],
            // forall (_: sigma x p), p x
            [
              "Inf",
              [
                "Pi",
                // _: sigma x p
                makeApplyExpr(
                  sigmaAnn,
                  ["Inf", ["Bound", 0]], // x
                  ["Inf", ["Bound", 1]] // p
                ),
                // p x
                makeApplyExpr(
                  ["Bound", 2], // p
                  ["Inf", ["Bound", 1]] // x
                ),
              ],
            ],
          ],
        ],
        // p Omega
        makeApplyExpr(
          ["Bound", 1], // p
          ["Inf", OmegaAnn] // Omega
        ),
      ],
    ],
  ],
];
export const lem1Ann: TermInferable = ["Ann", lem1Term, lem1Type];
test("check lem1", () => {
  typeInferable(0)([])(lem1Ann);
});

const lem2Term: TermCheckable = makeApplyExpr(
  lem1Ann,
  ["Inf", DeltaAnn],
  [
    "Lam",
    // arg: x
    [
      "Lam",
      // arg: H2
      [
        "Lam",
        // arg: H3
        makeApplyExpr(
          ["Bound", 0], // H3
          ["Inf", DeltaAnn],
          ["Inf", ["Bound", 1]], // H2
          [
            "Lam",
            // arg: p
            makeApplyExpr(
              ["Bound", 1], // H3
              [
                "Lam",
                // arg: y
                // p (tau (sigma y))
                makeApplyExpr(
                  ["Bound", 1], // p
                  makeApplyExpr(
                    tauAnn,
                    makeApplyExpr(
                      sigmaAnn,
                      ["Inf", ["Bound", 0]] // y
                    )
                  )
                ),
              ]
            ),
          ]
        ),
      ],
    ],
  ]
);
const lem2Type: TermCheckable = makeApplyExpr(notAnn, ["Inf", DAnn]);
export const lem2Ann: TermInferable = ["Ann", lem2Term, lem2Type];
test("check lem2", () => {
  typeInferable(0)([])(lem2Ann);
});

const lem3Term: TermCheckable = [
  "Lam",
  // arg: p
  makeApplyExpr(lem1Ann, [
    "Lam",
    // arg: y
    // p (tau (sigma y))
    makeApplyExpr(
      ["Bound", 1], // p
      makeApplyExpr(
        tauAnn,
        makeApplyExpr(
          sigmaAnn,
          ["Inf", ["Bound", 0]] // y
        )
      )
    ),
  ]),
];
const lem3Type: TermCheckable = ["Inf", DAnn];
export const lem3Ann: TermInferable = ["Ann", lem3Term, lem3Type];
test("check lem3", () => {
  typeInferable(0)([])(lem3Ann);
});

const loopTerm: TermCheckable = makeApplyExpr(lem2Ann, ["Inf", lem3Ann]);
const loopType: TermCheckable = ["Inf", botAnn];
export const loopAnn: TermInferable = ["Ann", loopTerm, loopType];
test("check loop", () => {
  typeInferable(0)([])(loopAnn);
});

const oneEqTwoTerm: TermCheckable = makeApplyExpr(
  loopAnn,
  makeEqExpr([1, "=", 2], new Map())
);
const oneEqTwoType: TermCheckable = makeEqExpr([1, "=", 2], new Map());
export const oneEqTwoAnn: TermInferable = ["Ann", oneEqTwoTerm, oneEqTwoType];
test("check oneEqTwo", () => {
  typeInferable(0)([])(oneEqTwoAnn);
});

// 停止しない
// RangeError: Maximum call stack size exceeded
// evalInferable(oneEqTwoAnn)([]);
