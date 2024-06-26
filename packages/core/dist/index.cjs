'use strict';

var fs = require('fs');
var utils = require('@iconify/utils');
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
    const body = svg.getBody();
    if (!isColors(body)) {
      tools.parseColors(svg, {
        defaultColor: "currentColor",
        callback: () => {
          return "currentColor";
        }
      });
    }
    tools.runSVGO(svg);
    const name = covertValidName(icon.class_name);
    iconSet.fromSVG(name, svg);
  });
  return iconSet.export();
}
function isColors(svg) {
  const re = /(stroke|fill)="([^"]+)"/g;
  const temp = [];
  let match;
  while ((match = re.exec(svg)) !== null) {
    const value = match[2];
    if (temp.indexOf(value) === -1) {
      temp.push(value);
    }
  }
  return temp.filter((item) => !["none"].includes(item)).length > 1;
}
function covertValidName(text) {
  return text.replaceAll("_", "-").replace(/\s+/g, "-").toLowerCase();
}
function toCamelCase(str) {
  return str.replace(/[-_]+/g, " ").toLowerCase().replace(/(\b\w)/g, (char) => char.toUpperCase()).replace(/\s+/g, "");
}
async function toSvgs(rawData) {
  const validatedData = utils.validateIconSet(rawData);
  const iconSet = new tools.IconSet(validatedData);
  const svgs = [];
  await iconSet.forEach(async (name) => {
    const icon = iconSet.resolve(name);
    if (icon) {
      svgs.push([name, icon]);
    }
  });
  return svgs;
}
function generateUniAppTemplate(style, exportName) {
  const template = `<script>
  export default {
    name: '${exportName}',
    props: {
      color: {
        type: String,
        default: 'currentColor'
      },
      size: {
        type: String,
        default: '1em'
      }
    },
    data(){
      return {
        style: ${style}
      }
    }
  }
  </script>
  <template>
    <view :style="{ fontSize: size, color: color }">
      <view :style="style"/>
    </view>
  </template>
  `;
  return template;
}
function generateStyle(isColors2, uri) {
  if (isColors2) {
    return {
      background: `${uri} no-repeat`,
      "background-size": "100% 100%",
      "background-color": "transparent",
      height: "1em",
      width: "1em"
    };
  } else {
    return {
      mask: `${uri} no-repeat`,
      "-webkit-mask": `${uri} no-repeat`,
      "mask-size": "100% 100%",
      "-webkit-mask-size": "100% 100%",
      "background-color": "currentColor",
      height: "1em",
      width: "1em"
    };
  }
}

// src/index.ts
async function fetchCodesignToken() {
  const key = generateKey();
  const url = `https://codesign.qq.com/login/${key}`;
  generateQrCode(url);
  const token = await createMaxIntervalFn({
    fn: async () => {
      console.log("fetching token...");
      return fetchToken(key);
    }
  });
  return token;
}
async function fetchCodesignIconsByToken(options) {
  const { token, projectId, teamId } = options;
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
  return icons.data;
}
async function buildIconifyJSON(options) {
  const { prefix, icons } = options;
  const data = parseIcons(icons, {
    prefix
  });
  return data;
}
async function buildUniAppIcons(options) {
  const { rawData, dist, exportPrefix } = options;
  const svgs = await toSvgs(rawData);
  await fs.promises.mkdir(dist, { recursive: true });
  const exportLines = [];
  svgs.forEach(async ([name, icon]) => {
    const { height = 16, width = 16 } = icon;
    const svg = utils.iconToHTML(icon.body, {
      viewBox: `${icon.left || 0} ${icon.top || 0} ${width} ${height}`,
      width: `${width}`,
      height: `${height}`
    });
    const url = utils.svgToURL(svg);
    const CamelCase = toCamelCase(name);
    const fileName = `${CamelCase}.vue`;
    const exportName = `${exportPrefix}${CamelCase}`;
    const path = `${dist}${fileName}`;
    const style = generateStyle(isColors(svg), url);
    const template = generateUniAppTemplate(JSON.stringify(style), exportName);
    exportLines.push(`export { default as ${exportName} } from './${fileName}'`);
    await fs.promises.writeFile(path, template, "utf8");
  });
  await fs.promises.writeFile(`${dist}index.js`, exportLines.join("\n"), "utf8");
}

exports.buildIconifyJSON = buildIconifyJSON;
exports.buildUniAppIcons = buildUniAppIcons;
exports.fetchCodesignIconsByToken = fetchCodesignIconsByToken;
exports.fetchCodesignToken = fetchCodesignToken;
