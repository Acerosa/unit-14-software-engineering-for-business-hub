import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { monacoModelPath } from "./blockConfig";

const monacoInstances: Array<{ path?: string; value?: string; onChange?: (value: string) => void }> = [];

vi.mock("@monaco-editor/react", () => ({
  default: function MockMonaco(props: {
    path?: string;
    value?: string;
    onChange?: (value: string | undefined) => void;
  }) {
    monacoInstances.push({
      path: props.path,
      value: props.value,
      onChange: (value) => props.onChange?.(value)
    });
    return (
      <textarea
        data-monaco-path={props.path}
        aria-label="monaco mock"
        value={props.value || ""}
        onChange={(event) => props.onChange?.(event.target.value)}
      />
    );
  }
}));

import { MonacoEditorField } from "./MonacoEditorField";

describe("MonacoEditorField model isolation", () => {
  beforeEach(function () {
    monacoInstances.length = 0;
  });

  afterEach(cleanup);

  it("assigns a unique stable Monaco path per modelId while keeping filename in the URI", async () => {
    render(
      <>
        <MonacoEditorField modelId="w2-dbg-1" filename="solution.py" value="first" onChange={() => {}} />
        <MonacoEditorField modelId="w2-dbg-2" filename="solution.py" value="second" onChange={() => {}} />
      </>
    );
    await waitFor(function () {
      expect(monacoInstances.length).toBe(2);
    });
    expect(monacoInstances[0]?.path).toBe("u14://w2-dbg-1/solution.py");
    expect(monacoInstances[1]?.path).toBe("u14://w2-dbg-2/solution.py");
    expect(monacoModelPath("w2-dbg-1", "solution.py")).toBe("u14://w2-dbg-1/solution.py");
  });

  it("keeps exercise editor values independent when paths differ", async () => {
    const onChangeA = vi.fn();
    const onChangeB = vi.fn();
    render(
      <>
        <MonacoEditorField modelId="w2-dbg-1" filename="solution.py" value="print(1)" onChange={onChangeA} />
        <MonacoEditorField modelId="w2-dbg-2" filename="solution.py" value="print(2)" onChange={onChangeB} />
      </>
    );
    const editors = await screen.findAllByLabelText("monaco mock");
    expect(editors[0]).toHaveValue("print(1)");
    expect(editors[1]).toHaveValue("print(2)");
    fireEvent.change(editors[0], { target: { value: "print(\"changed\")" } });
    expect(onChangeA).toHaveBeenCalledWith("print(\"changed\")");
    expect(onChangeB).not.toHaveBeenCalled();
    expect(editors[1]).toHaveValue("print(2)");
  });
});
