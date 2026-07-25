(function () {
  const data = window.labData;
  if (!data) return;

  const byId = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const stageClassMap = {
    "학교 적용": "stage-school",
    "지속 개선": "stage-improve",
    "내부 테스트": "stage-test",
    "데모": "stage-demo",
    "아이디어": "stage-idea",
    "보류": "stage-hold",
  };
  const externalAttrs = 'target="_blank" rel="noopener noreferrer"';
  const formatEmphasis = (value) => escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replaceAll("\n", "<br>");

  const stageBadge = (stage) => (
    `<span class="stage-badge ${stageClassMap[stage] || "stage-idea"}">${escapeHtml(stage)}</span>`
  );

  function actionMarkup(action, fallbackLabel) {
    const label = action?.label || fallbackLabel;
    if (action?.url) {
      return `<a class="lab-link" href="${escapeHtml(action.url)}" ${externalAttrs}>${escapeHtml(label)} <span aria-hidden="true">→</span></a>`;
    }
    return `<span class="lab-disabled" aria-disabled="true">${escapeHtml(label || "상세 공개 예정")}</span>`;
  }

  function mediaMarkup(project) {
    if (project.image) {
      return `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.name)} 화면 이미지" loading="lazy">`;
    }
    return `<div class="lab-media-placeholder" role="img" aria-label="${escapeHtml(project.name)} 이미지 준비 중">
      <span>${escapeHtml(project.category)}</span>
      <strong>${escapeHtml(project.name)}</strong>
    </div>`;
  }

  byId("lab-intro-label").textContent = data.intro.label;
  byId("lab-intro-content").innerHTML = `
    <h3 class="lab-title">${escapeHtml(data.intro.title)}</h3>
    ${data.intro.body.map((body) => `<p class="lab-lead">${escapeHtml(body)}</p>`).join("")}
    <div class="lab-message-grid">
      ${data.intro.cards.map((card) => `
        <div class="lab-message-card">
          <div class="k">${escapeHtml(card.title)}</div>
          <div class="v">${escapeHtml(card.body)}</div>
        </div>
      `).join("")}
    </div>
  `;

  const projects = data.projects;
  const featuredIds = ["draconis", "seokam-on", "dolflix"];
  byId("lab-feature-list").innerHTML = featuredIds
    .map((id) => projects.find((project) => project.id === id))
    .filter(Boolean)
    .map((project) => `
      <section class="lab-feature-card" aria-label="${escapeHtml(project.name)} 대표 서비스">
        ${mediaMarkup(project)}
        <div class="lab-feature-body">
          <div class="lab-card-head">
            <span class="lab-category">${escapeHtml(project.category)}</span>
            ${stageBadge(project.stage)}
          </div>
          <h3>${formatEmphasis(project.detailTitle)}</h3>
          <p>${formatEmphasis(project.detailBody)}</p>
          <div class="lab-report-point">${escapeHtml(project.reportPoint)}</div>
          <div class="lab-link-row" style="margin-top:12px">
            ${project.actions
              .filter((action) => action.url)
              .map((action) => actionMarkup(action, "서비스 체험"))
              .join("")}
          </div>
        </div>
      </section>
    `).join("");

  byId("lab-services-lead").innerHTML = data.sectionCopy.servicesLead
    .map((body) => `<p class="lab-body">${escapeHtml(body)}</p>`)
    .join("");

  function renderProjects(filter) {
    const filtered = filter === "전체"
      ? projects
      : projects.filter((project) => project.category === filter);

    byId("lab-project-grid").innerHTML = filtered.map((project) => `
      <section class="lab-service-card" aria-label="${escapeHtml(project.name)}">
        <div class="lab-card-head">
          <span class="lab-category">${escapeHtml(project.category)}</span>
          ${stageBadge(project.stage)}
        </div>
        <h3>${escapeHtml(project.name)}</h3>
        <p>${escapeHtml(project.summary)}</p>
        <div class="lab-owner">담당 ${escapeHtml(project.owner)}</div>
        <div class="lab-link-row">
          ${project.url
            ? actionMarkup({
              label: project.category === "홍보·운영" ? "채널 열기" : "서비스 체험",
              url: project.url,
            })
            : actionMarkup({ label: "상세 공개 예정", url: null })}
        </div>
      </section>
    `).join("");
  }

  byId("filter-bar").innerHTML = data.filters
    .map((filter, index) => `
      <button class="filter-btn" type="button" aria-pressed="${index === 0 ? "true" : "false"}" data-filter="${escapeHtml(filter)}">
        ${escapeHtml(filter)}
      </button>
    `).join("");
  byId("filter-bar").addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) return;
    byId("filter-bar").querySelectorAll(".filter-btn")
      .forEach((item) => item.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    renderProjects(button.dataset.filter);
  });
  renderProjects("전체");

  byId("lab-roadmap-content").innerHTML = `
    <h3>${escapeHtml(data.roadmap.title)}</h3>
    <div class="lab-roadmap-grid" style="margin-top:12px">
      ${data.roadmap.directions.map((direction, index) => `
        <section class="lab-roadmap-card" aria-label="방향 ${index + 1}. ${escapeHtml(direction.title)}">
          <h3>방향 ${index + 1}. ${escapeHtml(direction.title)}</h3>
          <p>${escapeHtml(direction.body)}</p>
        </section>
      `).join("")}
    </div>
    <div class="lab-closing">
      ${data.roadmap.closing.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}
    </div>
  `;

  byId("lab-org-list").innerHTML = data.organization.groups
    .map((group) => `
      <div class="lab-org-card">
        <div class="role">${escapeHtml(group.role)}</div>
        <div class="names">${escapeHtml(group.names)}</div>
      </div>
    `).join("");
})();
