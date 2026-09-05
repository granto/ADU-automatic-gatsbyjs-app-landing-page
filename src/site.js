const perspectives = {
  buyer: [
    "Buyer perspective:",
    "Compare the monthly cost of owning this home with and without an ADU. A rent estimate is only one part of affordability.",
  ],
  owner: [
    "Homeowner perspective:",
    "Start with the change in monthly cash flow, then test the construction cost and additional cash required.",
  ],
  investor: [
    "Investor perspective:",
    "Look at incremental modeled cash gain and additional peak cash required, then compare With ADU and Without ADU IRR over the same horizon.",
  ],
}
const insight = document.getElementById("goal-insight")
const buttons = document.querySelectorAll("[data-goal]")
buttons.forEach((button) =>
  button.addEventListener("click", () => {
    const perspective = perspectives[button.dataset.goal]
    if (!perspective || !insight) return
    buttons.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button))
    )
    const label = document.createElement("strong")
    label.textContent = perspective[0]
    insight.replaceChildren(
      label,
      document.createTextNode(" " + perspective[1])
    )
  })
)
