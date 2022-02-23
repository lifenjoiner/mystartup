$WshShell   = new ActiveXObject('WScript.Shell');
$cmd        = function(s){return /*controllable*/ $WshShell.Exec(s);}
$run        = function(s,t,r){return $WshShell.Run(s, t?t:10, r?r:false); /*?!url*/}
/*******/
try{WScript.StdOut.WriteLine()}catch(e){ //^_^ CLI. compiled?
    $run('cscript.exe //nologo "'+ WScript.ScriptFullName +'"');
    WScript.Quit();
}
//
$in     = WScript.StdIn;
$out    = WScript.StdOut;
$err    = WScript.StdErr;
$NonOEM = /[\uD800-\uDFFF]/g;
$echo   = function(s, f){if(!f)f=$out; try{f.Write(s)}catch(e){s=s.replace($NonOEM,'?');f.Write(s)}}
$msg    = function(s, f){$echo(s+'\n', f)}
$argv   = WScript.Arguments;
$is_dbg = $argv.Named.Exists('d');
$dsg    = function(s, f){if($is_dbg)$msg(s, f)}
$show_err   = function(e){$msg(e.name +': '+ e.message, $err)}
//
$fso = new ActiveXObject('Scripting.FileSystemObject');
//
$textstream = function(p,m,n,t){return $fso.OpenTextFile(p, m?m:1, n?n:false, t?t:0)}
$newstream  = function(p,t){return $textstream(p, 2, true, t?t:0)}
$getstream_r  = function(p,t){return $textstream(p, 1, false, t?t:0)}
//
$readall= function(p, t) {
    // t, 0:ANSI, -1:unicode, -2:system
    var f, r = '';
    try {
        f = $getstream_r(p, t?t:0);
        r = f.ReadAll();
        f.Close();
    }
    catch (e) {}
    return r;
}
/*******/

$wsomc2array = function(C) {
    // WSH OM collection and enumerator are sh*t
    var A = [];
    try {
        var E = new Enumerator(C); // {} errors on win10 with new jscript engine
        for (; !E.atEnd(); E.moveNext()) {
            A.push(E.item());
        }
    } catch(e) {$show_err(e)}
    return A;
}
/*******/

// https://docs.microsoft.com/en-us/windows/desktop/CIMWin32Prov/win32-process
// https://docs.microsoft.com/en-us/windows/desktop/WmiSdk/wql-sql-for-wmi
function get_processes_by_path_or_caption(sig_str) {
    var wbemFlagReturnImmediately = 0x10;
    var wbemFlagForwardOnly = 0x20;
    //
    var objWMIService = GetObject("winmgmts:\\\\.\\root\\CIMV2");
    $dsg(sig_str);
    sig_str = sig_str.replace(/"/g, '');
    sig_str = sig_str.replace(/\\/g, '\\\\');
    // CommandLine could be empty!
    // process name, path, param (start, scripts)
    var qry_str = 'SELECT * FROM Win32_Process Where Name = "'+ sig_str +'" Or ExecutablePath = "'+ sig_str +'" Or CommandLine Like "%[ \\\\]'+ sig_str +'%"';
    $dsg(qry_str);
    var colItems = objWMIService.ExecQuery(qry_str, "WQL", wbemFlagReturnImmediately | wbemFlagForwardOnly);
    //
    return $wsomc2array(colItems);
}
/*******/

// commands|test-str|sleep-ms
var tasks = $readall(WScript.ScriptFullName.replace(".js", ".txt"));
tasks = tasks.replace(/\r/g, '\n');
tasks = tasks.replace(/\n+/g, '\n');
var o_tasks = tasks.split('\n');
for (var i = 0; i < o_tasks.length; i++) {
    var task = o_tasks[i];
    var o_task = task.split('|');
    o_task[0] = o_task[0].replace(/^\s|\s$/g, '');
    if (o_task[0] != '') {
        $msg(o_task[0]);
        var sig = '';
        if (o_task.length > 1) {
            o_task[1] = o_task[1].replace(/^\s|\s$/g, '');
            sig = o_task[1];
        }
        if (sig == '') {
            sig = o_task[0];
        }
        if (get_processes_by_path_or_caption(sig).length > 0) {
            $msg('running ...');
        }
        else {
            try {
                var dir = o_task[0].replace(/"/g, '').replace(/[^/\\]+$/g, '');
                if (dir != "") {
                    $WshShell.CurrentDirectory = dir;
                }
                $run(o_task[0], 6);
            }
            catch (e) {
                $show_err(e);
            }
            if (o_task.length > 2) {
                var n = parseInt(o_task[2]);
                $msg('wait '+ n + 'ms');
                WScript.Sleep(n);
            }
        }
        $msg('');
    }
}
