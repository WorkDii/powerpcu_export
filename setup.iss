[Setup]
AppName=powerpcu_export
AppVersion=2.1
WizardStyle=modern
DefaultDirName={autopf}\powerpcu_export
DefaultGroupName=powerpcu_export
OutputDir=userdocs:Inno Setup Examples Output
OutputBaseFilename=powerpcu_export_installer
DisableDirPage=no
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\powerpcu_export.exe
UninstallDisplayName=powerpcu_export
Uninstallable=yes
LicenseFile=License.md

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "License.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\powerpcu_export"; Filename: "{app}\powerpcu_export.exe"
Name: "{group}\Uninstall powerpcu_export"; Filename: "{uninstallexe}"

[Code]
var
  DownloadPage: TDownloadWizardPage;

function OnDownloadProgress(const Url, FileName: String; const Progress, ProgressMax: Int64): Boolean;
begin
  if Progress = ProgressMax then
    Log(Format('Successfully downloaded file to {tmp}: %s', [FileName]));
  Result := True;
end;

procedure InitializeWizard;
begin
  DownloadPage := CreateDownloadPage(SetupMessage(msgWizardPreparing), SetupMessage(msgPreparingDesc), @OnDownloadProgress);
  DownloadPage.ShowBaseNameInsteadOfUrl := True;
end;

function NextButtonClick(CurPageID: Integer): Boolean;
var
  ResultCode: Integer;
begin
  if CurPageID = wpReady then begin
    // Stop the existing service before proceeding with the installation
    Exec(ExpandConstant('{sys}\sc.exe'), 'stop powerpcu_export', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    
    DownloadPage.Clear;
    DownloadPage.Add('https://pub-ad366a81dae24982a3481dcb62150168.r2.dev/powerpcu_export.zip', 'powerpcu_export.zip', '');
    DownloadPage.Show;
    try
      try
        DownloadPage.Download; // This downloads the files to {tmp}
        Result := True;
      except
        if DownloadPage.AbortedByUser then
          Log('Aborted by user.')
        else
          SuppressibleMsgBox(AddPeriod(GetExceptionMessage), mbCriticalError, MB_OK, IDOK);
        Result := False;
      end;
    finally
      DownloadPage.Hide;
    end;
  end else
    Result := True;
end;

function OpenFolderOrWebsite(Param: string): string;
var
  ErrorCode: Integer;
begin
  ShellExec('open', Param, '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode);
  Result := '';
end;

// Uninstall code
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  mRes : integer;
  ResultCode: Integer;
begin
  case CurUninstallStep of
    usUninstall:
      begin
        // Stop and delete the service
        Exec(ExpandConstant('{sys}\sc.exe'), 'stop powerpcu_export', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
        Exec(ExpandConstant('{sys}\sc.exe'), 'delete powerpcu_export', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
        
        mRes := MsgBox('Do you want to remove all user data?', mbConfirmation, MB_YESNO or MB_DEFBUTTON2)
        if mRes = IDYES then
        begin
          DelTree(ExpandConstant('{app}\UserData'), True, True, True);
        end;
      end;
    usPostUninstall:
      begin
        if DirExists(ExpandConstant('{app}')) then
        begin
          if MsgBox('Do you want to remove the installation directory?', mbConfirmation, MB_YESNO or MB_DEFBUTTON2) = IDYES then
          begin
            DelTree(ExpandConstant('{app}'), True, True, True);
          end;
        end;
      end;
  end;
end;

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Run]
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -Command ""Expand-Archive -Path '{tmp}\powerpcu_export.zip' -DestinationPath '{app}' -Force"""; Flags: runhidden
Filename: "{cmd}"; Parameters: "/c start """" ""{app}"""; Flags: nowait skipifsilent
Filename: "{app}\installService.bat"; Flags: waituntilterminated runascurrentuser postinstall; Description: "Install Service"