SELECT 'CREATE DATABASE geo;' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'geo');
SELECT 'CREATE DATABASE thchemical;' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'thchemical');
