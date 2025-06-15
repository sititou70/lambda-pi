import { describe, expect, test } from "vitest";
import { TermCheckable, TermInferable, Type } from "./types";
import { Context, typeInferable } from "./checker";
import { quote } from "./quote";
import { evalInferable } from "./eval";

const id: TermCheckable = ["Lam", ["Inf", ["Bound", 0]]];

const const_: TermCheckable = ["Lam", ["Lam", ["Inf", ["Bound", 1]]]];

const term1: TermInferable = [
  ["Ann", id, ["Fun", ["TFree", ["Global", "a"]], ["TFree", ["Global", "a"]]]],
  ":@:",
  ["Inf", ["Free", ["Global", "y"]]],
];

const term2: TermInferable = [
  [
    [
      "Ann",
      const_,
      [
        "Fun",
        ["Fun", ["TFree", ["Global", "b"]], ["TFree", ["Global", "b"]]],
        [
          "Fun",
          ["TFree", ["Global", "a"]],
          ["Fun", ["TFree", ["Global", "b"]], ["TFree", ["Global", "b"]]],
        ],
      ],
    ],
    ":@:",
    id,
  ],
  ":@:",
  ["Inf", ["Free", ["Global", "y"]]],
];

const env1: Context = [
  [
    ["Global", "y"],
    ["HasType", ["TFree", ["Global", "a"]]],
  ],
  [
    ["Global", "a"],
    ["HasKind", "*"],
  ],
];

const env2: Context = [
  [
    ["Global", "b"],
    ["HasKind", "*"],
  ],
  ...env1,
];

describe("eval", () => {
  test("term1", () => {
    const expected: TermCheckable = ["Inf", ["Free", ["Global", "y"]]];
    const actual: TermCheckable = quote(0)(evalInferable(term1)([]));
    expect(actual).toEqual(expected);
  });

  test("term2", () => {
    const expected: TermCheckable = ["Lam", ["Inf", ["Bound", 0]]];
    const actual: TermCheckable = quote(0)(evalInferable(term2)([]));
    expect(actual).toEqual(expected);
  });
});

describe("type checking", () => {
  test("term1", () => {
    const expected: Type = ["TFree", ["Global", "a"]];
    const actual: Type = typeInferable(0)(env1)(term1);
    expect(actual).toEqual(expected);
  });

  test("term2", () => {
    const expected: Type = [
      "Fun",
      ["TFree", ["Global", "b"]],
      ["TFree", ["Global", "b"]],
    ];
    const actual: Type = typeInferable(0)(env2)(term2);
    expect(actual).toEqual(expected);
  });
});
