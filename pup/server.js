/**
 * @file: server.js
 * @description:  支付宝扫码登录获取cookie
 * @package: alipay-qrcode-get-cookies
 * @create: 2021-05-23 12:12:32
 * @author: qiangmouren (2962051004@qq.com)
 * -----
 * @last-modified: 2022-07-26 03:13:56
 * -----
 */

const express = require('express');
const app = express();
const router = express.Router({ caseSensitive: true });
const Redis = require("ioredis");
const redis = new Redis({
  port: 6665, // Redis port
  host: "localhost", // Redis host
  username: "", // needs Redis >= 6
  password: "fs520131499Aa+~",
  db: 0, // Defaults to 0
});
const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs-extra');
EventEmitter.defaultMaxListeners = 100;

/** @type {{[key:string]:{page:import("puppeteer").Page, browser:import("puppeteer").Browser, state:string, time:number}} */
let task_page_map = {};

const _log = console.log;
console.log = () => { };

const mainFrameUrl = 'https://auth.alipay.com/login/index.htm?goto=https%3A%2F%2Fb.alipay.com%2Fpage%2Fhome';
const mainFrameHomeUrl = 'https://b.alipay.com/page/home';
router.get('/api/create', async (req, res, next) => {
  const id = (() => {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
  })();

  const { browser, page } = await newTask(id);
  try {
    task_page_map[id] = { page, state: '', time: Date.now(), browser, sid: 0, cookies: '' };
    redis.sadd(`cache:temp`, id)
    page.on('response', async (response) => {
      if (response.url().includes("service.json?ctoken=")) {
        //获取此时的cookies
        let cookies = await page
          .cookies()
          .then((x) => x.map(({ name, value }) => `${name}=${value}`).join(";"));
        task_page_map[id].cookies = cookies;
        let uid = cookies.match(/uid=(\d+)/)[0].replace('uid=', '');
        if (uid) {
          task_page_map[id].uid = uid;
          redis.sadd(`cache:cookies`, id)
          redis.set(`cache:idbinduid:${id}`, uid)
          redis.set(`cache:cookies:${uid}`, task_page_map[id].cookies)
          redis.set(`cache:status:${uid}`, '1')
          //删除临时任务
          redis.srem(`cache:temp`, id)
        }
      }
      if (response.url().includes('barcodeProcessStatus.json')) {
        let uid = await redis.get(`cache:idbinduid:${id}`)
        if (uid) {
          task_page_map[id].cookies = ''
          task_page_map[id].state = 'fail'
          //先获取id对应的uid
          //cookie失效
          await redis.set(`cache:status:${uid}`, '0')
        }

      }
      if (response.url().includes('rmsportal')) {
        //_log('繁忙:' + page.url())
        // await page.goto(mainFrameHomeUrl);
      }
    });
    try {
      //页面5分钟刷新一次
      task_page_map[id].sid = setInterval(async () => {
        await page.reload({
          timeout: 0,
        });

      }, 1 * 60 * 1000);
    } catch (error) {
      _log('页面刷新失败', error);
    }


    await page.goto(mainFrameUrl);
    await page.waitForSelector('.barcode');
    const element = await page.$('.barcode');
    const image = await element.screenshot().then((x) => `data:image/png;base64,${x.toString('base64')}`);
    const length = getTaskLength();
    res.json({ code: 1, image, id, tasks: length });
  } catch (error) {
    Reflect.deleteProperty(task_page_map, id);

    const length = getTaskLength();
    res.json({ code: 0, msg: '服务器正忙，请稍候重试', tasks: length });
    browser.close();
  }
});

//关闭浏览器
router.get('/api/close/:id', async ({ params }, res, next) => {
  _log('关闭浏览器' + params.id);
  const task = task_page_map[params.id];
  const length = getTaskLength();
  if (!task) {
    res.json({
      code: 0,
      msg: 'id不存在或任务已结束',
      tasks: length,
    });
    return;
  }
  //判断是否有cookies

  //清除定时器
  clearInterval(task.sid);
  await task.browser.close();
  //清理redis
  redis.srem(`cache:cookies`, params.id)
  //如果有cookies，清理cookies
  if (task.cookies) {
    redis.del(`cache:cookies:${task.uid}`)
    redis.del(`cache:status:${task.uid}`)
    redis.del(`cache:idbinduid:${params.id}`)
    redis.srem(`cache:cookies`, params.id)
  }
  // /** 清理内存 */
  Reflect.deleteProperty(task_page_map, params.id);
  res.json({ code: 1, tasks: length });
})


router.get('/api/status/:id', async ({ params }, res, next) => {
  const task = task_page_map[params.id];
  const length = getTaskLength();
  if (!task) {
    res.json({
      code: 0,
      msg: 'id不存在或任务已结束',
      tasks: length,
    });
    return;
  }

  task.cookies = task.cookies || '';
  if (task.cookies && task.cookies != '') {
    //正则查找uid=后面的值
    let uid = task.cookies.match(/uid=(\d+)/)[0].replace('uid=', '');
    //判断uid是否纯数字
    // if (isNaN(uid)) {
    //   //不是纯数字，返回错误
    // }

    res.json({ code: 1, state: task.state, cookies: task.cookies || undefined, tasks: length, uid });
  } else {
    res.json({ code: 0 })
  }


});

setInterval(() => {
  //并且是分钟整数

  (getTaskLength() > 0) && (new Date().getMinutes()) % 2 == 0 ? _log(new Date().toLocaleString() + '开始检测过期任务.', '目前任务后台有效任务数量', getTaskLength()) : null;
  //打印进程占用内存 并且格式化MB
  Object.keys(task_page_map).forEach(async (id) => {
    const { time, browser, cookies, sid, state } = task_page_map[id];
    if (cookies && state != 'fail') {
      return
    }
    if (state == 'fail') {
      _log(new Date().toLocaleString(), '失败任务:', id, '已被清理', "创建时间", new Date(time).toLocaleString())
      //删除redis中的缓存
      redis.srem(`cache:temp`, id)
      redis.srem(`cache:cookies`, id)
      let uid = await redis.get(`cache:idbinduid:${id}`)
      redis.del(`cache:idbinduid:${id}`)
      redis.del(`cache:cookies:${uid}`)
      redis.del(`cache:status:${uid}`)
      clearInterval(sid)
      //无效浏览处理
      try {
        await browser.close();
        //不在redis中，删除文件夹
        await fs.emptyDir(path.join(path.join(__filename, '../cache'), id))
        //删除文件夹
        await fs.rmdir(path.join(path.join(__filename, '../cache'), id));
        Reflect.deleteProperty(task_page_map, id);
      } catch (e) {
        _log(e)
      }
    }
    else if (Date.now() - time > 1000 * 60 * 3) {
      _log('过期任务:', id, '已被关闭');
      clearInterval(sid)
      //删除路径下的cache/id文件夹
      await browser.close();
      //无效浏览处理
      try {
        //删除redis中的缓存
        redis.srem(`cache:temp`, id)
        redis.srem(`cache:cookies`, id)
        _log(path.join(path.join(__filename, '../cache'), id))
        await fs.emptyDir(path.join(path.join(__filename, '../cache'), id))
        //删除文件夹
        fs.rmdir(path.join(path.join(__filename, '../cache'), id));
      } catch (e) {
        _log(e)
      }

      Reflect.deleteProperty(task_page_map, id);
    }

  });
}, 5 * 1000);

function getTaskLength() {
  return Object.keys(task_page_map).filter((x) => task_page_map[x].browser).length;
}
async function cacheStart() {
  //清除非cookies缓存文件夹
  let caches = await redis.smembers("cache:cookies");
  //获取cache文件夹下的所有文件夹
  let cacheDir = await fs.readdir(path.join(__filename, '../cache'))
  //判断文件夹是否在redis中
  cacheDir.forEach(async (id) => {
    if (!caches.includes(id)) {
      //不在redis中，删除文件夹
      await fs.emptyDir(path.join(path.join(__filename, '../cache'), id))
      //删除文件夹
      await fs.rmdir(path.join(path.join(__filename, '../cache'), id));
    }
  })
  //删除redis中的temp缓存
  await redis.del("cache:temp");

  //查看redis是否有缓存
  let cache = await redis.smembers("cache:cookies");
  cache.forEach(async (id) => {
    const { browser, page } = await newTask(id);
    try {
      task_page_map[id] = { page, state: '', time: Date.now(), browser, sid: 0 };
      page.on('response', async (response) => {
        let _id = id
        if (response.url().includes("service.json?ctoken=")) {
          console.log("有cookies，不关闭");
          //获取此时的cookies
          let cookies = await page
            .cookies()
            .then((x) => x.map(({ name, value }) => `${name}=${value}`).join(";"));
          task_page_map[_id].cookies = cookies;
          //判断cookies是否有效
          let uid = task_page_map[_id].cookies.match(/uid=(\d+)/)[0].replace('uid=', '');

          if (uid) {
            //有效
            //设置cookies
            await redis.set(`cache:cookies:${uid}`, cookies)
            //设置状态
            await redis.set(`cache:status:${uid}`, '1')
            //删除redis中的temp缓存
            await redis.srem("cache:temp", _id)
          }
          // browser.close();
        }
        if (response.url().includes('barcodeProcessStatus.json')) {
          //先获取id对应的uid
          let uid = await redis.get(`cache:idbinduid:${_id}`)
          if (uid) {
            task_page_map[id].cookies = ''
            task_page_map[id].state = 'fail'
            //cookie失效
            await redis.set(`cache:status:${uid}`, '0')
          }

        }
      });
      //页面5分钟刷新一次
      task_page_map[id].sid = setInterval(async () => {
        await page.reload({
          timeout: 0,
        });
      }, 1 * 60 * 1000);

      await page.goto(mainFrameHomeUrl);

    } catch (error) {
      Reflect.deleteProperty(task_page_map, id);
      const length = getTaskLength();
      browser.close();
    }
  });
}
/**
 * @return {PromiseLike<{browser:import("puppeteer").Browser,page:import("puppeteer").Page}>}
 */
async function newTask(id) {
  const browser = await revisionInfo.puppeteer.launch({
    args: [
      '--no-sandbox',
      '--start-maximized',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36"',
    ],
    executablePath: '/opt/google/chrome/chrome',
    defaultViewport: { width: 375, height: 812 },
    ignoreDefaultArgs: ['--enable-automation'],
    //缓存路径
    userDataDir: path.join(path.join(__dirname, 'cache'), id),
    ignoreHTTPSErrors: true,
    headless: true,
    timeout: 0,
    pipe: true,
  });

  const [page] = await browser.pages();
  return { browser, page };
}

(async () => {
  revisionInfo = await require('puppeteer-chromium-resolver')({ hosts: ['https://npm.taobao.org/mirrors'] });
  //先读取启动缓存的浏览器实例
  await cacheStart();
  app.set('json spaces', 40);
  app.use(router);
  app.listen(3005);

  _log('程序已经运行，接口地址 http://127.0.0.1:3005/api/create');
})();
