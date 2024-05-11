'use strict';

var fs = require('fs');
var tools = require('@iconify/tools');
var qrcode = require('qrcode-terminal');
var undici = require('undici');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var qrcode__default = /*#__PURE__*/_interopDefault(qrcode);

// src/index.ts
function generateKey(len = 16) {
  const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let n = "";
  for (let i = 0; i < len; i++) {
    n += t.charAt(Math.floor(Math.random() * t.length));
  }
  return n;
}
function generateQrCode(text) {
  qrcode__default.default.generate(text, { small: true });
}
function createMaxIntervalFn({
  fn,
  interval = 3e3,
  max = 10
}) {
  return new Promise((resolve, reject) => {
    let i = 0;
    const timer = setInterval(async () => {
      i += 1;
      const result = await fn();
      if (result) {
        clearInterval(timer);
        resolve(result);
      }
      if (i >= max) {
        clearInterval(timer);
        reject("timeout");
      }
    }, interval);
  });
}
async function fetchToken(key) {
  const { statusCode, body } = await undici.request(
    `https://codesign.qq.com/oauth/check?key=${key}`
  );
  if (statusCode !== 200) {
    return null;
  }
  const { result } = await body.json();
  if (result) {
    return result.token;
  }
  return null;
}
async function fetchCodesignIcons(params) {
  const { project_id, team_id, include, per_page, page, Authorization } = params;
  const { statusCode, body } = await undici.request(
    `https://codesign.qq.com/api/icons?project_id=${project_id}&team_id=${team_id}&include=${include}&per_page=${per_page}&page=${page}`,
    {
      headers: {
        Authorization
      }
    }
  );
  if (statusCode !== 200) {
    return;
  }
  const data = await body.json();
  return data;
}
function parseIcons(icons, options) {
  const { prefix } = options;
  const iconSet = tools.blankIconSet(prefix);
  icons.forEach((icon) => {
    const svg = new tools.SVG(icon.svg);
    tools.cleanupSVG(svg);
    if (!isColors(svg.getBody())) {
      tools.parseColors(svg, {
        defaultColor: "currentColor",
        callback: (_, colorStr, color) => {
          return !color || tools.isEmptyColor(color) ? "currentColor" : colorStr;
        }
      });
    }
    tools.runSVGO(svg);
    iconSet.fromSVG(icon.class_name, svg);
  });
  return iconSet.export();
}
function isColors(svg) {
  const re = /fill="([^"]+)"/g;
  const temp = [];
  let match;
  while ((match = re.exec(svg)) !== null) {
    const value = match[1];
    if (temp.indexOf(value) === -1) {
      temp.push(value);
    }
  }
  return temp.length > 1;
}

// src/index.ts
async function build(options) {
  const { prefix, projectId, teamId, dist = "" } = options;
  const key = generateKey();
  const url = `https://codesign.qq.com/login/${key}`;
  generateQrCode(url);
  const token = await createMaxIntervalFn({
    fn: async () => {
      console.log("fetching token...");
      return fetchToken(key);
    }
  });
  console.log("token:", token);
  const icons = await fetchCodesignIcons({
    project_id: projectId,
    team_id: teamId,
    include: "creator",
    per_page: 500,
    page: 1,
    Authorization: `Bearer ${token}`
  });
  if (!icons) {
    throw new Error("fetch icons failed");
  }
  if (!icons.data.length) {
    throw new Error("icons is empty");
  }
  const data = parseIcons(icons.data, {
    prefix
  });
  const exported = `${JSON.stringify(data, null, "	")}
`;
  await fs.promises.writeFile(`${dist}${prefix}.json`, exported, "utf8");
  console.log("completed!");
}

exports.build = build;
