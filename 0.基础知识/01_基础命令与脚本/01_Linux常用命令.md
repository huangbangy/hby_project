# Linux 常用命令

> 从 `0_知识大杂烩` 按原始行号拆分，内容未做语义改写。

## 原始行 2-0

1：常用命令
<!-- markdownlint-disable MD012 -->
/sys/bus/按物理连接分类（PCI/I2C/USB），/sys/class/按功能分类（hwmon/net/block），/sys/devices/是真实物理拓扑，bus和class下都是指向devices的软链接。同一个设备从不同维度看会出现在不同位置。

## 原始行 55-0

52)smartctl -a /dev/sda 可以读磁盘温度sn号等
51)Nohup test.sh & 可以让该脚本在后台进行
50)	dmidecode -t memory |grep -i size 可以查看内存的大小
49)	vim使用：2yy y2w
48)	fdisk -l /dev/sda
47)	ldconfig的主要用途：默认搜寻/lilb和/usr/lib，以及配置文件/etc/ld.so.conf内所列的目录下的库
46)	setsid命令可以让程序在后台执行
45)	dmidecode -t bios 可以看bios的版本
44)	环境变量，当前进程和子进程都会生效，但是换用户就不行
43)	id -u 打印当前的uid号
42)	modprobe i2c-i801 加载驱动
41)	ping -c 10 191.168.25.32 可以ping10次191.168.25.32
40)	du -h phonenum.txt 查看该文件的大小
39)ls /sys/bus/i2c/devices/ 查看系统上存在的 i2c 总线及其设备地址
38)	mkfs.ext4 清空u盘
37)date -s 2026-04-14 设置系统时钟
36)	reboot-f 强制重启
35)	free –h 可以看内存的总数，已经使用的内存数，和完全空闲的内存
34)	sed –i ‘s/aaa/bbb’ /home/1.txt 也就是把1.txt里面带有aaa的字眼替换为bbb
33)	dd if /dev/zero of = /dev/sdb 往sdb这块硬盘0的东西，看能否写进去
32)（切记-name 需要加- 不然会去找name这个关键词）
31)find 可以用来查询具体的文件（应该需要加路径），但是which用来查命令
30)	find 和which的区别，find / -name env_config.sh ,which ENVmonitor
29)	lsblk 查看分区挂载情况
28)	ifup eth0  ifup命令用于激活指定的网络接口。
27)du * -sh 看具体文件的大小
26)	system timer set poweron=22:01 poweroff= 定时关机
25)	cat /var/log/messages |grep -C 5 fault_time 查询fault_time 前五句
24)	grep -A 10找该查询语句后10条
23)	grep -v  xxx 显示不包含xxx字段的段
22)df –h 可以看文件系统各磁盘使用情况(注：根目录满需注意)
21)dmidecode | grep  Size 看内存大小，最下面数据是内存条大小
20)cat /proc/cpuinfo | grep processor 查看cpu是几核
19)cat /proc/cpuinfo |grep name cpu的类型名字
18)uname -r 找到内核版本
17)rm -rf 不做提示删除整个目录
16)du -h --max-depth=1列出目录中文件大小
15)cat /var/log/message 查看日志
14)df显示磁盘占用情况
13)mpstat 查看cpu利用率
12)tar xzvf  usr.tar.gz  把usr.tar.gz 解压出来
11)tar czvf usr.tar.gz /home 把home的全部东西打包压缩
10)chmod +x * 全部都赋予权限
9)pstree 可以看进程树
8)tree 可以看目录分支
7)systemctl reboot 重启，保存文件更安全的重启
6)tail -f /var/log/message 从尾部看新增的日志
5)which kill_monitor.sh 查找.sh脚本在哪
4)卸载用unmount
3)挂载u盘可以获取里面文件：mount /dev/sda2
2)grep -v xxx就是查询没有xxx的字段
1)ll /sys/block | grep usb 看是否插了u盘
1.1	常用linux命令
1：常用命令
<!-- markdownlint-disable MD012 -->
/sys/bus/按物理连接分类（PCI/I2C/USB），/sys/class/按功能分类（hwmon/net/block），/sys/devices/是真实物理拓扑，bus和class下都是指向devices的软链接。同一个设备从不同维度看会出现在不同位置。

