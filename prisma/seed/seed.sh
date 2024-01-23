#!/bin/sh
set -ex
mysql -u root -p tRicketDev < ./prisma/seed/dbV2.sql

