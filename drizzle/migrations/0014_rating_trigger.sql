-- Add unique constraint on reviews to prevent duplicate ratings
ALTER TABLE reviews ADD CONSTRAINT reviews_place_user_unique UNIQUE (place_id, user_id);

-- Create the trigger function to update places rating stats
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

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trg_update_place_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_place_rating();
