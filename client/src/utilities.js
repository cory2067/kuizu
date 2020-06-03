function formatParams(params) {
  return Object.keys(params)
    .map((key) => key + "=" + encodeURIComponent(params[key]))
    .join("&");
}

async function processResponse(res, type) {
  const text = await res.text();
  let output = text;
  try {
    output = JSON.parse(output);
  } catch (err) {
    console.log(`Could not convert response to JSON: ${text}`);
  }

  if (!res.ok) {
    console.log(`Request failed with response status ${res.status}:`);
    console.log(output);
    throw output;
  }

  return output;
}

export function get(endpoint, params = {}) {
  const fullPath = endpoint + "?" + formatParams(params);
  return fetch(fullPath, {
    credentials: "include",
  }).then(processResponse);
}

export function post(endpoint, params = {}) {
  return fetch(endpoint, {
    method: "post",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(params),
  }).then(processResponse);
}

export function delet(endpoint, params = {}) {
  return fetch(endpoint, {
    method: "delete",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(params),
  }).then(processResponse);
}
