@echo off
:: BatchGotAdmin
:-------------------------------------
REM  --> Check for permissions
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
REM --> If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )
:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params = %*:"=""
    echo UAC.ShellExecute "cmd.exe", "/c %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B
:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
:--------------------------------------
set SERVICE_NAME=powerpcu_export

sc stop %SERVICE_NAME%
sc delete %SERVICE_NAME%
REM Install the service
"%~dp0nssm_2.24_win64.exe" install %SERVICE_NAME% "%~dp0powerpcu_export.exe"
REM Configure stdout log
"%~dp0nssm_2.24_win64.exe" set %SERVICE_NAME% AppStdout "%~dp0powerpcu_export_stdout.log"
"%~dp0nssm_2.24_win64.exe" set %SERVICE_NAME% AppStdoutCreationDisposition 4
REM Configure stderr log
"%~dp0nssm_2.24_win64.exe" set %SERVICE_NAME% AppStderr "%~dp0powerpcu_export_stderr.log"
"%~dp0nssm_2.24_win64.exe" set %SERVICE_NAME% AppStderrCreationDisposition 4
REM Set rotation settings (optional)
"%~dp0nssm_2.24_win64.exe" set %SERVICE_NAME% AppRotateFiles 1
"%~dp0nssm_2.24_win64.exe" set %SERVICE_NAME% AppRotateOnline 1
"%~dp0nssm_2.24_win64.exe" set %SERVICE_NAME% AppRotateBytes 1048576

REM Set restart delay to 1 day
"%~dp0nssm_2.24_win64.exe" set %SERVICE_NAME% AppRestartDelay 21600000 
echo Service installed and configured with logging and 6 hours restart delay.
REM Open the service in the Services control panel

sc start %SERVICE_NAME%

timeout /t 10

start http://localhost:8765/
