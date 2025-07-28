import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";

// forall (A: Type) (P: A -> Prop) (x: A) (y: A),
// P x ->
// y = x ->
// P y

const eqIndRType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // a :: Star
    ["Star", 0],
    [
      "Pi",
      // prop :: a -> Star
      [
        "Pi",
        ["Bound", 0], // a
        ["Star", 0],
      ],
      [
        "Pi",
        // x :: a
        ["Bound", 1], // a
        [
          "Pi",
          // y :: a
          ["Bound", 2], // a
          [
            "Pi",
            // hpx :: prop x
            [
              ["Bound", 2], // prop
              ":@:",
              ["Inf", ["Bound", 1]], // x
            ],
            [
              "Pi",
              // heq :: y = x
              [
                "Eq",
                ["Inf", ["Bound", 4]], // a
                ["Inf", ["Bound", 1]], // y
                ["Inf", ["Bound", 2]], // x
              ],
              [
                ["Bound", 4], // prop
                ":@:",
                ["Inf", ["Bound", 2]], // y
              ],
            ],
          ],
        ],
      ],
    ],
  ],
];
const eqIndRProof: TermCheckable = [
  "Lam", // arg: a
  [
    "Lam", // arg: prop
    [
      "Lam", // arg: x
      [
        "Lam", // arg: y
        [
          "Lam", // arg: prop x
          [
            "Lam", // arg: y = x
            [
              "Inf",
              [
                [
                  "EqElim",
                  // EqElim_a
                  ["Inf", ["Bound", 5]],
                  // EqElim_prop :: forall (x: a) (y: a) (eqaxy: Eq a x y), forall (py: prop y), prop x
                  [
                    "Lam", // arg: x
                    [
                      "Lam", // arg: y
                      [
                        "Lam", // arg: eqaxy
                        [
                          "Inf",
                          [
                            "Pi",
                            // py :: prop y
                            [
                              ["Bound", 7], // prop
                              ":@:",
                              ["Inf", ["Bound", 1]], // y
                            ],
                            // prop x
                            [
                              ["Bound", 8], // prop
                              ":@:",
                              ["Inf", ["Bound", 3]], // x
                            ],
                          ],
                        ],
                      ],
                    ],
                  ],
                  // EqElim_propRefl :: forall (z: a), EqElim_prop z z (Refl a z)
                  //                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^
                  //                                   forall (pz: prop z), prop z
                  ["Lam", ["Lam", ["Inf", ["Bound", 0]]]],
                  // EqElim_x
                  ["Inf", ["Bound", 2]], // y
                  // EqElim_y
                  ["Inf", ["Bound", 3]], // x
                  // EqElim_eqaxy
                  ["Inf", ["Bound", 0]], // y = x
                ],
                ":@:",
                ["Inf", ["Bound", 1]], // prop x
              ],
            ],
          ],
        ],
      ],
    ],
  ],
];
export const eqIndRAnn: TermInferable = ["Ann", eqIndRProof, eqIndRType];
test("check eqIndR", () => {
  typeInferable(0)([])(eqIndRAnn);
});
