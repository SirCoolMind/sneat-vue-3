@echo off
set SERVER_USER=root
set SERVER_IP=hafiz.day
set SERVER_DIR=/var/www/sneat-vue-3
set LOCAL_FILE=vuetemplate.tar.gz

:: Generate date in DDMMYYYY format using PowerShell
for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToString('ddMMyyyy')"') do set DATE=%%I
:: Define backup file name
set BACKUP_FILE=dist_%DATE%

echo Delete old %LOCAL_FILE% on server
ssh %SERVER_USER%@%SERVER_IP% "cd %SERVER_DIR% && rm -r %LOCAL_FILE%"

echo Uploading %LOCAL_FILE% to %SERVER_USER%@%SERVER_IP%:%SERVER_DIR%
scp %LOCAL_FILE% %SERVER_USER%@%SERVER_IP%:%SERVER_DIR%

echo Extracting %LOCAL_FILE% on server and creating backup
ssh %SERVER_USER%@%SERVER_IP% "cd %SERVER_DIR%  && if [ ! -f %BACKUP_FILE%.tar.gz ]; then echo Backup file %BACKUP_FILE% created; tar -czf %BACKUP_FILE%.tar.gz dist; else echo Backup file %BACKUP_FILE% already exists. Skipping backup; fi && rm -r dist && tar xzvf %LOCAL_FILE% > /dev/null 2>&1"

echo Deployment complete!
exit
