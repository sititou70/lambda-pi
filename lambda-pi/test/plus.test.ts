import { describe, expect, test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeNat } from "./makeNat";
import { quote } from "../quote";
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
        ["Inf", ["Pi", ["Inf", ["Nat"]], ["Inf", ["Nat"]]]],
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
  ["Pi", ["Inf", ["Nat"]], ["Inf", ["Pi", ["Inf", ["Nat"]], ["Inf", ["Nat"]]]]],
];
export const annotatedPlus: TermInferable = ["Ann", plus, plusType];
test("check plus", () => {
  typeInferable(0)([])(annotatedPlus);
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
    [annotatedPlus, ":@:", makeNat(lhs)],
    ":@:",
    makeNat(rhs),
  ];

  test(`eval result is ${result}`, () => {
    const actual: TermCheckable = quote(0)(evalInferable(exp)([]));
    const expected: TermCheckable = makeNat(result);
    expect(actual).toEqual(expected);
  });

  test(`check result is Nat`, () => {
    const actual: TermCheckable = quote(0)(typeInferable(0)([])(exp));
    const expected: TermCheckable = ["Inf", ["Nat"]];
    expect(actual).toEqual(expected);
  });
});
