import { readFileSync } from "node:fs"
import vm from "node:vm"
import assert from "node:assert/strict"
import test from "node:test"
const code = readFileSync(new URL("../src/site.js", import.meta.url), "utf8")
function fixture() {
  const buttons = ["buyer", "owner", "investor"].map((goal) => ({
    dataset: { goal },
    attributes: { "aria-pressed": String(goal === "owner") },
    handlers: {},
    setAttribute(k, v) {
      this.attributes[k] = v
    },
    addEventListener(type, fn) {
      this.handlers[type] = fn
    },
  }))
  const insight = {
    children: [],
    replaceChildren(...nodes) {
      this.children = nodes
    },
  }
  const document = {
    getElementById: (id) => (id === "goal-insight" ? insight : null),
    querySelectorAll: () => buttons,
    createElement: () => ({ textContent: "" }),
    createTextNode: (text) => ({ textContent: text }),
  }
  vm.runInNewContext(code, { document })
  return { buttons, insight }
}
test("all three goals update meaningful perspective and exactly one pressed state", () => {
  const { buttons, insight } = fixture()
  for (const button of buttons) {
    button.handlers.click()
    assert.equal(
      buttons.filter((b) => b.attributes["aria-pressed"] === "true").length,
      1
    )
    assert.equal(button.attributes["aria-pressed"], "true")
    const text = insight.children.map((n) => n.textContent).join("")
    assert.match(text, /perspective:/)
    if (button.dataset.goal === "buyer")
      assert.match(text, /monthly cost of owning/)
    if (button.dataset.goal === "owner")
      assert.match(text, /change in monthly cash flow/)
    if (button.dataset.goal === "investor")
      assert.match(text, /incremental modeled cash gain/)
  }
})
test("unknown goal is ignored rather than injecting content", () => {
  const { buttons, insight } = fixture()
  buttons[0].dataset.goal = "<img onerror=bad>"
  buttons[0].handlers.click()
  assert.equal(insight.children.length, 0)
  assert.equal(buttons[1].attributes["aria-pressed"], "true")
})
test("switching goals requires no network or storage globals", () => {
  const { buttons } = fixture()
  for (let i = 0; i < 12; i++) buttons[i % 3].handlers.click()
  assert.doesNotMatch(
    code,
    /innerHTML|fetch\(|localStorage|sessionStorage|XMLHttpRequest/
  )
})
