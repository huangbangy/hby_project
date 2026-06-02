# Linux、GDB 与内核基础

> 从 `0_知识大杂烩` 原始备份按行号整理，内容未做语义改写。

## 原始行 183-230

2.3 Linux知识
2.3.1 pci相关
2.3.1.1 pci相关概念
1）PCI设备的配置空间共由 64个字节组成，其地址范围为 0x00 ~ 0x3F，这 64个字节是所有 PCI设备必须支持的
2.3.1.2 pci相关命令
1)setpci -s 0a:00.0 A0.b=0x01修改 0a:00.0设备配置空间 A0地址处 1字节的内容
2)lspci -tv 看pci设备树状图
2.3.1.2 pci相关速率
lspci -k 可以看出所有pci设备对应的驱动程序

2.3.2 GDB
1．gcc -g -o my_program my_program.c 编译成可gdb的文件
2．gdb my_program		gdb该调试文件
3．break main          # 在main函数开始处设置断点
4．break 25            # 在第 25 行设置断点
5．break my_function   # 在 my_function 函数开始处设置断点
6．run                运行程序
7．Step				   单步执行
2.3.3 linux内核
2.3.3.1 linux内核编译
一、基本概念：
（一）/lib/modules/$(uname -r) 是已编译内核模块的安装目录，而不是内核源代码目录。这个目录包含的是已编译的内核模块文件（.ko 文件），以及其他与内核加载和管理有关的文件。这些文件是在内核编译和安装过程中生成并安装到系统中的。

（二）内核源代码目录通常是 /usr/src/linux 或类似的路径，其中包含了完整的 Linux 内核源代码。这个目录用于开发和构建新的内核模块，或者进行内核的定制和调试


二、步骤：
①　下源码
②　解压
③　安装相应的编译所需的rpm包
④　替换.config文件
⑤　make -j32 bzImage编译

三、Demo代码
[root@localhost Project_HBY]# cat Makefile
obj-m += hello.o

KERNEL_DIR := /driver/linux-5.10/

all:
make -C $(KERNEL_DIR) M=$(PWD) modules

clean:
make -C $(KERNEL_DIR) M=$(PWD) clean

2.3.4 linux目录相关
1．/etc/modprobe.d/目录是用于存放Linux系统中modprobe命令的配置文件的位置。这些配置文件通常用于指定模块加载选项、黑名单、别名等设置，以影响内核模块的加载和管理行为。


## 原始行 732-759

Out of memory: Killed process 612693 (java) total-vm:3315472kB, anon-rss:71852kB, file-rss:0kB, shmem-rss:32kB, UID:0 pgtables:456kB oom_score_adj:0 
可以看到没喂狗杀了哪个进程

nm ko | grep 函数 看看有没双控得

top -hp可以看进程的线程函数



cat maps 可以看进程的内存映射地址

kdb使用



fsck.ext4 -y /dev/md126p3. 非V3设备就是md126p2

cat /proc/meminfo



openstack


smartctl -a /dev/sda
可以看系统卡的fwver版本

cpu占用率过高引起cpu的温度过高可以用top看

## 原始行 804-805

Call Trace可以看出是否堆栈
堆栈信息的最后一行是 Call Trace:，接下来的几行是函数调用栈，每一行都是一个函数调用，最上面的是发生错误的函数，最下面的是最开始的函数。

## 原始行 839-842

linux 不包含 .ko 文件：
vmlinux 是静态编译的内核，仅包含在编译时直接编译进内核的功能（CONFIG_* 设置为 y 的选项）。
.ko 是动态模块（CONFIG_* 设置为 m 的选项），独立于 vmlinux，需要在运行时通过 insmod 或 modprobe 加载。


## 原始行 929-940

ioremap是Linux内核中用于建立IO内存映射的关键函数。它的主要作用是将设备的物理地址映射到内核的虚拟地址空间，使得内核能够通过访问内存的方式来访问设备寄存器或内存。

作用和目的：

提供统一的访问接口：通过ioremap，驱动程序可以像操作普通内存一样操作设备寄存器

实现物理地址到虚拟地址的转换：在支持MMU的系统中，CPU访问的是虚拟地址，需要将设备物理地址映射到虚拟地址空间

支持缓存和写缓冲控制：可以通过不同的标志控制映射区域的缓存特性

内核启动参数：cat /proc/cmdline
在启动参数中可以看到内存的预留，所以就会导致free -h与实际的物理内存大小不一致的原因

## 原始行 1001-1018

内核编译模块：
make -C /usr/src/kernels/linux-5.4.20 M=/home/lichengjuan/kernel_make/linux-5.4.20/drivers/i2c modules

make -C /usr/src/kernels/linux-5.10.0_hotplug M=/driver/h10235/kernel_make/kernel/drivers/i2c modules


make -C /usr/src/kernels/linux-5.10.0 M=/driver/h10235/kernel_make/kernel/drivers/i2c/ modules
　　"-C"：表示进入指定目录中

　　PWD：获取当前所在路径

　　SUBDIRS=$(PWD)：告诉内核源码到指定目录去编译内核程序

　　clean：执行 make clean 时删除生成的目标文件

du * -sh 看具体文件的大小

make menuconfig 内核最后编译执行这个会出现一个界面

## 原始行 1077-1103

内核符号表的意义
{
	地址解析 让模块能找到内核函数的实际位置
}

cat /proc/kallsyms
可以查看内核符号表

A和B两个程序运行的时候，库的代码分别被加载到两个进程中，那么每个进程中的库代码访问的是各自进程地址空间中的全局变量，所以值不一样是正常的。

kmalloc分配的有两种标志一种是GFP_KERNEL，另一种是GFP_ATOMIC。
GFP_KERNEL：表示可以睡眠的分配方式，适用于进程上下文中使用，可以进行阻塞等待。
GFP_ATOMIC：表示不可睡眠的分配方式，适用于中断上下文或自旋锁保护的代码中，不能进行阻塞等待。
不同的上下文环境下，选择合适的GFP标志非常重要，以确保内核的稳定性和性能。以下是一些常见的上下文类型及其对应的GFP标志：
上下文类型	是否可以休眠	使用的 GFP 标志	原因
上下文类型       | 是否可以休眠 | 使用的 GFP 标志  | 原因
----------------|--------------|------------------|------------------------------
系统调用        | 可以         | GFP_KERNEL       | 代表用户进程，可以调度
内核线程        | 可以         | GFP_KERNEL       | 是真正的进程，可以调度
工作队列        | 可以         | GFP_KERNEL       | 在工作进程上下文中运行
硬件中断        | 不可以       | GFP_ATOMIC       | 打断了任意进程，不是进程上下文
软中断          | 不可以       | GFP_ATOMIC       | 在中断上下文中运行
Tasklet         | 不可以       | GFP_ATOMIC       | 本质是软中断
定时器回调      | 不可以       | GFP_ATOMIC       | 在中断上下文中运行
持有自旋锁      | 不可以       | GFP_ATOMIC       | 休眠会导致死锁
关闭抢占        | 不可以       | GFP_ATOMIC       | 调度被限制


## 原始行 1141-1148

lspci -k 可以查看所有设备对应的驱动程序

可用的内核参数在目录/proc/sys中
vi /etc/sysctl.conf
列
#禁用包过滤功能
net.ipv4.ip_forward = 0 


## 原始行 1162-1174

bootloader：包括很多种，如U-Boot（常用于ARM和嵌入式系统）、GRUB（常用于x86的Linux）、LILO（Linux Loader）、Windows的bootmgr等。

可修改某个中断所绑定的cpu
[root@localhost 165]# pwd
/proc/irq/165
[root@localhost 165]# echo 02 > smp_affinity
[root@localhost 165]#

make -j32 V=1可以看出利用32个核进行编译，同时V=1可以看到具体的编译命令

内核模块相应的启动顺序，pci位于postcore_initcall和arch_initcall之间，pci设备的驱动程序一般会在subsys_initcall阶段被加载，而pci总线的初始化则在postcore_initcall阶段完成。
pure_initcall → core_initcall → postcore_initcall → arch_initcall → 
subsys_initcall → fs_initcall → device_initcall → late_initcall

