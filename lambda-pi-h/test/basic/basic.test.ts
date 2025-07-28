import { expect, test } from "vitest";
import { Context, typeInferable } from "../../checker";
import { TermCheckable, TermInferable, Value } from "../../types";
import { evalCheckable } from "../../eval";

const context: Context = [
  [
    ["Global", "Bool"],
    ["VStar", 0],
  ],
  [
    ["Global", "false"],
    ["VNeutral", ["NFree", ["Global", "Bool"]]],
  ],
];

const id: TermCheckable = ["Lam", ["Inf", ["Bound", 0]]];

const idPoly: TermCheckable = ["Lam", id];
const idPolyType: TermCheckable = [
  "Inf",
  ["Pi", ["Star", 0], ["Pi", ["Bound", 0], ["Bound", 1]]],
];
const idPolyAnn: TermInferable = ["Ann", idPoly, idPolyType];

test("check idPoly", () => {
  typeInferable(0)(context)(idPolyAnn);
});

const boolTerm: TermInferable = ["Free", ["Global", "Bool"]];
const idBool: TermCheckable = ["Inf", [idPolyAnn, ":@:", ["Inf", boolTerm]]];
const idBoolType: TermCheckable = ["Inf", ["Pi", boolTerm, boolTerm]];
const idBoolAnn: TermInferable = ["Ann", idBool, idBoolType];
test("check idBool", () => {
  typeInferable(0)(context)(idBoolAnn);
});

const falseTerm: TermCheckable = ["Inf", ["Free", ["Global", "false"]]];
const applyIdBoolToFalse: TermCheckable = [
  "Inf",
  [idBoolAnn, ":@:", falseTerm],
];
const applyIdBoolToFalseType: TermInferable = boolTerm;
const applyIdBoolToFalseAnn: TermInferable = [
  "Ann",
  applyIdBoolToFalse,
  ["Inf", applyIdBoolToFalseType],
];
test("check applyIdBoolToFalse", () => {
  typeInferable(0)(context)(applyIdBoolToFalseAnn);
});
test("eval applyIdBoolToFalse", () => {
  const actual: Value = evalCheckable(applyIdBoolToFalse)([]);
  const expected: Value = ["VNeutral", ["NFree", ["Global", "false"]]];
  expect(actual).toEqual(expected);
});
