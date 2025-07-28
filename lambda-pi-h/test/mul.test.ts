import { describe, expect, test } from "vitest";
import { TermCheckable, TermInferable, Value } from "../types";
import { typeInferable } from "../checker";
import { makeNat, makeVNat } from "./makeNat";
import { plusAnn } from "./plus.test";
import { evalInferable } from "../eval";

const mul: TermCheckable = [
  "Lam",
  [
    "Inf",
    [
      "NatElim",
      // prop
      ["Lam", ["Inf", ["Pi", ["Nat"], ["Nat"]]]],
      // propZero
      ["Lam", makeNat(0)],
      // propSucc
      [
        "Lam", // arg: x
        [
          "Lam", // arg: prop x
          // prop (Succ x)
          [
            "Lam", // arg: y
            [
              "Inf",
              [
                [
                  plusAnn,
                  ":@:",
                  ["Inf", ["Bound", 0]], // y
                ],
                ":@:",
                [
                  "Inf",
                  [
                    ["Bound", 1], // prop x
                    ":@:",
                    ["Inf", ["Bound", 0]], // y
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
      // nat
      ["Inf", ["Bound", 0]],
    ],
  ],
];
const mulType: TermCheckable = [
  "Inf",
  ["Pi", ["Nat"], ["Pi", ["Nat"], ["Nat"]]],
];
export const mulAnn: TermInferable = ["Ann", mul, mulType];
test("check mul", () => {
  typeInferable(0)([])(mulAnn);
});

describe.each([
  { lhs: 0, rhs: 0, result: 0 },
  { lhs: 1, rhs: 0, result: 0 },
  { lhs: 0, rhs: 1, result: 0 },
  { lhs: 2, rhs: 1, result: 2 },
  { lhs: 1, rhs: 2, result: 2 },
  { lhs: 1, rhs: 3, result: 3 },
  { lhs: 3, rhs: 2, result: 6 },
  { lhs: 40, rhs: 2, result: 80 },
])("case: mul $lhs $rhs", ({ lhs, rhs, result }) => {
  const exp: TermInferable = [
    [mulAnn, ":@:", makeNat(lhs)],
    ":@:",
    makeNat(rhs),
  ];

  test(`eval result is ${result}`, () => {
    const actual: Value = evalInferable(exp)([]);
    const expected: Value = makeVNat(result);
    expect(actual).toEqual(expected);
  });

  test(`check result is Nat`, () => {
    const actual: Value = typeInferable(0)([])(exp);
    const expected: Value = ["VNat"];
    expect(actual).toEqual(expected);
  });
});
