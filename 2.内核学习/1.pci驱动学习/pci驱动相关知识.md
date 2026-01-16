看过的函数：
pci_assign_unassigned_root_bus_resources

__pci_bus_size_bridges默认热插拔最后分配资源的函数
[
pci_scan_root_bus()：启动入口。

pci_scan_child_bus()：递归扫描子总线。

pci_bus_size_bridges()：调用 pbus_size_mem 等函数统计空间，我们的内核参数传的值就是在这里被复制。

pci_bus_assign_resources()：真正分配地址。
]

pci_setup_bridge_io:写桥的io_base和limit，也会被pci_bus_assign_resources调用

pcibios_resource_to_bus 的作用就是：把内核管理的 resource 物理地址，加上或减去一个 Offset（偏移量），转换成 PCI 硬件能识别的总线地址。

平台兼容性：
在x86中，PCI总线地址通常通过ioremap映射到内核虚拟地址。
在ARM等架构中，可能需要通过MMU配置直接映射物理地址。

在PCI设备中，内存资源（Memory Resource）通常指的是设备通过 BAR（Base Address Register） 分配的物理地址范围，这些地址是系统内存的一部分，但通过PCI桥接器映射到设备的地址空间。

因为Linux x86 目前大多使用ACPI提供的中断路由表， 而不再使用BIOS中的中断路由表。 如果ACPI机制被使能， 该函数也将直接使用0 作为返回值， 并不会被完全执行

特性,INTx (需要中断路由表),MSI/MSI-X (现代推荐)
物理表现,靠电平信号（物理连线）,靠 PCIe 报文（写内存）
ACPI 依赖,强依赖 _PRT 表,不依赖 _PRT
热插拔友好度,差（连线固定，容易冲突）,极好（动态分配，不会冲突）

内核日志：在启动参数中加入 pci=debug，你可以在 dmesg 中看到完整的扫描和资源对齐过程