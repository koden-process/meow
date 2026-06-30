#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CONTAINER_NAME="${MEOW_LOCAL_MONGO_CONTAINER:-meow-local-restore}"
VOLUME_NAME="${MEOW_LOCAL_MONGO_VOLUME:-meow-local-restore-data}"
MONGO_IMAGE="${MEOW_LOCAL_MONGO_IMAGE:-mongo:7.0.34}"
HOST_PORT="${MEOW_LOCAL_MONGO_PORT:-27018}"
SOURCE_DATABASE="${MEOW_LOCAL_MONGO_SOURCE_DB:-test}"
TARGET_DATABASE="${MEOW_LOCAL_MONGO_TARGET_DB:-meow_local_restore}"
MONGODB_URI="mongodb://127.0.0.1:${HOST_PORT}/${TARGET_DATABASE}"

ARCHIVE_PATH=""
REPLACE=false
CREATED_RESOURCES=false

usage() {
  cat <<'USAGE'
Usage:
  restore-local-mongodb-archive.sh --archive /path/to/backup.archive.gz [--replace]

Options:
  --archive PATH  Gzipped archive produced by mongodump --archive --gzip.
  --replace       Delete and recreate only the dedicated local container and volume.
  --help          Show this help.

Optional environment variables:
  MEOW_LOCAL_MONGO_CONTAINER  Container name (default: meow-local-restore)
  MEOW_LOCAL_MONGO_VOLUME     Volume name (default: meow-local-restore-data)
  MEOW_LOCAL_MONGO_IMAGE      MongoDB image (default: mongo:7.0.34)
  MEOW_LOCAL_MONGO_PORT       Loopback port (default: 27018)
  MEOW_LOCAL_MONGO_SOURCE_DB  Database name in the archive (default: test)
  MEOW_LOCAL_MONGO_TARGET_DB  Restored database name (default: meow_local_restore)
USAGE
}

fail() {
  echo "Error: $*" >&2
  exit 1
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

resource_exists() {
  docker "$1" inspect "$2" >/dev/null 2>&1
}

cleanup_on_error() {
  local status=$?
  trap - EXIT

  if [[ $status -ne 0 && "$CREATED_RESOURCES" == true ]]; then
    echo "Restore failed; removing the incomplete dedicated container and volume." >&2
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker volume rm "$VOLUME_NAME" >/dev/null 2>&1 || true
  fi

  exit "$status"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --archive)
      [[ $# -ge 2 ]] || fail "--archive requires a path."
      ARCHIVE_PATH="$2"
      shift 2
      ;;
    --replace)
      REPLACE=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

[[ -n "$ARCHIVE_PATH" ]] || fail "--archive is required."
[[ -r "$ARCHIVE_PATH" ]] || fail "Archive is not readable: $ARCHIVE_PATH"
[[ "$HOST_PORT" =~ ^[0-9]+$ ]] || fail "MEOW_LOCAL_MONGO_PORT must be numeric."

command_exists docker || fail "Docker is required."
command_exists gzip || fail "gzip is required."
command_exists node || fail "Node.js is required."

docker info >/dev/null 2>&1 || fail "Docker is not running."
gzip -t "$ARCHIVE_PATH" || fail "The gzip archive is corrupted."

if resource_exists container "$CONTAINER_NAME" || resource_exists volume "$VOLUME_NAME"; then
  if [[ "$REPLACE" != true ]]; then
    fail "Dedicated local data already exists. Re-run with --replace to recreate it."
  fi

  echo "Removing the previous dedicated local restore..."
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  if resource_exists volume "$VOLUME_NAME"; then
    docker volume rm "$VOLUME_NAME" >/dev/null \
      || fail "The dedicated volume $VOLUME_NAME could not be removed."
  fi
fi

if command_exists lsof && lsof -nP -iTCP:"$HOST_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  fail "Port $HOST_PORT is already in use."
fi

trap cleanup_on_error EXIT

docker image inspect "$MONGO_IMAGE" >/dev/null 2>&1 || docker pull "$MONGO_IMAGE"
docker volume create "$VOLUME_NAME" >/dev/null
CREATED_RESOURCES=true

docker run -d \
  --name "$CONTAINER_NAME" \
  --mount "type=volume,source=${VOLUME_NAME},target=/data/db" \
  --publish "127.0.0.1:${HOST_PORT}:27017" \
  "$MONGO_IMAGE" >/dev/null

echo "Waiting for MongoDB in $CONTAINER_NAME..."
ready=false
for _ in {1..60}; do
  if docker exec "$CONTAINER_NAME" mongosh --quiet --eval \
    'quit(db.adminCommand({ ping: 1 }).ok === 1 ? 0 : 1)' >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done
[[ "$ready" == true ]] || fail "MongoDB did not become ready within 60 seconds."

restore_arguments=(
  --uri="mongodb://127.0.0.1:27017/?directConnection=true"
  --archive
  --gzip
  --stopOnError
  --nsInclude="${SOURCE_DATABASE}.*"
  --nsExclude="${SOURCE_DATABASE}.restore"
  --nsFrom="${SOURCE_DATABASE}.*"
  --nsTo="${TARGET_DATABASE}.*"
)

echo "Validating archive namespaces with mongorestore --dryRun..."
docker run --rm \
  --network "container:${CONTAINER_NAME}" \
  -i "$MONGO_IMAGE" \
  mongorestore "${restore_arguments[@]}" --dryRun < "$ARCHIVE_PATH"

echo "Restoring ${SOURCE_DATABASE}.* into ${TARGET_DATABASE}.*..."
docker run --rm \
  --network "container:${CONTAINER_NAME}" \
  -i "$MONGO_IMAGE" \
  mongorestore "${restore_arguments[@]}" < "$ARCHIVE_PATH"

validation_script='
const requiredCollections = ["Teams", "Users", "Cards", "Accounts", "Lanes", "Schemas"];
const availableCollections = db.getCollectionNames();
const missingCollections = requiredCollections.filter((name) => !availableCollections.includes(name));

if (missingCollections.length > 0) {
  print(`Missing required collections: ${missingCollections.join(", ")}`);
  quit(2);
}

const counts = Object.fromEntries(
  requiredCollections.map((name) => [name, db.getCollection(name).countDocuments()])
);

if (counts.Teams === 0 || counts.Users === 0 || counts.Cards === 0) {
  print(`Required business data is empty: ${JSON.stringify(counts)}`);
  quit(3);
}

function countOrphans(collection, localField, foreignCollection, additionalMatch = {}) {
  const result = db.getCollection(collection).aggregate([
    {
      $match: {
        ...additionalMatch,
        [localField]: { $exists: true, $ne: null }
      }
    },
    {
      $lookup: {
        from: foreignCollection,
        localField,
        foreignField: "_id",
        as: "_matches"
      }
    },
    { $match: { "_matches.0": { $exists: false } } },
    { $count: "count" }
  ]).toArray();

  return result.length === 0 ? 0 : result[0].count;
}

const orphans = {
  cardTeams: countOrphans("Cards", "teamId", "Teams"),
  cardUsers: countOrphans("Cards", "userId", "Users"),
  cardLanes: countOrphans("Cards", "laneId", "Lanes"),
  activeCardUsers: countOrphans(
    "Cards",
    "userId",
    "Users",
    { status: { $ne: "deleted" } }
  ),
  activeCardLanes: countOrphans(
    "Cards",
    "laneId",
    "Lanes",
    { status: { $ne: "deleted" } }
  ),
  userTeams: countOrphans("Users", "teamId", "Teams"),
  accountTeams: countOrphans("Accounts", "teamId", "Teams"),
  laneTeams: countOrphans("Lanes", "teamId", "Teams"),
  schemaTeams: countOrphans("Schemas", "teamId", "Teams")
};

print(JSON.stringify({ counts, orphans }, null, 2));

const blockingOrphans = {
  cardTeams: orphans.cardTeams,
  userTeams: orphans.userTeams,
  accountTeams: orphans.accountTeams,
  laneTeams: orphans.laneTeams,
  schemaTeams: orphans.schemaTeams
};

if (Object.values(blockingOrphans).some((count) => count !== 0)) {
  quit(4);
}

if (orphans.cardUsers !== 0 || orphans.cardLanes !== 0) {
  print(
    "Warning: the source backup contains opportunity references to missing "
      + "users or lanes. They are preserved unchanged in this faithful local copy."
  );
}
'

echo "Checking restored collections and primary references..."
docker exec "$CONTAINER_NAME" \
  mongosh --quiet "$TARGET_DATABASE" --eval "$validation_script"

# The database is complete and validated. Authentication setup errors must not
# delete the restored copy, so destructive cleanup stops here.
trap - EXIT

echo
echo "Select the local login account and set a local-only password."
MONGODB_URI="$MONGODB_URI" node "$SCRIPT_DIR/reset-local-user-password.mjs"

echo
echo "Local restore is ready."
echo "MongoDB URI: $MONGODB_URI"
echo
echo "Backend:"
echo "  export MONGODB_URI='$MONGODB_URI'"
echo "  export SESSION_SECRET='local-dev-secret'"
echo "  cd backend && npm start"
echo
echo "Frontend:"
echo "  export VITE_URL='http://127.0.0.1:9000'"
echo "  unset VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL"
echo "  cd frontend && npm start -- --host 127.0.0.1"
