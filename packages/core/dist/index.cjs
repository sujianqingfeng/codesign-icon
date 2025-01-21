'use strict';

var fs = require('fs');
var utils = require('@iconify/utils');
var tools = require('@iconify/tools');
var undici = require('undici');
var path = require('path');
var VirtualModulesPlugin = require('webpack-virtual-modules');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var path__default = /*#__PURE__*/_interopDefault(path);
var VirtualModulesPlugin__default = /*#__PURE__*/_interopDefault(VirtualModulesPlugin);

// src/index.ts
function createMaxIntervalFn({
  fn,
  interval = 3e3,
  max = 10
}) {
  return new Promise((resolve, reject) => {
    let i = 0;
    let isResolved = false;
    let timer = null;
    const cleanup = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    timer = setInterval(async () => {
      if (isResolved) {
        cleanup();
        return;
      }
      i += 1;
      try {
        const result = await fn();
        if (result) {
          isResolved = true;
          cleanup();
          resolve(result);
          return;
        }
      } catch (error) {
        console.error("Error in interval function:", error);
      }
      if (i >= max) {
        cleanup();
        reject("timeout");
      }
    }, interval);
    process.on("unhandledRejection", cleanup);
  });
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
async function openInBrowser(url) {
  const open = (await import('open')).default;
  await open(url);
}
async function getWeworkLoginToken() {
  const headers = {
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
    "cache-control": "no-cache",
    pragma: "no-cache",
    "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-site",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    cookie: "wwrtx.i18n_lan=en; ww_lang=en,cn,zh",
    referer: "https://codesign.qq.com/",
    origin: "https://codesign.qq.com",
    "upgrade-insecure-requests": "1"
  };
  const {
    statusCode,
    body,
    headers: responseHeaders
  } = await undici.request(
    "https://open.work.weixin.qq.com/wwopen/sso/3rd_qrConnect?appid=ww7a6a2fcbc9ee24ff&redirect_uri=https%3A%2F%2Fcodesign.qq.com%2Foauth%2Fcompanies%2Fwework%2Fcallback&usertype=member&lang=zh",
    {
      headers
    }
  );
  if (statusCode !== 200) {
    throw new Error("Failed to get QR code page");
  }
  const cookies = responseHeaders["set-cookie"];
  if (cookies) {
    const newCookies = Array.isArray(cookies) ? cookies : [cookies];
    const cookieStr = newCookies.map((cookie) => cookie.split(";")[0]).join("; ");
    headers.cookie = cookieStr;
  }
  const html = await body.text();
  const settingsMatch = html.match(/window\.settings\s*=\s*({[\s\S]+?});/);
  if (!settingsMatch) {
    throw new Error("Failed to find settings in HTML");
  }
  try {
    const settingsStr = settingsMatch[1].replace(/\n/g, "").replace(/\s+/g, " ");
    const settings = JSON.parse(settingsStr);
    console.log("\u{1F680} ~ getWeworkLoginToken ~ settings:", settings);
    if (settings.errCode) {
      throw new Error(`WeWork error: ${settings.errMsg}`);
    }
    const key = settings.key;
    if (!key) {
      throw new Error("Failed to get key from settings");
    }
    const qrUrl = `https:${settings.qrUrl}`;
    await openInBrowser(qrUrl);
    console.log("Please scan the QR code in your browser to login");
    const result = await createMaxIntervalFn({
      fn: async () => {
        const { statusCode: statusCode2, body: body2 } = await undici.request(
          `https://open.work.weixin.qq.com/wwopen/sso/l/qrConnect?callback=jsonpCallback&key=${key}&redirect_uri=https%3A%2F%2Fcodesign.qq.com%2Foauth%2Fcompanies%2Fwework%2Fcallback&appid=ww7a6a2fcbc9ee24ff&_=${Date.now()}`,
          {
            headers: {
              ...headers,
              referer: "https://open.work.weixin.qq.com/",
              origin: "https://open.work.weixin.qq.com"
            }
          }
        );
        if (statusCode2 !== 200) {
          return null;
        }
        const text = await body2.text();
        const match = text.match(/^jsonpCallback\((.*)\)$/);
        if (!match) {
          return null;
        }
        const json = JSON.parse(match[1]);
        console.log("\u{1F680} ~ fn: ~ json:", json);
        if (json.status === "QRCODE_SCAN_SUCC") {
          const { auth_code } = json;
          const { headers: redirectHeaders } = await undici.request(
            `https://codesign.qq.com/oauth/companies/wework/callback?auth_code=${auth_code}&appid=ww7a6a2fcbc9ee24ff`,
            {
              headers: {
                ...headers,
                referer: "https://open.work.weixin.qq.com/",
                origin: "https://open.work.weixin.qq.com"
              },
              maxRedirections: 0,
              throwOnError: false
            }
          );
          const cookies2 = redirectHeaders["set-cookie"];
          if (!cookies2?.length) {
            return null;
          }
          const accessTokenCookie = Array.isArray(cookies2) ? cookies2.find((cookie) => cookie.startsWith("access_token=")) : cookies2.split(",").find((cookie) => cookie.startsWith("access_token="));
          if (!accessTokenCookie) {
            return null;
          }
          const token = accessTokenCookie.split(";")[0].split("=")[1];
          return token;
        }
        return null;
      },
      interval: 2e3,
      max: 30
    });
    return result;
  } catch (error) {
    console.error("Error parsing settings:", error);
    throw error;
  }
}
var UniappIconPlugin = class {
  options;
  icons;
  virtualModules;
  constructor(options) {
    this.options = options;
    this.icons = /* @__PURE__ */ new Map();
    this.virtualModules = new VirtualModulesPlugin__default.default({});
  }
  async init() {
    const prefix = this.options.prefix || "";
    const svgs = await toSvgs(this.options.data);
    for (const [name, icon] of svgs) {
      const { height = 16, width = 16 } = icon;
      const svg = utils.iconToHTML(icon.body, {
        viewBox: `${icon.left || 0} ${icon.top || 0} ${width} ${height}`,
        width: `${width}`,
        height: `${height}`
      });
      const url = utils.svgToURL(svg);
      const componentName = `${prefix}${name}`;
      const style = generateStyle(isColors(svg), url);
      const template = generateUniAppTemplate(
        JSON.stringify(style),
        componentName
      );
      const modulePath = path__default.default.resolve(__dirname, `virtual/${componentName}.vue`);
      this.virtualModules.writeModule(modulePath, template);
      this.icons.set(componentName, modulePath);
    }
  }
  apply(compiler) {
    this.virtualModules.apply(compiler);
    compiler.options.resolve = compiler.options.resolve || {};
    compiler.options.resolve.alias = compiler.options.resolve.alias || {};
    compiler.options.resolve.alias["virtual-icon"] = path__default.default.resolve(
      __dirname,
      "virtual"
    );
    compiler.hooks.beforeRun.tapPromise("UniappIconPlugin", async () => {
      await this.init();
    });
    compiler.hooks.watchRun.tapPromise("UniappIconPlugin", async () => {
      await this.init();
    });
    compiler.hooks.normalModuleFactory.tap(
      "UniappIconPlugin",
      (normalModuleFactory) => {
        normalModuleFactory.hooks.beforeResolve.tap(
          "UniappIconPlugin",
          (resolveData) => {
            if (!resolveData) {
              return;
            }
            const request2 = resolveData.request;
            if (request2.startsWith("virtual:icon/")) {
              const iconName = request2.slice("virtual:icon/".length);
              const modulePath = this.icons.get(iconName);
              if (modulePath) {
                resolveData.request = path__default.default.relative(
                  path__default.default.dirname(resolveData.contextInfo.issuer),
                  modulePath
                );
              } else {
                console.warn(`Icon not found: ${iconName}`);
                console.warn("Available icons:", Array.from(this.icons.keys()));
              }
            }
          }
        );
      }
    );
  }
};
var webpack_uniapp_icon_default = UniappIconPlugin;

// src/index.ts
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
    const path2 = `${dist}${fileName}`;
    const style = generateStyle(isColors(svg), url);
    const template = generateUniAppTemplate(JSON.stringify(style), exportName);
    exportLines.push(`export { default as ${exportName} } from './${fileName}'`);
    await fs.promises.writeFile(path2, template, "utf8");
  });
  await fs.promises.writeFile(`${dist}index.js`, exportLines.join("\n"), "utf8");
}

exports.WebpackIconPlugin = webpack_uniapp_icon_default;
exports.buildIconifyJSON = buildIconifyJSON;
exports.buildUniAppIcons = buildUniAppIcons;
exports.fetchCodesignIconsByToken = fetchCodesignIconsByToken;
exports.getWeworkLoginToken = getWeworkLoginToken;
