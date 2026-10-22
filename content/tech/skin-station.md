---
title: 皮肤站
description: 皮肤站负责账号、Yggdrasil 认证、材质签名与皮肤库，并作为全国 MUA 的成员站对外提供接口。
---

# 皮肤站

`federated-skinstation` 是一个 Fastify 服务，前端在 `/portal/`，接口在站点根路径。

## 职责

| 能力 | 说明 |
| --- | --- |
| 账号 | 学校邮箱注册、验证、重置密码；一个账号一个主角色，可加附加角色 |
| Yggdrasil | `/authserver/*`（authenticate/refresh/validate/invalidate/signout）与 `/sessionserver/*`（join/hasJoined） |
| 材质 | 皮肤与披风上传、签名、按哈希公开读取（`/textures/:hash`） |
| 皮肤库 | 公开材质与个人衣柜 |
| 通行密钥 | 支持 Passkey 登录 |
| MUA 成员站 | `/api/union/member/*`，按全国规范与 Hub 同步 |

## 设备码授权

启动器不是浏览器，登录走 OIDC 设备码流程：

1. 启动器向皮肤站请求设备码与验证地址
2. 玩家在浏览器里完成授权
3. 启动器轮询拿到令牌，`id_token` 用 JWKS 里的公钥验签
4. 按 `selectedProfile` 取角色，刷新令牌轮换并拒绝重放

## 材质统一签名

材质属性由皮肤站用同一把私钥签名，各校联邦服务器原样转发给游戏客户端，共用同一条签名校验链。

## 运维要点

- `GET /health/live` 与 `GET /health/ready` 供反代与监控使用
- 配置分 `origin`、`smtp`、`mua` 等段落，密钥通过环境变量指向本地文件
- 只有一台实例（联盟共用），各校靠学校邮箱域名区分
