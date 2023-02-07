#!/bin/sh

set -e
set -u

create_user_and_database() {
    database=$1
    echo "  Creating user and database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER $database;
    CREATE DATABASE $database;
    GRANT ALL PRIVILEGES ON DATABASE $database TO $database;
EOSQL
}

create_extensions() {
    database=$1
    echo "  Creating extensions for '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$database" <<-EOSQL
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "public";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA "public";
    CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA "public";
    CREATE SCHEMA IF NOT EXISTS "auth";
    CREATE SCHEMA IF NOT EXISTS "public";
    CREATE SCHEMA IF NOT EXISTS "directus";
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo "$POSTGRES_MULTIPLE_DATABASES" | tr ',' ' '); do
        # create_user_and_database "$db"
        create_extensions "$db"
    done
    echo "Multiple databases created"
fi
