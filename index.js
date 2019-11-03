require('dotenv').config();

const fs = require('fs');
const Slack = require('slack-node');  // 슬랙 모듈 사용

const { SLACK_API_TOKEN, WEB_HOOK_URL, FILE_PATH } = process.env;
//const slack = new Slack(SLACK_API_TOKEN);
const slack = new Slack();
slack.setWebhook(WEB_HOOK_URL);

const restaurants = JSON.parse(fs.readFileSync(FILE_PATH));

const colors = [
  '#dee2e6',
  '#ffa8a8',
  '#faa2c1',
  '#e599f7',
  '#b197fc',
  '#91a7ff',
  '#74c0fc',
  '#66d9e8',
  '#63e6be',
  '#8ce99a',
  '#c0eb75',
  '#ffe066',
  '#ffc078',
];

const randomlyPick = (array, num = 5) => {
  const picked = [];
  const len = array.length;
  let randIdx;
  let cnt = 0;

  if (len < num) return array;

  while (cnt < num) {
    while (true) {
      randIdx = Math.floor(Math.random() * len);
      if (!picked.includes(randIdx)) break;
    }
    picked.push(randIdx);
    cnt++;
  }

  return picked.map(idx => array[idx]);
};

const makeAttachments = () => {
  const color = randomlyPick(colors, 1)[0];
  const fields = randomlyPick(restaurants).map(item => {
    const { title, star, href, type } = item;
    return {
      fallback: title,
      title: `${title} (${star})`,
      value: `${type} : ${href}`,
      short: false,
    }
  });

  return [{
    color,
    fields
  }]
};

const makeText = () => randomlyPick(restaurants)
  .map(({ title, href, type, star }) => `${title}(${star}) - ${type} : ${href}`)
  .join('\n');

/*
const send = async () => {
  slack.api('chat.postMessage', {
    username: '음식요정',  // 슬랙에 표시될 봇이름
    text: makeText(),
    channel: '#random',  // 전송될 채널 및 유저
    // attachments
  }, function (err, response) {
  });
}

send();
*/

const send = async () => {
  const attachments = makeAttachments();

  slack.webhook({
    text: "음식 요정이에요~!",
    attachments
  }, function (err, response) {
    console.log(response);
  });
}

send();


//console.log(randomlyPick(restaurants));
//console.log(makeAttachments());