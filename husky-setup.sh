#!/bin/sh
[ -d '.husky' ] && husky || mkdir .husky && husky

echo 'npx --no-install commitlint --edit $1' > .husky/commit-msg

echo 'npm run pre-commit' > .husky/pre-commit

echo 'npm run pre-push' > .husky/pre-push
