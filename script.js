const input = document.querySelector("#username");
const form = document.querySelector("form");
const banner = document.querySelector("#banner");
const errorBanner = document.querySelector("#error-banner");
const searchBtn = document.querySelector("#searchBtn");
const userData = document.querySelector("#data");
const baseUrl = `https://api.github.com/users/`;

function showError(message) {
  errorBanner.style.display = "block";
  errorBanner.textContent = message;
}

function clearError() {
  errorBanner.style.display = "none";
}

// ── Skeleton helpers ──────────────────────────────────────────
function showSkeleton() {
  userData.style.display = "block";
  userData.classList.add("skeleton-mode");
}

function hideSkeleton() {
  userData.classList.remove("skeleton-mode");
}

// ── Language color map for repo dots ─────────────────────────
const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  C: "#60c8ff",
  "C++": "#c084fc",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#4ade80",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || "#5a7a9a";
}

// ── Render profile ────────────────────────────────────────────
function renderProfile(data, mostRecentPush) {
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
  name.textContent = data.name || data.login;
  username.textContent = `@${data.login}`;

  if (data.location) {
    locationEl.textContent = data.location;
    locationWrapper.style.display = "flex";
  } else {
    locationWrapper.style.display = "none";
  }

  bio.textContent = data.bio || "";
  follower.textContent = data.followers;
  following.textContent = data.following;
  repo.textContent = data.public_repos;
  join.textContent = new Date(data.created_at).getFullYear();

  // FIX: use most recent repo push_at instead of user updated_at
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
  const last = mostRecentPush
    ? new Date(mostRecentPush)
    : new Date(data.updated_at);
  lastActive.textContent = `${last.getDate()} ${months[last.getMonth()]}, ${last.getFullYear()}`;
}

// ── Language bars ─────────────────────────────────────────────
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

// ── Loading state ─────────────────────────────────────────────
function setLoading(isLoading) {
  if (isLoading) {
    searchBtn.classList.add("loading");
    searchBtn.disabled = true;
  } else {
    searchBtn.classList.remove("loading");
    searchBtn.disabled = false;
  }
}

// ── Contribution chart ────────────────────────────────────────
function updateChart(data) {
  const chart = document.querySelector("#contribution");
  const url = `https://github-readme-activity-graph.vercel.app/graph?username=${data[0].owner.login}&theme=github-${localStorage.getItem("theme")}`;
  chart.src = url;
}

let currentData = null;

// ── Repo info summary ─────────────────────────────────────────
function renderRepoInfo(data) {
  if (data.length === 0) return;

  const repo = { fork: 0, star: 0, languages: {}, total: 0 };

  data.forEach((r) => {
    repo.fork += r.forks_count || 0;
    repo.star += r.stargazers_count || 0;
    const lang = r.language || "Other";
    repo.total += 1;
    repo.languages[lang] = (repo.languages[lang] || 0) + 1;
  });

  document.querySelector("#p-star").textContent = repo.star;
  document.querySelector("#p-fork").textContent = repo.fork;
  document.querySelector("#p-top-repo").textContent = data[0].name;

  languageRender(repo.languages, repo.total);
  updateChart(data);
  currentData = data;
}

// ── Repo list ─────────────────────────────────────────────────
function renderAllRepo(data) {
  const parent = document.querySelector(".repo-list");
  const fragment = document.createDocumentFragment();
  const template = document.querySelector("#repoTem");
  parent.replaceChildren();

  data.forEach((r) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".repo-name").textContent = r.name;
    clone.querySelector(".repo-des").textContent =
      r.description || "No description.";
    clone.querySelector(".repo-star").textContent = r.stargazers_count;
    clone.querySelector(".repo-fork").textContent = r.forks_count;
    clone.querySelector(".lang-name").textContent = r.language || "";

    // FIX: set lang-dot color dynamically from language
    const dot = clone.querySelector(".lang-dot");
    if (r.language) {
      dot.style.backgroundColor = getLangColor(r.language);
      dot.style.display = "inline-block";
    } else {
      dot.style.display = "none";
    }

    fragment.append(clone);
  });

  parent.append(fragment);
}

// ── API: repos ────────────────────────────────────────────────
async function getRepoInfo(username) {
  const response = await fetch(
    `${baseUrl}${username}/repos?sort=pushed&per_page=100`,
    { headers: { Accept: "application/vnd.github+json" } },
  );

  if (response.status === 403)
    throw new Error(
      "GitHub API rate limit reached (60 req/hr). Please wait ~1 hour and try again.",
    );
  if (response.status === 404)
    throw new Error(
      `User "${username}" not found. Check the username and try again.`,
    );
  if (!response.ok)
    throw new Error(
      `GitHub API error: ${response.status}. Please try again later.`,
    );

  return await response.json();
}

// ── API: user ─────────────────────────────────────────────────
async function getUserInfo(username) {
  const response = await fetch(`${baseUrl}${username}`, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (response.status === 404)
    throw new Error(
      `User "${username}" not found. Check the username and try again.`,
    );
  if (response.status === 403)
    throw new Error(
      "GitHub API rate limit reached (60 req/hr). Please wait ~1 hour and try again.",
    );
  if (!response.ok)
    throw new Error(
      `GitHub API error: ${response.status}. Please try again later.`,
    );

  return await response.json();
}

// ── Submit ────────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();
  banner.style.display = "none";

  const username = input.value.trim();
  if (!username) {
    showError("Please enter a GitHub username.");
    return;
  }

  setLoading(true);
  showSkeleton();

  try {
    const [userData, repoData] = await Promise.all([
      getUserInfo(username),
      getRepoInfo(username),
    ]);

    // FIX: get most recent push_at from repos for accurate "last active"
    const mostRecentPush =
      repoData.length > 0
        ? repoData.sort(
            (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at),
          )[0].pushed_at
        : null;

    // re-sort repos by stars for display
    repoData.sort((a, b) => b.stargazers_count - a.stargazers_count);

    renderProfile(userData, mostRecentPush);
    renderInsights(userData, repoData);
    renderRepoInfo(repoData);
    renderAllRepo(repoData);
  } catch (error) {
    showError(error.message);
  } finally {
    hideSkeleton();
    setLoading(false);
    form.reset();
  }
});

// ── Theme ─────────────────────────────────────────────────────
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

// ── Insights ──────────────────────────────────────────────────
function generateInsights(user, repos) {
  const insights = [];

  // 1. Language focus
  const langCount = {};
  repos.forEach((r) => {
    if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
  });
  const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]);
  if (topLangs.length > 0) {
    const top = topLangs[0][0];
    const focusMap = {
      JavaScript: "Frontend-focused developer",
      TypeScript: "Frontend-focused developer",
      HTML: "Frontend-focused developer",
      CSS: "Frontend-focused developer",
      Python: "Python / data-science oriented developer",
      Java: "Backend / systems developer",
      "C++": "Systems / competitive programmer",
      C: "Systems / low-level developer",
      Go: "Backend / infrastructure developer",
      Rust: "Systems / performance-focused developer",
      PHP: "Backend / web developer",
      Ruby: "Backend / web developer",
    };
    insights.push({
      icon: "💻",
      text: focusMap[top] || `${top}-focused developer`,
    });
  }

  // 2. Repo popularity
  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const avgStars = repos.length ? totalStars / repos.length : 0;
  if (totalStars >= 100 || avgStars >= 5) {
    insights.push({ icon: "⭐", text: "Highly popular repositories" });
  } else if (totalStars >= 20) {
    insights.push({ icon: "⭐", text: "Growing repository popularity" });
  }

  // 3. Activity
  const recentRepos = repos.filter((r) => {
    const days = (Date.now() - new Date(r.pushed_at)) / 86400000;
    return days <= 90;
  });
  if (recentRepos.length >= 5) {
    insights.push({ icon: "🔥", text: "Very active contributor" });
  } else if (recentRepos.length >= 2) {
    insights.push({ icon: "🔥", text: "Regularly active contributor" });
  } else {
    insights.push({ icon: "💤", text: "Occasionally active" });
  }

  // 4. Portfolio size
  if (user.public_repos >= 30) {
    insights.push({ icon: "📁", text: "Extensive project portfolio" });
  } else if (user.public_repos >= 10) {
    insights.push({ icon: "📁", text: "Growing project portfolio" });
  } else {
    insights.push({ icon: "🌱", text: "Early-stage portfolio" });
  }

  // 5. Community
  if (user.followers >= 100) {
    insights.push({ icon: "👥", text: "Well-known in the community" });
  } else if (user.followers >= 20) {
    insights.push({ icon: "👥", text: "Emerging community presence" });
  }

  // 6. Open source contributor
  const forkedFrom = repos.filter((r) => r.fork).length;
  if (forkedFrom >= 5) {
    insights.push({ icon: "🔀", text: "Active open-source contributor" });
  }

  // 7. Language diversity
  if (topLangs.length >= 5) {
    insights.push({
      icon: "🌐",
      text: "Polyglot — works across many languages",
    });
  }

  return insights;
}

function renderInsights(user, repos) {
  const section = document.querySelector("#insightSection");
  const list = document.querySelector("#insightList");

  const insights = generateInsights(user, repos);
  list.replaceChildren();

  if (insights.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  const fragment = document.createDocumentFragment();

  insights.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "insight-item";
    li.style.animationDelay = `${i * 80}ms`;
    li.innerHTML = `<span class="insight-icon">${item.icon}</span><span class="insight-text">${item.text}</span>`;
    fragment.append(li);
  });

  list.append(fragment);

  calculateScore(user, repos);
}

function calculateScore(userData, repoData) {
  let score = 0;
  // check bio
  if (userData.bio) {
    score += 10;
  }
  //check avatar
  if (userData.avatar_url) {
    score += 10;
  }

  //check name
  if (userData.name) {
    score += 5;
  }

  // repo count
  let repo_count = userData.public_repos;
  if (repo_count > 50) {
    score += 20;
  } else if (repo_count > 20) {
    score += 15;
  } else if (repo_count > 5) {
    score += 10;
  } else {
    score += 5;
  }

  // star_count
  let star_count = 0;
  repoData.forEach((r) => {
    star_count += r.stargazers_count || 0;
  });

  if (star_count > 1000) {
    score += 20;
  } else if (star_count > 100) {
    score += 15;
  } else if (star_count > 10) {
    score += 10;
  } else {
    score += 5;
  }
  // activity score
  const mostRecentPush =
    repoData.length > 0
      ? repoData.sort(
          (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at),
        )[0].pushed_at
      : null;

  const last = mostRecentPush
    ? new Date(mostRecentPush)
    : new Date(data.updated_at);

  const days_ago = (Date.now() - new Date(last)) / 86400000;

  if (days_ago <= 7) {
    score += 20;
  } else if (days_ago <= 30) {
    score += 10;
  } else {
    score += 5;
  }

  // check location
  if (userData.location) {
    score += 5;
  }
  // check blog
  if (userData.blog) {
    score += 5;
  }

  if (score > 100) {
    score = 100;
  }

  const scoreComment = document.querySelector("#score-catagory");

  if (score >= 80) {
    scoreComment.textContent = `Excellent`;
    scoreComment.style.color = "#00f5c4";
  } else if (score >= 60) {
    scoreComment.textContent = `Good`;
    scoreComment.style.color = "#f0c040";
  } else if (score >= 40) {
    scoreComment.textContent = `Average`;
    scoreComment.style.color = "#92600a";
  } else {
    scoreComment.textContent = `Needs Improvements`;
    scoreComment.style.color = "crimson";
  }

  const progressCircle = document.querySelector(".circular-progress");
  progressCircle.setAttribute("data-progress", score);
  renderCirculerProgress();
}

function renderCirculerProgress() {
  const progressCircle = document.querySelector(".circular-progress");
  const progressValue = progressCircle.querySelector(".progress-value");
  const target = parseInt(progressCircle.getAttribute("data-progress"));

  let current = 0;
  const speed = 20; // milliseconds between updates

  function animateProgress() {
    if (current <= target) {
      progressCircle.style.background = `conic-gradient(#02987a 0% ${current}%, #00f5c430 ${current}% 100%)`;
      progressValue.textContent = `${current}%`;
      current++;
      setTimeout(animateProgress, speed);
    }
  }

  animateProgress();
}
