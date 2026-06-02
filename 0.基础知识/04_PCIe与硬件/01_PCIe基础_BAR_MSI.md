# PCIe 基础、BAR 与 MSI

这份笔记用于快速复习 PCIe 设备枚举、配置空间、BAR、PMIO/MMIO、MSI 和常见调试命令。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `lspci -tv` | 以树形结构查看 PCI/PCIe 设备 |
| `lspci -k` | 查看设备绑定的驱动 |
| `lspci -n` | 查看厂商 ID 和设备 ID |
| `lspci -nn` | 同时显示名称和 ID |
| `lspci -vvv -s 00:1f.4` | 查看指定设备详细信息 |
| `lspci -xxx -s 05:0e.0` | 查看配置空间内容 |
| `setpci -s 0a:00.0 A0.b=0x01` | 修改指定设备配置空间 A0 偏移处 1 字节 |
| `cat /proc/iomem` | 查看内存映射 I/O 区域 |
| `cat /proc/ioports` | 查看 I/O 端口分配 |

## BDF 地址

PCIe 设备常用 `Bus:Device.Function` 标识。

```text
02:00.0
```

| 字段 | 含义 |
| --- | --- |
| `02` | Bus，总线号 |
| `00` | Device，设备号 |
| `0` | Function，功能号 |

## 配置空间

- 传统 PCI 配置空间通常是 256 字节，其中前 64 字节是标准头部区域。
- PCIe 设备配置空间可扩展到 4096 字节，256 字节之后是扩展配置空间。
- 配置空间中保存厂商 ID、设备 ID、Command/Status、BAR、中断能力等信息。

查看配置空间：

```bash
lspci -s 17:00.0 -xxx
```

修改配置空间示例：

```bash
setpci -s 0a:00.0 A0.b=0x01
```

## PMIO 与 MMIO

| 特性 | I/O 端口 PMIO | I/O 内存 MMIO |
| --- | --- | --- |
| 地址空间 | 独立 I/O 地址空间 | 与内存共享地址空间 |
| 常见地址规模 | x86 常见 64KB | 32 位或 64 位地址空间 |
| 访问指令 | `in` / `out` | 普通内存访问语义 |
| Linux API | `inb()` / `outb()` | `ioread*()` / `iowrite*()` |
| 是否需要映射 | 通常不需要 | 需要映射到内核虚拟地址 |
| 常见设备 | 传统 PC 外设 | PCIe、显卡、NVMe、网卡 |

ARM 架构通常不支持传统 I/O 端口访问，主要使用 MMIO。x86 通常两者都支持。

## BAR 基础

BAR 用来告诉系统：设备需要一段 I/O 或内存地址空间。系统枚举设备时会分配物理地址，并把结果写入设备配置空间。

示例：

```text
Region 0: Memory at 81200000 (64-bit, non-prefetchable) [size=16K]
```

如果配置空间中 BAR0 低 4 位为 `0x4`：

```text
0100b
```

| 位 | 含义 |
| --- | --- |
| bit 0 = 0 | Memory BAR，不是 I/O BAR |
| bit 2:1 = 10 | 64 位地址 |
| bit 3 = 0 | non-prefetchable |
| bit 4 及以上 | BAR 基地址的一部分 |

64 位 BAR 会占用两个 BAR 寄存器，需要把高低部分组合起来看。

## PCI Bridge 总线号

| 字段 | 中文 | 含义 |
| --- | --- | --- |
| Primary Bus | 主总线 | 桥设备上游总线号 |
| Secondary Bus | 次级总线 | 桥直接连接的下游总线号 |
| Subordinate Bus | 从属总线 | 该桥下面所有总线中的最大编号 |

这些字段通常在桥设备配置空间 `0x18`、`0x19`、`0x1a` 附近。

路由逻辑：

- 目标总线小于 Primary：往上游转发。
- 目标总线等于 Secondary：发到桥直接连接的下游总线。
- 目标总线大于 Secondary 且小于等于 Subordinate：继续往下游转发。

一个桥通常管理一段下游总线范围。系统分配 Bus 号时常按发现桥的顺序深度优先遍历。

## 透明桥与非透明桥

- 透明桥：普通 PCIe 拓扑扩展，对系统软件相对透明。
- 非透明桥：常用于两个处理器或两个系统之间的数据交换，两侧地址空间不完全共享。

## MSI / MSI-X

MSI 是通过内存写操作触发中断的机制，相比传统中断线更适合现代高速 I/O 设备。

典型申请流程：

```c
if (pci_find_capability(pdev, PCI_CAP_ID_MSI)) {
    /* 设备支持 MSI */
}

if (pci_find_capability(pdev, PCI_CAP_ID_MSIX)) {
    /* 设备支持 MSI-X */
}

int vectors = pci_alloc_irq_vectors(pdev, 1, 4, PCI_IRQ_ALL_TYPES);
int irq = pci_irq_vector(pdev, 0);

request_irq(irq, my_interrupt_handler, 0, "my_device", dev);
```

## AER 错误信息

PCIe AER 常见 sysfs 文件：

```bash
cd /sys/bus/pci/devices/0000:30:00.0
cat aer_dev_fatal
cat aer_dev_nonfatal
cat aer_dev_correctable
```

| 字段 | 含义 |
| --- | --- |
| `UESta` | Uncorrectable Error Status，记录发生了什么错误 |
| `UESvrt` | Uncorrectable Error Severity，配置每类错误的严重程度 |

简单理解：`UESta` 看“有没有发生”，`UESvrt` 看“发生后算多严重”。

## Linux 驱动中的 I/O 端口访问

操作 I/O 端口通常遵循：

1. 申请端口：`request_region`。
2. 访问端口：`inb`、`outb` 等。
3. 释放端口：`release_region`。

申请成功后，区域通常能在 `/proc/ioports` 中看到。

## PCIe 设备初始化大致流程

| 动作 | 执行者 | 目的 |
| --- | --- | --- |
| 创建设备对象 `pci_dev` | PCI 核心层 | 在内核中建立物理设备的软件抽象 |
| 分配 BAR 物理地址 | PCI 核心层 | 给设备划分地址空间，并写入配置空间 |
| 使能设备 | 设备驱动 | `pci_enable_device`，让硬件准备工作 |
| 映射虚拟地址 | 设备驱动 | `ioremap` 或相关接口，方便访问寄存器 |
| 申请中断 | 设备驱动 | 注册中断处理函数 |
| 正常收发或控制 | 设备驱动 | 读写寄存器、处理数据和事件 |
