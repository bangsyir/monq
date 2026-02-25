import { createServerFn } from "@tanstack/react-start"
import {
  getDashboardStatsService,
  getRecentDataService,
} from "./dashboard-service.server"

export const getDashboardStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await getDashboardStatsService()
    if ("error" in result) {
      throw new Error(result.message)
    }
    return result
  },
)

export const getRecentData = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await getRecentDataService()
    if ("error" in result) {
      throw new Error(result.message)
    }
    return result
  },
)
