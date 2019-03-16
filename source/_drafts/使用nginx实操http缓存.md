---
title: 使用nginx实操http缓存
tags: 缓存 nginx
---
### http 缓存综述
1. 针对http请求/响应，可以对其中满足要求的一部分进行缓存。在某个请求发起后，如果缓存判断可以以之前的响应直接或经初始服务器验证后作为响应，那么就可以避免与目标服务器的再次请求或简化请求。
2. 缓存可以是在当前的http请求的宿主中，也可以是中间服务器代理中。通过 cache-control 中的 public/private 指令可以控制之。
3. 缓存时，会缓存这个请求/响应对
4. 对一个请求响应进行缓存，要满足一些条件，
5. 使能对一个请求/响应的缓存需要同时满足: 
  1. 需要该请求的方法在 cache 中被定义为可缓存；
      1. this specification defines GET, HEAD, and POST as
   cacheable, although the overwhelming majority of cache
   implementations only support GET and HEAD.
  2. response 的状态码可以被识别；
  3. request/response 中没有出现 no-store 指令；
  4. 如果 cache 是共享的，那么不能在有 private 指令时进行缓存；
  5. 如果 cache 是共享的，request 中没有出现 Authorization 域时才可进行缓存(除非response 中有明确允许缓存)；
  6. 对于 response, 要满足: (包含 Expires 头部 || 包含 max-age 指令 || 包含 s-maxage 指令且 cache 是共享的 || 包含一个允许被缓存的 Cache-Control 扩展 || 状态码默认允许被缓存)
6. 判断缓存中的某个响应是否命中请求的条件(也就是缓存时候的key): 
7. 请求中可以通过 cache-control 来控制一些行为: 
    1. 在有 no-cache 指令时，不可直接使用缓存的响应进行响应，必须至少经过验证
    2. 在有 no-store 指令时，不允许对响应进行缓存
    3. 其他如 max-age max-stale min-fresh 等指令是控制响应的时间匹配规则的
8. 响应中也可以通过 cache-control 来控制一些行为:
    1. must-revalidate 指令要求在响应处于 stale 状态时必须进行验证，若验证失败则返回 504
    2. no-cache 类似请求中，不允许直接使用一个缓存中的响应去响应，必须到服务器验证，即便是 fresh 的
    3. no-store 同上
    4. max-age 控制的是所有的 cache 的最大生命时间，s-maxage 控制的是中间服务器的最大生命时间
    5. Expires 字段的值应该是一个时间戳，其优先级低于 cache-control 中的 max-age 和 s-maxage。它指示一个过期时间；但如果不是一个时间戳，也应该被识别，例如 0 应被理解为 '已过期'。
9.  如果请求中设置了 no-store，当前这个请求是可以被缓存所响应的。如果它没有被缓存响应，那么它的响应不应该被缓存。
10. 如果请求或响应中有 no-cache，那么缓存在试图响应时始终要进行验证。
11. 如果请求中没有 no-cache，那么缓存可以在一个响应是 fresh 的时候进行直接响应。
    1.  fresh 的计算规则:
      1.  response_is_fresh = (freshness_lifetime > current_age)
          1.  如何计算一个响应的新鲜时间 freshness_lifetime: 
            1.  如果响应有 s-maxage 指令，使用其值
            2.  否则如果响应有 max-age 指令，使用其值
            3.  否则如果有 Expires 头部，使用它减去响应的 Date 头部值
            4.  否则就由缓存决定一个默认的值。如果响应中有 Last-Modified 头部，可以使用这个字段来计算，一般取它与当前时刻的 10%。
          2.  如何计算 current_age:
            1.  这个值是当前缓存对这个响应从初始服务器发送它到现在的时间差的一个估计
            2.  如果简单计算，就是 now - date_time. date_time 是 Date 头部所指示的时间
            3.  规范中有一个详细的计算规则，如下
            4.  current_age = corrected_initial_age + resident_time
            5.  resident_time = now - response_time
            6.  corrected_initial_age = max(apparent_age, corrected_age_value);
            7.  apparent_age = max(0, response_time - date_value);
            8.  corrected_age_value = age_value + response_delay;
            9.  response_delay = response_time - request_time;
            10. age_value 是头部中的 Age 字段的值。如果有个头部，说明当前响应是由中间服务器所提供的，因为初始服务器不会带此字段
    2.  当判断为 stale 时，如果缓存所在的当前节点 (已经无法访问目标服务器) 或者 (有其他配置允许直接发送 stale 的响应)，那么会发送该响应，同时使用 warn code 来提示请求方
      1.  如何配置使能 stale 缓存直接响应？
        1.  使用 max-stale 指令，且没有设置如 no-cache 或 must-revalidate 这样的字段。
    3.  如果不允许直接响应，且可以连接目标服务器，则会进行验证流程。
      1.  验证流程中需要的头部字段有哪些？
        1.  使用响应中的 ETag 来构造请求中的 If-None-Match / If-Match / If-Range
          1.  If the response to the forwarded request is 304 (Not Modified) and has an ETag header field value with an entity-tag that is not in the client's list, the cache MUST generate a 200 (OK) response for the client by reusing its corresponding stored response, as updated by the 304 response metadata (Section 4.3.4). 
        2.  使用响应中的 Last-Modified 来 构造请求中的 If-Modified-Since / If-Unmodified-Since / If-Range 头部
        3.  两者中 ETag 具有较高的优先级。当有前者时使用前者。
        4.  为什么要有这两个，分别适合什么场景？
          1.  The Last-Modified response HTTP header contains the date and time at which the origin server believes the resource was last modified. It is used as a validator to determine if a resource received or stored is the same. Less accurate than an ETag header, it is a fallback mechanism. 
          2.  ETag 相比 Last-Modified 的优势: An entity-tag can be ***more reliable*** for validation than a modification date in situations ***where it is inconvenient to store modification dates, where the one-second resolution of HTTP date values is not sufficient, or where modification dates are not consistently maintained.***
          3.  此外，Last-Modified 总是根据文档的修改时间属性来判断的。如果一个文件我们进行了edit，但是实际上并没有改动内容，那么它也会有一个新的 modified time，于是旧的缓存失效。使用 ETag 可以避免这种情况。
          4.  此外，Last-Modified 因为依赖于时间，会在时间的分辨率上出现误差，比如在1s内的更新导致时间没有变化，那么就会忽略掉这次更新。
          5.  ETag 默认是 strong 的，但也可以是 weak 的，这时应该在值前用大写 W/ 标记: An entity-tag can be either a weak or strong validator, with strong being the default.  If an origin server provides an entity-tag for a representation and the generation of that entity-tag does not satisfy all of the characteristics of a strong validator (Section 2.1), then the origin server MUST mark the entity-tag as weak by prefixing its opaque value with "W/" (case-sensitive).
12. 什么是 weak validator，什么是 strong validator?
    1.  要求强匹配是 strong，弱匹配是 weak。ETag 默认是强匹配，此时它只能匹配同样是强匹配的缓存。
13. vary 字段什么作用？
    1.  用于 客户端/服务端沟通。对于一个特定的请求，服务端该以什么形式提供资源响应，或者选择哪个资源，称为 沟通策略。
    2.  A specific document is called a resource. When a client wants to obtain it, it requests it using its URL. The server uses this URL to choose one of the variants it provides – each variant being called a representation – and returns this specific representation to the client. The overall resource, as well as each of the  representations, have a specific URL.
    3.  策略分为两种: 服务端驱动沟通 和 客户端驱动(或主动)沟通。
    4.  服务端驱动沟通: 由服务端自己选择某个资源，其依据就是请求中的一些头部字段，比如 Accept / Accept-Encoding / Accept-Language / Accept-Charset。
    5.  客户端驱动(或主动)沟通: 服务端提供一个供客户端进行选择的选项响应，客户端进行选择后再发起请求，然后服务端以指定形式响应指定资源。但http规范没有规定供用户进行选择时的页面形式。
    6.  > The Vary HTTP response header determines how to match future request headers to decide whether a cached response can be used rather than requesting a fresh one from the origin server. ***It is used by the server to indicate which headers it used when selecting a representation of a resource in a content negotiation algorithm. ***
    7.  > The Vary header should be set on a 304 Not Modified response exactly like it would have been set on an equivalent 200 OK response.
    8.  所以缓存在响应某个 representation 时，需要判断它的 vary 中规定的字段 是否跟请求中的对应字段一致，不一致则不能响应。例如如果缓存中 representation 的 vary: *，那么任何缓存都不可以使用，因为服务端产生此 representation 时的决定性 header 未知，因此无法进行匹配比较和响应。如果是 "vary: Accept-Encoding"，那么只要请求中的 "Accept-Encoding" 和该 representation 的 "Accept-Encoding" 一致就可以以该缓存响应了。
14. memory cache 与 disk cache 的区别？
  1.  "Memory Cache" stores and loads resources to and from Memory (RAM). So this is much faster but it is non-persistent. Content is available until you close the Browser.
  2.  "Disk Cache" is persistent. Cached resources are stored and loaded to and from disk.
  3.  Simple Test: Open Chrome Developper Tools / Network. Reload a page multiple times. The table column "Size" will tell you that some files are loaded "from memory cache". Now close the browser, open Developper Tools / Network again and load that page again. All cached files are loaded "from disk cache" now, because your memory cache is empty.

### 使用 nginx 实操
15. 首先开启一个本地服务器
16. 通过设置不同的缓存策略来更改缓存模型


本地nginx目录: 
配置放置目录: /usr/local/etc/nginx
执行文件放置目录: /usr/local/bin

### 引用
> The goal of caching in HTTP/1.1 is to significantly improve
   performance by reusing a prior response message to satisfy a current
   request.  A stored response is considered "fresh", as defined in
   Section 4.2, if the response can be reused without "validation"
   (checking with the origin server to see if the cached response
   remains valid for this request).  A fresh response can therefore
   reduce both latency and network overhead each time it is reused.
   When a cached response is not fresh, it might still be reusable if it
   can be freshened by validation (Section 4.3) or if the origin is
   unavailable (Section 4.2.4).

> The primary cache key consists of the request method and target URI.
   However, since HTTP caches in common use today are typically limited
   to caching responses to GET, many caches simply decline other methods
   and use only the URI as the primary cache key.

除非满足第 3 节中开头的条件，否则 cache 不应该缓存该请求的响应。这里判断一个 request/response 是否可以缓存，需要该请求的方法在 cache 中被定义为可缓存；response 的状态码可以被识别；request/response 中没有出现 no-store 指令；如果 cache 是共享的，那么不能在有 private 指令时进行缓存；如果 cache 是共享的，request 中没有出现 Authorization 域时才可进行缓存(除非response 中有明确允许缓存)；对于 response, 要满足: (包含 Expires 头部 || 包含 max-age 指令 || 包含 s-maxage 指令且 cache 是共享的 || 包含一个允许被缓存的 Cache-Control 扩展 || 状态码默认允许被缓存)

从这段话里，可以理解 cache 应该是每个中间服务器或浏览器中的一段专用空间。所谓 共享的cache ，应该是指中间节点？

> When a stored response is used to satisfy a request without
   validation, a cache MUST generate an Age header field (Section 5.1),
   replacing any present in the response with a value equal to the
   stored response's current_age; see Section 4.2.3.

> A fresh response is one whose age has not yet exceeded its freshness
   lifetime.  Conversely, a stale response is one where it has.

> When a response is "fresh" in the cache, it can be used to satisfy
   subsequent requests without contacting the origin server, thereby
   improving efficiency.

> If an origin server wishes to force a cache to validate every
   request, it can assign an explicit expiration time in the past to
   indicate that the response is already stale.  Compliant caches will
   normally validate a stale cached response before reusing it for
   subsequent requests (see Section 4.2.4).


注意这里对这个值的计算不会受到当前机器时间偏差的影响，因为即便是步骤3，也是都以原始响应服务器的时间去计算的。



### cache-control 字段的含义
request 中: 
> The "no-cache" request directive indicates that a cache MUST NOT use
   a stored response to satisfy the request without successful
   validation on the origin server.

<blockquote>
The "no-store" request directive indicates that a cache MUST NOT
   store any part of either this request or any response to it.  This
   directive applies to both private and shared caches.  "MUST NOT
   store" in this context means that the cache MUST NOT intentionally
   store the information in non-volatile storage, and MUST make a
   best-effort attempt to remove the information from volatile storage
   as promptly as possible after forwarding it.

   This directive is NOT a reliable or sufficient mechanism for ensuring
   privacy.  In particular, malicious or compromised caches might not
   recognize or obey this directive, and communications networks might
   be vulnerable to eavesdropping.

   Note that if a request containing this directive is satisfied from a
   cache, the no-store request directive does not apply to the already
   stored response.
</blockquote>

no-cache 与 no-store 的区别？
1. 在 request 中，
  1. 前者指示任何试图提供响应的宿主或中间服务器，不可使用未经初始服务器验证的缓存中 response
  2. 后者指示这个请求以及它的响应，不可以被任何前述宿主或中间服务器所缓存。但这个指令不足以称为保证这个请求／响应的私有性的保证。***特别注意，如果带有这个指令的请求已经被某个缓存命中，那么这个缓存会被用来提供响应，这是允许的。***
  3. 所以 no-store 的意思，就是 ***禁止存储***。一般说通过它来禁止缓存，是指通过禁止存储来禁止缓存。而 no-cache，也是准确地禁止使用缓存来作响应。



### ref
1. [Hypertext Transfer Protocol (HTTP/1.1): Caching](https://tools.ietf.org/html/rfc7234#section-5.1)