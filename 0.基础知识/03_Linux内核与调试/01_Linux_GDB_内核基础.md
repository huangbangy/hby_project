# Linux、GDB 与内核基础

> 从 `0_知识大杂烩` 按原始行号拆分，内容未做语义改写。

## 原始行 183-0

2.3 Linux知识
Compress  压缩  detecting  检测 chips芯片 buzzer 蜂鸣器 configuration 配置
2.2 英语单词
char *a = malloc( 12 ); printf("%d \n", sizeof(b));------->等于8，指针在64位占8个字节
20)	int arr[4]={1,2,3,2};int len_arr = sizeof(arr);---------->len_arr等于16
19)	register这个关键字请求编译器尽可能的将变量存在CPU内部寄存器中，而不是通过内存寻址访问，以提高效率。注意是尽可能，不是绝对。因为，如果定义了很多register变量，可能会超过CPU的寄存器个数，超过容量。
18）把整型16转换为8进制，存在str里面，存在str里面的是字符（其中16可改为其他想要转换的整型数字，如25，40...），（8可改为其他想要转换的进制，如2，4，16...）itoa(16,str,8)
17)	new / delete 是C++运算符，malloc / free是C/C++语言标准库函数
16)	无符号数据类型（%u）
15)	正数在计算机中存储的是原码，而负数在计算机中存储的是补码
}
	操作系统分配一块物理地址给共享内存，共享内存没有加锁的机制，要加锁的话需要加信号	
	共享内存，信号量	
	不同服务器可以用socket
	同一台机器才可以用管道和消息队列用于进程间通信---> 少用
14)	进程间通信：{
不加也可以，因为函数默认就是extern(全局可见的
只是将该函数显式的指定为extern(全局可见的)
12)	函数声明的时候为什么加extern？？？
3、若程序包含多个文件，其他文件需要用到另外一个文件的全局变量，则可以在需要用到此全局变量的文件里用extern对该全局变量作外部声明，将该全局变量的作用域扩展到本文件，从声明处一直到文件结束--------》这种情况最常见
2、通常情况下，都将全局变量定义在所有使用它的函数之前
若下面定义了，全局申明的情况，定义之前还是可以用的
1、用extern对全局变量作提前引用声明，可以扩展全局变量在文件中的作用域；此时就可以从声明开始位置起，合法的使用该全局变量----》这句话的意思就是
11)	extern g_para_t envpara 类似这种，就是声明了一个外部的变量，extern只能用于声明全局变量
也就会结束，但是通过static修饰之后呢，这个变量被放在了静态存储区，不会随着函数体的结束而结束，所以你多次调用包含static修饰变量的函数体的时候，变量的值还是保持上一次调用完的值，而不会置初始位，尽管你函数体里static int a = 0；但a++，下次调用的时候a的值是1，不是0
第二种就是修饰函数体里面的变量，一般来说正常定义的变量，这个函数体结束了因为都是局部变量存放在栈空间所以函数体结束的话定义的变量
一种就是修饰本文件定义的变量或函数，只能在本文件调用使用，也就是假如其它的文件用extern这个关键词来声明也是获取不到的
分两种情况
10)	static作用？？
9)	1、全局变量（所有文件可见的）  因此extern可以获取2、静态全局变量（当前文件可见的）
8)	GBK编码，一个汉字占两个字节。 UTF-8编码是变长编码，通常汉字占三个字节
5)	代码怎么变成一个可执行文件的，先编译出所有目标文件，然后把这些目标文件链接起来首先预处理（头文件的包含，注释的删除，define的替换）编译（将.c代码翻译成汇编代码）汇编（将汇编代码转化成二进制代码）合并段表就成了可执行文件
4)	cpunum_temp=strtoul(tmp, NULL, 10);把tmp按10进制转化输出


4) BIT(3) 是一个宏，用于设置一个二进制位，具体的实现可能类似于 (1 << 3)。在这种情况下，BIT(3) 表示将第 3 位设置为 1。
3)gcc如果加参数 -c 是只编译不连接 去掉后就好了，假如只想编译一个.c文件
2)strstr(str1,str2) 函数用于判断字符串str2是否是str1的子串。如果是，则该函数返回str2在str1中首次出现的地址；否则，返回NULL。
access函数用来判断指定的文件或目录是否存在(F_OK)，已存在的文件或目录是否有可读(R_OK)、可写(W_OK)、可执行(X_OK)权限。F_OK、R_OK、W_OK、X_OK这四种方式通过access函数中的第二个参数mode指定。如果指定的方式有效，则此函数返回0，否则返回-1
1)	access函数？
2.1 C语言知识
2：基本知识
66)	sed -n 4p打印第四行
65)	grep -s 选项表示不显示不存在或无匹配文本的错误信息
64)	source和./执行脚本的区别？？？
echo ${arry[*]:1:3} 打印这个数组下标为1后的三个元素
echo ${#array[*]}
获取数据所有元素的个数
echo ${array[*]}
获取数组的所有元素
echo ${array[0]}
获取数组的第一个元素是
arry={5 6 7}
还有一种是整体定义
array[1]=harry
array[0]=hby
63)	数组有两种定义的方式一种是单个单个定义
62)	ggYG复制全部
这个命令一般放在make modules_install之后。depmod可检测模块的相依性，供modprobe在安装模块时使用。
61)	depmod -a
60)	modprobe命令用于智能地向内核中加载模块或者从内核中移除模块
59)	awk {print $2} 就是一行行读取文件，以空格为分割符，打印第二个字段
58)	awk -F 后面加一个.就是指定了分隔符
57)	shell中if[-z]就是后面是数据是空的它就是真的，就成立
56)	grep -w 就是精准查找，默认只匹配一个单词
55)	grep -v 就是反向查找，查找不含后续字段的行
54)	cat phonenum.txt |sort -u|wc –l  sort -u 的作用是剔除相同行，wc -l是计算行数
53)	bash -n  查看脚本语法有误错误
52)	bash -x 25.sh 查看脚本调试过程
51)	unset取消变量
50)	read -p "Input your name" name 输出相应提示
49)	read -s -p "Input your name  " pass 隐藏密码
48)	read -n 5 -p "INput your name": name 限制输入个数
47)	read -t 3 -p "input": name 限制输入三秒
46)	echo ${A:2:3} 截取第2个字符的后面三个
45)	B=$(uname -r)等同于b=`uname -r`
44)	read -p "Input": ip < ip.txt 把ip.txt的内容当作密码输入给ip
43)	双引号可以引用变量
42)	declare -r B=111  定义B只读
41)	env 查看当前用户的环境变量
40)	/etc/profile 全局环境变量信息
39)	ccc=itcast export ccc 等价于export ccc=itcast 和declare -x 定义一个环境变量和export一样
38)	echo $?查看上一次的shell命令有无执行成功，成功的话就会显示0，没有成功就会显示别的数字
37)	$0 当前执行脚本的名字，$1 当前执行脚本的第一个参数一次类推，$* 脚本输入的所有的参数和$@一样
36)	ll -i 可以显示inode号
35)	 [ -d  ./file1 ];echo $? 如果是目录文件在就会打印0，但是是文件的话就打印别的数字
34)	-f	判断文件是否存在并且是一个普通文件	file
33)	-e	判断文件是否存在（link文件指向的也必须存在）	exists
32)	echo $(( 256*22 ))等价于echo $[ 256*22 ]
30)	test -z "hello";echo $? 前面为空就会打印0,echo &?假就是1所以打印的是1，-z 就是空就是1，非空就是0，所以test –z “hello” 执行的结果就是0，但是echo $?结果0打印就是1
29)	-s是判断文件是否不为空，！-s判断文件是否为空文件，要和字符串的-z     和-n区分开
28)	test -r i2cdetect;echo $? 判断icdetect文件是不是可读的l
27)	ln -s file1 test1   if[ -L ./test1 ];echo $? 0 判断是不是一个链接文件
26)	echo $$ ？？？  echo $$  返回登录shell的PID
25)	let n=n**3 计算一个数的幂值
24)	[ file -ef file2 ];echo $? 比较两个文件是否一致，也就是他们的id号是否一致，内容一致id号也会不一致
23)	[ !-d ./dir1 ]; 判断一个文件不是目录
22)	记得if[  ] 判断的时候只有一个等号
21)	echo 1 >> 1.txt 会直接创建1.txt文件
20)	if 和elif后面需空格
19)	for i in $(seq 2 $[$val-1]) 等价于 for i in `seq 2 $[$val-1]`
$() 和` `效果一样
注：if后面有空格，中括号两边有空格
$[$i%2] 引用变量必须这样写
18)	if [ $(($i%2)) -eq 0 ]; then
17)	[ -s file5 ]  ||  echo hby 在终端可以这样使用
16)	touch file{5..8} 可以创建file5到file8之间包括自身的所有文件	
15)	for i in {2..22} 写法正确，for i in{2..$val} 写法错误，因为for中只能指定确定的数值
14)	查看用户组 cat /etc/group 查看用户 cat /etc/passwd
13)	往一个组里添加用户 useradd -G class u1 往clas这个组里添加u1这个用户
12)	创建一个组 groupadd class 创建一个用户useradd u1p
11)	echo 123456|passwd --stdin stu01 给一个用户设置密码
10))	time ./shezhimima.sh 查看脚本运行时间
9)	echo $RANDOM 打印一个随机数
tail -1的作用就是打印下面的一行，所以上面的命令就可以筛选第三行
head -3 phonenum.txt |tail -1 
8)	head -3 phonenum.txt 打印phonenum.txt 的前3行
7)	shell界面写true，接下里echo $?就打印0 写false就打印1
6)	ping -c1 $ip.$i $>/dev/null 可以有这样的写法
5)	echo -n "hello world" 不换行打印 
4)	./1.sh & 放到后台运行
echo $ip 就是10.1.1.1
1.txt的内容是 10.1.1.1 hby 
3)	read ip user < 1.txt
2)	若直接换行直接输入echo即可，不需要后面添加内容，可以自动换行
sort -u 的作用是剔除相同行，wc -l是计算行数
1)	cat phonenum.txt |sort -u|wc -l
1.2 常用shell脚本命令
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

## 原始行 230-0


1．/etc/modprobe.d/目录是用于存放Linux系统中modprobe命令的配置文件的位置。这些配置文件通常用于指定模块加载选项、黑名单、别名等设置，以影响内核模块的加载和管理行为。
2.3.4 linux目录相关

make -C $(KERNEL_DIR) M=$(PWD) clean
clean:

make -C $(KERNEL_DIR) M=$(PWD) modules
all:

KERNEL_DIR := /driver/linux-5.10/

obj-m += hello.o
[root@localhost Project_HBY]# cat Makefile
三、Demo代码

⑤　make -j32 bzImage编译
④　替换.config文件
③　安装相应的编译所需的rpm包
②　解压
①　下源码
二、步骤：


（二）内核源代码目录通常是 /usr/src/linux 或类似的路径，其中包含了完整的 Linux 内核源代码。这个目录用于开发和构建新的内核模块，或者进行内核的定制和调试

（一）/lib/modules/$(uname -r) 是已编译内核模块的安装目录，而不是内核源代码目录。这个目录包含的是已编译的内核模块文件（.ko 文件），以及其他与内核加载和管理有关的文件。这些文件是在内核编译和安装过程中生成并安装到系统中的。
一、基本概念：
2.3.3.1 linux内核编译
2.3.3 linux内核
7．Step				   单步执行
6．run                运行程序
5．break my_function   # 在 my_function 函数开始处设置断点
4．break 25            # 在第 25 行设置断点
3．break main          # 在main函数开始处设置断点
2．gdb my_program		gdb该调试文件
1．gcc -g -o my_program my_program.c 编译成可gdb的文件
2.3.2 GDB

lspci -k 可以看出所有pci设备对应的驱动程序
2.3.1.2 pci相关速率
2)lspci -tv 看pci设备树状图
1)setpci -s 0a:00.0 A0.b=0x01修改 0a:00.0设备配置空间 A0地址处 1字节的内容
2.3.1.2 pci相关命令
1）PCI设备的配置空间共由 64个字节组成，其地址范围为 0x00 ~ 0x3F，这 64个字节是所有 PCI设备必须支持的
2.3.1.1 pci相关概念
2.3.1 pci相关
2.3 Linux知识
Compress  压缩  detecting  检测 chips芯片 buzzer 蜂鸣器 configuration 配置
2.2 英语单词
char *a = malloc( 12 ); printf("%d \n", sizeof(b));------->等于8，指针在64位占8个字节
20)	int arr[4]={1,2,3,2};int len_arr = sizeof(arr);---------->len_arr等于16
19)	register这个关键字请求编译器尽可能的将变量存在CPU内部寄存器中，而不是通过内存寻址访问，以提高效率。注意是尽可能，不是绝对。因为，如果定义了很多register变量，可能会超过CPU的寄存器个数，超过容量。
18）把整型16转换为8进制，存在str里面，存在str里面的是字符（其中16可改为其他想要转换的整型数字，如25，40...），（8可改为其他想要转换的进制，如2，4，16...）itoa(16,str,8)
17)	new / delete 是C++运算符，malloc / free是C/C++语言标准库函数
16)	无符号数据类型（%u）
15)	正数在计算机中存储的是原码，而负数在计算机中存储的是补码
}
	操作系统分配一块物理地址给共享内存，共享内存没有加锁的机制，要加锁的话需要加信号	
	共享内存，信号量	
	不同服务器可以用socket
	同一台机器才可以用管道和消息队列用于进程间通信---> 少用
14)	进程间通信：{
不加也可以，因为函数默认就是extern(全局可见的
只是将该函数显式的指定为extern(全局可见的)
12)	函数声明的时候为什么加extern？？？
3、若程序包含多个文件，其他文件需要用到另外一个文件的全局变量，则可以在需要用到此全局变量的文件里用extern对该全局变量作外部声明，将该全局变量的作用域扩展到本文件，从声明处一直到文件结束--------》这种情况最常见
2、通常情况下，都将全局变量定义在所有使用它的函数之前
若下面定义了，全局申明的情况，定义之前还是可以用的
1、用extern对全局变量作提前引用声明，可以扩展全局变量在文件中的作用域；此时就可以从声明开始位置起，合法的使用该全局变量----》这句话的意思就是
11)	extern g_para_t envpara 类似这种，就是声明了一个外部的变量，extern只能用于声明全局变量
也就会结束，但是通过static修饰之后呢，这个变量被放在了静态存储区，不会随着函数体的结束而结束，所以你多次调用包含static修饰变量的函数体的时候，变量的值还是保持上一次调用完的值，而不会置初始位，尽管你函数体里static int a = 0；但a++，下次调用的时候a的值是1，不是0
第二种就是修饰函数体里面的变量，一般来说正常定义的变量，这个函数体结束了因为都是局部变量存放在栈空间所以函数体结束的话定义的变量
一种就是修饰本文件定义的变量或函数，只能在本文件调用使用，也就是假如其它的文件用extern这个关键词来声明也是获取不到的
分两种情况
10)	static作用？？
9)	1、全局变量（所有文件可见的）  因此extern可以获取2、静态全局变量（当前文件可见的）
8)	GBK编码，一个汉字占两个字节。 UTF-8编码是变长编码，通常汉字占三个字节
5)	代码怎么变成一个可执行文件的，先编译出所有目标文件，然后把这些目标文件链接起来首先预处理（头文件的包含，注释的删除，define的替换）编译（将.c代码翻译成汇编代码）汇编（将汇编代码转化成二进制代码）合并段表就成了可执行文件
4)	cpunum_temp=strtoul(tmp, NULL, 10);把tmp按10进制转化输出


4) BIT(3) 是一个宏，用于设置一个二进制位，具体的实现可能类似于 (1 << 3)。在这种情况下，BIT(3) 表示将第 3 位设置为 1。
3)gcc如果加参数 -c 是只编译不连接 去掉后就好了，假如只想编译一个.c文件
2)strstr(str1,str2) 函数用于判断字符串str2是否是str1的子串。如果是，则该函数返回str2在str1中首次出现的地址；否则，返回NULL。
access函数用来判断指定的文件或目录是否存在(F_OK)，已存在的文件或目录是否有可读(R_OK)、可写(W_OK)、可执行(X_OK)权限。F_OK、R_OK、W_OK、X_OK这四种方式通过access函数中的第二个参数mode指定。如果指定的方式有效，则此函数返回0，否则返回-1
1)	access函数？
2.1 C语言知识
2：基本知识
66)	sed -n 4p打印第四行
65)	grep -s 选项表示不显示不存在或无匹配文本的错误信息
64)	source和./执行脚本的区别？？？
echo ${arry[*]:1:3} 打印这个数组下标为1后的三个元素
echo ${#array[*]}
获取数据所有元素的个数
echo ${array[*]}
获取数组的所有元素
echo ${array[0]}
获取数组的第一个元素是
arry={5 6 7}
还有一种是整体定义
array[1]=harry
array[0]=hby
63)	数组有两种定义的方式一种是单个单个定义
62)	ggYG复制全部
这个命令一般放在make modules_install之后。depmod可检测模块的相依性，供modprobe在安装模块时使用。
61)	depmod -a
60)	modprobe命令用于智能地向内核中加载模块或者从内核中移除模块
59)	awk {print $2} 就是一行行读取文件，以空格为分割符，打印第二个字段
58)	awk -F 后面加一个.就是指定了分隔符
57)	shell中if[-z]就是后面是数据是空的它就是真的，就成立
56)	grep -w 就是精准查找，默认只匹配一个单词
55)	grep -v 就是反向查找，查找不含后续字段的行
54)	cat phonenum.txt |sort -u|wc –l  sort -u 的作用是剔除相同行，wc -l是计算行数
53)	bash -n  查看脚本语法有误错误
52)	bash -x 25.sh 查看脚本调试过程
51)	unset取消变量
50)	read -p "Input your name" name 输出相应提示
49)	read -s -p "Input your name  " pass 隐藏密码
48)	read -n 5 -p "INput your name": name 限制输入个数
47)	read -t 3 -p "input": name 限制输入三秒
46)	echo ${A:2:3} 截取第2个字符的后面三个
45)	B=$(uname -r)等同于b=`uname -r`
44)	read -p "Input": ip < ip.txt 把ip.txt的内容当作密码输入给ip
43)	双引号可以引用变量
42)	declare -r B=111  定义B只读
41)	env 查看当前用户的环境变量
40)	/etc/profile 全局环境变量信息
39)	ccc=itcast export ccc 等价于export ccc=itcast 和declare -x 定义一个环境变量和export一样
38)	echo $?查看上一次的shell命令有无执行成功，成功的话就会显示0，没有成功就会显示别的数字
37)	$0 当前执行脚本的名字，$1 当前执行脚本的第一个参数一次类推，$* 脚本输入的所有的参数和$@一样
36)	ll -i 可以显示inode号
35)	 [ -d  ./file1 ];echo $? 如果是目录文件在就会打印0，但是是文件的话就打印别的数字
34)	-f	判断文件是否存在并且是一个普通文件	file
33)	-e	判断文件是否存在（link文件指向的也必须存在）	exists
32)	echo $(( 256*22 ))等价于echo $[ 256*22 ]
30)	test -z "hello";echo $? 前面为空就会打印0,echo &?假就是1所以打印的是1，-z 就是空就是1，非空就是0，所以test –z “hello” 执行的结果就是0，但是echo $?结果0打印就是1
29)	-s是判断文件是否不为空，！-s判断文件是否为空文件，要和字符串的-z     和-n区分开
28)	test -r i2cdetect;echo $? 判断icdetect文件是不是可读的l
27)	ln -s file1 test1   if[ -L ./test1 ];echo $? 0 判断是不是一个链接文件
26)	echo $$ ？？？  echo $$  返回登录shell的PID
25)	let n=n**3 计算一个数的幂值
24)	[ file -ef file2 ];echo $? 比较两个文件是否一致，也就是他们的id号是否一致，内容一致id号也会不一致
23)	[ !-d ./dir1 ]; 判断一个文件不是目录
22)	记得if[  ] 判断的时候只有一个等号
21)	echo 1 >> 1.txt 会直接创建1.txt文件
20)	if 和elif后面需空格
19)	for i in $(seq 2 $[$val-1]) 等价于 for i in `seq 2 $[$val-1]`
$() 和` `效果一样
注：if后面有空格，中括号两边有空格
$[$i%2] 引用变量必须这样写
18)	if [ $(($i%2)) -eq 0 ]; then
17)	[ -s file5 ]  ||  echo hby 在终端可以这样使用
16)	touch file{5..8} 可以创建file5到file8之间包括自身的所有文件	
15)	for i in {2..22} 写法正确，for i in{2..$val} 写法错误，因为for中只能指定确定的数值
14)	查看用户组 cat /etc/group 查看用户 cat /etc/passwd
13)	往一个组里添加用户 useradd -G class u1 往clas这个组里添加u1这个用户
12)	创建一个组 groupadd class 创建一个用户useradd u1p
11)	echo 123456|passwd --stdin stu01 给一个用户设置密码
10))	time ./shezhimima.sh 查看脚本运行时间
9)	echo $RANDOM 打印一个随机数
tail -1的作用就是打印下面的一行，所以上面的命令就可以筛选第三行
head -3 phonenum.txt |tail -1 
8)	head -3 phonenum.txt 打印phonenum.txt 的前3行
7)	shell界面写true，接下里echo $?就打印0 写false就打印1
6)	ping -c1 $ip.$i $>/dev/null 可以有这样的写法
5)	echo -n "hello world" 不换行打印 
4)	./1.sh & 放到后台运行
echo $ip 就是10.1.1.1
1.txt的内容是 10.1.1.1 hby 
3)	read ip user < 1.txt
2)	若直接换行直接输入echo即可，不需要后面添加内容，可以自动换行
sort -u 的作用是剔除相同行，wc -l是计算行数
1)	cat phonenum.txt |sort -u|wc -l
1.2 常用shell脚本命令
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

