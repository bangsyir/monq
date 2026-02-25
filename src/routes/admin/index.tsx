import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Flag, MapPin, TrendingUp, Users } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getDashboardStats, getRecentData } from "@/modules/dashboard"

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const stats = await getDashboardStats()
    const recent = await getRecentData()
    return { stats, recent }
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  const { stats, recent } = Route.useLoaderData()
  const getStatsFn = useServerFn(getDashboardStats)
  const getRecentFn = useServerFn(getRecentData)

  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getStatsFn(),
    initialData: stats,
  })

  const { data: recentData } = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: () => getRecentFn(),
    initialData: recent,
  })

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const dashboardStatsList = [
    {
      label: "Total Users",
      value: formatNumber(dashboardStats.totalUsers),
      icon: Users,
    },
    {
      label: "Total Places",
      value: formatNumber(dashboardStats.totalPlaces),
      icon: MapPin,
    },
    {
      label: "Total Reviews",
      value: formatNumber(dashboardStats.totalReviews),
      icon: Flag,
    },
    {
      label: "Total Comments",
      value: formatNumber(dashboardStats.totalComments),
      icon: TrendingUp,
    },
  ]

  return (
    <main className="pt-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-foreground text-2xl font-bold md:text-3xl">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage users, places, and reports
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {dashboardStatsList.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-foreground text-2xl font-bold">
                    {stat.value}
                  </p>
                </div>
                <div className="bg-primary/10 rounded-xl p-1 md:p-3">
                  <stat.icon className="text-primary h-4 w-4 md:h-6 md:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-lg font-semibold">Recent Places</h2>
              <div className="space-y-3">
                {recentData.recentPlaces.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No places yet</p>
                ) : (
                  recentData.recentPlaces.slice(0, 5).map((place: object) => {
                    const p = place as {
                      name?: string
                      city?: string
                      rating?: number
                    }
                    return (
                      <div
                        key={p.name}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {p.city}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {p.rating?.toFixed(1) || "N/A"}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-lg font-semibold">Recent Users</h2>
              <div className="space-y-3">
                {recentData.recentUsers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No users yet</p>
                ) : (
                  recentData.recentUsers.slice(0, 5).map((user: object) => {
                    const u = user as {
                      name?: string
                      email?: string
                      createdAt?: Date
                    }
                    return (
                      <div
                        key={u.email}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {u.email}
                          </p>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
