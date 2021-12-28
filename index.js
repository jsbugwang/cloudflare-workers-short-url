const config = {
  cors: 'on'
}

let responseHeaders = {
  'content-type': 'text/html; charset=utf-8',
}
if (config.cors == 'on') {
  responseHeaders = {
    ...responseHeaders,
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST',
  }
}

function randomString(len = 6) {
  // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
  const CHARS = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  let result = ''
  for (i = 0; i < len; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

/**
 * 生成短网址，重复提交相同的 url ，会生成新的短网址
 * @param {String} url 需要生成短网址的 url 
 * @returns 短网址的 key 部分
 */
async function genShortUrlKey(url) {
  let key = randomString()
  let shortUrl = await LINKS.get(key)
  // key 冲突了，重新生成
  if (shortUrl !== null) {
    return genShortUrlKey(url)
  }

  // 同一个边缘立即可读，其他可能有 60s 左右的延迟。put 返回一个 promise
  let result = await LINKS.put(key, url)
  console.log(result)
  return key
}

function reponse404() {
  return new Response(`<!DOCTYPE html>
    <body>
      <h1>404 Not Found.</h1>
    </body>`, {
    headers: reponseHeaders,
    status: 404
  })
}

async function handleGenarateRequest(request) {
  if (request.method === 'POST') { // POST 对应的 HTTP 响应返回 JSON
    let headers = {...responseHeaders, 'content-type': 'application/json; charset=utf-8'}
    let req = await request.json()

    // 检查 URL 合法性
    if (!/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(req.url)) {
      // `{'status':500,'key':': Error: Url illegal.'}`
      return new Response(JSON.stringify({
        code: 1,
        msg: '非法URL'
      }), {
        status: 500,
        headers
      })
    }

    let shortUrlKey = await genShortUrlKey(req.url)
    console.log(`shortUrlKey=${shortUrlKey}`)
    return new Response(JSON.stringify({
      code: 0,
      data: {
        key: shortUrlKey
      }
    }), {
      headers
    })
  } else if (request.method === 'OPTIONS') { // 跨域 preflight
    return new Response({
      headers: reponseHeaders
    })
  }
}

async function handleRedirectRequest(request) {
  // 获取短网址的 key ，去掉 pathname 的 / 前缀
  let key = new URL(request.url).pathname.substring(1)
  if (!key) {
    return reponse404()
  }

  // 从 KV 查询原始 URL 
  const originalUrl = await LINKS.get(key)

  // 没有找到短链接，返回 404 页面
  if (!originalUrl) {
    return reponse404()
  }

  return Response.redirect(originalUrl, 302)
}

async function handleRequest(request) {
  console.log(request)
  if (request.method === 'POST' || request.method === 'OPTIONS') {
    return handleGenarateRequest(request)
  }

  if (request.method === 'GET') {
    return handleRedirectRequest(request)
  }

  return new Response(JSON.stringify({
    code: 2,
    msg: '非法请求方法，只支持 GET POST OPTIONS'
  }), {
    status: 500,
    headers
  })
}

async function handleRequestHello(request) {
  return new Response("Hello worker!", {
    headers: { "content-type": "text/plain" }
  })
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
