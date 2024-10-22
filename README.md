# 掘金自动签到脚本


## 代码结构说明
- service： 登录滑块认证服务
- src： puputeer 模拟登录

## 自动签到原理

使用puputeer自动化输入账号密码登录，遇到验证码认证计算滑块位置，然后模拟滑动


## 使用说明 config.js

LOGIN_USER 登录账号密码
EMAIL_RECEIVER 签到接受短信接受邮箱
SERVER_URI 登录验证服务器地址


## TODO
登录成功后存储cookie，第二次登陆可以用cookie登录，待cookie过期后，再用账号密码登录