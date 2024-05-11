import { promises } from 'fs';
import { iconToHTML, svgToURL, validateIconSet } from '@iconify/utils';
import { blankIconSet, SVG, cleanupSVG, parseColors, isEmptyColor, runSVGO, IconSet } from '@iconify/tools';
import '@iconify/utils/lib/svg/encode-svg-for-css';
import qrcode from 'qrcode-terminal';
import { request } from 'undici';

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
  qrcode.generate(text, { small: true });
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
  const { statusCode, body } = await request(
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
  const { statusCode, body } = await request(
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
  const iconSet = blankIconSet(prefix);
  icons.forEach((icon) => {
    const svg = new SVG(icon.svg);
    cleanupSVG(svg);
    if (!isColors(svg.getBody())) {
      parseColors(svg, {
        defaultColor: "currentColor",
        callback: (_, colorStr, color) => {
          return !color || isEmptyColor(color) ? "currentColor" : colorStr;
        }
      });
    }
    runSVGO(svg);
    const name = covertValidName(icon.class_name);
    iconSet.fromSVG(name, svg);
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
function covertValidName(text) {
  return text.replaceAll("_", "-").replace(/\s+/g, "-").toLowerCase();
}
function toCamelCase(str) {
  return str.replace(/[-_]+/g, " ").toLowerCase().replace(/(\b\w)/g, (char) => char.toUpperCase()).replace(/\s+/g, "");
}
async function toSvgs(rawData) {
  const validatedData = validateIconSet(rawData);
  const iconSet = new IconSet(validatedData);
  const svgs = [];
  await iconSet.forEach(async (name) => {
    const icon = iconSet.resolve(name);
    if (icon) {
      svgs.push([name, icon]);
    }
  });
  return svgs;
}
function generateUniAppTemplate(style) {
  const template = `<script>
  export default {
    name: 'Icon',
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
      "mask-size": "100% 100%",
      "background-color": "currentColor",
      height: "1em",
      width: "1em"
    };
  }
}

// src/index.ts
async function buildIconifyJSON(options) {
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
  await promises.writeFile(`${dist}${prefix}.json`, exported, "utf8");
  console.log("completed!");
}
async function buildUniAppIcons(options) {
  const { rawData, dist } = options;
  const svgs = await toSvgs(rawData);
  await promises.mkdir(dist, { recursive: true });
  svgs.forEach(async ([name, icon]) => {
    const svg = iconToHTML(icon.body, {
      viewBox: `${icon.left || 0} ${icon.top || 0} ${icon.width} ${icon.height}`,
      width: icon.width ? icon.width.toString() : "auto",
      height: icon.height ? icon.height.toString() : "auto"
    });
    const url = svgToURL(svg);
    const style = generateStyle(isColors(svg), url);
    const template = generateUniAppTemplate(JSON.stringify(style));
    const CamelCase = toCamelCase(name);
    await promises.writeFile(`${dist}${CamelCase}.vue`, template, "utf8");
  });
}

export { buildIconifyJSON, buildUniAppIcons };
