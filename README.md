# idman

## Database

    CREATE USER idman WITH PASSWORD 'secret';
    CREATE DATABASE idman OWNER idman;

    CREATE TABLE accounts (
      id SERIAL PRIMARY KEY NOT NULL,
      created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now()),
      data JSONB NOT NULL
    );
    CREATE UNIQUE INDEX ON accounts ((lower(data->>'email')));
