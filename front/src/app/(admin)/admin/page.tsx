import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/getQueryClient";
import { queryKeys } from "@/lib/hooks/queryKeys";
import { AdminDashboardClient } from "./_components/AdminDashboardClient";

export default async function AdminHome() {
  const session = await getSession();
  if (!session) redirect("/login");

  const queryClient = getQueryClient();

  // Prefetch sites
  await queryClient.prefetchQuery({
    queryKey: queryKeys.sites.all,
    queryFn: async () => {
      const sites = await prisma.site.findMany({
        where: { userId: session.userId },
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

  // Get first site for prefetching insights
  const firstSite = await prisma.site.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { siteKey: true },
  });

  // Prefetch insights data if site exists
  if (firstSite) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.insights.overview(firstSite.siteKey),
        queryFn: async () => {
          const res = await fetch(
            `${
              process.env.SITE_URL
            }/api/insights/overview?site=${encodeURIComponent(
              firstSite.siteKey
            )}`,
            { cache: "no-store" }
          );
          if (!res.ok) return null;
          return res.json();
        },
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.insights.conversions(firstSite.siteKey),
        queryFn: async () => {
          const res = await fetch(
            `${
              process.env.SITE_URL
            }/api/insights/conversions?site=${encodeURIComponent(
              firstSite.siteKey
            )}`,
            { cache: "no-store" }
          );
          if (!res.ok) return null;
          return res.json();
        },
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.insights.journeys(firstSite.siteKey),
        queryFn: async () => {
          const res = await fetch(
            `${
              process.env.SITE_URL
            }/api/insights/journeys?site=${encodeURIComponent(
              firstSite.siteKey
            )}`,
            { cache: "no-store" }
          );
          if (!res.ok) return null;
          return res.json();
        },
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardClient />
    </HydrationBoundary>
  );
}
