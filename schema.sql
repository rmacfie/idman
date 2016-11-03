CREATE TABLE accounts (
  id SERIAL PRIMARY KEY NOT NULL,
  created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now()),
  data JSONB NOT NULL
);
CREATE UNIQUE INDEX ON accounts ((lower(data->>'email')));
CREATE UNIQUE INDEX ON accounts ((data->>'emailConfirmationToken'));
CREATE UNIQUE INDEX ON accounts ((data->>'passwordResetToken'));

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY NOT NULL,
  created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now()),
  accountid BIGINT NOT NULL REFERENCES accounts(id),
  expires TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  data JSONB NOT NULL
);
CREATE UNIQUE INDEX ON accounts ((data->>'refreshToken'));

CREATE TABLE logins (
  id SERIAL PRIMARY KEY NOT NULL,
  created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now()),
  sessionid BIGINT NOT NULL REFERENCES sessions(id),
  expires TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  data JSONB NOT NULL
);
CREATE UNIQUE INDEX ON accounts ((data->>'nonce'));
