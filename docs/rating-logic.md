## Rating Login

Gemini said
Adding a rating feature seems simple on the surface, but if you have a high-traffic app, "just calculating the average" on the fly will eventually crawl to a halt. Dealing with race conditions—where two people rate at the exact same millisecond—is the other half of the battle.

Here is a high-performance, concurrency-safe strategy for PostgreSQL.

### 1. The Schema Design

Avoid calculating averages from your ratings table every time a user views a place. Instead, use Counter Caching. Store the aggregated data directly on the places table.

The Places Table

```sql
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name TEXT,
    rating_count INTEGER DEFAULT 0,
    rating_sum INTEGER DEFAULT 0, -- Store sum of stars (e.g., 5 + 4 + 5)
    avg_rating NUMERIC(3, 2) DEFAULT 0
);
```

The Ratings Table

```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    place_id INTEGER REFERENCES places(id),
    user_id INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    UNIQUE(place_id, user_id) -- Prevents duplicate ratings
);
```

### 2. Avoiding Race Conditions

To avoid race conditions (like two updates canceling each other out), never fetch the value to your application code, increment it, and save it back. Instead, let the database handle the atomic update using UPDATE ... SET col = col + 1.

Option A: The Atomic SQL Update
When a user submits a rating, run this in a single transaction:

```sql
WITH inserted_review AS (
    INSERT INTO reviews (place_id, user_id, rating)
    VALUES (123, 45, 5)
    RETURNING place_id, rating
)
UPDATE places
SET
    rating_count = rating_count + 1,
    rating_sum = rating_sum + (SELECT rating FROM inserted_review),
    avg_rating = (rating_sum + (SELECT rating FROM inserted_review))::numeric / (rating_count + 1)
WHERE id = (SELECT place_id FROM inserted_review);
```

### 3. Performance Optimizations

Indexing: Ensure you have an index on reviews(place_id). Even though we cache the average, you’ll still need to fetch individual reviews for the UI.

BRIN Indexes: If your reviews table grows to tens of millions of rows and is mostly insert-only, a BRIN index on created_at can save massive amounts of disk space compared to a B-Tree index.

Batch Updates: If you are under extreme load (thousands of ratings per second), don't update the places table instantly. Write ratings to a fast "buffer" table (or Redis) and run a background worker every minute to sync the aggregates to the places table.

### 4. Handling "Edits"

If a user changes their 3-star rating to a 5-star rating, your logic needs to subtract the old value before adding the new one.

```sql
-- Logic for an update
UPDATE places
SET
    rating_sum = rating_sum - old_rating + new_rating,
    avg_rating = (rating_sum - old_rating + new_rating)::numeric / rating_count
WHERE id = target_place_id;
```

Another option to avoid race condition is using postgres function

### 1. The Trigger Function

This function contains the logic. It handles three scenarios: inserting a new review, updating an existing review (changing stars), and deleting a review.

```sql
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE places
        SET
            rating_count = rating_count + 1,
            rating_sum = rating_sum + NEW.rating,
            avg_rating = (rating_sum + NEW.rating)::NUMERIC / (rating_count + 1)
        WHERE id = NEW.place_id;

    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE places
        SET
            rating_sum = rating_sum - OLD.rating + NEW.rating,
            avg_rating = (rating_sum - OLD.rating + NEW.rating)::NUMERIC / NULLIF(rating_count, 0)
        WHERE id = NEW.place_id;

    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE places
        SET
            rating_count = rating_count - 1,
            rating_sum = rating_sum - OLD.rating,
            avg_rating = CASE
                WHEN (rating_count - 1) = 0 THEN 0
                ELSE (rating_sum - OLD.rating)::NUMERIC / (rating_count - 1)
            END
        WHERE id = OLD.place_id;
    END IF;

    RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql;
```

### 2. The Trigger Bind

Now, we tell PostgreSQL to run that function every time the reviews table changes.

```sql
CREATE TRIGGER trg_update_place_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_place_rating();
```

Why this is the best for Performance & Race Conditions:
Atomic Consistency: Since the UPDATE happens inside the same transaction as the INSERT, Postgres locks the specific row in the places table for a few microseconds. Other updates will wait their turn, ensuring the math is never corrupted.

Zero "App-Level" Latency: Your application doesn't have to wait for the database to send data back, do math in JavaScript/Python, and send it back again. It all happens internally in the engine.

Simple App Code: Your application code becomes a simple, single-line INSERT:
INSERT INTO reviews (place_id, user_id, rating) VALUES (1, 10, 5);
The database handles the rest of the heavy lifting automatically.

Important Note on NULLIF
In the UPDATE and DELETE logic, I used NULLIF(rating_count, 0). This is a safety measure to prevent a Division by Zero error if the last review is deleted or if something goes wrong with the count.
