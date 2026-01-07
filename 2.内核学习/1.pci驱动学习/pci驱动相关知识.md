
平台兼容性：
在x86中，PCI总线地址通常通过ioremap映射到内核虚拟地址。
在ARM等架构中，可能需要通过MMU配置直接映射物理地址。

在PCI设备中，内存资源（Memory Resource）通常指的是设备通过 BAR（Base Address Register） 分配的物理地址范围，这些地址是系统内存的一部分，但通过PCI桥接器映射到设备的地址空间。