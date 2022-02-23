# mystartup

mystartup is a sequential startup launcher for Windows.

mystartup 是 Windows 下的顺序启动器。

### Usage | 用法

List the tasks in `mystartup.txt` with syntax:

把任务列在 `mystartup.txt` 中，语法：

```
<FilePaht>|[ProcessSig]|[Wait-ms
```

example:

示例：

```
D:\GreenSoftWares\DNS\dnscrypt-proxy\dnscrypt-proxy.bat|dnscrypt-proxy.exe|2000
D:\GreenSoftWares\Proxy\ezx-pac\ezx-pac_auto-pac.bat|ezx-pac_auto-pac.js|1000
D:\GreenSoftWares\procexp64.exe||3000
"C:\Program Files\Microsoft Office 15\root\office15\outlook.exe"
```

### Homepage | 主页

https://github.com/lifenjoiner/mystartup
