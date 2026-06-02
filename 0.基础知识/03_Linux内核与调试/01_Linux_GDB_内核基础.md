# Linux、GDB 与内核基础

这份笔记集中放 Linux 调试、GDB、内核编译、模块和常见排障命令。PCIe 细节放在 [PCIe 基础、BAR 与 MSI](../04_PCIe与硬件/01_PCIe基础_BAR_MSI.md)。

## GDB 基础流程

```bash
gcc -g -o my_program my_program.c
gdb my_program
```

| GDB 命令 | 用途 |
| --- | --- |
| `break main` | 在 `main` 函数处打断点 |
| `break 25` | 在第 25 行打断点 |
| `break my_function` | 在指定函数处打断点 |
| `run` | 运行程序 |
| `step` | 单步进入函数 |
| `next` | 单步但不进入函数 |
| `bt` | 查看调用栈 |

## 内核源码与模块目录

| 路径 | 含义 |
| --- | --- |
| `/lib/modules/$(uname -r)` | 当前内核对应的已安装模块目录，主要是 `.ko` 文件 |
| `/usr/src/linux` 或 `/usr/src/kernels/...` | 常见内核源码或内核头文件目录 |
| `/etc/modprobe.d/` | `modprobe` 配置目录，可设置模块别名、黑名单、加载参数 |

`vmlinux` 是静态编译出的内核镜像，包含直接编进内核的功能。`.ko` 是动态模块，需要运行时通过 `insmod` 或 `modprobe` 加载。

## 内核编译基本步骤

1. 下载内核源码。
2. 解压源码。
3. 安装编译依赖包。
4. 准备或替换 `.config`。
5. 执行编译。

```bash
make -j32 bzImage
make -j32 V=1
make menuconfig
```

- `-j32` 表示使用 32 个并行任务编译。
- `V=1` 可以显示更完整的编译命令。
- `make menuconfig` 会进入内核配置界面。

## 编译单个内核模块

```makefile
obj-m += hello.o

KERNEL_DIR := /driver/linux-5.10/

all:
	make -C $(KERNEL_DIR) M=$(PWD) modules

clean:
	make -C $(KERNEL_DIR) M=$(PWD) clean
```

也可以指定某个内核源码目录和模块目录：

```bash
make -C /usr/src/kernels/linux-5.10.0 M=/driver/h10235/kernel_make/kernel/drivers/i2c modules
```

| 参数 | 含义 |
| --- | --- |
| `-C` | 进入指定内核源码目录执行 make |
| `M=$(PWD)` | 指定外部模块源码目录 |
| `modules` | 编译模块 |
| `clean` | 清理生成文件 |

## 常见内核排障命令

| 命令 | 用途 |
| --- | --- |
| `cat /proc/meminfo` | 查看内存信息 |
| `cat /proc/cmdline` | 查看内核启动参数 |
| `cat /proc/kallsyms` | 查看内核符号表 |
| `nm module.ko | grep <func>` | 查看模块里是否有某个符号 |
| `top -Hp <pid>` | 查看某进程下各线程 CPU 占用 |
| `cat /proc/<pid>/maps` | 查看进程内存映射 |
| `fsck.ext4 -y /dev/md126p3` | 修复 ext4 文件系统 |
| `smartctl -a /dev/sda` | 查看磁盘健康、SN、温度等信息 |

`Call Trace` 是内核异常日志中的调用栈。越靠上通常越接近发生问题的位置，越靠下越接近调用起点。

OOM 日志示例：

```text
Out of memory: Killed process 612693 (java) ...
```

这类日志可以看出系统因为内存不足杀掉了哪个进程。

## `ioremap`

`ioremap` 用于把设备物理地址映射到内核虚拟地址空间，让驱动可以访问设备寄存器或设备内存。

核心作用：

- 把设备物理地址转换成内核可访问的虚拟地址。
- 让驱动可以像访问内存一样访问硬件寄存器。
- 根据不同 API 控制缓存和写缓冲行为。

常见流程：

1. 设备枚举后得到物理 BAR 地址。
2. 驱动调用 `ioremap` 或相关接口映射。
3. 驱动通过 `ioread*`、`iowrite*` 或寄存器指针访问硬件。
4. 退出时释放映射。

## GFP 内存分配标志

| 上下文 | 是否可以休眠 | 常用 GFP 标志 | 原因 |
| --- | --- | --- | --- |
| 系统调用 | 可以 | `GFP_KERNEL` | 代表用户进程，可以调度 |
| 内核线程 | 可以 | `GFP_KERNEL` | 是进程上下文 |
| 工作队列 | 可以 | `GFP_KERNEL` | 在工作进程上下文中运行 |
| 硬件中断 | 不可以 | `GFP_ATOMIC` | 中断上下文不能睡眠 |
| 软中断 | 不可以 | `GFP_ATOMIC` | 中断上下文 |
| Tasklet | 不可以 | `GFP_ATOMIC` | 本质是软中断 |
| 定时器回调 | 不可以 | `GFP_ATOMIC` | 中断上下文 |
| 持有自旋锁 | 不可以 | `GFP_ATOMIC` | 睡眠可能死锁 |
| 关闭抢占 | 不可以 | `GFP_ATOMIC` | 调度受限制 |

## sysctl 与内核参数

可用的内核参数通常可以在 `/proc/sys` 下查看。永久配置常写入 `/etc/sysctl.conf`。

```bash
vi /etc/sysctl.conf

# 示例：禁用包转发
net.ipv4.ip_forward = 0
```

## 中断 CPU 亲和性

可以修改某个中断绑定到哪些 CPU 上：

```bash
cd /proc/irq/165
echo 02 > smp_affinity
```

`smp_affinity` 是位图形式，写入前需要确认目标 CPU 和业务影响。

## 内核 initcall 顺序

常见初始化顺序：

```text
pure_initcall
core_initcall
postcore_initcall
arch_initcall
subsys_initcall
fs_initcall
device_initcall
late_initcall
```

PCI 总线初始化通常较早，PCI 设备驱动一般在更靠后的阶段加载。

## Bootloader

Bootloader 是系统启动早期加载内核的程序。常见类型：

- U-Boot：常用于 ARM 和嵌入式系统。
- GRUB：常用于 x86 Linux。
- LILO：早期 Linux Loader。
- Windows bootmgr：Windows 启动管理器。
