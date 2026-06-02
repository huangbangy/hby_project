# PCIe 基础、BAR 与 MSI

> 从 `0_知识大杂烩` 按原始行号拆分，内容未做语义改写。

## 原始行 184-192

2.3.1 pci相关
2.3.1.1 pci相关概念
1）PCI设备的配置空间共由 64个字节组成，其地址范围为 0x00 ~ 0x3F，这 64个字节是所有 PCI设备必须支持的
2.3.1.2 pci相关命令
1)setpci -s 0a:00.0 A0.b=0x01修改 0a:00.0设备配置空间 A0地址处 1字节的内容
2)lspci -tv 看pci设备树状图
2.3.1.2 pci相关速率
lspci -k 可以看出所有pci设备对应的驱动程序


## 原始行 795-795

由于PCI总线高性能低延迟的特性，它用来扩展的是CPU的存储域和IO域。

## 原始行 809-824

例如，在 02:00.0 中：

02 是总线号。
00 是设备号。
0 是函数号。

跨网段 ping 操作确实需要涉及网关（路由器），以确保数据包能够从一个网络传输到另一个网络

我们对外发布，发布的 ko一定是当前测试的ko，同时合入到版本里面。 有无strip --strip-unneeded 记得

objdump -t 可以查看相关符号

cat /proc/iomem

看出所有寄存器的数据
lspci -xxx -s 05:0e.0

## 原始行 874-880

I/O 端口空间：最大 64KB（x86 架构），通过 in/out 指令访问，受16位地址的影响。
I/O 内存空间：无统一上限，通过内存映射访问，最小单位通常是 4KB。


类型	地址空间	宽度
I/O端口	64KB	16位
内存地址	4GB/1TB+	32位/64位

## 原始行 888-889

Primary Bus Number:主总线号，表示桥设备上游总线号，即桥连接的上一级总线的编号，用于标识桥所属的根总线 4）Secondary Bus Number:次总线号,指桥设备直接连接的下游总线号，是桥下游第一个PCI总线的编号 5）Subordinate Bus Number:从属总线号,是该桥下所有总线中最大的总线号，代表以该桥为根的子树中，总线号的最大值。


## 原始行 921-922

MSI中断机制是一种通过内存写入操作来触发中断的现代化技术，它解决了传统中断机制的瓶颈，极大地提升了系统的I/O性能和响应速度，是现代计算机体系结构中至关重要的一环。


## 原始行 945-955

“PCIe 设备的扩展配置空间”： PCIe 设备除了前 256 字节的标准配置空间，后面还有额外的“扩展配置空间”，总共可达 4096 字节。访问这个空间是配置和管理高级 PCIe 设备（如 SSD、万兆网卡）的基础。

操作 I/O 端口
在 Linux 设备驱动中，操作 I/O 端口通常遵循“申请-访问-释放”的步骤：

申请端口：使用 request_region 函数向内核申请一段 I/O 端口区域。如果成功，该区域就会出现在 /proc/ioports 中。（存储设备中V3之前的采取request的方法，后面的采取bios预留的方法）

访问端口：使用 inb、outb 等专用函数进行读写。

释放端口：使用 release_region 函数释放不再使用的端口。


## 原始行 1056-1061

查看pci设备的配置空间内容
PCI设备的配置空间共由 64个字节组成，其地址范围为 0x00 ~ 0x3F，这 64个字节是所有 PCI设备必须支持的
lspci -s 17:00.0 -xxx
修改 0a:00.0设备配置空间 A0地址处 1字节的内容
$ setpci -s 0a:00.0 A0.b=0x01 


## 原始行 1106-1117

第九章 与硬件通信
******************************************************************************************************************
特性        | I/O 端口 (PMIO)                 | I/O 内存 (MMIO)
-----------|---------------------------------|----------------------------------------
地址空间    | 独立的 I/O 地址空间             | 与内存共享地址空间
访问指令    | 专用 I/O 指令（IN/OUT）         | 普通内存访问指令
地址大小    | 通常 16 位（64K 端口）         | 32 位或 64 位
性能        | 较慢                            | 较快（可利用缓存）
常见设备    | 传统 PC 设备（DMA、中断控制器） | 现代设备（PCIe、显卡）
映射需求    | 不需要映射                      | 需要映射到虚拟地址空间
Linux API   | inb()/outb() 系列               | ioread()/iowrite() 系列


## 原始行 1135-1159

pci桥分透明桥和非透明桥，非透明桥一般用于双处理器直接的数据交换

cat /proc/iomem  # 显示所有内存映射的IO区域
cat /proc/ioports  # 显示所有IO端口分配


lspci -k 可以查看所有设备对应的驱动程序

可用的内核参数在目录/proc/sys中
vi /etc/sysctl.conf
列
#禁用包过滤功能
net.ipv4.ip_forward = 0 

[root@localhost ~]# lspci -n
00:00.0 0600: 1d94:1450
00:01.0 0600: 1d94:1452
00:01.1 0604: 1d94:1453
查看pci设备的厂商和设备id号
lspci -nn
[root@localhost ~]# lspci -nn
00:00.0 Host bridge [0600]: Chengdu Haiguang IC Design Co., Ltd. Root Complex [1d94:1450]
00:01.0 Host bridge [0600]: Chengdu Haiguang IC Design Co., Ltd. PCIe Dummy Host Bridge [1d94:1452]
查看更具体的设备信息
lspci -vvv -s 00:1f.4

## 原始行 1189-1265

arm架构不支持io端口访问,支持mmio访问，x86则都支持

[root@localhost 0000:30:00.0]# lspci -vvv -s 30:00.0 |grep -A 5 "Region"
        Region 0: Memory at 81200000 (64-bit, non-prefetchable) [size=16K]
lspci查询到的是物理地址，通过下面的lspci -xxx -s也是可以看出的第一个bar就存着物理地址，低四位是对
地址类型的判断
BAR0 低4位 = 0x4 = 0100b

bit 0 = 0 → 内存空间（非I/O）
bit 2:1 = 10 → 64位地址空间
bit 3 = 0 → 非预取内存
bit 4-31 = 基地址
[root@localhost 0000:30:00.0]# lspci -xxx -s 30:00.0
30:00.0 Non-Volatile memory controller: Intel Corporation PCIe Data Center SSD (rev 01)
00: 86 80 53 09 06 04 10 00 01 02 08 01 10 00 00 00
10: 04 00 20 81 00 00 00 00 00 00 00 00 00 00 00 00

cd /sys/bus/pci/devices/0000:30:00.0
# 查看致命错误
cat aer_dev_fatal

# 查看非致命错误
cat aer_dev_nonfatal

# 查看可纠正错误
cat aer_dev_correctable

lspci -vvv -s 30：00.0的AER显示中
Q：UESta和UESvrt的关系？

UESta置位 (+)   │  ← 记录"发生了什么"
查询UESvrt      │  ← 判断"有多严重"
A：

UESta是状态寄存器，报告错误是否发生
UESvrt是配置寄存器，预定义每个错误的严重程度

一个桥能管理多个总线吗？	不能，每个桥只管理一个subordinate bus

概念	中文	数量	含义
Primary Bus	主总线	1个	桥所在的总线
Secondary Bus	次级总线	1个	桥直接连接的下级总线
Subordinate Bus	从属总线	1个	下级总线的最大编号
在pci配置的0x18 0x19 0x20寄存器的位置

作用：PCI事务路由
- 如果目标总线 < Primary    → 往上游转发
- 如果目标总线 = Secondary  → 发送到该总线
- 如果目标总线 > Secondary 且 ≤ Subordinate → 往下游转发

MSI中断申请流程
1：检查设备是否支持msi
if (pci_find_capability(pdev, PCI_CAP_ID_MSI)) {
    // 设备支持MSI
}
// 检查设备是否支持MSI-X
if (pci_find_capability(pdev, PCI_CAP_ID_MSIX)) {
    // 设备支持MSI-X
}
2：申请msi中断
// 申请MSI中断（1-4个向量）
int vectors = pci_alloc_irq_vectors(pdev, 1, 4, PCI_IRQ_ALL_TYPES);

// 获取中断号
int irq = pci_irq_vector(pdev, 0);
3：注册中断处理函数
request_irq(irq, my_interrupt_handler, 0, "my_device", dev);
4：中断处理
my_interrupt_handler的实现

动作,执行者,目的
创建 pci_dev,PCI 核心层,在内核软件层面建立该物理设备的抽象对象，存储设备身份信息。
分配物理 BAR 地址,PCI 核心层,在 PCI 总线地址空间内为设备划拨“地皮”（物理地址区间），并写入设备配置空间。
开启设备电源与中断,NVMe 驱动,通过 pci_enable_device 激活硬件，使其从低功耗状态唤醒并准备好处理中断。
虚拟地址映射 (ioremap),NVMe 驱动,将分配好的物理 BAR 地址映射到内核虚拟地址空间，使驱动能通过指针读写 SSD 寄存器。

先把第一个桥的整棵子树（包括子桥、孙桥）全分配完，再回头分配第二个桥的子树。 这是深度优先遍历，Bus号是按发现Bridge的先后顺序递增的，不是按层级分配的。

