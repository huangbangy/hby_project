# Shell 脚本常用写法

> 从 `0_知识大杂烩` 原始备份按行号整理，内容未做语义改写。

## 原始行 56-141

1.2 常用shell脚本命令
1)	cat phonenum.txt |sort -u|wc -l
sort -u 的作用是剔除相同行，wc -l是计算行数
2)	若直接换行直接输入echo即可，不需要后面添加内容，可以自动换行
3)	read ip user < 1.txt
1.txt的内容是 10.1.1.1 hby 
echo $ip 就是10.1.1.1
4)	./1.sh & 放到后台运行
5)	echo -n "hello world" 不换行打印 
6)	ping -c1 $ip.$i $>/dev/null 可以有这样的写法
7)	shell界面写true，接下里echo $?就打印0 写false就打印1
8)	head -3 phonenum.txt 打印phonenum.txt 的前3行
head -3 phonenum.txt |tail -1 
tail -1的作用就是打印下面的一行，所以上面的命令就可以筛选第三行
9)	echo $RANDOM 打印一个随机数
10))	time ./shezhimima.sh 查看脚本运行时间
11)	echo 123456|passwd --stdin stu01 给一个用户设置密码
12)	创建一个组 groupadd class 创建一个用户useradd u1p
13)	往一个组里添加用户 useradd -G class u1 往clas这个组里添加u1这个用户
14)	查看用户组 cat /etc/group 查看用户 cat /etc/passwd
15)	for i in {2..22} 写法正确，for i in{2..$val} 写法错误，因为for中只能指定确定的数值
16)	touch file{5..8} 可以创建file5到file8之间包括自身的所有文件	
17)	[ -s file5 ]  ||  echo hby 在终端可以这样使用
18)	if [ $(($i%2)) -eq 0 ]; then
$[$i%2] 引用变量必须这样写
注：if后面有空格，中括号两边有空格
$() 和` `效果一样
19)	for i in $(seq 2 $[$val-1]) 等价于 for i in `seq 2 $[$val-1]`
20)	if 和elif后面需空格
21)	echo 1 >> 1.txt 会直接创建1.txt文件
22)	记得if[  ] 判断的时候只有一个等号
23)	[ !-d ./dir1 ]; 判断一个文件不是目录
24)	[ file -ef file2 ];echo $? 比较两个文件是否一致，也就是他们的id号是否一致，内容一致id号也会不一致
25)	let n=n**3 计算一个数的幂值
26)	echo $$ ？？？  echo $$  返回登录shell的PID
27)	ln -s file1 test1   if[ -L ./test1 ];echo $? 0 判断是不是一个链接文件
28)	test -r i2cdetect;echo $? 判断icdetect文件是不是可读的l
29)	-s是判断文件是否不为空，！-s判断文件是否为空文件，要和字符串的-z     和-n区分开
30)	test -z "hello";echo $? 前面为空就会打印0,echo &?假就是1所以打印的是1，-z 就是空就是1，非空就是0，所以test –z “hello” 执行的结果就是0，但是echo $?结果0打印就是1
32)	echo $(( 256*22 ))等价于echo $[ 256*22 ]
33)	-e	判断文件是否存在（link文件指向的也必须存在）	exists
34)	-f	判断文件是否存在并且是一个普通文件	file
35)	 [ -d  ./file1 ];echo $? 如果是目录文件在就会打印0，但是是文件的话就打印别的数字
36)	ll -i 可以显示inode号
37)	$0 当前执行脚本的名字，$1 当前执行脚本的第一个参数一次类推，$* 脚本输入的所有的参数和$@一样
38)	echo $?查看上一次的shell命令有无执行成功，成功的话就会显示0，没有成功就会显示别的数字
39)	ccc=itcast export ccc 等价于export ccc=itcast 和declare -x 定义一个环境变量和export一样
40)	/etc/profile 全局环境变量信息
41)	env 查看当前用户的环境变量
42)	declare -r B=111  定义B只读
43)	双引号可以引用变量
44)	read -p "Input": ip < ip.txt 把ip.txt的内容当作密码输入给ip
45)	B=$(uname -r)等同于b=`uname -r`
46)	echo ${A:2:3} 截取第2个字符的后面三个
47)	read -t 3 -p "input": name 限制输入三秒
48)	read -n 5 -p "INput your name": name 限制输入个数
49)	read -s -p "Input your name  " pass 隐藏密码
50)	read -p "Input your name" name 输出相应提示
51)	unset取消变量
52)	bash -x 25.sh 查看脚本调试过程
53)	bash -n  查看脚本语法有误错误
54)	cat phonenum.txt |sort -u|wc –l  sort -u 的作用是剔除相同行，wc -l是计算行数
55)	grep -v 就是反向查找，查找不含后续字段的行
56)	grep -w 就是精准查找，默认只匹配一个单词
57)	shell中if[-z]就是后面是数据是空的它就是真的，就成立
58)	awk -F 后面加一个.就是指定了分隔符
59)	awk {print $2} 就是一行行读取文件，以空格为分割符，打印第二个字段
60)	modprobe命令用于智能地向内核中加载模块或者从内核中移除模块
61)	depmod -a
这个命令一般放在make modules_install之后。depmod可检测模块的相依性，供modprobe在安装模块时使用。
62)	ggYG复制全部
63)	数组有两种定义的方式一种是单个单个定义
array[0]=hby
array[1]=harry
还有一种是整体定义
arry={5 6 7}
获取数组的第一个元素是
echo ${array[0]}
获取数组的所有元素
echo ${array[*]}
获取数据所有元素的个数
echo ${#array[*]}
echo ${arry[*]:1:3} 打印这个数组下标为1后的三个元素
64)	source和./执行脚本的区别？？？
65)	grep -s 选项表示不显示不存在或无匹配文本的错误信息
66)	sed -n 4p打印第四行

## 原始行 231-244

2.3.5 常用的shell结构
2.3.5.1 for循环
1.for letter in {a..z}; 
2.do
3.        dd if=/dev/sda$letter of=/dev/null bs=512k count=200 iflag=direct >/tmp/ddresult_devsday
4.        echo $letter
5.done 
6.







