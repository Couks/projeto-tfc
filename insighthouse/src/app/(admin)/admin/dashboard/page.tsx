import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getQueryClient } from "@/lib/getQueryClient";
import { queryKeys } from "@/lib/hooks/queryKeys";
import { DashboardClient } from "./_components/DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  const queryClient = getQueryClient();

  // Prefetch sites
  await queryClient.prefetchQuery({
    queryKey: queryKeys.sites.all,
    queryFn: async () => {
      const sites = await prisma.site.findMany({
        where: { userId: session?.userId },
        select: {
          id: true,
          name: true,
          siteKey: true,
          status: true,
          createdAt: true,
          domains: {
            select: {
              id: true,
              host: true,
              isPrimary: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return sites;
    },
  });

  // Get first site for prefetching overview
  const site = await prisma.site.findFirst({
    where: { userId: session?.userId },
    orderBy: { createdAt: "desc" },
  });

  // Prefetch overview data if site exists
  if (site) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.insights.overview(site.siteKey),
      queryFn: async () => {
        const res = await fetch(
          `${
            process.env.SITE_URL
          }/api/insights/overview?site=${encodeURIComponent(site.siteKey)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return null;
        return res.json();
      },
    });
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  );
}
