let vscode = require("vscode");
let path = require("path");
let os = require("os");

function activate(global) {
  console.log('Extension "m68hc11-asm11" activated.');

  let disposable = vscode.commands.registerCommand(
    "m68hc11-asm11.asm11assemble",
    function() {
      let optionStr = "";
      let configuration = vscode.workspace.getConfiguration("m68hc11-asm11");

      if (configuration.get("Listing")) {
        optionStr = optionStr + "l ";
      }

      if (configuration.get("NoListing")) {
        optionStr = optionStr + "nol ";
      }

      if (configuration.get("CrossReference")) {
        optionStr = optionStr + "cre ";
      }

      if (configuration.get("Symbol")) {
        optionStr = optionStr + "s ";
      }

      if (configuration.get("Cycle")) {
        optionStr = optionStr + "c ";
      }

      if (configuration.get("NoCycle")) {
        optionStr = optionStr + "noc ";
      }

      if (optionStr != "") {
        optionStr = "-" + optionStr;
      }

      let applicationPath = configuration.get("Asm11Path");
      let commandPath = applicationPath + path.sep + "asm11";
      let listingExtension = configuration.get("ListingExtension"); 
      let srcPath = vscode.window.activeTextEditor.document.fileName;
      let srcDir = path.dirname(srcPath);
      let extName = path.extname(srcPath);
      let baseName = path.basename(srcPath, extName);
      let listingStr = "> " + baseName + listingExtension;

      if (extName.toLowerCase() == ".s" || extName.toLowerCase() == ".asm") {
        let platformStr = os.platform();
        if(platformStr == "win32"){ // windows10 + WSL + Ubuntu
          commandPath = commandPath.replace(/\\/g, "/");
          let commandArg = baseName + extName + " " + optionStr + " " + listingStr;
          let commandStr = "bash.exe -c '" + commandPath + " " + commandArg  +" '";
  
          const { exec } = require("child_process");
          let cp = exec(
              commandStr,
              { cwd: srcDir }
          );
          // show cp stderr
          cp.stderr.on('data', (data) => {
            vscode.window.showErrorMessage(`asm11 stderr: ${data}`);
          });
          // show command
          vscode.window.showInformationMessage("asm11: " + commandStr);
        }else{ // darwin / linux
          const { spawn } = require("child_process");
          let cp = spawn(
            commandPath,
            [baseName + extName, optionStr, listingStr],
            { cwd: srcDir, shell: true }
          );
          // show cp stderr
          cp.stderr.on('data', (data) => {
            vscode.window.showErrorMessage(`asm11 stderr: ${data}`);
          });
          // show command
          vscode.window.showInformationMessage(
            "asm11: " + commandPath + " " + baseName + extName + " " + optionStr + " " + listingStr
          );
        }
      }else{
        // show 'wrong source extension' error mesg
        vscode.window.showErrorMessage("asm11: not a source file");
      }
    }
  );
}
exports.activate = activate;

function deactivate() {}
