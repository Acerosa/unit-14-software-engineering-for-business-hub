#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const SCHEMA = "0.1.0";
const root = path.join(__dirname, "..");
const packageDir = path.join(root, "content/unit-14");
const outFile = path.join(root, "content/packages/week-2.json");

function envelope(schema, id, metadata, relationships, extra) {
  return Object.assign({
    schema: schema,
    schemaVersion: SCHEMA,
    id: id,
    version: SCHEMA,
    metadata: metadata,
    relationships: relationships
  }, extra || {});
}

function block(id, type, content) {
  return envelope("lp.content.block", id, {}, {}, { type: type, content: content });
}

function activity(id, title, summary, blocks) {
  return envelope("lp.content.activity", id, {
    title: title,
    status: "available",
    summary: summary,
    href: null
  }, {
    learningOutcomes: ["LO1"],
    assignment: "A1",
    criteria: ["P1"],
    questions: [],
    assets: []
  }, { blocks: blocks });
}

function pythonExercise(id, questionId, instructions, starter, hints, required, passFeedback, failFeedback, prohibited) {
  const checks = {
    required: required,
    passFeedback: passFeedback,
    failFeedback: failFeedback
  };
  if (prohibited && prohibited.length) checks.prohibited = prohibited;
  return block(id, "python-exercise", {
    questionId: questionId,
    language: "python",
    label: "Python editor",
    instructions: instructions,
    starter: starter,
    hints: hints,
    checks: checks
  });
}

function buildWeek2Package() {
  const week = envelope("lp.content.week", "week-2", {
    teachingWeek: 2,
    title: "Data Type Conversion and Predefined Subroutines",
    status: "available",
    phase: "teaching",
    professionalPractice: ".gitignore and a named feature branch.",
    route: "weeks/week-2/",
    weekCommencing: null,
    releaseDate: null,
    dueDate: null
  }, {
    curriculum: "u14-curriculum",
    learningOutcomes: ["LO1"],
    assignment: "A1",
    sessions: ["week-2-session-1", "week-2-session-2", "week-2-independent-study"]
  });

  const sessions = [
    envelope("lp.content.session", "week-2-session-1", {
      title: "Session 1",
      kind: "session",
      summary: "Theory and demonstration: Week 1 retrieval, conversion, predefined subroutines, formatted output and .gitignore.",
      sortOrder: 1,
      defaultOpen: true
    }, {
      week: "week-2",
      activities: [
        "week-2-week-1-retrieval",
        "week-2-conversion-problem",
        "week-2-conversion-demonstration",
        "week-2-predefined-subroutines",
        "week-2-formatted-output",
        "week-2-gitignore"
      ]
    }),
    envelope("lp.content.session", "week-2-session-2", {
      title: "Session 2",
      kind: "session",
      summary: "Practical lab: conversion debugging, customer-data cleaning, a business calculation, Git branch guidance and Assignment 1 notes.",
      sortOrder: 2,
      defaultOpen: false
    }, {
      week: "week-2",
      activities: [
        "week-2-review",
        "week-2-conversion-debugging",
        "week-2-customer-data-cleaning",
        "week-2-business-calculation",
        "week-2-git-branch-guidance",
        "week-2-assignment-1-guide"
      ]
    }),
    envelope("lp.content.session", "week-2-independent-study", {
      title: "Directed independent study",
      kind: "independent-study",
      summary: "Finish the business calculation, complete P1 conversion and subroutine notes, then optional stretch on try/except, truncation and cleaner branch history.",
      sortOrder: 3,
      defaultOpen: false
    }, {
      week: "week-2",
      activities: ["week-2-homework"]
    })
  ];

  const activities = [
    activity("week-2-week-1-retrieval", "Week 1 retrieval", "A short formative check of the four fundamental data types before conversion teaching.", [
      block("w2-ret-h", "heading", { text: "Four fundamental types", level: 4 }),
      block("w2-ret-p", "paragraph", { text: "Week 1 used integer, floating point, string and Boolean to store business data. This check is formative only. It is not a grade and is not P1." }),
      block("w2-ret-q1", "single-choice", {
        formative: true,
        questionId: "u14-w2-ret-q1",
        prompt: "Which value is a floating-point number?",
        options: [
          { id: "a", label: "17" },
          { id: "b", label: "12.50" },
          { id: "c", label: "\"12.50\"" },
          { id: "d", label: "True" }
        ],
        correctOptionId: "b",
        feedback: {
          correct: "12.50 is a floating-point number. Quotes would make it a string.",
          incorrect: "A floating-point number includes a fractional part and is not wrapped in quotes."
        }
      }),
      block("w2-ret-q2", "single-choice", {
        formative: true,
        questionId: "u14-w2-ret-q2",
        prompt: "Customer name \"Ngọc Trần-García\" should be stored as which type?",
        options: [
          { id: "a", label: "Integer" },
          { id: "b", label: "Boolean" },
          { id: "c", label: "String" }
        ],
        correctOptionId: "c",
        feedback: {
          correct: "Names are text, including accents, hyphens and more than one word.",
          incorrect: "A name is text. Do not force it into a number or a true/false value."
        }
      }),
      block("w2-ret-class", "classification", {
        formative: true,
        questionId: "u14-w2-ret-class",
        prompt: "Match each Week 1 business value to its fundamental type.",
        categories: [
          { id: "integer", label: "Integer" },
          { id: "floating-point", label: "Floating point" },
          { id: "string", label: "String" },
          { id: "boolean", label: "Boolean" }
        ],
        items: [
          { id: "qty", label: "Number of items ordered", correctCategoryId: "integer" },
          { id: "price", label: "Unit price in pounds and pence", correctCategoryId: "floating-point" },
          { id: "name", label: "Customer name", correctCategoryId: "string" },
          { id: "delivery", label: "Delivery required", correctCategoryId: "boolean" }
        ],
        feedback: {
          correct: "Those four types are the Week 1 foundation for this week's conversion work.",
          incorrect: "Quantity is a whole number, price may include pence, names are text, and delivery is yes/no."
        }
      }),
      block("w2-ret-note", "callout", { tone: "info", title: "Formative only", text: "Correct options are stored in the hub for instant feedback. They are not secure assignment evidence." })
    ]),

    activity("week-2-conversion-problem", "Why conversion is necessary", "Show that input() returns a string and that \"10\" + \"5\" concatenates instead of adding.", [
      block("w2-prob-h", "heading", { text: "input() returns text", level: 4 }),
      block("w2-prob-p1", "paragraph", { text: "Python input() always returns a string. If a cashier types 10, the program stores \"10\", not the integer 10. Arithmetic needs a numeric type first." }),
      block("w2-prob-code", "code-editor", {
        questionId: "u14-w2-prob-demo",
        language: "python",
        label: "Read this example",
        instructions: "This fragment shows the conversion problem. The browser does not run it. Predict the output, then answer below.",
        starter: "first = input(\"First quantity: \")   # learner types 10\nsecond = input(\"Second quantity: \") # learner types 5\nprint(first + second)\n"
      }),
      block("w2-prob-q1", "single-choice", {
        formative: true,
        questionId: "u14-w2-prob-q1",
        prompt: "If the user types 10 and then 5, what does print(first + second) display?",
        options: [
          { id: "a", label: "15" },
          { id: "b", label: "105" },
          { id: "c", label: "10 5" }
        ],
        correctOptionId: "b",
        feedback: {
          correct: "The + operator concatenates strings, so \"10\" + \"5\" is \"105\".",
          incorrect: "Both values are strings. + joins them as text rather than adding them as numbers."
        }
      }),
      block("w2-prob-q2", "single-choice", {
        formative: true,
        questionId: "u14-w2-prob-q2",
        prompt: "Why must quantity be converted before it is used in arithmetic?",
        options: [
          { id: "a", label: "Because input() returns a string" },
          { id: "b", label: "Because print() cannot display numbers" },
          { id: "c", label: "Because GitHub rejects integers" }
        ],
        correctOptionId: "a",
        feedback: {
          correct: "Conversion is needed because input() returns text.",
          incorrect: "print() can display numbers. The issue is that input() returns a string."
        }
      }),
      block("w2-prob-ref", "short-response", {
        questionId: "u14-w2-prob-why",
        prompt: "In one or two sentences, explain why a business program must convert quantity before calculating a total.",
        guidance: "A typical answer mentions that typed input is text, and text cannot be multiplied or added as money or stock."
      }),
      block("w2-prob-ind", "callout", {
        tone: "warning",
        title: "Unreliable input",
        text: "Users type unexpected values. Treating all input as trusted numbers is a common source of defects. Convert deliberately, and expect invalid text."
      })
    ]),

    activity("week-2-conversion-demonstration", "Conversion functions", "Teach int(), float(), str() and bool(), including a deliberate conversion failure.", [
      block("w2-conv-h", "heading", { text: "int, float, str and bool", level: 4 }),
      block("w2-conv-p", "paragraph", { text: "Convert with int(), float(), str() and bool() before you calculate or store a typed value. Convert as close as possible to the input, then use the typed variable." }),
      block("w2-conv-md", "code-editor", {
        questionId: "u14-w2-conv-examples",
        language: "python",
        label: "Worked conversion examples",
        instructions: "Read these conversions. int(\"10\") is 10. float(\"12.50\") is 12.5. str(10) is \"10\". bool(0) is False; any non-zero number is True.",
        starter: "quantity = int(input(\"Quantity: \"))\nprice = float(input(\"Unit price: \"))\nlabel = str(quantity)\nflag = bool(quantity)\n"
      }),
      block("w2-conv-q1", "single-choice", {
        formative: true,
        questionId: "u14-w2-conv-q1",
        prompt: "Which call is appropriate for a price typed as 12.50?",
        options: [
          { id: "a", label: "int(input(\"Price: \"))" },
          { id: "b", label: "float(input(\"Price: \"))" },
          { id: "c", label: "bool(input(\"Price: \"))" }
        ],
        correctOptionId: "b",
        feedback: {
          correct: "Prices include pence, so float() is the matching conversion.",
          incorrect: "int(\"12.50\") raises ValueError. bool() would only test whether text was typed."
        }
      }),
      block("w2-conv-fail", "code-editor", {
        questionId: "u14-w2-conv-fail",
        language: "python",
        label: "Deliberate failure",
        instructions: "This program is meant to fail. Do not \"fix\" it here. Read the error you would see in Python, then interpret it below.",
        starter: "quantity = int(input(\"Quantity: \"))\n# If the user types ten, Python raises:\n# ValueError: invalid literal for int() with base 10: 'ten'\n"
      }),
      block("w2-conv-err", "short-response", {
        questionId: "u14-w2-conv-err",
        prompt: "A user types ten instead of 10. What happens, and what does the error tell you?",
        guidance: "int() cannot convert the letters ten. Python raises ValueError. The program stops unless later weeks add handling."
      }),
      block("w2-conv-bool", "callout", {
        tone: "info",
        title: "bool() on text",
        text: "bool(\"False\") is True because the string is not empty. Do not use bool() to interpret the words True and False typed by a user."
      }),
      pythonExercise(
        "w2-conv-ex",
        "u14-w2-conv-code",
        "Convert quantity with int() and price with float() before any arithmetic. The check looks for those calls only. The browser does not execute the program.",
        "quantity_text = input(\"Quantity: \")\nprice_text = input(\"Unit price: \")\n# Convert, then calculate a line total.\n",
        ["Use int() for quantity.", "Use float() for price.", "Multiply only after conversion."],
        [
          { pattern: "int\\s*\\(", label: "int()" },
          { pattern: "float\\s*\\(", label: "float()" }
        ],
        "int() and float() are present. Run the file in your Python environment to see conversion work or fail.",
        "Include int() for quantity and float() for price."
      )
    ]),

    activity("week-2-predefined-subroutines", "Predefined string subroutines", "Select len, upper, lower, strip, split and replace for realistic business data.", [
      block("w2-sub-h", "heading", { text: "Cleaning business text", level: 4 }),
      block("w2-sub-p", "paragraph", { text: "Customer records arrive messy: extra spaces, mixed case, commas in addresses. Predefined subroutines clean that text. Choose the operation that matches the job." }),
      block("w2-sub-md", "code-editor", {
        questionId: "u14-w2-sub-examples",
        language: "python",
        label: "Worked string operations",
        instructions: "Read these examples. Keep legitimate names such as Mary-Anne, O'Neill and Ngọc. Do not strip hyphens or apostrophes just to make data simpler.",
        starter: "raw_name = \"  jane smith  \"\nname = raw_name.strip().title()\nemail = \"Jane.Smith@Example.com\".lower()\nparts = \"12 High Street, Leeds\".split(\",\")\npostcode = \"ls1 4ap\".upper()\nlength = len(name)\nclean = \"Order  #12\".replace(\"  \", \" \")\n"
      }),
      block("w2-sub-class", "classification", {
        formative: true,
        questionId: "u14-w2-sub-class",
        prompt: "Choose the most appropriate subroutine for each job.",
        categories: [
          { id: "len", label: "len" },
          { id: "upper", label: "upper" },
          { id: "lower", label: "lower" },
          { id: "strip", label: "strip" },
          { id: "split", label: "split" },
          { id: "replace", label: "replace" }
        ],
        items: [
          { id: "spaces", label: "Remove leading and trailing spaces from a name", correctCategoryId: "strip" },
          { id: "email", label: "Store an email address in a consistent case", correctCategoryId: "lower" },
          { id: "postcode", label: "Display a UK postcode in capitals", correctCategoryId: "upper" },
          { id: "address", label: "Separate \"12 High Street, Leeds\" into street and city", correctCategoryId: "split" },
          { id: "typo", label: "Change \"Stret\" to \"Street\" in an address", correctCategoryId: "replace" },
          { id: "count", label: "Check that a product code is 8 characters long", correctCategoryId: "len" }
        ],
        feedback: {
          correct: "Each subroutine has a specific job. Matching the job to the call is the Week 2 skill.",
          incorrect: "strip spaces, lower emails, upper postcodes, split on a separator, replace a substring, len for length."
        }
      }),
      pythonExercise(
        "w2-sub-ex",
        "u14-w2-sub-code",
        "Clean the customer name with strip and make the email lower case. The check looks for those calls. It does not execute code.",
        "raw_name = \"  Mary-Anne O'Neill  \"\nraw_email = \"Mary.Anne@Example.com\"\n# Clean the name and email for a business record.\n",
        ["strip() removes surrounding spaces.", "lower() makes email comparison consistent.", "Keep the hyphen and apostrophe in the name."],
        [
          { pattern: "strip\\s*\\(", label: "strip()" },
          { pattern: "lower\\s*\\(", label: "lower()" }
        ],
        "strip() and lower() are present. Preserve legitimate name punctuation when you run this in Python.",
        "Include strip() and lower()."
      )
    ]),

    activity("week-2-formatted-output", "Formatted business output", "Use f-strings to produce a professional receipt-style summary.", [
      block("w2-fmt-h", "heading", { text: "f-strings for business output", level: 4 }),
      block("w2-fmt-p", "paragraph", { text: "A receipt should be readable: labels, currency and two decimal places. f-strings place converted values into that layout." }),
      block("w2-fmt-md", "code-editor", {
        questionId: "u14-w2-fmt-example",
        language: "python",
        label: "Worked receipt",
        instructions: "Read this receipt layout. Labels, currency and two decimal places sit in f-strings.",
        starter: "customer = \"River Café\"\nsubtotal = 18.5\nvat = subtotal * 0.2\ntotal = subtotal + vat\nprint(f\"Customer: {customer}\")\nprint(f\"Subtotal: £{subtotal:.2f}\")\nprint(f\"VAT (20%): £{vat:.2f}\")\nprint(f\"Total: £{total:.2f}\")\n"
      }),
      pythonExercise(
        "w2-fmt-ex",
        "u14-w2-fmt-code",
        "Complete the receipt using an f-string. Include subtotal, VAT and total. The browser does not execute this.",
        "customer = \"River Café\"\nsubtotal = 18.5\nvat_rate = 0.2\n# Calculate VAT and total, then print a labelled receipt with f-strings.\n",
        ["Calculate vat as subtotal * vat_rate.", "Use print(f\"...\") for labelled lines.", ":.2f keeps pence on money values."],
        [
          { pattern: "print\\s*\\(\\s*f[\"']", label: "f-string print" },
          { pattern: "subtotal|vat|total", label: "business totals" }
        ],
        "The receipt uses an f-string and business totals. Run it in Python to confirm the layout.",
        "Print with an f-string and include subtotal, VAT or total."
      ),
      block("w2-fmt-q", "single-choice", {
        formative: true,
        questionId: "u14-w2-fmt-q1",
        prompt: "Why use an f-string on a receipt instead of joining several strings with + ?",
        options: [
          { id: "a", label: "It keeps labels and converted values in one readable line" },
          { id: "b", label: "It converts strings to integers automatically" },
          { id: "c", label: "It uploads the receipt to GitHub" }
        ],
        correctOptionId: "a",
        feedback: {
          correct: "f-strings format values in place. They do not replace conversion.",
          incorrect: "You still convert numbers first. f-strings only control how the output is written."
        }
      })
    ]),

    activity("week-2-gitignore", "Reading and extending .gitignore", "Explain the supplied .gitignore, ignored generated files, and how to add an extra ignore rule.", [
      block("w2-gi-h", "heading", { text: "Keep generated files out of Git", level: 4 }),
      block("w2-gi-p", "paragraph", { text: "The Classroom repository includes a .gitignore. Git uses it to skip files that should not be committed: Python cache, virtual environments and editor settings." }),
      block("w2-gi-md", "paragraph", {
        text: "Typical supplied entries include Python cache (__pycache__/, *.pyc), virtual environments (.venv/) and editor folders (.idea/, .vscode/). These are generated or local. They are not the business program. Committing them clutters history and can leak editor or machine-specific files."
      }),
      block("w2-gi-q1", "single-choice", {
        formative: true,
        questionId: "u14-w2-gi-q1",
        prompt: "Why should __pycache__/ stay out of the repository?",
        options: [
          { id: "a", label: "It is generated cache, not source the team should review" },
          { id: "b", label: "Python cannot run if the folder is ignored" },
          { id: "c", label: "GitHub deletes ignored folders from the classroom" }
        ],
        correctOptionId: "a",
        feedback: {
          correct: "Cache is rebuilt locally. Source and .gitignore belong in Git; cache does not.",
          incorrect: "Ignoring cache does not stop Python. It keeps the repository about the program."
        }
      }),
      block("w2-gi-code", "code-editor", {
        questionId: "u14-w2-gi-add",
        language: "python",
        label: ".gitignore excerpt",
        instructions: "This is not Python to run. Add one extra ignored entry such as .DS_Store or *.log under the comment.",
        starter: "__pycache__/\n*.pyc\n.venv/\n.idea/\n.vscode/\n# Add one extra generated or local pattern below.\n"
      }),
      block("w2-gi-ref", "short-response", {
        questionId: "u14-w2-gi-why",
        prompt: "Which extra pattern did you add, and why should that file stay local?",
        guidance: "A generated or machine-specific file (for example .DS_Store or a log) does not help another learner run the business program."
      }),
      block("w2-gi-note", "callout", {
        tone: "info",
        title: "Clean repository",
        text: "A professional repository contains source, tests and agreed config. After changing .gitignore, remove any already-tracked cache from the index in Git itself. This hub does not run Git."
      })
    ]),

    activity("week-2-review", "Session 2 retrieval", "Short recap of conversion and choosing an appropriate predefined subroutine.", [
      block("w2-rev-h", "heading", { text: "Before the lab", level: 4 }),
      block("w2-rev-p", "paragraph", { text: "Recap only: convert before arithmetic, and pick the subroutine that matches the data job." }),
      block("w2-rev-q1", "single-choice", {
        formative: true,
        questionId: "u14-w2-rev-q1",
        prompt: "A user types 3 and 2. quantity = input(...) then extra = input(...). What is quantity + extra?",
        options: [
          { id: "a", label: "5" },
          { id: "b", label: "\"32\"" },
          { id: "c", label: "6" }
        ],
        correctOptionId: "b",
        feedback: {
          correct: "Without int(), + concatenates the two strings.",
          incorrect: "input() returns strings. Convert before you add as numbers."
        }
      }),
      block("w2-rev-q2", "single-choice", {
        formative: true,
        questionId: "u14-w2-rev-q2",
        prompt: "Which call removes spaces from both ends of \"  Leeds  \"?",
        options: [
          { id: "a", label: "split()" },
          { id: "b", label: "replace()" },
          { id: "c", label: "strip()" }
        ],
        correctOptionId: "c",
        feedback: {
          correct: "strip() removes leading and trailing spaces.",
          incorrect: "split() breaks on a separator. replace() swaps a substring. strip() trims edges."
        }
      }),
      block("w2-rev-class", "classification", {
        formative: true,
        questionId: "u14-w2-rev-class",
        prompt: "Choose conversion or subroutine for each task.",
        categories: [
          { id: "int", label: "int()" },
          { id: "float", label: "float()" },
          { id: "strip", label: "strip()" },
          { id: "split", label: "split()" }
        ],
        items: [
          { id: "qty", label: "Turn typed quantity \"4\" into a whole number", correctCategoryId: "int" },
          { id: "price", label: "Turn typed price \"9.99\" into a number with pence", correctCategoryId: "float" },
          { id: "name", label: "Remove spare spaces around a surname", correctCategoryId: "strip" },
          { id: "csv", label: "Break \"name,email\" into two fields", correctCategoryId: "split" }
        ],
        feedback: {
          correct: "Match the job: whole number, money, trim, or split.",
          incorrect: "int for whole numbers, float for money, strip for edges, split for separators."
        }
      })
    ]),

    activity("week-2-conversion-debugging", "Five conversion debugging programs", "Inspect five programs that fail because of missing or incorrect conversion, repair each one, and explain the cause.", [
      block("w2-dbg-h", "heading", { text: "Repair missing conversion", level: 4 }),
      block("w2-dbg-p", "paragraph", { text: "Each program is deliberately broken. Inspect the problem, repair it in the editor, then explain the cause. Checks look for conversion calls. They do not execute Python in the browser." }),
      pythonExercise(
        "w2-dbg-1",
        "u14-w2-dbg-1",
        "Program 1: two quantities are added as text. Convert both with int() before adding.",
        "first = input(\"First quantity: \")\nsecond = input(\"Second quantity: \")\nprint(\"Total items:\", first + second)\n",
        ["input() returns a string.", "int() each value before +."],
        [{ pattern: "int\\s*\\(", label: "int()" }],
        "int() is present. In Python, 10 and 5 should now total 15, not 105.",
        "Convert both quantities with int() before adding."
      ),
      block("w2-dbg-1e", "short-response", {
        questionId: "u14-w2-dbg-1e",
        prompt: "Program 1: what went wrong before the repair?",
        guidance: "+ concatenated two strings. The values needed int() before numeric addition."
      }),
      pythonExercise(
        "w2-dbg-2",
        "u14-w2-dbg-2",
        "Program 2: a price is multiplied by 1.2 without conversion. Use float().",
        "price = input(\"Unit price: \")\nprint(\"Price including VAT:\", price * 1.2)\n",
        ["A string cannot be multiplied by 1.2.", "float() converts money text."],
        [{ pattern: "float\\s*\\(", label: "float()" }],
        "float() is present. Run it in Python to confirm VAT is calculated.",
        "Convert the price with float() before multiplying."
      ),
      block("w2-dbg-2e", "short-response", {
        questionId: "u14-w2-dbg-2e",
        prompt: "Program 2: why did price * 1.2 fail?",
        guidance: "price was still a string. Python cannot multiply that string by 1.2. float() is required."
      }),
      pythonExercise(
        "w2-dbg-3",
        "u14-w2-dbg-3",
        "Program 3: int() is the wrong conversion for a price with pence. Use float().",
        "price = int(input(\"Unit price: \"))  # user types 12.50\nprint(\"Price:\", price)\n",
        ["int(\"12.50\") raises ValueError.", "Money with pence needs float()."],
        [{ pattern: "float\\s*\\(", label: "float()" }],
        "float() is present. int() is the wrong tool for 12.50.",
        "Replace int() with float() for a price that includes pence."
      ),
      block("w2-dbg-3e", "short-response", {
        questionId: "u14-w2-dbg-3e",
        prompt: "Program 3: what error does int(\"12.50\") cause, and which conversion is correct?",
        guidance: "ValueError: invalid literal for int(). float(\"12.50\") is the matching conversion."
      }),
      pythonExercise(
        "w2-dbg-4",
        "u14-w2-dbg-4",
        "Program 4: a typed age is compared with 18 without conversion. Use int().",
        "age = input(\"Age: \")\nprint(\"Adult ticket:\", age > 18)\n",
        ["Python 3 cannot compare a string with an integer using >.", "Convert age with int() first."],
        [{ pattern: "int\\s*\\(", label: "int()" }],
        "int() is present. The comparison can now use a whole number.",
        "Convert age with int() before comparing with 18."
      ),
      block("w2-dbg-4e", "short-response", {
        questionId: "u14-w2-dbg-4e",
        prompt: "Program 4: why must age be converted before age > 18?",
        guidance: "input() is a string. Comparing it with 18 is a type error. Convert with int() first."
      }),
      pythonExercise(
        "w2-dbg-5",
        "u14-w2-dbg-5",
        "Program 5: bool() is the wrong conversion for the words True/False. Compare the text instead (for example member.lower() == \"true\").",
        "member = input(\"Loyalty member (True/False): \")\nprint(\"Apply discount:\", bool(member))\n",
        ["bool(\"False\") is True because the string is not empty.", "Compare normalised text, such as member.lower() == \"true\"."],
        [
          { pattern: "\\.lower\\s*\\(|==\\s*[\"']true[\"']", flags: "i", label: "text comparison" }
        ],
        "The program compares the typed words instead of using bool() on text.",
        "Do not rely on bool() for the words True and False. Compare the text.",
        [{ pattern: "bool\\s*\\(", label: "bool() on text" }]
      ),
      block("w2-dbg-5e", "short-response", {
        questionId: "u14-w2-dbg-5e",
        prompt: "Program 5: why is bool(\"False\") the wrong fix?",
        guidance: "Non-empty strings are True, so bool(\"False\") is True. Compare the letters the user typed."
      })
    ]),

    activity("week-2-customer-data-cleaning", "Customer-data cleaning", "Select and apply strip, upper/lower, split, replace and len to messy customer data.", [
      block("w2-cln-h", "heading", { text: "Messy customer rows", level: 4 }),
      block("w2-cln-p", "paragraph", { text: "A café exports bookings with extra spaces, mixed case and a combined address field. Choose the predefined subroutine that cleans each part. Keep legitimate names and address formats." }),
      block("w2-cln-md", "code-editor", {
        questionId: "u14-w2-cln-sample",
        language: "python",
        label: "Sample customer export",
        instructions: "These are messy exported rows, not a program to run. Notice extra spaces, mixed case and combined address fields.",
        starter: "  Mary-Anne O'Neill  | Mary.Anne@Example.COM | 12 High Street,  Leeds | ls1 4ap | SKU-18\nNgọc Trần-García     | ngoc@example.com      | Flat 2, 4 King's Rd, York | yo1 7hh | SKU-7\n"
      }),
      block("w2-cln-class", "classification", {
        formative: true,
        questionId: "u14-w2-cln-class",
        prompt: "Choose the subroutine for each cleaning job.",
        categories: [
          { id: "strip", label: "strip" },
          { id: "lower", label: "lower" },
          { id: "upper", label: "upper" },
          { id: "split", label: "split" },
          { id: "replace", label: "replace" },
          { id: "len", label: "len" }
        ],
        items: [
          { id: "name", label: "Trim spaces around Mary-Anne O'Neill without removing the hyphen", correctCategoryId: "strip" },
          { id: "email", label: "Store Mary.Anne@Example.COM consistently", correctCategoryId: "lower" },
          { id: "postcode", label: "Display ls1 4ap as LS1 4AP", correctCategoryId: "upper" },
          { id: "address", label: "Separate street from city on the comma", correctCategoryId: "split" },
          { id: "double", label: "Turn two spaces in \"Street,  Leeds\" into one space", correctCategoryId: "replace" },
          { id: "sku", label: "Check the product code length", correctCategoryId: "len" }
        ],
        feedback: {
          correct: "The subroutine should match the job. Inclusive names stay intact.",
          incorrect: "Trim with strip, normalise case with lower/upper, split fields, replace doubled spaces, len for length."
        }
      }),
      pythonExercise(
        "w2-cln-ex",
        "u14-w2-cln-code",
        "Clean one customer row: strip the name, lower the email, upper the postcode, split the address. The check looks for those calls.",
        "raw_name = \"  Mary-Anne O'Neill  \"\nraw_email = \"Mary.Anne@Example.COM\"\nraw_address = \"12 High Street,  Leeds\"\nraw_postcode = \"ls1 4ap\"\n# Clean each field with an appropriate predefined subroutine.\n",
        ["Keep hyphens and apostrophes in names.", "split(\",\") separates street and city.", "replace can tidy doubled spaces after you split or before."],
        [
          { pattern: "strip\\s*\\(", label: "strip()" },
          { pattern: "lower\\s*\\(", label: "lower()" },
          { pattern: "upper\\s*\\(", label: "upper()" },
          { pattern: "split\\s*\\(", label: "split()" }
        ],
        "The cleaning calls are present. Run the file in Python and check the name still includes the hyphen and apostrophe.",
        "Include strip(), lower(), upper() and split()."
      ),
      block("w2-cln-ref", "reflection", {
        questionId: "u14-w2-cln-ref",
        prompt: "Which name or address feature must not be removed during cleaning, and why?"
      })
    ]),

    activity("week-2-business-calculation", "Independent business calculation", "Collect numeric business data as text, convert it, and calculate subtotal, tax and total.", [
      block("w2-calc-h", "heading", { text: "River Café takeaway", level: 4 }),
      block("w2-calc-p", "paragraph", { text: "Write a short program for a takeaway order. Collect numeric values as text, convert them, then calculate subtotal, 20% VAT and total. Print a labelled receipt with f-strings. Work in your cloned repository; the hub only checks structure." }),
      pythonExercise(
        "w2-calc-ex",
        "u14-w2-calc-code",
        "Ask for quantity and unit price as text, convert, calculate subtotal, VAT and total, then print an f-string receipt. The browser does not execute this.",
        "# River Café takeaway — Week 2\n# Collect text, convert, then calculate.\n\ncustomer = input(\"Customer name: \")\nquantity_text = input(\"Number of items: \")\nprice_text = input(\"Unit price: \")\n\n# Convert, calculate subtotal, VAT (20%) and total, then print a receipt.\n",
        ["int() for quantity, float() for price.", "subtotal = quantity * unit_price.", "vat = subtotal * 0.2; total = subtotal + vat.", "Use f-strings and :.2f for money."],
        [
          { pattern: "input\\s*\\(", label: "input()" },
          { pattern: "int\\s*\\(", label: "int()" },
          { pattern: "float\\s*\\(", label: "float()" },
          { pattern: "print\\s*\\(\\s*f[\"']", label: "f-string print" }
        ],
        "The program collects text, converts, and uses an f-string. Run it in Python and commit it on your feature branch.",
        "Include input(), int(), float() and an f-string print."
      ),
      block("w2-calc-ref", "reflection", {
        questionId: "u14-w2-calc-ref",
        prompt: "Which conversion was essential for the VAT line, and what would happen without it?"
      })
    ]),

    activity("week-2-git-branch-guidance", "Named feature branch", "Commit the working program on an appropriately named feature branch. Guidance only; this hub is not a Git client.", [
      block("w2-git-h", "heading", { text: "Commit on a feature branch", level: 4 }),
      block("w2-git-p", "paragraph", { text: "Do not commit Week 2 work only on main if your team uses feature branches. Create a short, named branch, commit the working calculation incrementally, then push. Use GitHub and Git on your machine. This hub does not run Git." }),
      block("w2-git-md", "markdown", {
        text: "Suggested branch name: **feature/week-2-conversion**\n\nIncremental commits, for example:\n\n* convert quantity and price\n* add VAT and receipt output\n* extend .gitignore\n\nUse the commands your teacher demonstrated. Do not paste secrets into commit messages."
      }),
      block("w2-git-q", "single-choice", {
        formative: true,
        questionId: "u14-w2-git-q1",
        prompt: "Which branch name best matches this week's work?",
        options: [
          { id: "a", label: "feature/week-2-conversion" },
          { id: "b", label: "update" },
          { id: "c", label: "final-final-2" }
        ],
        correctOptionId: "a",
        feedback: {
          correct: "The name describes the week and the work.",
          incorrect: "Prefer a feature name that another learner can understand later."
        }
      }),
      block("w2-git-ref", "reflection", {
        questionId: "u14-w2-git-ref",
        prompt: "Write the branch name you will use and the first commit message for the calculation program."
      }),
      block("w2-git-note", "callout", {
        tone: "info",
        title: "Guidance only",
        text: "The hub cannot create branches or commits. Use your cloned Classroom repository."
      })
    ]),

    activity("week-2-assignment-1-guide", "Assignment 1: conversion and subroutines", "Add P1 preparation for data type conversion and predefined subroutines. Hub completion is not P1 achieved.", [
      block("w2-a1-h", "heading", { text: "P1 notes this week", level: 4 }),
      block("w2-a1-p", "paragraph", { text: "P1 asks you to show understanding of the programming constructs used to build software for business. This week add two constructs: data type conversion and predefined subroutines. Completing these boxes is not P1 achieved. Your teacher assesses the submitted technical guide." }),
      block("w2-a1-md", "markdown", {
        text: "For **each** construct record:\n\n* an explanation\n* its purpose\n* a worked Python example\n* why a business program needs it"
      }),
      block("w2-a1-conv", "reflection", {
        questionId: "u14-w2-a1-conv",
        prompt: "Draft the conversion section: explanation, purpose, a short Python example, and a business reason."
      }),
      block("w2-a1-sub", "reflection", {
        questionId: "u14-w2-a1-sub",
        prompt: "Draft the predefined-subroutines section: explanation, purpose, a short Python example, and a business reason."
      }),
      block("w2-a1-link", "reference", { label: "Open the Assignment 1 workspace", href: "assignments/assignment-1/" }),
      block("w2-a1-note", "callout", {
        tone: "warning",
        title: "Not a grade",
        text: "The hub never awards Pass, Merit or Distinction. Saving these notes does not mean P1 is achieved."
      })
    ]),

    activity("week-2-homework", "Homework: finish calculation and P1 notes", "Complete the directed independent study from the Scheme of Learning, with optional stretch for more confident learners.", [
      block("w2-hw-h", "heading", { text: "Directed independent study", level: 4 }),
      block("w2-hw-p", "paragraph", { text: "Finish the River Café calculation in your cloned repository if you did not complete it in Session 2. Convert input before arithmetic, print a receipt with f-strings, extend .gitignore if needed, and commit on your named feature branch. Then finish the Assignment 1 notes for conversion and predefined subroutines." }),
      pythonExercise(
        "w2-hw-ex",
        "u14-w2-hw-code",
        "Continue the calculation here if useful, but the assessed copy is the file in your GitHub repository. The check looks for conversion and an f-string only.",
        "# Homework — finish the takeaway calculation\ncustomer = input(\"Customer name: \")\nquantity = int(input(\"Number of items: \"))\nunit_price = float(input(\"Unit price: \"))\nsubtotal = quantity * unit_price\nvat = subtotal * 0.2\ntotal = subtotal + vat\nprint(f\"{customer}: subtotal £{subtotal:.2f}, VAT £{vat:.2f}, total £{total:.2f}\")\n",
        ["Commit on feature/week-2-conversion or the name you chose.", "Push to GitHub. The hub is not the repository."],
        [
          { pattern: "int\\s*\\(", label: "int()" },
          { pattern: "float\\s*\\(", label: "float()" },
          { pattern: "print\\s*\\(\\s*f[\"']", label: "f-string print" }
        ],
        "The homework program still converts and formats. Commit and push on GitHub, then complete the P1 drafts.",
        "Keep int(), float() and an f-string print."
      ),
      block("w2-hw-ref", "reflection", {
        questionId: "u14-w2-hw-ref",
        prompt: "Confirm what you committed (calculation, .gitignore change, P1 notes) and the branch name."
      }),
      block("w2-hw-stretch", "callout", {
        tone: "info",
        title: "Stretch (optional)",
        text: "More confident learners may try: try/except around a failed int() or float(); observe that int(19.99) truncates rather than rounding; and tidy commit history on the feature branch. These are not required Week 2 outcomes."
      }),
      block("w2-hw-next", "callout", {
        tone: "info",
        title: "What next",
        text: "Week 3 introduces selection. Do not start selection work yet. Keep Assignment 1 focused on conversion and predefined subroutines from this week."
      }),
      block("w2-hw-link", "reference", { label: "Open the Assignment 1 workspace", href: "assignments/assignment-1/" })
    ])
  ];

  return {
    weeks: [week],
    sessions: sessions,
    activities: activities
  };
}

function mergeById(current, extra) {
  const map = new Map(current.map((item) => [item.id, item]));
  extra.forEach((item) => map.set(item.id, item));
  return [...map.values()];
}

function main() {
  const pkg = buildWeek2Package();
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({
    schema: "lp.content.package",
    schemaVersion: SCHEMA,
    weeks: pkg.weeks,
    sessions: pkg.sessions,
    activities: pkg.activities
  }, null, 2) + "\n");

  const weeksPath = path.join(packageDir, "weeks.json");
  const sessionsPath = path.join(packageDir, "sessions.json");
  const activitiesPath = path.join(packageDir, "activities.json");
  const weeks = mergeById(JSON.parse(fs.readFileSync(weeksPath, "utf8")), pkg.weeks);
  const sessions = mergeById(JSON.parse(fs.readFileSync(sessionsPath, "utf8")), pkg.sessions);
  const activities = mergeById(JSON.parse(fs.readFileSync(activitiesPath, "utf8")), pkg.activities);
  fs.writeFileSync(weeksPath, JSON.stringify(weeks, null, 2) + "\n");
  fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2) + "\n");
  fs.writeFileSync(activitiesPath, JSON.stringify(activities, null, 2) + "\n");

  const indexPath = path.join(packageDir, "index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  index.version = "0.2.0";
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");

  process.stdout.write(
    "Wrote " + outFile + " (" + pkg.sessions.length + " sessions, " + pkg.activities.length + " activities)\n"
  );
}

module.exports = { buildWeek2Package };

if (require.main === module) {
  main();
}
