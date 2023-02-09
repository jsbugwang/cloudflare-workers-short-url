## 速览

我发布了一个 [https://short.bugwang.workers.dev/rTJJPm](https://short.bugwang.workers.dev/rTJJPm)，点击会 302 到 [https://jsbug.wang/](https://jsbug.wang/) 即表示成功了。

## 运行

```
$ wrangler dev
```

## 发布

注意 `wrangler.toml` 要修改：

```
type = "webpack"
```

```
$ wrangler publish
```

## 测试

### 1. 生成短链接

```
curl -d "{\"url\":\"https://jsbug.wang/\"}" "http://127.0.0.1:8787"
```

返回类似如下的 JSON ：

```
{"code":0,"data":{"key":"QnjXCC"}}
```
### 2. 访问短链接

访问：[http://127.0.0.1:8787/QnjXCC](http://127.0.0.1:8787/QnjXCC) 会跳转到 [https://jsbug.wang/](https://jsbug.wang/) 即表示成功了。

这是一个绝好的项目！
Test
