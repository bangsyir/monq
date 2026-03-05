-- Drop the trigger and function
DROP TRIGGER IF EXISTS trg_update_place_rating ON reviews;
DROP FUNCTION IF EXISTS update_place_rating();

-- Drop the unique constraint (will be handled by app code)
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_place_user_unique;
