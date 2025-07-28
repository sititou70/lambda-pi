import { describe, expect, test } from "vitest";
import { TermCheckable, TermInferable, Value } from "../types";
import { typeInferable } from "../checker";
import { makeNat, makeVNat } from "./makeNat";
import { evalInferable } from "../eval";

const plus: TermCheckable = [
  "Lam", // arg: x
  [
    "Inf",
    [
      "NatElim",
      // NatElim_prop
      [
        "Lam", // arg: x
        ["Inf", ["Pi", ["Nat"], ["Nat"]]],
      ],
      // NatElim_propZero
      ["Lam", ["Inf", ["Bound", 0]]],
      // NatElim_propSucc
      [
        "Lam", // arg: x
        [
          "Lam", // arg: prop x
          [
            "Lam", // arg: y
            [
              "Inf",
              [
                "Succ",
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
      // NatElim_nat
      ["Inf", ["Bound", 0]], // x
    ],
  ],
];
const plusType: TermCheckable = [
  "Inf",
  ["Pi", ["Nat"], ["Pi", ["Nat"], ["Nat"]]],
];
export const plusAnn: TermInferable = ["Ann", plus, plusType];
test("check plus", () => {
  typeInferable(0)([])(plusAnn);
});

describe.each([
  { lhs: 0, rhs: 0, result: 0 },
  { lhs: 1, rhs: 0, result: 1 },
  { lhs: 0, rhs: 1, result: 1 },
  { lhs: 2, rhs: 1, result: 3 },
  { lhs: 1, rhs: 2, result: 3 },
  { lhs: 1, rhs: 3, result: 4 },
  { lhs: 3, rhs: 2, result: 5 },
  { lhs: 40, rhs: 2, result: 42 },
])("case: plus $lhs $rhs", ({ lhs, rhs, result }) => {
  const exp: TermInferable = [
    [plusAnn, ":@:", makeNat(lhs)],
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
