# SSH 密钥配置步骤

## 1. 生成密钥对

```powershell
ssh-keygen -t rsa -b 4096 -C "tianxuan3"
```

三个问题依次输入：

1. 保存路径 → `C:\Users\Payours/.ssh/tianxuan3`（不要用默认 id\_rsa，避免覆盖 GitHub 密钥）
2. passphrase → 直接回车
3. confirm passphrase → 直接回车

生成后：

```
C:\Users\Payours\.ssh\
  ├─ tianxuan3      ← 私钥（留本地）
  └─ tianxuan3.pub  ← 公钥（装服务器）
```

***

## 2. 公钥装到服务器

```powershell
type C:\Users\Payours\.ssh\tianxuan3.pub | ssh root@database.payours.me "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

> 这一步要输入一次服务器密码，装完就不用了。

***

## 3. 测试免密

```powershell
ssh -i C:\Users\Payours\.ssh\tianxuan3 root@database.payours.me "echo OK"
```

直接输出 `OK` 且不问密码 → 成功。

***

## 4. 配置 SSH config（免去每次写 -i）

创建文件 `C:\Users\Payours\.ssh\config`，内容：

```
Host blog database.payours.me
    HostName database.payours.me
    User root
    IdentityFile ~/.ssh/tianxuan3
```

之后两种写法都能免密：

```powershell
ssh blog
ssh root@database.payours.me
```

***

## 5. 验证配置完成

**验证 ssh 别名：**
```powershell
ssh blog "echo SSH别名 OK"
```

**验证 IP 直连：**
```powershell
ssh root@database.payours.me "echo IP直连 OK"
```

**验证 scp 上传：**
```powershell
echo "test file" > test.txt
scp test.txt blog:/tmp/
ssh blog "cat /tmp/test.txt && rm /tmp/test.txt"
rm test.txt
```

三条命令都不提示密码 → 全部配置成功 ✅

***

## 密钥文件位置

| 文件        | 路径                                    |
| --------- | ------------------------------------- |
| 私钥        | `C:\Users\Payours\.ssh\tianxuan3`     |
| 公钥        | `C:\Users\Payours\.ssh\tianxuan3.pub` |
| config    | `C:\Users\Payours\.ssh\config`        |
| GitHub 私钥 | `C:\Users\Payours\.ssh\id_rsa`        |
| GitHub 公钥 | `C:\Users\Payours\.ssh\id_rsa.pub`    |

