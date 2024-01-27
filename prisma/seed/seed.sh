#!/bin/sh
set -ex

npx ts-node ./prisma/seed/seed.ts
mysql -u root -p tRicketDev < ./prisma/seed/dbV2.sql

