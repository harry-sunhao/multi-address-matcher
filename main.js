
let map = null;

function normalizeCityName(obj) {
  return (obj.city || obj.town || obj.county || obj.state || obj.province || obj.village || obj.district || "未知")
    .replace("市", "").trim();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function wgs84_to_gcj02(lng, lat) {
  if (out_of_china(lng, lat)) return [lng, lat];
  let dlat = transformlat(lng - 105.0, lat - 35.0);
  let dlng = transformlng(lng - 105.0, lat - 35.0);
  let radlat = lat / 180.0 * Math.PI;
  let magic = Math.sin(radlat);
  magic = 1 - 0.00669342162296594323 * magic * magic;
  let sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / ((6335552.717000426 / (magic * sqrtmagic)) * Math.PI);
  dlng = (dlng * 180.0) / ((6378245.0 / sqrtmagic) * Math.cos(radlat) * Math.PI);
  return [lng + dlng, lat + dlat];
}

function out_of_china(lng, lat) {
  return (lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271);
}

function transformlat(lng, lat) {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat +
    0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformlng(lng, lat) {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng +
    0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
  return ret;
}

function saveKeysToLocal() {
  localStorage.setItem("amapJsKey", document.getElementById("amapJsKeyInput").value.trim());
  localStorage.setItem("amapWebKey", document.getElementById("amapWebKeyInput").value.trim());
  localStorage.setItem("tencentKey", document.getElementById("tencentKeyInput").value.trim());
  localStorage.setItem("geoapifyKey", document.getElementById("geoapifyKeyInput").value.trim());
}

function loadKeysFromLocal() {
  ["amapJsKey", "amapWebKey", "tencentKey", "geoapifyKey"].forEach(key => {
    const val = localStorage.getItem(key);
    if (val !== null) {
      document.getElementById(key + "Input").value = val;
    }
  });
}

function bindKeyAutoSave() {
  ["amapJsKeyInput", "amapWebKeyInput", "tencentKeyInput", "geoapifyKeyInput"].forEach(id => {
    document.getElementById(id).addEventListener("input", saveKeysToLocal);
  });
}

function saveCheckedAPIsToLocal() {
  const checks = document.querySelectorAll(".api-check");
  const selected = Array.from(checks).filter(c => c.checked).map(c => c.value);
  localStorage.setItem("enabledAPIs", JSON.stringify(selected));
}

function loadCheckedAPIsFromLocal() {
  const saved = localStorage.getItem("enabledAPIs");
  if (saved) {
    const list = JSON.parse(saved);
    document.querySelectorAll(".api-check").forEach(el => {
      el.checked = list.includes(el.value);
    });
  }
}

function bindCheckSave() {
  document.querySelectorAll(".api-check").forEach(el => {
    el.addEventListener("change", saveCheckedAPIsToLocal);
  });
}

function getEnabledAPIs() {
  return Array.from(document.querySelectorAll(".api-check")).filter(c => c.checked).map(c => c.value);
}

function addAddress() {
  const addrContainer = document.getElementById("addresses");
  const count = document.querySelectorAll(".addr-input").length;
  if (count >= 5) {
    alert("最多只能添加5个地址！");
    return;
  }
  const div = document.createElement("div");
  div.className = "address-block";
  div.innerHTML = `地址 ${count + 1}：<input type="text" class="addr-input" size="40">`;
  addrContainer.appendChild(div);
}

function clearSavedKeys() {
  ["amapJsKey", "amapWebKey", "tencentKey", "geoapifyKey"].forEach(key => localStorage.removeItem(key));
  alert("已清除本地保存的 Key，请刷新页面后查看效果。");
}

function loadAmapSDK(jsKey) {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(); return;
    }
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${jsKey}&plugin=AMap.Geocoder,AMap.Circle,AMap.Marker,AMap.GeometryUtil`;
    script.onload = resolve;
    script.onerror = () => reject(new Error("高德地图 SDK 加载失败"));
    document.head.appendChild(script);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  loadKeysFromLocal();
  loadCheckedAPIsFromLocal();
  bindKeyAutoSave();
  bindCheckSave();

  const jsKey = document.getElementById("amapJsKeyInput").value.trim();
  if (!jsKey) {
    alert("请填写高德 JS Key 后刷新");
    return;
  }

  try {
    await loadAmapSDK(jsKey);
    map = new AMap.Map("map", {
      zoom: 10,
      center: [116.397428, 39.90923]
    });
    document.getElementById("matchBtn").disabled = false;
  } catch (err) {
    alert("高德地图 SDK 加载失败，请检查 JS Key 是否正确。");
  }

  const deployTime = new Date().toLocaleString("zh-CN", {
    hour12: false, timeZone: "Asia/Shanghai"
  });
  const el = document.getElementById("deploy-time");
  if (el) el.innerText = deployTime;

  const saved = localStorage.getItem("lastMatchResult");
  if (saved) {
    const parsed = JSON.parse(saved);
    const area = document.getElementById("last-match-info");
    if (area) {
      area.innerText =
        `🕘 时间：${parsed.time}
🏙️ 城市：${parsed.city}
📍 匹配：
` +
        parsed.addresses.map(a => `- ${a.input} → ${a.matched.name} [${a.matched.source}]`).join('\n');
    }
  }
});


// ------------------ 核心匹配逻辑 ------------------

async function fetchAllCandidates(address) {
  const enabledAPIs = getEnabledAPIs();
  const amapWebKey = document.getElementById("amapWebKeyInput").value.trim();
  const tencentKey = document.getElementById("tencentKeyInput").value.trim();
  const geoapifyKey = document.getElementById("geoapifyKeyInput").value.trim();
  const results = [];

  if (enabledAPIs.includes("amap") && amapWebKey) {
    const url = `https://restapi.amap.com/v3/geocode/geo?key=${amapWebKey}&address=${encodeURIComponent(address)}`;
    const data = await fetch(url).then(res => res.json()).catch(() => null);
    if (data?.geocodes?.length > 0) {
      results.push(...data.geocodes.map(g => ({
        name: g.formatted_address,
        city: normalizeCityName(g),
        location: g.location.split(',').map(Number),
        source: "amap"
      })));
    }
  }

  if (enabledAPIs.includes("tencent") && tencentKey) {
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(address)}&key=${tencentKey}`;
    const data = await fetch(url).then(r => r.json()).catch(() => null);
    if (data?.status === 0) {
      results.push({
        name: address,
        city: (data.result.address_components.city || "").replace("市", "").trim(),
        location: [data.result.location.lng, data.result.location.lat],
        source: "tencent"
      });
    }
  }

  if (enabledAPIs.includes("geoapify") && geoapifyKey) {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&format=json&apiKey=${geoapifyKey}`;
    const data = await fetch(url).then(r => r.json()).catch(() => null);
    if (data?.results?.[0]) {
      results.push({
        name: data.results[0].formatted,
        city: normalizeCityName(data.results[0]),
        location: wgs84_to_gcj02(data.results[0].lon, data.results[0].lat),
        source: "geoapify"
      });
    }
  }

  return results;
}

async function checkMatch() {
  if (!map || typeof map.clearMap !== 'function') {
    alert("⚠️ 地图尚未初始化完成，请稍候再试！");
    return;
  }
  const inputs = Array.from(document.querySelectorAll(".addr-input"));
  const threshold = parseFloat(document.getElementById("threshold").value);
  const logsDiv = document.getElementById("logs");
  const resultsDiv = document.getElementById("results");
  logsDiv.innerHTML = "🔍 正在搜索并尝试匹配...\n";
  resultsDiv.innerHTML = "";
  map.clearMap();
  const allInputs = inputs.map(i => i.value.trim());
  if (allInputs.some(val => !val)) {
    logsDiv.innerHTML += "❌ 存在空地址，请补全。";
    return;
  }
  const allCandidates = await Promise.all(allInputs.map(addr => fetchAllCandidates(addr)));
  const firstAddressCandidates = allCandidates[0];
  if (firstAddressCandidates.length === 0) {
    logsDiv.innerHTML += "❌ 第一个地址无有效候选，终止匹配。";
    return;
  }
  const baseCityMap = new Map();
  for (const cand of firstAddressCandidates) {
    const city = cand.city.replace("市", "").trim();
    if (!baseCityMap.has(city)) {
      baseCityMap.set(city, Array(allInputs.length).fill(null));
    }
    baseCityMap.get(city)[0] = cand;
  }
  logsDiv.innerHTML += `✅ 第一个地址匹配到以下候选城市：
`;
  firstAddressCandidates.forEach(c => {
    logsDiv.innerHTML += `- ${c.city}（${c.name}） [${c.source}]
`;
  });
  for (let i = 1; i < allCandidates.length; i++) {
    for (const cand of allCandidates[i]) {
      const city = cand.city.replace("市", "").trim();
      if (baseCityMap.has(city)) {
        const arr = baseCityMap.get(city);
        if (!arr[i]) arr[i] = cand;
      }
    }
  }
  const matchedCities = [];
  for (let [city, points] of baseCityMap.entries()) {
    logsDiv.innerHTML += `
🗺️ 尝试匹配城市：${city}
`;
    if (points.includes(null)) {
      const missing = points.map((p, i) => p ? null : allInputs[i]).filter(Boolean);
      logsDiv.innerHTML += `❌ 匹配失败：以下地址在该城市无结果 → ${missing.join("，")}
`;
      continue;
    }
    logsDiv.innerHTML += `📍 匹配点：
`;
    points.forEach((p, i) => logsDiv.innerHTML += `  - ${allInputs[i]}：${p.name}（${p.location.join(",")}） [${p.source}]
`);
    let valid = true;
    logsDiv.innerHTML += `📏 距离矩阵：
`;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = AMap.GeometryUtil.distance(points[i].location, points[j].location);
        logsDiv.innerHTML += `  - ${allInputs[i]} ↔ ${allInputs[j]}：${dist.toFixed(2)} 米
`;
        if (dist > threshold * 2) valid = false;
      }
    }
    if (valid) {
      logsDiv.innerHTML += `✅ 匹配成功：该城市满足距离条件，加入候选列表。
`;
      matchedCities.push({ city, points });
    } else {
      logsDiv.innerHTML += `❌ 匹配失败：距离超限。
`;
    }
  }
  if (matchedCities.length === 0) {
    resultsDiv.innerHTML = "❌ 没有找到任何满足条件的城市。";
    return;
  }
  const match = matchedCities[0];
  resultsDiv.innerHTML = `<h4>🏁 匹配成功城市：${match.city}</h4><ul>`;
  const markers = [];
  for (let i = 0; i < match.points.length; i++) {
    const p = match.points[i];
    resultsDiv.innerHTML += `<li>${allInputs[i]}：${p.name}（${p.location.join(",")}） [${p.source}]</li>`;
    const marker = new AMap.Marker({ position: p.location, title: p.name, map });
    const circle = new AMap.Circle({
      center: p.location,
      radius: threshold,
      fillColor: '#cceeff',
      strokeColor: '#3399ff',
      fillOpacity: 0.3,
      map
    });
    markers.push(marker, circle);
  }
  resultsDiv.innerHTML += "</ul>";
  map.setFitView(markers);
  localStorage.setItem("lastMatchResult", JSON.stringify({
    time: new Date().toLocaleString("zh-CN", { hour12: false }),
    city: match.city,
    addresses: allInputs.map((addr, idx) => ({
      input: addr,
      matched: match.points[idx]
    }))
  }));
}


async function queryNearby(baseLocation, keyword, radius, key) {
  const url = `https://restapi.amap.com/v3/place/around?key=${key}&location=${baseLocation.join(',')}&radius=${radius}&keywords=${encodeURIComponent(keyword)}`;
  const data = await fetch(url).then(r => r.json()).catch(() => null);
  if (data?.status === "1" && data.pois?.length > 0) {
    return data.pois.map(poi => ({
      name: poi.name,
      location: poi.location.split(',').map(Number),
      address: poi.address,
      source: "amap-poi"
    }));
  }
  return [];
}

async function checkMatch() {
  if (!map || typeof map.clearMap !== 'function') {
    alert("⚠️ 地图尚未初始化完成，请稍候再试！");
    return;
  }

  const inputs = Array.from(document.querySelectorAll(".addr-input"));
  const threshold = parseFloat(document.getElementById("threshold").value);
  const logsDiv = document.getElementById("logs");
  const resultsDiv = document.getElementById("results");
  logsDiv.innerHTML = "🔍 正在尝试多中心周边匹配...\n";
  resultsDiv.innerHTML = "";
  map.clearMap();

  const allInputs = inputs.map(i => i.value.trim());
  if (allInputs.some(val => !val)) {
    logsDiv.innerHTML += "❌ 存在空地址，请补全。\n";
    return;
  }

  const amapWebKey = document.getElementById("amapWebKeyInput").value.trim();
  if (!amapWebKey) {
    alert("请先填写高德 Web Key");
    return;
  }

  const firstCandidates = await fetchAllCandidates(allInputs[0]);
  if (firstCandidates.length === 0) {
    logsDiv.innerHTML += "❌ 第一个地址没有任何候选点。\n";
    return;
  }

  let matched = null;

  for (let centerIdx = 0; centerIdx < firstCandidates.length; centerIdx++) {
    const base = firstCandidates[centerIdx];
    const matchedPoints = [base];
    logsDiv.innerHTML += `\n🔄 尝试以候选点 ${centerIdx + 1}：${base.name}（${base.location.join(",")}） 为中心点\n`;

    let valid = true;

    for (let i = 1; i < allInputs.length; i++) {
      const keyword = allInputs[i];
      const nearbyResults = await queryNearby(base.location, keyword, threshold, amapWebKey);
      if (nearbyResults.length === 0) {
        logsDiv.innerHTML += `❌ 地址 ${i + 1}：${keyword} 在该中心点周边未匹配\n`;
        valid = false;
        break;
      } else {
        const poi = nearbyResults[0];
        matchedPoints.push(poi);
        logsDiv.innerHTML += `✅ 地址 ${i + 1}：${keyword} 匹配为 ${poi.name}（${poi.location.join(",")}）\n`;
      }
    }

    if (valid) {
      matched = matchedPoints;
      logsDiv.innerHTML += `🎯 成功匹配所有地址，使用第 ${centerIdx + 1} 个中心点\n`;
      break;
    } else {
      logsDiv.innerHTML += `⚠️ 第 ${centerIdx + 1} 个中心点匹配失败，尝试下一个...\n`;
    }
  }

  if (!matched) {
    resultsDiv.innerHTML = "❌ 无法找到满足所有地址的中心点匹配结果。";
    return;
  }

  logsDiv.innerHTML += `📏 正在验证匹配点之间距离...\n`;
  let distanceOk = true;
  for (let i = 0; i < matched.length; i++) {
    for (let j = i + 1; j < matched.length; j++) {
      const dist = AMap.GeometryUtil.distance(matched[i].location, matched[j].location);
      logsDiv.innerHTML += `  - 地址 ${i + 1} ↔ 地址 ${j + 1}：${dist.toFixed(2)} 米\n`;
      if (dist > threshold * 2) distanceOk = false;
    }
  }

  if (!distanceOk) {
    resultsDiv.innerHTML = "❌ 匹配失败：距离超出限制。";
    return;
  }

  resultsDiv.innerHTML = `<h4>🏁 匹配成功：所有地址在中心点周边 ${threshold} 米范围内</h4><ul>`;
  const markers = [];
  for (let i = 0; i < matched.length; i++) {
    const p = matched[i];
    const amapLink = `https://uri.amap.com/marker?position=${p.location[0]},${p.location[1]}&name=${encodeURIComponent(p.name)}`;
	resultsDiv.innerHTML += `<li>${allInputs[i]}：<a href="${amapLink}" target="_blank">${p.name}</a>（${p.location.join(",")}） [${p.source}]</li>`;
    const marker = new AMap.Marker({
	  position: p.location,
	  title: p.name,
	  map,
	  label: {
		content: `地址 ${i + 1}`,
		offset: new AMap.Pixel(0, -25)
	  },
	  icon: i === 0 ? "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png" : undefined
	});

    const circle = new AMap.Circle({
      center: p.location,
      radius: threshold,
      fillColor: '#cceeff',
      strokeColor: '#3399ff',
      fillOpacity: 0.3,
      map
    });
    markers.push(marker, circle);
  }
  resultsDiv.innerHTML += "</ul>";
  map.setFitView(markers);
}
