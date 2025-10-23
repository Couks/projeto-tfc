import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getQueryClient } from "@/lib/getQueryClient";
import { queryKeys } from "@/lib/hooks/queryKeys";
import { SitesClient } from "./_components/SitesClient";

export default async function SitesPage() {
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SitesClient />
    </HydrationBoundary>
  );
}
