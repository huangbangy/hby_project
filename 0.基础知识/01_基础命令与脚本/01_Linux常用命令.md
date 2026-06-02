# Linux 常用命令

这份笔记按使用场景整理。需要进一步查语法时，再用 `man <command>` 或 `<command> --help`。

## 系统与硬件信息

| 命令 | 用途 | 备注 |
| --- | --- | --- |
| `uname -r` | 查看当前内核版本 | 编译内核模块时经常用 |
| `cat /proc/cpuinfo | grep 'model name'` | 查看 CPU 型号 | 不同系统字段可能略有差异 |
| `cat /proc/cpuinfo | grep processor` | 查看 CPU 逻辑核编号 | 也可用 `nproc` |
| `free -h` | 查看内存使用情况 | 快速判断可用内存 |
| `dmidecode -t memory | grep -i size` | 查看内存条容量 | 需要 root 权限 |
| `dmidecode -t bios` | 查看 BIOS 信息 | 可看版本和厂商 |
| `mpstat` | 查看 CPU 利用率 | 可能需要安装 `sysstat` |
| `id -u` | 查看当前用户 UID | root 通常为 `0` |

## 磁盘、文件系统与容量

| 命令 | 用途 | 备注 |
| --- | --- | --- |
| `df -h` | 查看各文件系统空间占用 | 根目录满时优先看这里 |
| `du -h --max-depth=1` | 查看当前目录下一级目录大小 | 定位哪个目录占空间 |
| `du * -sh` | 查看当前目录每个文件/目录大小 | 简洁版容量排查 |
| `du -h phonenum.txt` | 查看单个文件大小 | 文件名替换成目标文件 |
| `lsblk` | 查看磁盘、分区、挂载关系 | 插 U 盘、看分区常用 |
| `ll /sys/block | grep usb` | 粗略判断是否有 USB 块设备 | 依赖系统设备命名 |
| `fdisk -l /dev/sda` | 查看指定磁盘分区表 | 不要误操作写入 |
| `smartctl -a /dev/sda` | 查看磁盘 SMART 信息 | 可看温度、SN、健康状态 |
| `mount /dev/sda2 /mnt` | 挂载分区 | 目标目录需存在 |
| `umount /mnt` | 卸载挂载点 | 命令是 `umount`，不是 `unmount` |

## 日志、查找与文本处理

| 命令 | 用途 |
| --- | --- |
| `tail -f /var/log/messages` | 实时追踪新增日志 |
| `cat /var/log/messages` | 查看系统日志内容 |
| `cat /var/log/messages | grep -C 5 fault_time` | 查看匹配行前后 5 行 |
| `grep -v xxx file` | 显示不包含 `xxx` 的行 |
| `grep -A 10 xxx file` | 显示匹配行之后 10 行 |
| `grep -w xxx file` | 按完整单词匹配 |
| `find / -name env_config.sh` | 按文件名全局查找 |
| `which kill_monitor.sh` | 查命令或脚本路径 |
| `sed -i 's/aaa/bbb/g' /home/1.txt` | 原地替换文件内容 |

## 进程、后台与重启

| 命令 | 用途 | 备注 |
| --- | --- | --- |
| `pstree` | 查看进程树 | 适合看父子进程关系 |
| `setsid ./test.sh` | 让程序脱离当前终端执行 | 常用于后台任务 |
| `nohup ./test.sh &` | 后台运行并忽略挂断信号 | 输出默认进 `nohup.out` |
| `./1.sh &` | 将脚本放到后台运行 | 仍可能受终端关闭影响 |
| `systemctl reboot` | 通过 systemd 重启系统 | 相对正常的重启方式 |
| `reboot -f` | 强制重启 | 谨慎使用 |
| `date -s '2026-04-14'` | 设置系统时间 | 会影响日志和证书判断 |

## 网络、驱动与系统库

| 命令 | 用途 |
| --- | --- |
| `ping -c 10 192.168.25.32` | Ping 10 次指定 IP |
| `ifup eth0` | 激活指定网络接口 |
| `modprobe i2c-i801` | 加载内核模块 |
| `ls /sys/bus/i2c/devices/` | 查看系统上的 I2C 总线和设备 |
| `ldconfig` | 更新动态库缓存 |

## 压缩、权限与编辑

| 命令 | 用途 |
| --- | --- |
| `chmod +x *` | 给当前目录文件增加可执行权限 |
| `tar czvf usr.tar.gz /home` | 打包并压缩 `/home` |
| `tar xzvf usr.tar.gz` | 解压 `.tar.gz` 文件 |
| `tree` | 查看目录树 |
| `vim` 中 `2yy` | 复制两行 |
| `vim` 中 `y2w` | 复制两个单词 |

## 高风险命令

这些命令会改磁盘、删文件或重启系统，执行前最好确认设备名和路径。

| 命令 | 风险 |
| --- | --- |
| `rm -rf <dir>` | 不提示删除目录，路径写错会直接清空 |
| `dd if=/dev/zero of=/dev/sdb` | 向磁盘写零，可能破坏数据 |
| `mkfs.ext4 /dev/sdX` | 格式化分区或磁盘 |
| `reboot -f` | 强制重启，可能导致数据未落盘 |
| `date -s ...` | 修改系统时间，可能影响业务判断 |

## 常用组合

```bash
# 查看某个关键词附近日志
cat /var/log/messages | grep -C 5 fault_time

# 统计去重后的行数
sort -u phonenum.txt | wc -l

# 找出当前目录下最占空间的一级目录
du -h --max-depth=1 | sort -h

# 查看磁盘基础信息和健康状态
lsblk
smartctl -a /dev/sda
```
