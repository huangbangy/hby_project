# ti-ads1015.c 驱动学习笔记

本文基于 Linux 5.10 的 `drivers/iio/adc/ti-ads1015.c`，用于梳理 TI ADS1015/ADS1115 ADC 驱动的基本概念和源码阅读主线。

## 1. 这个驱动是什么

`ti-ads1015.c` 是 TI ADS1015/ADS1115 系列 ADC 的 Linux 内核驱动。

ADC 是 Analog-to-Digital Converter，即模数转换器，作用是把外部模拟电压转换成数字值。

ADS1015/ADS1115 通过 I2C 总线和主控通信，所以这个驱动首先是一个 I2C 设备驱动。同时，ADC 在 Linux 中通常归到 IIO 子系统管理，所以它也是一个 IIO 驱动。

可以简单理解为：

```text
外部模拟电压
    ↓
ADS1015/ADS1115 ADC 芯片
    ↓ I2C
Linux ti-ads1015.c 驱动
    ↓ IIO
/sys/bus/iio/devices/iio:deviceX/
    ↓
用户空间读取 ADC 数值
```

## 2. I2C 驱动入口

文件底部有驱动注册结构：

```c
static struct i2c_driver ads1015_driver = {
	.driver = {
		.name = ADS1015_DRV_NAME,
		.of_match_table = ads1015_of_match,
		.pm = &ads1015_pm_ops,
	},
	.probe		= ads1015_probe,
	.remove		= ads1015_remove,
	.id_table	= ads1015_id,
};

module_i2c_driver(ads1015_driver);
```

`module_i2c_driver()` 会把这个驱动注册进 Linux I2C 子系统。

当内核发现某个 I2C 设备能和这个驱动匹配时，就会调用：

```c
ads1015_probe()
```

匹配方式之一是设备树：

```c
static const struct of_device_id ads1015_of_match[] = {
	{
		.compatible = "ti,ads1015",
		.data = (void *)ADS1015
	},
	{
		.compatible = "ti,ads1115",
		.data = (void *)ADS1115
	},
	{}
};
```

对应设备树节点大致可能是：

```dts
adc@48 {
	compatible = "ti,ads1015";
	reg = <0x48>;
};
```

其中 `reg = <0x48>` 表示 I2C 地址。

## 3. probe() 的作用

`ads1015_probe()` 是驱动初始化设备的核心函数。

它的职责是：把一个裸的 I2C ADC 芯片，包装成 Linux IIO 子系统里的标准 ADC 设备。

主要流程如下：

```text
分配 IIO 设备对象
    ↓
获取驱动私有数据
    ↓
初始化锁和基本信息
    ↓
判断芯片型号 ADS1015 / ADS1115
    ↓
设置通道表、IIO 操作函数、采样率表
    ↓
初始化阈值配置
    ↓
读取设备树/平台通道配置
    ↓
初始化 regmap
    ↓
设置 IIO buffer
    ↓
如果有 IRQ，注册中断处理
    ↓
设置 ADC 连续转换模式
    ↓
启用 runtime PM
    ↓
注册 IIO 设备
```

关键代码：

```c
indio_dev = devm_iio_device_alloc(&client->dev, sizeof(*data));
data = iio_priv(indio_dev);
i2c_set_clientdata(client, indio_dev);
```

`indio_dev` 是 IIO 框架认识的设备对象。

`data` 是驱动私有数据，类型是：

```c
struct ads1015_data {
	struct regmap *regmap;
	struct mutex lock;
	struct ads1015_channel_data channel_data[ADS1015_CHANNELS];

	unsigned int event_channel;
	unsigned int comp_mode;
	struct ads1015_thresh_data thresh_data[ADS1015_CHANNELS];

	unsigned int *data_rate;
	bool conv_invalid;
};
```

其中比较重要的成员：

- `regmap`：封装 I2C 寄存器读写。
- `lock`：保护并发读写。
- `channel_data`：保存每个通道的 PGA、采样率等配置。
- `thresh_data`：保存事件阈值。
- `data_rate`：当前芯片型号对应的采样率表。
- `conv_invalid`：标记当前 conversion register 里的值可能是旧配置下的结果。

## 4. IIO 子系统

IIO 是 Industrial I/O 子系统，常用于 ADC、DAC、IMU、温度传感器等设备。

这个驱动通过 IIO 向用户空间暴露标准接口，比如：

```text
/sys/bus/iio/devices/iio:device0/in_voltage0_raw
/sys/bus/iio/devices/iio:device0/in_voltage0_scale
/sys/bus/iio/devices/iio:device0/in_voltage0_sampling_frequency
```

这些文件不是驱动手动一个个创建的，而是 IIO 根据 `iio_chan_spec` 和 `iio_info` 自动生成的。

驱动给 IIO 提供的操作函数主要在：

```c
static const struct iio_info ads1015_info = {
	.read_raw	= ads1015_read_raw,
	.write_raw	= ads1015_write_raw,
	.read_event_value = ads1015_read_event,
	.write_event_value = ads1015_write_event,
	.read_event_config = ads1015_read_event_config,
	.write_event_config = ads1015_write_event_config,
	.attrs          = &ads1015_attribute_group,
};
```

## 5. channel 通道描述

ADS1015 的通道表：

```c
static const struct iio_chan_spec ads1015_channels[] = {
	ADS1015_V_DIFF_CHAN(0, 1, ADS1015_AIN0_AIN1),
	ADS1015_V_DIFF_CHAN(0, 3, ADS1015_AIN0_AIN3),
	ADS1015_V_DIFF_CHAN(1, 3, ADS1015_AIN1_AIN3),
	ADS1015_V_DIFF_CHAN(2, 3, ADS1015_AIN2_AIN3),
	ADS1015_V_CHAN(0, ADS1015_AIN0),
	ADS1015_V_CHAN(1, ADS1015_AIN1),
	ADS1015_V_CHAN(2, ADS1015_AIN2),
	ADS1015_V_CHAN(3, ADS1015_AIN3),
	IIO_CHAN_SOFT_TIMESTAMP(ADS1015_TIMESTAMP),
};
```

前 4 个是差分输入：

```text
AIN0 - AIN1
AIN0 - AIN3
AIN1 - AIN3
AIN2 - AIN3
```

后 4 个是单端输入：

```text
AIN0
AIN1
AIN2
AIN3
```

通道编号来自：

```c
enum ads1015_channels {
	ADS1015_AIN0_AIN1 = 0,
	ADS1015_AIN0_AIN3,
	ADS1015_AIN1_AIN3,
	ADS1015_AIN2_AIN3,
	ADS1015_AIN0,
	ADS1015_AIN1,
	ADS1015_AIN2,
	ADS1015_AIN3,
	ADS1015_TIMESTAMP,
};
```

这些枚举值不仅是驱动内部通道编号，也对应 ADS1015 配置寄存器里的 MUX 选择值。

## 6. read_raw() 读取路径

`ads1015_read_raw()` 是用户空间读取 ADC 数值时的核心入口。

函数原型：

```c
static int ads1015_read_raw(struct iio_dev *indio_dev,
			    struct iio_chan_spec const *chan, int *val,
			    int *val2, long mask)
```

`mask` 表示用户想读取什么信息：

```c
case IIO_CHAN_INFO_RAW:
case IIO_CHAN_INFO_SCALE:
case IIO_CHAN_INFO_SAMP_FREQ:
```

对应含义：

```text
RAW       原始 ADC 数字值
SCALE     每一位代表多少电压
SAMP_FREQ 当前采样频率
```

读取原始值时，关键调用是：

```c
ret = ads1015_get_adc_result(data, chan->address, val);
```

## 7. ads1015_get_adc_result()

这个函数是真正和芯片寄存器打交道的地方。

主要流程：

```text
检查通道编号是否合法
    ↓
读取 ADS1015_CFG_REG 配置寄存器
    ↓
取出当前通道的 PGA 和 data rate
    ↓
组装 MUX/PGA/DR 配置位
    ↓
如果配置变化，写回配置寄存器
    ↓
如有必要，等待新的 ADC 转换完成
    ↓
读取 ADS1015_CONV_REG 转换结果寄存器
```

关键代码：

```c
ret = regmap_read(data->regmap, ADS1015_CFG_REG, &old);

pga = data->channel_data[chan].pga;
dr = data->channel_data[chan].data_rate;

mask = ADS1015_CFG_MUX_MASK | ADS1015_CFG_PGA_MASK |
	ADS1015_CFG_DR_MASK;

cfg = chan << ADS1015_CFG_MUX_SHIFT |
      pga << ADS1015_CFG_PGA_SHIFT |
      dr << ADS1015_CFG_DR_SHIFT;
```

这里把 Linux 里的抽象配置翻译成了芯片寄存器 bit 位：

```text
chan -> MUX 位，选择输入通道
pga  -> PGA 位，选择量程
dr   -> DR 位，选择采样率
```

如果配置发生变化：

```c
regmap_write(data->regmap, ADS1015_CFG_REG, cfg);
data->conv_invalid = true;
```

设置 `conv_invalid = true` 的原因是：刚切换通道、量程或采样率后，conversion register 里可能还是旧配置下的结果，不能直接使用。

等待转换完成：

```c
conv_time = DIV_ROUND_UP(USEC_PER_SEC, data->data_rate[dr_old]);
conv_time += DIV_ROUND_UP(USEC_PER_SEC, data->data_rate[dr]);
conv_time += conv_time / 10;
usleep_range(conv_time, conv_time + 1);
```

这里根据采样率计算等待时间，并加了 10% 余量，用来覆盖芯片内部时钟误差。

最后读取转换结果：

```c
return regmap_read(data->regmap, ADS1015_CONV_REG, val);
```

`ADS1015_CONV_REG` 是 `0x00`，即 ADC conversion register。

## 8. sign_extend32() 的作用

`read_raw()` 读到 ADC 值之后有一行：

```c
*val = sign_extend32(*val >> shift, 15 - shift);
```

ADS1015 是 12 位 ADC，但 conversion register 是 16 位，结果左对齐。

通道描述里写着：

```c
.realbits = 12,
.storagebits = 16,
.shift = 4,
```

所以需要先右移 4 位：

```text
16 位寄存器值 -> 右移 4 位 -> 真实 12 位 ADC 值
```

由于差分输入可能为负，ADC 结果是有符号数，所以还要做符号扩展。

ADS1115 是 16 位 ADC，因此它没有 ADS1015 这种右移 4 位的问题。

## 9. regmap 的意义

ADS1015 主要寄存器包括：

```c
#define ADS1015_CONV_REG	0x00
#define ADS1015_CFG_REG		0x01
#define ADS1015_LO_THRESH_REG	0x02
#define ADS1015_HI_THRESH_REG	0x03
```

驱动没有直接手写 I2C 读写流程，而是使用 `regmap`：

```c
data->regmap = devm_regmap_init_i2c(client, &ads1015_regmap_config);
```

之后就可以用：

```c
regmap_read()
regmap_write()
regmap_update_bits()
```

`regmap` 的好处是：

- 统一寄存器访问接口。
- 隐藏 I2C/SPI 等总线细节。
- 支持缓存、位更新、调试等能力。
- 让驱动代码更聚焦于芯片逻辑。

## 10. runtime PM 电源管理

驱动中有：

```c
static int ads1015_set_power_state(struct ads1015_data *data, bool on)
```

读取 ADC 前：

```c
ads1015_set_power_state(data, true);
```

读取完成后：

```c
ads1015_set_power_state(data, false);
```

如果开启了 `CONFIG_PM`，它内部会使用：

```c
pm_runtime_get_sync()
pm_runtime_put_autosuspend()
```

作用是：需要采样时唤醒设备，空闲一段时间后自动进入省电状态。

## 11. 中断和事件

ADS1015 有比较器功能，可以设置高低阈值。

驱动中有 IIO event 相关函数：

```c
ads1015_read_event()
ads1015_write_event()
ads1015_read_event_config()
ads1015_write_event_config()
ads1015_event_handler()
```

如果设备树或平台数据提供了 IRQ，probe 中会注册中断：

```c
devm_request_threaded_irq(&client->dev, client->irq,
			  NULL, ads1015_event_handler,
			  irq_trig | IRQF_ONESHOT,
			  client->name, indio_dev);
```

当电压超过阈值时，驱动可以通过 IIO event 通知用户空间。

## 12. buffer 和 trigger

除了 sysfs 直接读取，IIO 还支持 buffer 模式，即连续采样。

probe 中有：

```c
devm_iio_triggered_buffer_setup(&client->dev, indio_dev, NULL,
				ads1015_trigger_handler,
				&ads1015_buffer_setup_ops);
```

`ads1015_trigger_handler()` 会在触发时读取 ADC 数据，并把数据推送到 IIO buffer。

这类机制适合周期采样、批量采样，而不是用户偶尔读一次 sysfs。

## 13. 一次读取的完整路径

用户执行：

```sh
cat /sys/bus/iio/devices/iio:device0/in_voltage0_raw
```

大致路径：

```text
用户空间 cat
    ↓
sysfs
    ↓
IIO framework
    ↓
ads1015_read_raw()
    ↓
iio_device_claim_direct_mode()
    ↓
ads1015_set_power_state(data, true)
    ↓
ads1015_get_adc_result()
    ↓
配置 MUX/PGA/DR
    ↓
等待新转换完成
    ↓
regmap_read(ADS1015_CONV_REG)
    ↓
右移 + 符号扩展
    ↓
ads1015_set_power_state(data, false)
    ↓
返回整数给用户空间
```

## 14. 阅读这个驱动的建议顺序

建议按下面顺序阅读：

```text
module_i2c_driver()
    ↓
struct i2c_driver ads1015_driver
    ↓
ads1015_of_match / ads1015_id
    ↓
ads1015_probe()
    ↓
struct ads1015_data
    ↓
ads1015_channels / ads1115_channels
    ↓
ads1015_info
    ↓
ads1015_read_raw()
    ↓
ads1015_get_adc_result()
    ↓
ads1015_write_raw()
    ↓
event / irq
    ↓
buffer / trigger
    ↓
runtime PM
```

## 15. 核心总结

这个驱动的核心思想是：

```text
IIO 负责把 ADC 表达成 Linux 标准接口；
ti-ads1015.c 负责把 IIO 的标准请求翻译成 ADS1015/ADS1115 的寄存器操作。
```

再换句话说：

```text
用户想读电压
    ↓
IIO 告诉驱动读哪个 channel
    ↓
驱动配置 ADS1015 的 MUX/PGA/DR
    ↓
驱动等待转换完成
    ↓
驱动读取 conversion register
    ↓
IIO 把结果暴露给用户空间
```

