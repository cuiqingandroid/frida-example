## frida安装
### 安装frida pc端
```
$ pip3 install frida
$ pip3 install frida-tools
```

### 安装frida 手机端

[下载链接](https://github.com/frida/frida/releases)，找到手机对应的版本，下载解压
```
$ adb push frida-server-12.8.20-android-arm64 /data/local/tmp
$ adb shell
$ adb chmod a+x /data/local/tmp/frida-server-12.8.20-android-arm64
```
端口转发
```
$ adb forward tcp:27042 tcp:27042
$ adb forward tcp:27043 tcp:27043
```

#### 关闭selinux(可选)
使用setenforce 命令进行设置:
```
$ adb shell setenforce 0 //关闭selinux
$ adb shell setenforce 1 //打开selinux
```
注意此方法重启后失效

## 开发
### 环境依赖
- node 
- npm


### 编译依赖

```
$ git clone git@github.com:cuiqingandroid/frida-example.git
$ cd frida-example/
$ npm install
```

### 开发工具

推荐使用pycharm

### 运行

python3 duia.py