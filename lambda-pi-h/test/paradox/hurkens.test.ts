import { expect, test } from "vitest";
import { TermCheckable, TermInferable } from "../../types";
import { typeInferable } from "../../checker";
import { makeApplyExpr } from "../makeExpr";

// see: https://github.com/sititou70/rocq-hurkens-paradox/blob/main/hurkens.v

const botTerm: TermCheckable = ["Inf", ["Pi", ["Star", 0], ["Bound", 0]]];
const botType: TermCheckable = ["Inf", ["Star", 1]];
export const botAnn: TermInferable = ["Ann", botTerm, botType];
test("check bot", () => {
  typeInferable(0)([])(botAnn);
});

const notTerm: TermCheckable = ["Lam", ["Inf", ["Pi", ["Bound", 0], botAnn]]];
const notType: TermCheckable = ["Inf", ["Pi", ["Star", 0], ["Star", 1]]];
export const notAnn: TermInferable = ["Ann", notTerm, notType];
test("check not", () => {
  typeInferable(0)([])(notAnn);
});

const PTerm: TermCheckable = [
  "Lam",
  ["Inf", ["Pi", ["Bound", 0], ["Star", 0]]],
];
const PType: TermCheckable = ["Inf", ["Pi", ["Star", 0], ["Star", 1]]];
export const PAnn: TermInferable = ["Ann", PTerm, PType];
test("check P", () => {
  typeInferable(0)([])(PAnn);
});

const P2Term: TermCheckable = [
  "Lam",
  ["Inf", ["Pi", ["Bound", 0], ["Star", 0]]],
];
const P2Type: TermCheckable = ["Inf", ["Pi", ["Star", 1], ["Star", 1]]];
export const P2Ann: TermInferable = ["Ann", P2Term, P2Type];
test("check P2", () => {
  typeInferable(0)([])(P2Ann);
});

const UTerm: TermCheckable = [
  "Inf",
  [
    "Pi",
    // X :: Type
    ["Star", 0],
    [
      "Pi",
      // _: (forall (_: P (P X)), X)
      [
        "Pi",
        // _: P (P X)
        makeApplyExpr(P2Ann, [
          "Inf",
          makeApplyExpr(PAnn, ["Inf", ["Bound", 0]]),
        ]),
        // X
        ["Bound", 1],
      ],
      // P (P X)
      makeApplyExpr(P2Ann, ["Inf", makeApplyExpr(PAnn, ["Inf", ["Bound", 1]])]),
    ],
  ],
];
const UType: TermCheckable = ["Inf", ["Star", 1]];
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
        [
          "Inf",
          makeApplyExpr(
            ["Bound", 3], // t
            // fun x => p (f (x X f))
            [
              "Lam",
              // arg: x
              [
                "Inf",
                makeApplyExpr(
                  ["Bound", 1], // p
                  [
                    "Inf",
                    makeApplyExpr(
                      ["Bound", 2], // f
                      [
                        "Inf",
                        makeApplyExpr(
                          ["Bound", 0], // x
                          ["Inf", ["Bound", 3]], // X
                          ["Inf", ["Bound", 2]] // f
                        ),
                      ]
                    ),
                  ]
                ),
              ],
            ]
          ),
        ],
      ],
    ],
  ],
];
const tauType: TermCheckable = [
  "Inf",
  [
    "Pi",
    makeApplyExpr(P2Ann, ["Inf", makeApplyExpr(P2Ann, ["Inf", UAnn])]),
    UAnn,
  ],
];
export const tauAnn: TermInferable = ["Ann", tauTerm, tauType];
test("check tau", () => {
  typeInferable(0)([])(tauAnn);
});

// ここまでは定義できるが、以下のsigmaは定義できない

// const sigmaTerm: TermCheckable = [
//   "Lam",
//   // arg: s: U
//   // s U (fun t => tau t)
//   makeApplyExpr(
//     ["Bound", 0], // s
//     ["Inf", UAnn],
//     // (fun t => tau t)
//     [
//       "Lam",
//       // t
//       makeApplyExpr(
//         tauAnn, // tau
//         ["Inf", ["Bound", 0]] // t
//       ),
//     ]
//   ),
// ];
// const sigmaType: TermCheckable = [
//   "Inf",
//   [
//     "Pi",
//     ["Inf", UAnn],
//     makeApplyExpr(PAnn, makeApplyExpr(PAnn, ["Inf", UAnn])),
//   ],
// ];
// export const sigmaAnn: TermInferable = ["Ann", sigmaTerm, sigmaType];
// test("check sigma", () => {
//   typeInferable(0)([])(sigmaAnn);
// });

// 特に、Uの値であるsをU自身に適用できないからである。

//   // arg: s: U
//   // s U (fun t => tau t)
//   makeApplyExpr(
//     ["Bound", 0], // s
//     ["Inf", UAnn],

// このことを、簡略化したUとsを用いて検証する。

// まず、簡略化バージョンのUを、Star_0を受け取ってNat型を返す関数型と定義する。
// 今回はUが返却する型に興味がないので、Natは適当である。

const simpleUTerm: TermCheckable = ["Inf", ["Pi", ["Star", 0], ["Nat"]]];
const simpleUType: TermCheckable = ["Inf", ["Star", 1]];
export const simpleUAnn: TermInferable = ["Ann", simpleUTerm, simpleUType];
test("check simpleU", () => {
  typeInferable(0)([])(simpleUAnn);
});

// ここで、Uが属するのはStar_1になる。つまり、「Uの引数が属するStar < Uが属するStar」という関係になる。
// このことは、T-Pi規則とT-Star規則からわかる。
// T-Pi規則の仮定の1行目により「『引数が属する型（今回はStar）』が属するStarのレベル」が$i$になる。
// T-Star規則により、$i$は「引数が属するStarのレベル」の1つ上になる。
// そして、T-Piの結論より、Pi関数（今回はU）が属するStarのレベルは、Max関数により最低でも$i$になる。

// 次に、簡略化バージョンのsを、Star_0に属する引数を受け取って、Zeroを返す関数と定義する。
// 戻り値のZeroは適当である。

const simpleSTerm: TermCheckable = ["Lam", ["Inf", ["Zero"]]];
const simpleSType: TermCheckable = simpleUTerm;
export const simpleSAnn: TermInferable = ["Ann", simpleSTerm, simpleSType];
test("check simpleS", () => {
  typeInferable(0)([])(simpleSAnn);
});

// sの型はsimpleUTermなので、sの引数はStar_0に属するのがわかる。

// 最後に、「s U」の適用が失敗することを確認する。
// 適用はT-App規則によって検査される。
// T-App規則の仮定の2行目では「実引数 :: 仮引数の型」を確認しているが、今回はここで失敗する。
// 仮引数の型は、演算子sの引数の型であり、Star_0である。
// 実引数はUである。
// つまり、「U :: Star_0」を検査することになる。
// 具体的には、UはsimpleUTermであるので、T-Pi規則によって検査が進められるのだが、
// 前述のとおり「Uの引数が属するStar < Star_0」が要求され、
// これは「Star_0 < Star_0」を要求しているので失敗する。

const invalidApplicationTerm: TermCheckable = [
  "Inf",
  [simpleSAnn, ":@:", simpleUTerm],
];
const invalidApplicationType: TermCheckable = ["Inf", ["Nat"]];
export const invalidApplicationAnn: TermInferable = [
  "Ann",
  invalidApplicationTerm,
  invalidApplicationType,
];
test("check invalidApplication", () => {
  expect(() => typeInferable(0)([])(invalidApplicationAnn)).toThrow();
});

// このような自己適用は、Uの引数のStarのレベルをどのようにしても回避できない。
// したがって、Hurkensのパラドックスにおけるsigmaが定義できず、矛盾を回避できる。
