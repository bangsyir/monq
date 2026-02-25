import * as process from "node:process"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL!
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
})

export const searchRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
  prefix: "rate-limit:search",
})

export const commentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60s"),
  prefix: "rate-limit:comment",
})

export const ipRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1m"),
  prefix: "rate-limit:ip",
})
