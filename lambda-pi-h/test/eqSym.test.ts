import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";

// forall (A: Type) (x y: A),
// forall (Heq: x = y),
// y = x

const eqSymType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // a :: Star
    ["Star", 0],
    [
      "Pi",
      // x :: a
      ["Bound", 0], // a
      [
        "Pi",
        // y :: a
        ["Bound", 1], // a
        [
          "Pi",
          // x = y :: a
          [
            "Eq",
            ["Inf", ["Bound", 2]], // a
            ["Inf", ["Bound", 1]], // x
            ["Inf", ["Bound", 0]], // y
          ],
          [
            "Eq",
            ["Inf", ["Bound", 3]], // a
            ["Inf", ["Bound", 1]], // y
            ["Inf", ["Bound", 2]], // x
          ],
        ],
      ],
    ],
  ],
];
const eqSymProof: TermCheckable = [
  "Lam", // arg: a
  [
    "Lam", // arg: x
    [
      "Lam", // arg: y
      [
        "Lam", // arg: x = y
        [
          "Inf",
          [
            "EqElim",
            // EqElim_a
            ["Inf", ["Bound", 3]], // a
            // EqElim_prop :: forall (x: a) (y: a) (eqaxy: Eq a x y), Eq a y x
            [
              "Lam", // arg: x
              [
                "Lam", // arg: y
                [
                  "Lam", // arg: eqaxy
                  [
                    "Inf",
                    [
                      "Eq",
                      ["Inf", ["Bound", 6]], // a
                      ["Inf", ["Bound", 1]], // y
                      ["Inf", ["Bound", 2]], // x
                    ],
                  ],
                ],
              ],
            ],
            // EqElim_propRefl :: forall (z: a), EqElim_prop z z (Refl a z)
            //                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^
            //                                   Eq a z z
            [
              "Lam", // arg: z
              [
                "Inf",
                [
                  "Refl",
                  ["Inf", ["Bound", 4]], // a
                  ["Inf", ["Bound", 0]], // z
                ],
              ],
            ],
            // EqElim_x
            ["Inf", ["Bound", 2]], // x
            // EqElim_y
            ["Inf", ["Bound", 1]], // y
            // EqElim_eqaxy
            ["Inf", ["Bound", 0]], // x = y
          ],
        ],
      ],
    ],
  ],
];
export const eqSymAnn: TermInferable = ["Ann", eqSymProof, eqSymType];
test("check eqSym", () => {
  typeInferable(0)([])(eqSymAnn);
});
