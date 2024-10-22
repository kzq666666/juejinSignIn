const puppeteer = require("puppeteer");
const axios = require("axios");
const { JUEJIN_URI, HAS_GUI, SERVER_URI } = require("../config");


const sleep = ms => new Promise(res => setTimeout(res, ms));


const getIframeEle = async (page, iframeSelector) => {
  const iframe = await page.$(iframeSelector);
  const iframeContent = await iframe.contentFrame();
  return iframeContent;
}


const signInByAccount = async (page, username, password) => {
  await page.click(".login-button");
  await sleep(1000);
  await page.click(".clickable");
  await sleep(500);
  await page.type(".account-input", username, { delay: 120 });
  await page.type(".login-password", password, { delay: 120 });
  await page.click(".btn-login");
  await sleep(2000);

  // 这一部分需要后面更新 kk
  // 获取登录验证所需的
  const iframe = await getIframeEle(page, "#captcha_container iframe",)
  const { verifyImgUrl, verifyImgWidth, verifyImgHeight } = await iframe.$eval(
    ".captcha-verify-image",
    (e) => {
      return {
        verifyImgUrl: e.getAttribute("src"),
        verifyImgWidth: e.getBoundingClientRect().width,
        verifyImgHeight: e.getBoundingClientRect().height,
      };
    }
  );
  const { sliderImgUrl, sliderImgWidth, sliderImgHeight } = await iframe.$eval(
    "#captcha-verify_img_slide",
    (e) => {
      return {
        sliderImgUrl: e.getAttribute("src"),
        sliderImgWidth: e.getBoundingClientRect().width,
        sliderImgHeight: e.getBoundingClientRect().height,
      };
    }
  );

  const res = await axios({
    url: SERVER_URI,
    method: "post",
    data: {
      bg_url: verifyImgUrl,
      slider_url: sliderImgUrl,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const { x, width, height } = res.data;
  const distance = x / (width / verifyImgWidth);
  const elementHandle = await iframe.$(".captcha-slider-btn");

  // 获取元素的位置和大小
  const rect = await elementHandle.boundingBox();
  // 计算拖动目标位置
  const targetX = rect.x + distance;

  // 移动鼠标到元素的初始位置
  await page.mouse.move(rect.x, rect.y);

  // 按下鼠标左键
  await page.mouse.down();

  // 移动鼠标到目标位置
  await page.mouse.move(targetX, rect.y, { steps: 10 });

  // 松开鼠标左键
  await page.mouse.up();
};

const signIn = async (username, password) => {

  const browser = await puppeteer.launch({
    headless: !HAS_GUI,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537");
  const uri = JUEJIN_URI;
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(uri);

  await signInByAccount(page, username, password);

  await sleep(8000);
  await page.waitForSelector("a.jj-link.username > span.name");
  const userName = await page.$eval(
    "a.jj-link.username > span.name",
    (e) => e.textContent
  );

  console.log(userName)


  // 签到
  const signedInBtn = await page.$('.signedin.btn');
  const hasSignIn = !!signedInBtn;

  if (!hasSignIn) {
    await page.click(".code-calender > .signin.btn");  // 点击立即登录按钮
  } else {
    await page.click(".signedin.btn");
  }
  await sleep(3000);
  await page.waitForSelector(".btn-area > .btn");
  // 抽奖
  await page.click(".btn-area > .btn");
  await sleep(2000);

  // 判断是否是免费抽
  const text = await page.$eval("#turntable-item-0", (e) => e.textContent);
  if (/.*免.*费.*/g.test(text)) {
    await page.click("#turntable-item-0");
    await sleep(10000);
    await page.click("button.submit");
  }
  await page.goBack();
  await sleep(6000);

  // 累计签到天数
  const totalLoginDays = await page.$eval(
    ".mid-card > .figure",
    (e) => e.textContent
  );

  // 连续签到天数
  const continuousLoginDays = await page.$eval(
    ".figure.active",
    (e) => e.textContent
  );

  // 获取签到后矿石
  const stones = await page.$eval(
    ".figure-card.large-card > .figure",
    (e) => e.textContent
  );

  await page.close();
  await browser.close();

  console.log(`${userName.trim()} 签到成功\n 剩余矿石：${stones.trim()}; 累计签到天数：${totalLoginDays}天;连续签到天数：${continuousLoginDays} 天`)
  return (
    `<tr>
      <td>${userName.trim()}</td>
      <td>${stones.trim()}</td>
      <td>${totalLoginDays}</td>
      <td style="color: red">${continuousLoginDays}</td>
    </tr>`
  )
};
module.exports = {
  signIn,
};
