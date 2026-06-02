# Shell 脚本常用写法

这份笔记整理 Bash 中最常用的语法和容易出错的点。

## 变量与特殊参数

| 写法 | 含义 |
| --- | --- |
| `$0` | 当前脚本名 |
| `$1`、`$2` | 第 1、第 2 个参数 |
| `$*` | 所有参数，偏向当作一个整体 |
| `$@` | 所有参数，偏向保留每个参数边界 |
| `$?` | 上一条命令的退出状态，成功通常为 `0` |
| `$$` | 当前 Shell 进程 PID |
| `$RANDOM` | 随机数 |
| `B=$(uname -r)` | 命令替换，推荐写法 |
| `B=\`uname -r\`` | 命令替换，老写法 |
| `unset name` | 删除变量 |
| `declare -r B=111` | 定义只读变量 |
| `export ccc=itcast` | 定义环境变量，传给子进程 |

```bash
A="abcdef"
echo "${A:2:3}"   # 从下标 2 开始取 3 个字符，输出 cde
```

## 输入、输出与重定向

| 写法 | 用途 |
| --- | --- |
| `echo` | 输出空行 |
| `echo -n "hello"` | 输出但不换行 |
| `echo 1 >> 1.txt` | 追加写入，文件不存在会创建 |
| `read ip user < 1.txt` | 从文件读取两个字段到变量 |
| `read -p "Input: " name` | 带提示读取输入 |
| `read -t 3 -p "Input: " name` | 限制 3 秒输入 |
| `read -n 5 -p "Input: " name` | 限制输入 5 个字符 |
| `read -s -p "Password: " pass` | 隐藏输入，适合密码 |
| `./1.sh &` | 后台运行脚本 |

```bash
ping -c1 "$ip.$i" >/dev/null
echo $?   # 查看 ping 是否成功
```

## 判断条件

`if` 后要有空格，`[` 和 `]` 两侧也要有空格。

```bash
if [ "$name" = "hby" ]; then
    echo "matched"
elif [ -z "$name" ]; then
    echo "empty"
fi
```

| 条件 | 含义 |
| --- | --- |
| `[ -e file ]` | 文件存在 |
| `[ -f file ]` | 存在且是普通文件 |
| `[ -d dir ]` | 存在且是目录 |
| `[ ! -d dir ]` | 不是目录或目录不存在 |
| `[ -s file ]` | 文件存在且非空 |
| `[ -z "$str" ]` | 字符串为空 |
| `[ -n "$str" ]` | 字符串非空 |
| `[ -L link ]` | 是符号链接 |
| `test -r file` | 文件可读 |
| `[ file1 -ef file2 ]` | 两个路径是否指向同一个 inode |

## 算术

```bash
echo $((256 * 22))
echo $[256 * 22]       # 老写法，不推荐新脚本继续用
let n=n**3

if [ $((i % 2)) -eq 0 ]; then
    echo "even"
fi
```

## 循环

大括号展开只能写确定范围，不能直接写变量范围。

```bash
for i in {2..22}; do
    echo "$i"
done

for i in $(seq 2 "$((val - 1))"); do
    echo "$i"
done

for letter in {a..z}; do
    dd if="/dev/sda${letter}" of=/dev/null bs=512k count=200 iflag=direct >/tmp/ddresult_devsda${letter}
    echo "$letter"
done
```

## 数组

```bash
array[0]=hby
array[1]=harry

nums=(5 6 7)

echo "${array[0]}"       # 第一个元素
echo "${array[*]}"       # 所有元素
echo "${#array[*]}"      # 元素个数
echo "${nums[*]:1:3}"    # 从下标 1 开始取 3 个元素
```

## 文本处理

| 命令 | 用途 |
| --- | --- |
| `sort -u phonenum.txt | wc -l` | 去重后统计行数 |
| `head -3 phonenum.txt | tail -1` | 取第 3 行 |
| `grep -v xxx file` | 反向查找，不包含 `xxx` 的行 |
| `grep -w xxx file` | 精准匹配单词 |
| `grep -s xxx file` | 不显示不存在或无匹配的错误信息 |
| `awk -F '.' '{print $2}' file` | 指定 `.` 为分隔符，打印第 2 列 |
| `awk '{print $2}' file` | 默认按空白分隔，打印第 2 列 |
| `sed -n '4p' file` | 打印第 4 行 |

## 用户、组与模块

```bash
groupadd class
useradd u1
useradd -G class u1

cat /etc/group
cat /etc/passwd

echo 123456 | passwd --stdin stu01

modprobe i2c-i801
depmod -a
```

`depmod -a` 一般放在 `make modules_install` 之后，用来生成模块依赖信息，供 `modprobe` 使用。

## 调试脚本

| 命令 | 用途 |
| --- | --- |
| `bash -n 25.sh` | 只检查语法，不执行 |
| `bash -x 25.sh` | 打印执行过程，方便调试 |
| `time ./script.sh` | 查看脚本运行时间 |
| `source ./script.sh` | 在当前 Shell 执行，变量会影响当前环境 |
| `./script.sh` | 开子 Shell 执行，变量通常不影响当前环境 |

## 易错点

- `[ ! -d ./dir1 ]` 中 `!` 后面要有空格。
- 字符串比较常用一个等号：`[ "$a" = "$b" ]`。
- `$?` 表示退出状态，`0` 通常是真成功，非 `0` 通常是失败。
- `>` 会覆盖文件，`>>` 会追加文件。
- 双引号可以引用变量，也能避免变量为空或包含空格时把命令拆坏。
