#! /bin/sh
REDIRECT_STATUS=1 export REDIRECT_STATUS
SCRIPT_FILENAME=$(pwd)/index.php export SCRIPT_FILENAME
#exec $SCRIPT_FILENAME 2>&1
/usr/bin/php-cgi -d open_basedir=none -d safe_mode_exec_dir="" $SCRIPT_FILENAME 2>&1
