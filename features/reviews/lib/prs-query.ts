import { queryOptions } from "@tanstack/react-query";
import { pollWhileInFlight } from "@/features/inngest/job-limits";
import type { ListedPullRequest } from "@/features/reviews/server/list-pull-requests";

export const pullRequestKeys = {
  all: ["github", "pull-requests"] as const,
};

const PRS_STALE_TIME = 60_000;

export const pullRequestsQuery = queryOptions({
  queryKey: pullRequestKeys.all,
  queryFn: async (): Promise<ListedPullRequest[]> => {
    const response = await fetch("/api/github/pull-requests");

    if (!response.ok) {
      throw new Error("Failed to load pull requests");
    }

    return response.json();
  },
  staleTime: PRS_STALE_TIME,
  refetchOnWindowFocus: true,
  refetchInterval: (query) => {
    const inFlight = Boolean(
      query.state.data?.some(
        (pr) => pr.status === "pending" || pr.status === "processing"
      )
    );

    return pollWhileInFlight(query, inFlight);
  },
});
