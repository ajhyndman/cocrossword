# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.18.2
# Adjust YARN_VERSION as desired
ARG YARN_VERSION=4.10.3

FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Remix"

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

# Install node modules
COPY --link package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# Copy application code
COPY --link . .

# Build application
RUN yarn run build

# Remove development dependencies
RUN yarn workspaces focus --production


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "yarn", "serve" ]
