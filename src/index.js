const fs = require("fs").promises;
const schedule = require("node-schedule");
const path = require("path");
const { sendEmail } = require("./utils/email.js");
const { signIn } = require("./utils/sign.js");
const { LOGIN_USERS, EMAIL_RECEIVER } = require("./config.js");

let currentJob = null;
let runCount = 0;

const runTaskOnce = async () => {
  console.log("正在运行签到脚本");
  const templatePath = path.join(__dirname, "template/loginInfo.html");
  const template = await fs.readFile(templatePath, "utf8");
  const rows = [];

  for (let user of LOGIN_USERS) {
    const { username, password } = user;
    const row = await signIn(username, password);
    rows.push(row);
  }

  const html = template.replace("<!-- ###ROWS### -->", rows.join(""));
  sendEmail(EMAIL_RECEIVER, html);
};

// 创建随机定时任务
const createRandomTask = (hour, minute, immediate = false) => {
  if (immediate) {
    runTaskOnce();
  }
  if (currentJob) {
    currentJob.cancel();
  }

  currentJob = schedule.scheduleJob(
    { hour, minute },
    async () => {
      runTaskOnce();
    }
  );

};

// 程序运行入口
const main = () => {
  createRandomTask(9, 30, true);
};

main();
