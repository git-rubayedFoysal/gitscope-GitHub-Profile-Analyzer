const input = document.querySelector("#username");
const form = document.querySelector("form");
const banner = document.querySelector("#banner");
const errorBanner = document.querySelector("#error-banner");
const searchBtn = document.querySelector("#searchBtn");
const userData = document.querySelector("#data");
const baseUrl = `https://api.github.com/users/`;

// FIX 1: Removed hardcoded GITHUB_TOKEN — exposed tokens get
// flagged by GitHub push protection and are a security risk.
// Unauthenticated requests allow 60 req/hr, sufficient for a portfolio project.

// FIX 2: Renamed parameter `massege` → `message` (typo fix)
function showError(message) {
  errorBanner.style.display = "block";
  errorBanner.textContent = message;
}

function clearError() {
  errorBanner.style.display = "none";
}

function renderProfile(data) {
  userData.style.display = "block";
  const avatar = document.querySelector("#p-img");
  const name = document.querySelector("#p-name");
  const username = document.querySelector("#p-username");
  const locationEl = document.querySelector("#p-location");
  const locationWrapper = document.querySelector(".location");
  const bio = document.querySelector("#p-bio");
  const follower = document.querySelector("#p-follower");
  const following = document.querySelector("#p-following");
  const repo = document.querySelector("#p-repo");
  const join = document.querySelector("#p-joined");
  const lastActive = document.querySelector("#p-last-active");

  avatar.src = data.avatar_url;

  // FIX 3: data.name can be null for users who haven't set a display name.
  // Fall back to login (username) so the DOM never renders the string "null".
  name.textContent = data.name || data.login;

  username.textContent = `@${data.login}`;

  // FIX 4: Hide the location row (including the dot) when location is null.
  // Previously the green dot rendered next to empty text for users with no location.
  if (data.location) {
    locationEl.textContent = data.location;
    locationWrapper.style.display = "flex";
  } else {
    locationWrapper.style.display = "none";
  }

  // FIX 5: data.bio can be null — fall back to empty string so DOM stays clean.
  bio.textContent = data.bio || "";

  follower.textContent = data.followers;
  following.textContent = data.following;
  repo.textContent = data.public_repos;
  join.textContent = new Date(data.created_at).getFullYear();

  const last = new Date(data.updated_at);
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  lastActive.textContent = `${last.getDate()} ${months[last.getMonth()]}, ${last.getFullYear()}`;
}

function languageRender(language, total) {
  const topLanguages = Object.entries(language)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const parent = document.querySelector(".lang-list");
  const fragment = document.createDocumentFragment();
  const template = document.querySelector("#langTem");

  parent.replaceChildren();

  let c = 0;

  for (let [lang, count] of topLanguages) {
    c++;

    const clone = template.content.cloneNode(true);

    const lName = clone.querySelector(".lang-name");
    const lPer = clone.querySelector(".lang-per");
    const bar = clone.querySelector(".bar");

    const percent = total ? Math.round((count / total) * 100) : 0;

    lName.textContent = lang;
    lPer.textContent = `${percent}%`;

    bar.classList.add(`bar${c}`);
    bar.style.width = `${percent}%`;

    fragment.append(clone);
  }

  parent.append(fragment);
}

function setLoading(isLoading) {
  if (isLoading) {
    searchBtn.classList.add("loading");
    searchBtn.disabled = true;
  } else {
    searchBtn.classList.remove("loading");
    searchBtn.disabled = false;
  }
}

function updateChart(data) {
  const chart = document.querySelector("#contribution");
  const url = `https://github-readme-activity-graph.vercel.app/graph?username=${data[0].owner.login}&theme=github-${localStorage.getItem("theme")}`;
  chart.src = url;
}

let currentData = null;

function renderRepoInfo(data) {
  if (data.length === 0) return;

  const repo = {
    fork: 0,
    star: 0,
    languages: {},
    total: 0,
  };

  data.forEach((r) => {
    repo.fork += r.forks_count || 0;
    repo.star += r.stargazers_count || 0;

    const lang = r.language || "Other";
    repo.total += 1;

    repo.languages[lang] = (repo.languages[lang] || 0) + 1;
  });

  const stars = document.querySelector("#p-star");
  const forks = document.querySelector("#p-fork");
  const top = document.querySelector("#p-top-repo");

  stars.textContent = repo.star;
  forks.textContent = repo.fork;
  top.textContent = data[0].name;

  languageRender(repo.languages, repo.total);
  updateChart(data);
  currentData = data;
}

function renderAllRepo(data) {
  const parent = document.querySelector(".repo-list");
  const fragment = document.createDocumentFragment();
  const template = document.querySelector("#repoTem");
  parent.replaceChildren();

  data.forEach((r) => {
    const clone = template.content.cloneNode(true);
    const name = clone.querySelector(".repo-name");
    const des = clone.querySelector(".repo-des");
    const star = clone.querySelector(".repo-star");
    const fork = clone.querySelector(".repo-fork");
    const lang = clone.querySelector(".lang-name");

    name.textContent = r.name;
    des.textContent = r.description || "No Description.";
    star.textContent = r.stargazers_count;
    fork.textContent = r.forks_count;
    lang.textContent = r.language || "";

    fragment.append(clone);
  });

  parent.append(fragment);
}

async function getRepoInfo(username) {
  try {
    // FIX 1 (continued): Authorization header removed — no token needed.
    const response = await fetch(
      `${baseUrl}${username}/repos?sort=stars&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      },
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}, user not found.`);
    }
    const data = await response.json();

    renderRepoInfo(data);
    renderAllRepo(data);
  } catch (error) {
    showError(error.message);
  }
}

async function getUserInfo(username) {
  try {
    // FIX 1 (continued): Authorization header removed — no token needed.
    const response = await fetch(`${baseUrl}${username}`, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}, user not found.`);
    }

    const data = await response.json();
    renderProfile(data);
  } catch (error) {
    showError(error.message);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();
  banner.style.display = "none";

  const username = input.value.trim();
  if (!username) {
    showError("Invalid Input! Please enter a valid username.");
    return;
  }

  setLoading(true);
  try {
    await Promise.all([getUserInfo(username), getRepoInfo(username)]);
  } finally {
    // FIX 6: Removed duplicate form.reset() that appeared after this finally block.
    // Keeping it only here guarantees it runs whether the fetches succeed or fail.
    setLoading(false);
    form.reset();
  }
});

const html = document.documentElement;
const toggle = document.querySelector("#img-toggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  html.setAttribute("data-theme", "light");
  toggle.src = "./icon/light_mode.svg";
} else {
  toggle.src = "./icon/dark_mode.svg";
}

function toggleTheme() {
  const isLight = html.getAttribute("data-theme") === "light";

  if (isLight) {
    html.removeAttribute("data-theme");
    toggle.src = "./icon/dark_mode.svg";
    localStorage.setItem("theme", "dark");
  } else {
    html.setAttribute("data-theme", "light");
    toggle.src = "./icon/light_mode.svg";
    localStorage.setItem("theme", "light");
  }
  if (currentData) updateChart(currentData);
}
