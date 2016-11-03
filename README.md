# idman

[![CircleCI](https://circleci.com/gh/rmacfie/idman.svg?style=svg)](https://circleci.com/gh/rmacfie/idman)

A backend for managing identities.


## Environment variables

**`POSTGRES_URL`** e.g. `postgres://username:password@localhost:5432/idman`

**`JWT_SECRET`** a long random string for securing JWTs

**`PORT`** the port to listen on, e.g. `80`


## Database

Idman requires access to a Postgresql server.

**Prepare**

    CREATE USER idman WITH PASSWORD 'secret';
    CREATE DATABASE idman OWNER idman;

**Schema**

See the `schema.sql` file.

**Clean**

During development you might want to run the following to reset the data:

    DELETE FROM logins;
    DELETE FROM sessions;
    DELETE FROM accounts;
