#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const SCHEMA = "0.1.0";
const root = path.join(__dirname, "..");
const packageDir = path.join(root, "content/unit-14");

function envelope(schema, id, metadata, relationships, extra) {
  return Object.assign({
    schema,
    schemaVersion: SCHEMA,
    id,
    version: SCHEMA,
    metadata,
    relationships
  }, extra || {});
}

function block(id, type, content) {
  return envelope("lp.content.block", id, {}, {}, { type, content });
}

function activity(id, title, summary, blocks) {
  return envelope("lp.content.activity", id, {
    title,
    status: "available",
    summary,
    href: null
  }, {
    learningOutcomes: ["LO1"],
    assignment: "A1",
    criteria: ["P1"],
    questions: [],
    assets: []
  }, { blocks });
}

function pythonExercise(id, questionId, instructions, starter, options) {
  const opts = options || {};
  const content = {
    questionId,
    language: "python",
    label: opts.label || "Python editor",
    instructions,
    starter,
    hints: opts.hints || [],
    checks: opts.checks || {}
  };
  if (opts.filename) content.filename = opts.filename;
  if (opts.sampleInput) content.sampleInput = opts.sampleInput;
  if (opts.interaction) content.interaction = opts.interaction;
  return block(id, "python-exercise", content);
}

function readOnlyCode(id, questionId, instructions, starter, filename) {
  return block(id, "code-editor", {
    questionId,
    language: "python",
    label: "Read this example",
    instructions,
    starter,
    filename: filename || "example.py",
    interaction: "read-only"
  });
}

function buildActivities() {
  return [
    // ── Week 3: Selection ─────────────────────────────────────────────
    activity("week-3-retrieval", "Week 2 retrieval", "A short formative check before selection teaching.", [
      block("w3-ret-h", "heading", { text: "Before selection", level: 4 }),
      block("w3-ret-p", "paragraph", { text: "Selection lets a program choose different actions. This check is formative only." }),
      block("w3-ret-q1", "single-choice", {
        formative: true,
        questionId: "u14-w3-ret-q1",
        prompt: "Which keyword starts a two-way choice in Python?",
        options: [
          { id: "a", label: "if / else" },
          { id: "b", label: "for" },
          { id: "c", label: "def" }
        ],
        correctOptionId: "a",
        feedback: {
          correct: "if / else chooses between two paths.",
          incorrect: "for repeats code. def defines a function."
        }
      })
    ]),

    activity("week-3-selection-intro", "Selection in business software", "How programs branch on business rules.", [
      block("w3-sel-h", "heading", { text: "Selection", level: 4 }),
      block("w3-sel-p", "paragraph", { text: "Business software often checks a value and chooses what to do next — apply a discount, allow an order, or choose a delivery band." }),
      readOnlyCode("w3-sel-md", "u14-w3-sel-example", "Predict the output, then answer below.", "order_total = 120\nif order_total >= 100:\n    print(\"Discount applied\")\nelse:\n    print(\"No discount\")\n"),
      block("w3-sel-q", "single-choice", {
        formative: true,
        questionId: "u14-w3-sel-q1",
        prompt: "When order_total is 120, what is printed?",
        options: [
          { id: "a", label: "Discount applied" },
          { id: "b", label: "No discount" },
          { id: "c", label: "Both lines" }
        ],
        correctOptionId: "a",
        feedback: {
          correct: "120 meets the >= 100 condition.",
          incorrect: "Only one branch runs. 120 is at least 100."
        }
      })
    ]),

    activity("week-3-if-discount", "Simple if statement", "Apply a discount when an order total qualifies.", [
      block("w3-disc-h", "heading", { text: "Discount threshold", level: 4 }),
      pythonExercise("w3-disc-ex", "u14-w3-disc-code",
        "Complete the function so it returns True when the order qualifies for a 10% discount (total is at least £50). Use Run to check your function.",
        "def qualifies_for_discount(order_total):\n    # Return True when order_total >= 50\n    pass\n",
        {
          hints: ["Use if and return True.", "Return False when the total is below £50."],
          checks: {
            required: [{ pattern: "if\\s+", label: "if" }, { pattern: "return", label: "return" }],
            runtimeTests: [
              { label: "£50 qualifies", assertion: "qualifies_for_discount(50) == True" },
              { label: "£49 does not qualify", assertion: "qualifies_for_discount(49) == False" },
              { label: "£120 qualifies", assertion: "qualifies_for_discount(120) == True" }
            ],
            passFeedback: "Your function returns the correct discount decision.",
            failFeedback: "Use if and return True or False based on order_total >= 50."
          }
        })
    ]),

    activity("week-3-if-else-stock", "if / else", "Decide whether stock is available.", [
      pythonExercise("w3-stock-ex", "u14-w3-stock-code",
        "Complete the function so it returns \"Available\" when stock_level is greater than zero, otherwise \"Out of stock\".",
        "def stock_status(stock_level):\n    pass\n",
        {
          hints: ["Use if / else.", "Compare stock_level > 0."],
          checks: {
            runtimeTests: [
              { label: "Positive stock", assertion: "stock_status(5) == 'Available'" },
              { label: "Zero stock", assertion: "stock_status(0) == 'Out of stock'" }
            ],
            passFeedback: "Stock status is correct for both cases.",
            failFeedback: "Return Available when stock_level > 0, otherwise Out of stock."
          }
        })
    ]),

    activity("week-3-elif-delivery", "if / elif / else", "Classify delivery bands by order total.", [
      pythonExercise("w3-del-ex", "u14-w3-del-code",
        "Complete delivery_band so it returns \"Free\" for totals >= 100, \"Reduced\" for totals >= 50, otherwise \"Standard\".",
        "def delivery_band(order_total):\n    pass\n",
        {
          hints: ["Check the highest threshold first.", "Use elif for the middle band."],
          checks: {
            runtimeTests: [
              { label: "Free delivery", assertion: "delivery_band(100) == 'Free'" },
              { label: "Reduced delivery", assertion: "delivery_band(75) == 'Reduced'" },
              { label: "Standard delivery", assertion: "delivery_band(20) == 'Standard'" }
            ],
            passFeedback: "All three delivery bands work.",
            failFeedback: "Use if / elif / else with thresholds 100 and 50."
          }
        })
    ]),

    activity("week-3-boolean-conditions", "Combining conditions", "Use and / or in business rules.", [
      pythonExercise("w3-bool-ex", "u14-w3-bool-code",
        "Complete can_dispatch so it returns True only when stock_level > 0 and order_paid is True.",
        "def can_dispatch(stock_level, order_paid):\n    pass\n",
        {
          hints: ["Both conditions must be true.", "Use the and operator."],
          checks: {
            required: [{ pattern: "and", label: "and" }],
            runtimeTests: [
              { label: "Ready to dispatch", assertion: "can_dispatch(3, True) == True" },
              { label: "Unpaid order", assertion: "can_dispatch(3, False) == False" },
              { label: "No stock", assertion: "can_dispatch(0, True) == False" }
            ],
            passFeedback: "Dispatch rule combines stock and payment correctly.",
            failFeedback: "Return True only when stock_level > 0 and order_paid is True."
          }
        })
    ]),

    activity("week-3-selection-debug", "Debugging selection", "Fix incorrect comparison and branch logic.", [
      block("w3-dbg-p", "paragraph", { text: "The function below uses the wrong comparison operator. Repair it and use Run to verify." }),
      pythonExercise("w3-dbg-ex", "u14-w3-dbg-code",
        "Fix priority_band so it returns \"High\" when ticket_hours >= 8, \"Medium\" when ticket_hours >= 4, otherwise \"Low\".",
        "def priority_band(ticket_hours):\n    if ticket_hours > 8:\n        return \"High\"\n    elif ticket_hours > 4:\n        return \"Medium\"\n    else:\n        return \"Low\"\n",
        {
          hints: ["8 hours should be High priority.", "Change > to >= where needed."],
          checks: {
            runtimeTests: [
              { label: "Exactly 8 hours", assertion: "priority_band(8) == 'High'" },
              { label: "Exactly 4 hours", assertion: "priority_band(4) == 'Medium'" },
              { label: "2 hours", assertion: "priority_band(2) == 'Low'" }
            ],
            passFeedback: "Boundary values now classify correctly.",
            failFeedback: "Use >= so 8 and 4 are included in the correct bands."
          }
        })
    ]),

    activity("week-3-selection-applied", "Applied selection task", "Combine selection rules for a business scenario.", [
      pythonExercise("w3-app-ex", "u14-w3-app-code",
        "Complete calculate_quote so it returns the subtotal. Apply a 10% discount when quantity is at least 10. Parameters are unit_price and quantity.",
        "def calculate_quote(unit_price, quantity):\n    subtotal = unit_price * quantity\n    # Apply 10% discount when quantity >= 10\n    pass\n",
        {
          hints: ["Calculate subtotal first.", "Reduce subtotal by 10% when quantity >= 10.", "Return the final subtotal."],
          checks: {
            runtimeTests: [
              { label: "Small order", assertion: "calculate_quote(10, 2) == 20" },
              { label: "Bulk discount", assertion: "calculate_quote(10, 10) == 90.0" }
            ],
            passFeedback: "Quote calculation applies the bulk discount correctly.",
            failFeedback: "Return subtotal with 10% off when quantity >= 10."
          }
        }),
      block("w3-app-ref", "reflection", {
        questionId: "u14-w3-app-ref",
        prompt: "Which business rule in your program uses selection, and why is it needed?"
      })
    ]),

    activity("week-3-github-issues", "GitHub Issues", "Link commits to tracked work.", [
      block("w3-gh-p", "paragraph", { text: "Professional teams link commits to GitHub Issues so work is traceable. When you fix a selection bug, reference the issue in your commit message." }),
      block("w3-gh-callout", "callout", {
        tone: "info",
        title: "Professional practice",
        text: "Example commit message: Fix delivery band boundary — closes #12"
      })
    ]),

    // ── Week 4: Iteration ─────────────────────────────────────────────
    activity("week-4-retrieval", "Selection retrieval", "Formative check before iteration.", [
      block("w4-ret-q1", "single-choice", {
        formative: true,
        questionId: "u14-w4-ret-q1",
        prompt: "Which structure repeats code for each item in a list?",
        options: [
          { id: "a", label: "for loop" },
          { id: "b", label: "if / else" },
          { id: "c", label: "return" }
        ],
        correctOptionId: "a",
        feedback: {
          correct: "A for loop visits each item in a sequence.",
          incorrect: "if / else chooses once. return exits a function."
        }
      })
    ]),

    activity("week-4-iteration-intro", "Iteration in business software", "Processing lists of business data.", [
      block("w4-it-h", "heading", { text: "Iteration", level: 4 }),
      block("w4-it-p", "paragraph", { text: "Loops process many records — prices, orders, or support tickets — without repeating the same code manually." }),
      readOnlyCode("w4-it-md", "u14-w4-loop-example", "Predict the total, then answer below.", "prices = [10, 15, 20]\ntotal = 0\nfor price in prices:\n    total = total + price\nprint(total)\n"),
      block("w4-it-q", "single-choice", {
        formative: true,
        questionId: "u14-w4-it-q1",
        prompt: "What is printed?",
        options: [
          { id: "a", label: "45" },
          { id: "b", label: "10 15 20" },
          { id: "c", label: "0" }
        ],
        correctOptionId: "a",
        feedback: {
          correct: "The loop accumulates 10 + 15 + 20 = 45.",
          incorrect: "total increases on each iteration."
        }
      })
    ]),

    activity("week-4-for-prices", "for loop over prices", "Print each product price on its own line.", [
      pythonExercise("w4-for-ex", "u14-w4-for-code",
        "Complete the loop so each price is printed with a label, e.g. Price: 12.5",
        "prices = [12.5, 8.0, 19.99]\nfor price in prices:\n    pass\n",
        {
          hints: ["Use print inside the loop.", "Include the price variable in the output."],
          checks: {
            required: [{ pattern: "for\\s+\\w+\\s+in", label: "for loop" }, { pattern: "print\\s*\\(", label: "print()" }]
          }
        })
    ]),

    activity("week-4-running-total", "Running total", "Calculate a subtotal from a list of prices.", [
      pythonExercise("w4-tot-ex", "u14-w4-tot-code",
        "Complete calculate_subtotal so it returns the sum of all prices in the list.",
        "def calculate_subtotal(prices):\n    total = 0\n    for price in prices:\n        pass\n    return total\n",
        {
          hints: ["Add each price to total inside the loop.", "Return total after the loop."],
          checks: {
            runtimeTests: [
              { label: "Three prices", assertion: "calculate_subtotal([10, 5, 2.5]) == 17.5" },
              { label: "Empty list", assertion: "calculate_subtotal([]) == 0" }
            ],
            passFeedback: "Subtotal calculation is correct.",
            failFeedback: "Add each price to total inside the for loop."
          }
        })
    ]),

    activity("week-4-count-condition", "Count values meeting a condition", "Count how many prices exceed a threshold.", [
      pythonExercise("w4-cnt-ex", "u14-w4-cnt-code",
        "Complete count_expensive so it returns how many prices are strictly greater than limit.",
        "def count_expensive(prices, limit):\n    count = 0\n    for price in prices:\n        pass\n    return count\n",
        {
          hints: ["Use an accumulator variable.", "Increase count when price > limit."],
          checks: {
            runtimeTests: [
              { label: "Two above limit", assertion: "count_expensive([5, 12, 15, 3], 10) == 2" },
              { label: "None above limit", assertion: "count_expensive([1, 2, 3], 10) == 0" }
            ],
            passFeedback: "Count logic is correct.",
            failFeedback: "Increment count when price > limit."
          }
        })
    ]),

    activity("week-4-while-validation", "while loop validation", "Keep asking until valid input is entered.", [
      pythonExercise("w4-wh-ex", "u14-w4-wh-code",
        "Complete the function so it returns the first quantity between 1 and 10 (inclusive). The inputs list simulates typed values — use a while loop and index.",
        "def first_valid_quantity(inputs):\n    index = 0\n    while index < len(inputs):\n        value = int(inputs[index])\n        index = index + 1\n        pass\n    return None\n",
        {
          hints: ["Return value when 1 <= value <= 10.", "Otherwise continue the loop."],
          checks: {
            required: [{ pattern: "while\\s+", label: "while loop" }],
            runtimeTests: [
              { label: "Skips invalid first value", assertion: "first_valid_quantity(['0', '15', '4']) == 4" }
            ],
            passFeedback: "Validation loop finds the first acceptable quantity.",
            failFeedback: "Return the value when it is between 1 and 10 inclusive."
          }
        })
    ]),

    activity("week-4-loop-debug", "Debugging a loop", "Fix an off-by-one accumulator error.", [
      pythonExercise("w4-dbg-ex", "u14-w4-dbg-code",
        "Fix total_hours so it returns the sum of hours in the list. The loop currently misses the last value.",
        "def total_hours(hours_list):\n    total = 0\n    for i in range(len(hours_list) - 1):\n        total = total + hours_list[i]\n    return total\n",
        {
          hints: ["range(len(hours_list) - 1) stops one item early.", "Iterate over every item."],
          checks: {
            runtimeTests: [
              { label: "Three values", assertion: "total_hours([2, 3, 5]) == 10" },
              { label: "Single value", assertion: "total_hours([8]) == 8" }
            ],
            passFeedback: "All hours are now included.",
            failFeedback: "Include every item in hours_list when summing."
          }
        })
    ]),

    activity("week-4-business-summary", "Business summary function", "Summarise order lines with iteration.", [
      pythonExercise("w4-sum-ex", "u14-w4-sum-code",
        "Complete summarise_orders so it returns a string like \"3 orders, total £45.00\" for the given list of order totals. Use len() and your running total helper pattern.",
        "def summarise_orders(order_totals):\n    count = 0\n    total = 0\n    for amount in order_totals:\n        count = count + 1\n        total = total + amount\n    return f\"{count} orders, total £{total:.2f}\"\n",
        {
          hints: ["The starter is nearly complete.", "Check formatting with :.2f for money."],
          checks: {
            runtimeTests: [
              { label: "Summary text", assertion: "summarise_orders([10, 20, 15]) == '3 orders, total £45.00'" }
            ],
            passFeedback: "Order summary is formatted correctly.",
            failFeedback: "Return count and total with two decimal places."
          }
        }),
      block("w4-sum-ref", "reflection", {
        questionId: "u14-w4-sum-ref",
        prompt: "Why is a loop better than writing separate lines for each order total?"
      })
    ]),

    activity("week-4-feature-branches", "Feature branches", "Professional practice for iteration work.", [
      block("w4-fb-p", "paragraph", { text: "Create a feature branch for your iteration exercises. Commit each working loop separately with a clear message before merging." })
    ]),

    // ── Week 5: Functions ─────────────────────────────────────────────
    activity("week-5-retrieval", "Iteration retrieval", "Formative check before functions.", [
      block("w5-ret-q1", "single-choice", {
        formative: true,
        questionId: "u14-w5-ret-q1",
        prompt: "What is the main benefit of a function in business software?",
        options: [
          { id: "a", label: "Reusable, named logic that can be tested" },
          { id: "b", label: "It always runs faster than a loop" },
          { id: "c", label: "It removes the need for variables" }
        ],
        correctOptionId: "a",
        feedback: {
          correct: "Functions encapsulate logic you can reuse and test.",
          incorrect: "Functions organise logic; they do not remove variables or guarantee speed."
        }
      })
    ]),

    activity("week-5-functions-intro", "Functions and return values", "Encapsulating business calculations.", [
      block("w5-fn-h", "heading", { text: "Functions", level: 4 }),
      readOnlyCode("w5-fn-md", "u14-w5-fn-example", "Read this example. Notice the parameter and return value.", "def delivery_fee(distance_km):\n    if distance_km <= 5:\n        return 3.50\n    return 3.50 + (distance_km - 5) * 0.50\n\nprint(delivery_fee(3))\nprint(delivery_fee(8))\n")
    ]),

    activity("week-5-one-parameter", "Function with one parameter", "Calculate VAT for a subtotal.", [
      pythonExercise("w5-vat-ex", "u14-w5-vat-code",
        "Complete calculate_vat so it returns 20% of the subtotal.",
        "def calculate_vat(subtotal):\n    pass\n",
        {
          hints: ["Multiply subtotal by 0.2.", "Use return."],
          checks: {
            runtimeTests: [
              { label: "VAT on £100", assertion: "calculate_vat(100) == 20.0" },
              { label: "VAT on £0", assertion: "calculate_vat(0) == 0" }
            ],
            passFeedback: "VAT calculation is correct.",
            failFeedback: "Return subtotal * 0.2."
          }
        })
    ]),

    activity("week-5-multiple-parameters", "Multiple parameters", "Calculate line total from price and quantity.", [
      pythonExercise("w5-line-ex", "u14-w5-line-code",
        "Complete line_total so it returns unit_price multiplied by quantity.",
        "def line_total(unit_price, quantity):\n    pass\n",
        {
          checks: {
            runtimeTests: [
              { label: "Line total", assertion: "line_total(12.5, 4) == 50.0" }
            ],
            passFeedback: "Line total is correct.",
            failFeedback: "Return unit_price * quantity."
          }
        })
    ]),

    activity("week-5-return-value", "Return a calculated value", "Build an invoice total function.", [
      pythonExercise("w5-inv-ex", "u14-w5-inv-code",
        "Complete invoice_total so it returns subtotal + vat_amount.",
        "def invoice_total(subtotal, vat_amount):\n    pass\n",
        {
          checks: {
            runtimeTests: [
              { label: "Invoice total", assertion: "invoice_total(100, 20) == 120" }
            ],
            passFeedback: "Invoice total combines subtotal and VAT.",
            failFeedback: "Return subtotal + vat_amount."
          }
        })
    ]),

    activity("week-5-reuse-function", "Reusing a function", "Call helper functions to build a receipt.", [
      pythonExercise("w5-rcpt-ex", "u14-w5-rcpt-code",
        "Use line_total and calculate_vat (defined above in your program) to complete build_receipt. Return a string with subtotal and total.",
        "def line_total(unit_price, quantity):\n    return unit_price * quantity\n\ndef calculate_vat(subtotal):\n    return subtotal * 0.2\n\ndef build_receipt(unit_price, quantity):\n    subtotal = line_total(unit_price, quantity)\n    vat = calculate_vat(subtotal)\n    total = subtotal + vat\n    return f\"Subtotal £{subtotal:.2f}, Total £{total:.2f}\"\n",
        {
          hints: ["The function is complete.", "Run it to verify the formatted output."],
          checks: {
            runtimeTests: [
              { label: "Receipt format", assertion: "build_receipt(10, 3) == 'Subtotal £30.00, Total £36.00'" }
            ],
            passFeedback: "Receipt uses your helper functions correctly.",
            failFeedback: "Ensure build_receipt calls line_total and calculate_vat."
          }
        })
    ]),

    activity("week-5-debug-return", "Debug: print vs return", "Fix a function that prints instead of returning.", [
      pythonExercise("w5-dbg-ex", "u14-w5-dbg-code",
        "Fix discount_amount so it returns the discount value instead of only printing it.",
        "def discount_amount(subtotal):\n    discount = subtotal * 0.1\n    print(discount)\n",
        {
          hints: ["Callers need a return value for further calculations.", "Replace or add return."],
          checks: {
            runtimeTests: [
              { label: "Returns discount", assertion: "discount_amount(200) == 20.0" }
            ],
            passFeedback: "Function now returns the discount for reuse.",
            failFeedback: "Use return discount so the value can be used elsewhere."
          }
        })
    ]),

    activity("week-5-simple-class", "Simple class", "Model a business product.", [
      pythonExercise("w5-cls-ex", "u14-w5-cls-code",
        "Complete the Product class so describe() returns \"Name: {name}, Price: £{price:.2f}\".",
        "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    def describe(self):\n        pass\n",
        {
          hints: ["Use self.name and self.price.", "Return an f-string with two decimal places for price."],
          checks: {
            runtimeTests: [
              { label: "Product description", assertion: "Product('Keyboard', 24.99).describe() == 'Name: Keyboard, Price: £24.99'" }
            ],
            passFeedback: "Product.describe() formats correctly.",
            failFeedback: "Return an f-string with name and price formatted to two decimal places."
          }
        })
    ]),

    activity("week-5-applied-validation", "Applied validation function", "Validate a repair job quote.", [
      pythonExercise("w5-val-ex", "u14-w5-val-code",
        "Complete is_valid_hours so it returns True when hours is between 0.5 and 24 inclusive.",
        "def is_valid_hours(hours):\n    pass\n",
        {
          checks: {
            runtimeTests: [
              { label: "Valid hours", assertion: "is_valid_hours(2) == True" },
              { label: "Too many hours", assertion: "is_valid_hours(30) == False" },
              { label: "Minimum job", assertion: "is_valid_hours(0.5) == True" }
            ],
            passFeedback: "Hour validation covers the business limits.",
            failFeedback: "Return True only when 0.5 <= hours <= 24."
          }
        }),
      block("w5-val-ref", "reflection", {
        questionId: "u14-w5-val-ref",
        prompt: "Why is a function a good place to put validation logic?"
      })
    ]),

    activity("week-5-pull-requests", "Pull requests and review", "Professional practice.", [
      block("w5-pr-p", "paragraph", { text: "Open a pull request for your function exercises. Ask a peer to check that each function returns the expected value before you merge." })
    ]),

    // ── Week 6: GUI / consolidation ───────────────────────────────────
    activity("week-6-gui-intro", "GUI objects", "Desktop interfaces with tkinter.", [
      block("w6-gui-h", "heading", { text: "GUI objects", level: 4 }),
      block("w6-gui-p", "paragraph", { text: "Graphical applications use windows, labels, entry fields and buttons. In this unit you build tkinter programs locally on your computer. The hub lets you edit code here, but Run is disabled — tkinter needs a desktop Python environment." }),
      readOnlyCode("w6-tk-win", "u14-w6-tk-window", "Read this window setup example.", "import tkinter as tk\n\nwindow = tk.Tk()\nwindow.title(\"River Café orders\")\nwindow.geometry(\"320x200\")\n\nlabel = tk.Label(window, text=\"Welcome\")\nlabel.pack()\n\nwindow.mainloop()\n", "app.py"),
      readOnlyCode("w6-tk-widgets", "u14-w6-tk-widgets", "Read how Entry and Button widgets connect to handlers.", "import tkinter as tk\n\ndef register():\n    name = name_entry.get()\n    status_label.config(text=f\"Registered: {name}\")\n\nwindow = tk.Tk()\nname_entry = tk.Entry(window)\nname_entry.pack()\nregister_button = tk.Button(window, text=\"Register\", command=register)\nregister_button.pack()\nstatus_label = tk.Label(window, text=\"\")\nstatus_label.pack()\nwindow.mainloop()\n", "app.py")
    ]),

    activity("week-6-tkinter-app", "Build a tkinter app locally", "Edit a starter GUI and run it on your computer.", [
      pythonExercise("w6-tk-ex", "u14-w6-tk-code",
        "Complete the tkinter app so the Register button shows the product name entered. Edit here, then run app.py locally in your Python environment — browser Run is disabled for tkinter.",
        "import tkinter as tk\n\ndef register_product():\n    # Update status_label with the text from product_entry\n    pass\n\nwindow = tk.Tk()\nwindow.title(\"Product register\")\n\nproduct_entry = tk.Entry(window)\nproduct_entry.pack()\n\nregister_button = tk.Button(window, text=\"Register\", command=register_product)\nregister_button.pack()\n\nstatus_label = tk.Label(window, text=\"Enter a product name\")\nstatus_label.pack()\n\nwindow.mainloop()\n",
        {
          filename: "app.py",
          hints: ["Use product_entry.get() inside register_product.", "status_label.config(text=...) updates the label."],
          checks: {
            required: [
              { pattern: "product_entry\\.get", label: "Entry.get()" },
              { pattern: "status_label\\.config", label: "Label.config()" }
            ],
            passFeedback: "GUI handler reads the entry and updates the label.",
            failFeedback: "Use get() on the entry and config() on the label."
          }
        })
    ]),

    activity("week-6-consolidation", "Assignment 1 consolidation", "Review programming skills before submission.", [
      block("w6-con-h", "heading", { text: "Consolidation", level: 4 }),
      block("w6-con-p", "paragraph", { text: "Review your GitHub repository. Ensure Weeks 1–5 programs run locally and your tkinter app runs on your computer. Assignment 1 evidence comes from your repository, not from browser test results." }),
      block("w6-con-ref", "reflection", {
        questionId: "u14-w6-con-ref",
        prompt: "List three programming techniques from Weeks 1–5 that appear in your Assignment 1 repository."
      }),
      block("w6-con-link", "reference", {
        label: "Open the Assignment 1 workspace",
        href: "assignments/assignment-1/"
      })
    ]),

    activity("week-6-tagged-release", "Tagged releases", "Professional practice for Assignment 1 hand-in.", [
      block("w6-rel-p", "paragraph", { text: "When Assignment 1 is ready, create a tagged release in GitHub so your teacher can identify the submitted version clearly." })
    ])
  ];
}

function buildSessions() {
  return [
    envelope("lp.content.session", "week-3-session-1", {
      title: "Session 1",
      kind: "session",
      summary: "Selection concepts, simple if, if/else and formative checks.",
      sortOrder: 1,
      defaultOpen: true
    }, { week: "week-3", activities: ["week-3-retrieval", "week-3-selection-intro", "week-3-if-discount", "week-3-if-else-stock"] }),

    envelope("lp.content.session", "week-3-session-2", {
      title: "Session 2",
      kind: "session",
      summary: "elif chains, Boolean conditions, debugging and GitHub Issues.",
      sortOrder: 2,
      defaultOpen: false
    }, { week: "week-3", activities: ["week-3-elif-delivery", "week-3-boolean-conditions", "week-3-selection-debug", "week-3-github-issues"] }),

    envelope("lp.content.session", "week-3-independent-study", {
      title: "Directed independent study",
      kind: "independent-study",
      summary: "Applied selection task and reflection.",
      sortOrder: 3,
      defaultOpen: false
    }, { week: "week-3", activities: ["week-3-selection-applied"] }),

    envelope("lp.content.session", "week-4-session-1", {
      title: "Session 1",
      kind: "session",
      summary: "Iteration concepts, for loops and running totals.",
      sortOrder: 1,
      defaultOpen: true
    }, { week: "week-4", activities: ["week-4-retrieval", "week-4-iteration-intro", "week-4-for-prices", "week-4-running-total"] }),

    envelope("lp.content.session", "week-4-session-2", {
      title: "Session 2",
      kind: "session",
      summary: "Counting, while loops, debugging and feature branches.",
      sortOrder: 2,
      defaultOpen: false
    }, { week: "week-4", activities: ["week-4-count-condition", "week-4-while-validation", "week-4-loop-debug", "week-4-feature-branches"] }),

    envelope("lp.content.session", "week-4-independent-study", {
      title: "Directed independent study",
      kind: "independent-study",
      summary: "Business summary function and reflection.",
      sortOrder: 3,
      defaultOpen: false
    }, { week: "week-4", activities: ["week-4-business-summary"] }),

    envelope("lp.content.session", "week-5-session-1", {
      title: "Session 1",
      kind: "session",
      summary: "Functions, parameters and return values.",
      sortOrder: 1,
      defaultOpen: true
    }, { week: "week-5", activities: ["week-5-retrieval", "week-5-functions-intro", "week-5-one-parameter", "week-5-multiple-parameters", "week-5-return-value"] }),

    envelope("lp.content.session", "week-5-session-2", {
      title: "Session 2",
      kind: "session",
      summary: "Reusing functions, debugging return values and simple classes.",
      sortOrder: 2,
      defaultOpen: false
    }, { week: "week-5", activities: ["week-5-reuse-function", "week-5-debug-return", "week-5-simple-class", "week-5-pull-requests"] }),

    envelope("lp.content.session", "week-5-independent-study", {
      title: "Directed independent study",
      kind: "independent-study",
      summary: "Applied validation function.",
      sortOrder: 3,
      defaultOpen: false
    }, { week: "week-5", activities: ["week-5-applied-validation"] }),

    envelope("lp.content.session", "week-6-session-1", {
      title: "Session 1",
      kind: "session",
      summary: "GUI concepts, tkinter examples and local editing.",
      sortOrder: 1,
      defaultOpen: true
    }, { week: "week-6", activities: ["week-6-gui-intro", "week-6-tkinter-app"] }),

    envelope("lp.content.session", "week-6-session-2", {
      title: "Session 2",
      kind: "session",
      summary: "Assignment 1 consolidation and tagged releases.",
      sortOrder: 2,
      defaultOpen: false
    }, { week: "week-6", activities: ["week-6-consolidation", "week-6-tagged-release"] })
  ];
}

function patchWeek12SampleInput(activities) {
  const patches = {
    "u14-w1-order-code": ["Patel", "3", "12.50", "False"],
    "u14-w1-hw-code": ["Alex", "Keyboard", "2", "19.99", "True", "False"],
    "u14-w2-dbg-1": ["10", "5"],
    "u14-w2-dbg-2": ["24.99"],
    "u14-w2-dbg-3": ["18"],
    "u14-w2-dbg-4": ["5"],
    "u14-w2-dbg-5": ["yes"]
  };
  activities.forEach(function (act) {
    (act.blocks || []).forEach(function (blk) {
      const qid = blk.content && blk.content.questionId;
      if (qid && patches[qid] && !blk.content.sampleInput) {
        blk.content.sampleInput = patches[qid];
      }
    });
  });
}

function main() {
  const activitiesPath = path.join(packageDir, "activities.json");
  const sessionsPath = path.join(packageDir, "sessions.json");
  const weeksPath = path.join(packageDir, "weeks.json");

  const activities = JSON.parse(fs.readFileSync(activitiesPath, "utf8"));
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8"));
  const weeks = JSON.parse(fs.readFileSync(weeksPath, "utf8"));

  patchWeek12SampleInput(activities);

  const newActivities = buildActivities();
  const existingIds = new Set(activities.map(function (a) { return a.id; }));
  newActivities.forEach(function (a) {
    if (existingIds.has(a.id)) throw new Error("Duplicate activity id: " + a.id);
    activities.push(a);
  });

  const newSessions = buildSessions();
  const sessionIds = new Set(sessions.map(function (s) { return s.id; }));
  newSessions.forEach(function (s) {
    if (sessionIds.has(s.id)) throw new Error("Duplicate session id: " + s.id);
    sessions.push(s);
  });

  const weekSessions = {
    "week-3": ["week-3-session-1", "week-3-session-2", "week-3-independent-study"],
    "week-4": ["week-4-session-1", "week-4-session-2", "week-4-independent-study"],
    "week-5": ["week-5-session-1", "week-5-session-2", "week-5-independent-study"],
    "week-6": ["week-6-session-1", "week-6-session-2"]
  };

  weeks.forEach(function (week) {
    if (weekSessions[week.id]) {
      week.relationships.sessions = weekSessions[week.id];
      week.metadata.status = "available";
    }
  });

  fs.writeFileSync(activitiesPath, JSON.stringify(activities, null, 2) + "\n");
  fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2) + "\n");
  fs.writeFileSync(weeksPath, JSON.stringify(weeks, null, 2) + "\n");

  console.log("Added", newActivities.length, "activities and", newSessions.length, "sessions for weeks 3–6.");
}

main();
