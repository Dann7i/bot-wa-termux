import fs from "fs";
import path from "path"

const pkg = JSON.parse(fs.readFileSync("package.json"));

global.dan = {
  name: "Wildan Hemrawan",
  number: "6283849695767",
  versi: pkg["version"],
  prefix: "!",
  splitArgs: "|",
  locale: "en",
  timezone: "Asia/Jakarta",
  github: "https://github.com/Dann7i",
  autoRead: true,
sticker: {
      packname: "@Wildan",
      author: "pack"      
  },
  emojicuy: {
    wait: "🤔",
    success: "✅",
    error: "❌",
    owner: "🫡",
    sticker: "🖼️",
    downloader: "📥",
    ai: "🤖",
    wave: "👋",
  },

  newsletterJid: "",
  setting: JSON.parse(fs.readFileSync("./storage/setting.json")),
  saveSetting: function () {
    fs.writeFileSync("./storage/setting.json", JSON.stringify(global.dan.setting, null, 2));
    return global.dan.setting;
  },
  saveSettingAsync: async function () {
    await fs.promises.writeFile("./storage/setting.json", JSON.stringify(global.dan.setting, null, 2));
    return global.dan.setting;
  },
};

global.owner = {
  name: "Wildan Hermawan",
  number: "6282129955815",
};

global.db = {
  user: [],
  premium: [],
  group: [],
  save: async function (dbName = "database.json") {
    await fs.promises.writeFile(`./storage/${dbName}`, JSON.stringify(global.db, null, 2));
  },
};
