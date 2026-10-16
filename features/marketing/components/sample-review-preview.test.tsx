/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { EXAMPLE_SAMPLE_REVIEW } from "@/features/marketing/lib/sample-review";
import { SampleReviewPreview } from "./sample-review-preview";

describe("SampleReviewPreview", () => {
  it("renders the sample review without crashing and switches to the summary tab", async () => {
    const user = userEvent.setup();

    render(<SampleReviewPreview sample={EXAMPLE_SAMPLE_REVIEW} />);

    expect(
      screen.getByRole("heading", {
        name: "Same shape as a real GitHub review.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(EXAMPLE_SAMPLE_REVIEW.title)).toBeInTheDocument();
    expect(
      screen.getByText("Rate limit protection"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Conversation" }));

    expect(screen.getByText("Summary comment")).toBeInTheDocument();
    expect(screen.getByText(EXAMPLE_SAMPLE_REVIEW.summary)).toBeInTheDocument();
  });
});
