import { expect, test } from "vitest";
import { Context, typeInferable } from "../../checker";
import { evalCheckable, evalInferable } from "../../eval";
import { quote } from "../../quote";
import { TermCheckable, TermInferable, Value } from "../../types";
import { a } from "vitest/dist/chunks/suite.d.FvehnV49.js";

const context: Context = [
  [["Global", "Bool"], ["VStar"]],
  [
    ["Global", "false"],
    ["VNeutral", ["NFree", ["Global", "Bool"]]],
  ],
];

const id: TermCheckable = ["Lam", ["Inf", ["Bound", 0]]];

const idPoly: TermCheckable = ["Lam", id];
const idPolyType: TermCheckable = [
  "Inf",
  [
    "Pi",
    ["Inf", ["Star"]],
    ["Inf", ["Pi", ["Inf", ["Bound", 0]], ["Inf", ["Bound", 1]]]],
  ],
];
const idPolyAnn: TermInferable = ["Ann", idPoly, idPolyType];

test("check idPoly", () => {
  typeInferable(0)(context)(idPolyAnn);
});

const boolTerm: TermCheckable = ["Inf", ["Free", ["Global", "Bool"]]];
const idBool: TermCheckable = ["Inf", [idPolyAnn, ":@:", boolTerm]];
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
const applyIdBoolToFalseType: TermCheckable = boolTerm;
const applyIdBoolToFalseAnn: TermInferable = [
  "Ann",
  applyIdBoolToFalse,
  applyIdBoolToFalseType,
];
test("check applyIdBoolToFalse", () => {
  typeInferable(0)(context)(applyIdBoolToFalseAnn);
});
test("eval applyIdBoolToFalse", () => {
  const actual: Value = evalCheckable(applyIdBoolToFalse)([]);
  const expected: Value = ["VNeutral", ["NFree", ["Global", "false"]]];
  expect(actual).toEqual(expected);
});

const starTerm: TermCheckable = ["Inf", ["Star"]];
const idStar: TermCheckable = ["Inf", [idPolyAnn, ":@:", starTerm]];
const idStarType: TermCheckable = ["Inf", ["Pi", starTerm, starTerm]];
const idStarAnn: TermInferable = ["Ann", idStar, idStarType];
test("check idStar", () => {
  typeInferable(0)(context)(idStarAnn);
});

const applyStarIdToBool: TermCheckable = ["Inf", [idStarAnn, ":@:", boolTerm]];
const applyStarIdToBoolType: TermCheckable = starTerm;
const applyStarIdToBoolAnn: TermInferable = [
  "Ann",
  applyStarIdToBool,
  applyStarIdToBoolType,
];
test("check applyStarIdToBool", () => {
  typeInferable(0)(context)(applyStarIdToBoolAnn);
});
test("eval applyStarIdToBool", () => {
  const actual: Value = evalInferable(applyStarIdToBoolAnn)([]);
  const expected: Value = ["VNeutral", ["NFree", ["Global", "Bool"]]];
  expect(actual).toEqual(expected);
});
