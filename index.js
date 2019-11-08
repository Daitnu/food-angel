require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const Slack = require('slack-node');

const readFile = promisify(fs.readFile);
const { WEB_HOOK_URL } = process.env;
const slack = new Slack();
const request = promisify(slack.webhook);
slack.setWebhook(WEB_HOOK_URL);

const MAX_PEEK = 8;
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

const getRandom = max => {
  return Math.floor(Math.random() * max);
};

const getDailyRestaurants = async () => {
  const restaurants = JSON.parse(await readFile('restaurants.json', 'utf-8'));
  const peekSet = new Set();
  const length = restaurants.length;

  while (peekSet.size < MAX_PEEK) {
    peekSet.add(getRandom(length));
  }

  const peekRestaurants = [];

  for (let number of peekSet) {
    peekRestaurants.push(restaurants[number]);
  }

  return peekRestaurants;
};

const makeAttachments = peekRestaurants => {
  const colorLength = colors.length;
  const random = getRandom(colorLength);
  const color = colors[random];

  const fields = peekRestaurants.map(restaurant => {
    const { title, star, href, type } = restaurant;
    return {
      fallback: title,
      title: `${title} (${star})`,
      value: `${type} : ${href}`,
      short: false,
    };
  });

  return [
    {
      color,
      fields,
    },
  ];
};

const send = async () => {
  const restaurants = await getDailyRestaurants();
  const attachments = makeAttachments(restaurants);

  return request({ text: '음식 요정이에요~!', attachments });
};

module.exports = {
  main: send,
};

send();
