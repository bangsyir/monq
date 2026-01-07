import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  index,
  real,
  integer,
} from "drizzle-orm/pg-core"
import { v7 as uuidv7 } from "uuid"

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    role: text("role"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
  },
  (table) => [index("user_id_idx").on(table.id)],
)

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
)

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)],
)

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
)
/**
 * CATEGORIES TABLE
 * Based on the `categories` array in the JSON.
 */
export const categories = pgTable("categories", {
  id: uuid("id")
    .$defaultFn(() => uuidv7())
    .primaryKey(), // e.g., "waterfall", "trail"
  name: text("name").notNull(),
  icon: text("icon").notNull(),
})

/**
 * AMENITIES TABLE
 * Normalized from the amenities array inside places.
 * This allows reusing amenities like "Parking" across different places.
 */
export const amenities = pgTable("amenities", {
  id: uuid("id")
    .$defaultFn(() => uuidv7())
    .primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
})

/**
 * PLACES TABLE
 * Represents the main `mockPlaces` objects.
 * I flattened the `location` object into columns for easier querying.
 */
export const places = pgTable(
  "places",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    userId: uuid("user_id"),
    name: text("name").notNull(),
    description: text("description").notNull(),
    categoryId: text("category_id")
      .references(() => categories.id, { onDelete: "set null" })
      .notNull(),

    // Location fields (flattened from JSON object)
    latitude: real("latitude"),
    longitude: real("longitude"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    country: text("country"),

    rating: real("rating").notNull(),
    reviewCount: integer("review_count").notNull().default(0),

    difficulty: text("difficulty"), // e.g., "moderate", "hard"
    duration: text("duration"), // e.g., "3-4 hours"
    distance: text("distance"), // e.g., "5.2 miles"
    elevation: text("elevation"), // e.g., "1,200 ft"

    // Using a native Postgres array for seasons
    bestSeason: text("best_season").array(),

    isFeatured: boolean("is_featured").default(false),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("category_idx").on(table.categoryId),
    index("featured_idx").on(table.isFeatured),
  ],
)
/**
 * PLACE IMAGES TABLE
 * Handles the one-to-many relationship for images.
 */
export const placeImages = pgTable("place_images", {
  id: uuid("id")
    .$defaultFn(() => uuidv7())
    .primaryKey(),
  placeId: text("place_id")
    .references(() => places.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
})
/**
 * PLACE AMENITIES TABLE
 * Many-to-many relationship between Places and Amenities.
 */
export const placeAmenities = pgTable("place_amenities", {
  placeId: uuid("place_id")
    .references(() => places.id, { onDelete: "cascade" })
    .notNull(),
  amenityId: uuid("amenity_id")
    .references(() => amenities.id, { onDelete: "cascade" })
    .notNull(),
})
/**
 * REVIEWS TABLE
 * Represents the `mockReviews` data.
 */
export const reviews = pgTable("reviews", {
  id: uuid("id")
    .$defaultFn(() => uuidv7())
    .primaryKey(),
  placeId: text("place_id")
    .references(() => places.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  rating: integer("rating").notNull(), // Assuming integer rating (1-5) based on typical reviews, or use real() if decimals needed
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull(),
})

// ==========================================
// RELATIONSHIPS
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  places: many(places),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  users: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  users: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  places: many(places),
}))

export const placesRelations = relations(places, ({ one, many }) => ({
  user: one(users, {
    fields: [places.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [places.categoryId],
    references: [categories.id],
  }),
  images: many(placeImages),
  amenities: many(placeAmenities),
  reviews: many(reviews),
}))

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  places: many(placeAmenities),
}))

export const placeImagesRelations = relations(placeImages, ({ one }) => ({
  place: one(places, {
    fields: [placeImages.placeId],
    references: [places.id],
  }),
}))

export const placeAmenitiesRelations = relations(placeAmenities, ({ one }) => ({
  place: one(places, {
    fields: [placeAmenities.placeId],
    references: [places.id],
  }),
  amenity: one(amenities, {
    fields: [placeAmenities.amenityId],
    references: [amenities.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  place: one(places, {
    fields: [reviews.placeId],
    references: [places.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}))
